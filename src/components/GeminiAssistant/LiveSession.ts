import { GoogleGenAI } from '@google/genai';
import { AudioManager, int16ToBase64 } from './AudioManager';
import type { GeminiToolCall, GeminiToolResult } from './types';
import { buildSystemPrompt } from './systemPrompt';
import { getToolsDeclaration } from './tools';
import type { AssistantExternalContext } from './types';

const MODEL = 'gemini-3.1-flash-live-preview';
const LOG_PREFIX = '[GeminiAssistant][LiveSession]';

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
  private lastSendLogAt = 0;

  constructor(private readonly audio = AudioManager.getInstance(), private callbacks: LiveCallbacks = {}) {}

  setCallbacks(callbacks: LiveCallbacks): void { this.callbacks = callbacks; }
  isConnected(): boolean { return Boolean(this.session); }

  async connect(context: AssistantExternalContext): Promise<void> {
    this.closedByUser = false;
    this.sentAudioChunks = 0;
    this.ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

    const prompt = buildSystemPrompt(context);
    const functionDeclarations = getToolsDeclaration();
    console.info(LOG_PREFIX, 'Connexion Gemini Live demandée', {
      model: MODEL,
      responseModalities: ['AUDIO'],
      hasApiKey: Boolean(import.meta.env.VITE_GEMINI_API_KEY),
      promptChars: prompt.length,
      tools: functionDeclarations.map((tool) => tool.name),
      context: {
        inventoryCount: context.inventory?.length ?? 0,
        categoriesCount: context.categories?.length ?? 0,
        offlineMode: context.offlineMode,
        language: context.language,
      },
    });

    this.session = await (this.ai as any).live.connect({
      model: MODEL,
      config: {
        responseModalities: ['AUDIO'],
        systemInstruction: { parts: [{ text: prompt }] },
        tools: [{ functionDeclarations }],
      },
      callbacks: {
        onopen: () => {
          this.reconnectAttempts = 0;
          console.info(LOG_PREFIX, 'Connexion Gemini Live ouverte');
          this.callbacks.onOpen?.();
        },
        onclose: (event: unknown) => {
          console.warn(LOG_PREFIX, 'Connexion Gemini Live fermée', event);
          void this.handleClose(context);
        },
        onerror: (event: unknown) => {
          const message = event instanceof Error ? event.message : 'Erreur Gemini Live';
          console.error(LOG_PREFIX, 'Erreur Gemini Live', event);
          this.callbacks.onError?.(message);
        },
        onmessage: (message: unknown) => void this.handleMessage(message),
      },
    });

    this.audio.onMicrophoneChunk((pcm) => this.sendAudio(pcm));
    console.info(LOG_PREFIX, 'Session Live créée et handler audio attaché');
  }

  async startAudio(): Promise<void> {
    console.info(LOG_PREFIX, 'Démarrage capture audio');
    await this.audio.startMicrophone();
    console.info(LOG_PREFIX, 'Capture audio démarrée');
  }

  sendAudio(pcm: Int16Array): void {
    if (!this.session) {
      console.warn(LOG_PREFIX, 'Chunk PCM ignoré: session absente', { samples: pcm.length });
      return;
    }

    this.sentAudioChunks += 1;
    const now = Date.now();
    if (now - this.lastSendLogAt > 1000) {
      this.lastSendLogAt = now;
      console.info(LOG_PREFIX, 'Envoi audio vers Gemini', { chunks: this.sentAudioChunks, samples: pcm.length, bytes: pcm.byteLength });
    }

    this.session.sendRealtimeInput?.({ media: { mimeType: 'audio/pcm;rate=16000', data: int16ToBase64(pcm) } });
  }

  async sendToolResult(result: GeminiToolResult): Promise<void> {
    console.info(LOG_PREFIX, 'Retour tool envoyé à Gemini', { id: result.id, name: result.name, success: result.response.success, denied: result.response.denied, error: result.response.error });
    this.session?.sendToolResponse?.({ functionResponses: [{ id: result.id, name: result.name, response: result.response }] });
  }

  async disconnect(): Promise<void> {
    console.info(LOG_PREFIX, 'Déconnexion demandée', { sentAudioChunks: this.sentAudioChunks });
    this.closedByUser = true;
    this.audio.onMicrophoneChunk(null);
    this.audio.stopMicrophone();
    this.session?.close?.();
    this.session = null;
    this.callbacks.onClose?.();
  }

  private async handleMessage(message: any): Promise<void> {
    console.debug(LOG_PREFIX, 'Message reçu de Gemini', message);
    const parts = message?.serverContent?.modelTurn?.parts ?? message?.modelTurn?.parts ?? [];
    if (message?.setupComplete) console.info(LOG_PREFIX, 'Setup Gemini Live terminé');
    if (!parts.length && !message?.setupComplete) console.info(LOG_PREFIX, 'Message Gemini sans parts exploitables', Object.keys(message ?? {}));

    for (const part of parts) {
      if (part.inlineData?.data) {
        console.info(LOG_PREFIX, 'Audio reçu de Gemini', { mimeType: part.inlineData.mimeType, chars: part.inlineData.data.length });
        this.callbacks.onAudio?.();
        await this.audio.playBase64Pcm(part.inlineData.data);
      }
      if (part.functionCall && this.callbacks.onFunctionCall) {
        console.info(LOG_PREFIX, 'Function call reçu', { id: part.functionCall.id, name: part.functionCall.name, args: part.functionCall.args });
        this.callbacks.onThinking?.();
        const result = await this.callbacks.onFunctionCall({ id: part.functionCall.id ?? crypto.randomUUID(), name: part.functionCall.name, args: part.functionCall.args ?? {} });
        await this.sendToolResult(result);
      }
    }
  }

  private async handleClose(context: AssistantExternalContext): Promise<void> {
    this.session = null;
    this.callbacks.onClose?.();
    if (this.closedByUser || this.reconnectAttempts >= 3) {
      console.info(LOG_PREFIX, 'Reconnexion non lancée', { closedByUser: this.closedByUser, reconnectAttempts: this.reconnectAttempts });
      return;
    }
    const delay = 500 * 2 ** this.reconnectAttempts;
    this.reconnectAttempts += 1;
    console.warn(LOG_PREFIX, 'Reconnexion planifiée', { attempt: this.reconnectAttempts, delay });
    window.setTimeout(() => void this.connect(context).catch((error: unknown) => {
      console.error(LOG_PREFIX, 'Reconnexion échouée', error);
      this.callbacks.onError?.(error instanceof Error ? error.message : 'Reconnexion impossible');
    }), delay);
  }
}
