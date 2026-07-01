import { GoogleGenAI } from '@google/genai';
import { AudioManager, int16ToBase64 } from './AudioManager';
import type { GeminiToolCall, GeminiToolResult } from './types';
import { buildSystemPrompt } from './systemPrompt';
import { getToolsDeclaration } from './tools';
import type { AssistantExternalContext } from './types';

const MODEL = 'gemini-3.1-flash-live-preview';

type LiveCallbacks = {
  onOpen?: () => void;
  onClose?: () => void;
  onAudio?: () => void;
  onThinking?: () => void;
  onFunctionCall?: (call: GeminiToolCall) => Promise<GeminiToolResult>;
  onError?: (message: string) => void;
};

export class LiveSession {
  private ai: GoogleGenAI | null = null;
  private session: any = null;
  private reconnectAttempts = 0;
  private closedByUser = false;
  private sentAudioChunks = 0;

  constructor(private readonly audio = AudioManager.getInstance(), private callbacks: LiveCallbacks = {}) {}

  setCallbacks(callbacks: LiveCallbacks): void { this.callbacks = callbacks; }
  isConnected(): boolean { return Boolean(this.session); }

  async connect(context: AssistantExternalContext): Promise<void> {
    this.closedByUser = false;
    this.sentAudioChunks = 0;
    this.ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

    const prompt = buildSystemPrompt(context);
    const functionDeclarations = getToolsDeclaration();

    this.session = await (this.ai as any).live.connect({
      model: MODEL,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } }
        },
        systemInstruction: { parts: [{ text: prompt }] },
        tools: [{ functionDeclarations }],
      },
      callbacks: {
        onopen: () => {
          this.reconnectAttempts = 0;
          this.callbacks.onOpen?.();
        },
        onclose: (event: unknown) => {
          void this.handleClose(context);
        },
        onerror: (event: unknown) => {
          const message = event instanceof Error ? event.message : 'Erreur Gemini Live';
          this.callbacks.onError?.(message);
        },
        onmessage: (message: unknown) => void this.handleMessage(message),
      },
    });

    this.audio.onMicrophoneChunk((pcm) => this.sendAudio(pcm));
  }

  async startAudio(): Promise<void> {
    await this.audio.startMicrophone();
  }

  sendAudio(pcm: Int16Array): void {
    if (!this.session) {
      return;
    }

    this.sentAudioChunks += 1;
    this.session.sendRealtimeInput?.({ audio: { mimeType: 'audio/pcm;rate=16000', data: int16ToBase64(pcm) } });
  }

  sendText(text: string): void {
    if (!this.session || !text.trim()) {
      return;
    }

    this.session.sendRealtimeInput?.({ text: text.trim() });
  }

  async sendToolResult(result: GeminiToolResult): Promise<void> {
    this.session?.sendToolResponse?.({ functionResponses: [{ id: result.id, name: result.name, response: result.response }] });
  }

  async disconnect(): Promise<void> {
    this.closedByUser = true;
    this.audio.onMicrophoneChunk(null);
    this.audio.stopMicrophone();
    this.audio.stopPlayback();
    this.session?.close?.();
    this.session = null;
    this.callbacks.onClose?.();
  }

  private async handleMessage(message: any): Promise<void> {
    if (message?.serverContent?.interrupted || message?.interrupted) {
      this.audio.stopPlayback();
      return;
    }
    const serverContent = message?.serverContent;
    const modelTurn = serverContent?.modelTurn ?? message?.modelTurn;
    const parts = modelTurn?.parts ?? [];

    if (message?.setupComplete) {
      return;
    }

    if (serverContent?.turnComplete) {
      return;
    }

    if (message?.toolCall) {
      await this.handleToolCall(message.toolCall);
      return;
    }

    if (!parts.length) {
      this.handleNonContentMessage(message, serverContent);
      return;
    }

    for (const part of parts) {
      if (part.inlineData?.data) {
        this.callbacks.onAudio?.();
        await this.audio.playBase64Pcm(part.inlineData.data);
      }

      if (part.functionCall) {
        await this.handleFunctionCall(part.functionCall);
      }
    }
  }

  private async handleToolCall(toolCall: any): Promise<void> {
    const functionCalls = toolCall?.functionCalls ?? [];
    if (!functionCalls.length) {
      return;
    }

    for (const functionCall of functionCalls) {
      await this.handleFunctionCall(functionCall);
    }
  }

  private async handleFunctionCall(functionCall: any): Promise<void> {
    if (!this.callbacks.onFunctionCall) return;

    const name = functionCall?.name;
    if (!name) {
      return;
    }

    this.callbacks.onThinking?.();
    const result = await this.callbacks.onFunctionCall({
      id: functionCall.id ?? crypto.randomUUID(),
      name,
      args: functionCall.args ?? {},
    });
    await this.sendToolResult(result);
  }

  private handleNonContentMessage(message: any, serverContent: any): void {
    if (serverContent?.generationComplete) {
      return;
    }

    if (serverContent?.waitingForInput) {
      return;
    }

    if (serverContent?.inputTranscription || serverContent?.outputTranscription) {
      return;
    }

    if (message?.sessionResumptionUpdate) {
      return;
    }

    if (message?.usageMetadata) {
      return;
    }

    if (message?.goAway) {
      return;
    }
  }

  private async handleClose(context: AssistantExternalContext): Promise<void> {
    this.session = null;
    this.callbacks.onClose?.();
    if (this.closedByUser || this.reconnectAttempts >= 3) {
      return;
    }
    const delay = 500 * 2 ** this.reconnectAttempts;
    this.reconnectAttempts += 1;
    window.setTimeout(() => void this.connect(context).catch((error: unknown) => {
      this.callbacks.onError?.(error instanceof Error ? error.message : 'Reconnexion impossible');
    }), delay);
  }
}
