import { useEffect, useRef, useState, useCallback } from "react";
import { Mic, MicOff, X, Minimize2, Loader2 } from "lucide-react";
import { useGeminiLive, ToolCall } from "./useGeminiLive";
import { GEMINI_ASSISTANT_SYSTEM_PROMPT } from "./systemPrompt";
import { GeminiFloatingBubble } from "./GeminiFloatingBubble";

type GeminiAssistantDrawerProps = {
  apiKey: string;
  initialOpen?: boolean;
};

type ConfirmState = {
  calls: ToolCall[];
};

export function GeminiAssistantDrawer({ apiKey, initialOpen = false }: GeminiAssistantDrawerProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [pendingCalls, setPendingCalls] = useState<ToolCall[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const isSimulator = !apiKey;

  const onTranscriptUpdate = useCallback((text: string, isFinal: boolean) => {
    setTranscript((prev) => {
      if (!text) return prev;
      if (isFinal) return `${prev}\n${text}`.trim();
      return text;
    });
  }, []);

  const onToolCall = useCallback((calls: ToolCall[]) => {
    // On blinde toutes les actions sensibles derrière une confirmation utilisateur.
    setPendingCalls((prev) => [...prev, ...calls]);
    setConfirmState({ calls: [...calls] });
  }, []);

  const { start, stop, isActive, isThinking, error } = useGeminiLive({
    apiKey,
    systemPrompt: GEMINI_ASSISTANT_SYSTEM_PROMPT,
    onTranscriptUpdate,
    onToolCall,
    onConnected: () => {
      setTranscript("");
      setPendingCalls([]);
    },
    onDisconnected: () => {
      // nothing special for now
    },
  });

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  useEffect(() => {
    if (!isOpen) {
      stop();
    }
  }, [isOpen, stop]);

  const handleToggle = async () => {
    if (isActive) {
      stop();
    } else {
      await start();
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmState) return;
    setIsConfirmLoading(true);
    // Dans une version future, on exécutera ici l’appel métier réel.
    // Pour l’instant on simule une réponse positive au SDK.
    setTimeout(() => {
      setPendingCalls((prev) => prev.filter((c) => !confirmState.calls.find((p) => p.id === c.id)));
      setConfirmState(null);
      setIsConfirmLoading(false);
    }, 600);
  };

  const handleCancelConfirm = () => {
    setConfirmState(null);
  };

  const simulateToolCall = useCallback(() => {
    onToolCall([
      {
        id: `sim-${Date.now()}`,
        name: "update_stock",
        arguments: { product: "Coca-Cola", quantity: 3, action: "add" },
      },
    ]);
  }, [onToolCall]);

  const bubble = isOpen && isMinimized ? (
    <GeminiFloatingBubble
      isActive={isActive}
      isThinking={isThinking}
      onClick={() => setIsMinimized(false)}
    />
  ) : isOpen ? null : (
    <button
      type="button"
      onClick={() => {
        setIsOpen(true);
        setIsMinimized(false);
      }}
      aria-label="Ouvrir l’assistant vocal"
      className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 transition active:scale-95"
    >
      <Mic className="h-5 w-5" />
    </button>
  );

  if (!isOpen || isMinimized) {
    return bubble;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-[2rem] border border-stone-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-stone-100 px-4 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-stone-300"}`} />
          <div>
            <p className="text-sm font-bold text-stone-900">Julien</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-500">
              {isThinking ? "En réflexion" : isActive ? "À l’écoute" : "Inactif"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            aria-label="Réduire l’assistant"
            className="touch-target grid h-10 w-10 place-items-center rounded-full border border-stone-200 text-stone-700 transition active:scale-95"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              stop();
              setIsOpen(false);
            }}
            aria-label="Fermer l’assistant"
            className="touch-target grid h-10 w-10 place-items-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 transition active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3 text-sm text-stone-800">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Transcription</p>
          <div className="min-h-[5rem] rounded-xl border border-stone-200 bg-stone-50/80 p-3">
            <p className="whitespace-pre-wrap text-xs leading-relaxed text-stone-800">
              {transcript || <span className="text-stone-400">En attente de parole…</span>}
            </p>
            <div ref={transcriptEndRef} />
          </div>
        </div>

        {pendingCalls.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Action sensible en attente</p>
            <div className="space-y-2">
              {pendingCalls.map((call) => (
                <div key={call.id} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs">
                  <p className="font-semibold text-amber-900">{call.name}</p>
                  {call.arguments && (
                    <pre className="mt-1 overflow-x-auto text-[10px] text-amber-800">
                      {JSON.stringify(call.arguments, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-xs text-rose-600">Erreur : {error}</p>}
        {isSimulator && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Mode simulateur</p>
            <p className="text-xs text-stone-600">Aucune clé API n’est fournie. La session vocale est simulée et la synthèse est locale.</p>
            <button
              type="button"
              onClick={simulateToolCall}
              className="touch-target rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-800 transition active:scale-95"
            >
              Simuler un tool call sensible
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-stone-100 px-4 pb-5 pt-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 text-[10px] font-semibold uppercase tracking-widest text-stone-500">
            {isActive ? (
              <span className="text-emerald-700">Session active</span>
            ) : (
              <span>Session à l’arrêt</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleToggle}
            aria-label={isActive ? "Arrêter la session" : "Démarrer la session"}
            className={`touch-target flex h-14 w-14 items-center justify-center rounded-full border transition active:scale-95 ${
              isActive
                ? "border-rose-200 bg-rose-50 text-rose-600"
                : "border-indigo-200 bg-indigo-50 text-indigo-600"
            }`}
          >
            {isThinking ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isActive ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {confirmState && (
        <div className="absolute inset-0 z-10 flex items-end justify-center bg-black/30 p-4">
          <div className="w-full rounded-2xl border border-amber-200 bg-white p-4 shadow-xl">
            <p className="text-sm font-bold text-stone-900">Confirmer cette action sensible</p>
            <p className="mt-1 text-xs text-stone-600">
              Julien demande à exécuter <span className="font-semibold">{confirmState.calls[0]?.name}</span>. Continue-t-on ?
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleCancelConfirm}
                className="touch-target flex-1 rounded-xl border border-stone-200 py-2 text-sm font-semibold text-stone-700 transition active:scale-95"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isConfirmLoading}
                className="touch-target flex-1 rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-70"
              >
                {isConfirmLoading ? "Exécution…" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
