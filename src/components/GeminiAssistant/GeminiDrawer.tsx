import { motion } from 'motion/react';
import { Mic, MicOff, Pause, X, Minus, Loader } from 'lucide-react';
import { AssistantState } from './types';

interface Props { state: AssistantState; isMuted: boolean; error: string | null; onMinimize: () => void; onClose: () => void; onMuteToggle: () => void; onStop: () => void; }

export function GeminiDrawer({ state, isMuted, error, onMinimize, onClose, onMuteToggle, onStop }: Props) {
  const active = state === AssistantState.Listening || state === AssistantState.Speaking || state === AssistantState.Thinking;
  return (
    <motion.section initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-x-0 bottom-0 z-50 rounded-t-[2rem] bg-white p-5 shadow-2xl">
      <div className="mx-auto max-w-md space-y-5">
        <div className="flex items-center justify-between">
          <div><p className="text-sm font-bold text-stone-900">Assistant vocal Julien</p><p className="text-xs text-stone-500">Audio Gemini Live uniquement</p></div>
          <div className="flex gap-2"><button aria-label="Réduire" onClick={onMinimize} className="rounded-full bg-stone-100 p-2"><Minus /></button><button aria-label="Fermer" onClick={onClose} className="rounded-full bg-stone-100 p-2"><X /></button></div>
        </div>
        <div className="grid place-items-center py-4">
          <div className="relative grid h-28 w-28 place-items-center rounded-full bg-indigo-600 text-white">
            {active && <span className="absolute inset-0 animate-ping rounded-full bg-indigo-400/50" />}
            {state === AssistantState.Connecting || state === AssistantState.Thinking ? <Loader className="h-10 w-10 animate-spin" /> : isMuted ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
          </div>
        </div>
        {error && <p className="rounded-2xl bg-rose-50 p-3 text-center text-xs font-medium text-rose-700">{error}</p>}
        <div className="flex justify-center gap-3">
          <button onClick={onMuteToggle} className="rounded-2xl bg-stone-100 px-5 py-3 font-semibold text-stone-700">{isMuted ? 'Micro' : 'Pause'}</button>
          <button onClick={onStop} className="rounded-2xl bg-rose-600 px-5 py-3 font-semibold text-white"><Pause className="inline h-4 w-4" /> Stop</button>
        </div>
      </div>
    </motion.section>
  );
}
