import { useEffect, useRef, useState, useCallback } from "react";
import { GoogleGenAI, Modality, Type } from "@google/genai";

export type ToolCall = {
  id: string;
  name: string;
  arguments?: Record<string, unknown>;
};

export type UseGeminiLiveOptions = {
  apiKey: string;
  systemPrompt?: string;
  onTranscriptUpdate?: (text: string, isFinal: boolean) => void;
  onToolCall?: (calls: ToolCall[]) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
};

export function useGeminiLive({
  apiKey,
  systemPrompt,
  onTranscriptUpdate,
  onToolCall,
  onConnected,
  onDisconnected,
}: UseGeminiLiveOptions) {
  const [isActive, setIsActive] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentTranscriptRef = useRef<string>("");
  const scheduledSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const audioQueueRef = useRef<Uint8Array[]>([]);
  const nextPlayTimeRef = useRef<number>(0);

  const stopPlayback = useCallback(() => {
    scheduledSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch {
        // ignore
      }
      try {
        source.disconnect();
      } catch {
        // ignore
      }
    });
    scheduledSourcesRef.current.clear();
    nextPlayTimeRef.current = 0;
    audioQueueRef.current = [];
  }, []);

  const stopEverything = useCallback(() => {
    setIsActive(false);
    setIsThinking(false);
    stopPlayback();
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close().catch(() => {});
      } catch {
        // ignore
      }
    }
    audioContextRef.current = null;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    mediaStreamRef.current = null;
    try {
      sessionRef.current?.close?.();
    } catch {
      // ignore
    }
    sessionRef.current = null;
    onDisconnected?.();
  }, [onDisconnected, stopPlayback]);

  useEffect(() => () => {
    stopEverything();
  }, [stopEverything]);

  const handleServerMessage = useCallback(
    async (message: unknown) => {
      if (!isActive) {
        return;
      }

      if (!isThinking) {
        setIsThinking(true);
      }

      const data = message as {
        serverContent?: {
          modelTurn?: { parts?: Array<{ text?: string; inlineData?: { data?: string; mimeType?: string } }> };
          turnComplete?: boolean;
          interrupted?: boolean;
          inputTranscription?: { text?: string; finished?: boolean };
          outputTranscription?: { text?: string; finished?: boolean };
        };
        toolCall?: {
          functionCalls?: Array<{
            id: string;
            name: string;
            args?: Record<string, unknown>;
          }>;
        };
      };

      if (data.serverContent?.interrupted) {
        stopPlayback();
        setIsThinking(false);
        return;
      }

      if (data.toolCall?.functionCalls?.length) {
        onToolCall?.(
          data.toolCall.functionCalls.map((call) => ({
            id: call.id,
            name: call.name,
            arguments: call.args,
          })),
        );
      }

      const inputTranscript = data.serverContent?.inputTranscription?.text ?? "";
      if (inputTranscript) {
        currentTranscriptRef.current = inputTranscript.trim();
        onTranscriptUpdate?.(currentTranscriptRef.current, !!data.serverContent?.inputTranscription?.finished);
      }

      const outputTranscript = data.serverContent?.outputTranscription?.text ?? "";
      if (outputTranscript) {
        if (data.serverContent?.outputTranscription?.finished) {
          onTranscriptUpdate?.(outputTranscript.trim(), true);
          currentTranscriptRef.current = "";
          setIsThinking(false);
        } else {
          currentTranscriptRef.current = outputTranscript.trim();
          onTranscriptUpdate?.(currentTranscriptRef.current, false);
        }
      }

      const parts = data.serverContent?.modelTurn?.parts;
      if (parts?.length) {
        const textParts: string[] = [];
        for (const part of parts) {
          if (typeof part.text === "string" && part.text.length) {
            textParts.push(part.text);
          }
        }

        if (textParts.length) {
          const spoken = textParts.join("").trim();
          if (spoken) {
            onTranscriptUpdate?.(spoken, !!data.serverContent?.turnComplete);
          }
          if (data.serverContent?.turnComplete) {
            currentTranscriptRef.current = "";
            setIsThinking(false);
          }
        }
      }

      if (data.serverContent?.turnComplete) {
        currentTranscriptRef.current = "";
        setIsThinking(false);
      }
    },
    [isActive, onToolCall, onTranscriptUpdate, stopPlayback],
  );

  useEffect(() => {
    const context = audioContextRef.current;
    if (!context) {
      return;
    }

    const drainQueue = () => {
      while (audioQueueRef.current.length > 0) {
        const chunk = audioQueueRef.current.shift();
        if (!chunk) continue;
        try {
          const buffer = context.decodeAudioData(chunk.buffer.slice(0));
          const source = context.createBufferSource();
          source.buffer = buffer;
          source.connect(context.destination);
          const now = context.currentTime;
          const start = Math.max(now, nextPlayTimeRef.current);
          source.start(start);
          nextPlayTimeRef.current = start + (buffer.duration ?? 0);
          scheduledSourcesRef.current.add(source);
          source.onended = () => {
            scheduledSourcesRef.current.delete(source);
            try {
              source.disconnect();
            } catch {
              // ignore
            }
          };
        } catch {
          continue;
        }
      }
    };

    let running = true;
    const loop = () => {
      if (!running) return;
      if (!audioContextRef.current) return;
      if (audioContextRef.current.state === "closed") return;
      if (!isActive) return;
      drainQueue();
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
    return () => {
      running = false;
    };
  }, [isActive]);

  const start = useCallback(async () => {
    try {
      if (!apiKey) {
        setIsActive(true);
        setIsThinking(true);
        onConnected?.();
        const followUps = [
          "Bonjour, je suis Julien.",
          "Tu peux me demander d'ajouter du stock, de créer un produit ou d'exporter l'inventaire.",
          "Je te demande confirmation avant toute action sensible.",
        ];
        for (const line of followUps) {
          await new Promise((resolve) => setTimeout(resolve, 900));
          handleServerMessage({
            serverContent: {
              outputTranscription: { text: line, finished: true },
              modelTurn: { parts: [{ text: line }] },
              turnComplete: true,
            },
          });
        }
        setIsThinking(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1,
        },
      });

      mediaStreamRef.current = stream;
      setError(null);

      const AudioContextCtor = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext) as typeof AudioContext;
      const audioContext = new AudioContextCtor({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      nextPlayTimeRef.current = 0;
      audioQueueRef.current = [];

      const session = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          tools: [
            {
              functionDeclarations: [
                {
                  name: "__reply__",
                  description: "Répondre à l'utilisateur en streaming audio",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING, description: "Réponse vocale" },
                    },
                    required: ["text"],
                  },
                },
              ],
            },
          ],
          systemInstruction: systemPrompt ?? "Assistant vocal Superette Salengro. Confirmes toute action sensible.",
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onopen: () => {
            setIsActive(true);
            setIsThinking(false);
            currentTranscriptRef.current = "";
            onConnected?.();
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onmessage: (event: any) => {
            handleServerMessage(event.data ?? event);
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onerror: (event: ErrorEvent) => {
            const message = event.error instanceof Error ? event.error.message : "Connexion vocale interrompue.";
            setError(message);
            stopEverything();
          },
          onclose: () => {
            stopEverything();
          },
        },
      });

      sessionRef.current = session;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur de demarrage de l'assistant vocal.";
      setError(message);
      stopEverything();
    }
  }, [apiKey, systemPrompt, isActive, onConnected, onTranscriptUpdate, onToolCall, stopEverything, handleServerMessage]);

  const stop = useCallback(() => {
    stopEverything();
  }, [stopEverything]);

  return {
    start,
    stop,
    isActive,
    isThinking,
    error,
    currentTranscript: currentTranscriptRef.current,
  };
}
