import { Mic, MicOff, Loader2 } from "lucide-react";

type GeminiFloatingBubbleProps = {
  isActive: boolean;
  isThinking: boolean;
  onClick: () => void;
};

export function GeminiFloatingBubble({ isActive, isThinking, onClick }: GeminiFloatingBubbleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Ouvrir l’assistant vocal"
      className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 transition active:scale-95"
    >
      {isThinking ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isActive ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
      {isActive && <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 animate-ping" />}
    </button>
  );
}
