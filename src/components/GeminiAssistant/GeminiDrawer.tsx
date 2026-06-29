import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, X, Minus, Check, Volume2, Loader2, Wifi, AlertTriangle } from 'lucide-react';
import { AssistantState } from './types';

interface Props {
  state: AssistantState;
  isMuted: boolean;
  error: string | null;
  autoAccept: boolean;
  setAutoAccept: (value: boolean) => void;
  onMinimize: () => void;
  onClose: () => void;
  onMuteToggle: () => void;
  onStop: () => void;
}

/* ── State metadata ─────────────────────────────────────────── */
const STATE_META: Record<
  AssistantState,
  { label: string; sub: string; accent: string; icon: ReactNode; wave: boolean }
> = {
  [AssistantState.Idle]: {
    label: 'Prêt',
    sub: 'Dites quelque chose…',
    accent: 'bg-indigo-600 shadow-indigo-600/20',
    icon: <Mic className="h-8 w-8" />,
    wave: false,
  },
  [AssistantState.Connecting]: {
    label: 'Connexion',
    sub: 'Établissement de la session…',
    accent: 'bg-sky-500 shadow-sky-500/20',
    icon: <Wifi className="h-8 w-8" />,
    wave: false,
  },
  [AssistantState.Listening]: {
    label: 'À l\'écoute',
    sub: 'Parlez maintenant',
    accent: 'bg-emerald-600 shadow-emerald-600/20',
    icon: <Mic className="h-8 w-8" />,
    wave: true,
  },
  [AssistantState.Speaking]: {
    label: 'Répond',
    sub: 'Julien vous répond…',
    accent: 'bg-indigo-600 shadow-indigo-600/20',
    icon: <Volume2 className="h-8 w-8" />,
    wave: true,
  },
  [AssistantState.Thinking]: {
    label: 'Réfléchit',
    sub: 'Traitement en cours…',
    accent: 'bg-violet-600 shadow-violet-600/20',
    icon: <Loader2 className="h-8 w-8 animate-spin" />,
    wave: false,
  },
  [AssistantState.Muted]: {
    label: 'En pause',
    sub: 'Micro coupé',
    accent: 'bg-stone-500 shadow-stone-400/20',
    icon: <MicOff className="h-8 w-8" />,
    wave: false,
  },
  [AssistantState.Error]: {
    label: 'Erreur',
    sub: 'Session interrompue',
    accent: 'bg-rose-600 shadow-rose-600/20',
    icon: <AlertTriangle className="h-8 w-8" />,
    wave: false,
  },
};

/* ── Sound wave bars ────────────────────────────────────────── */
function SoundWave({ active }: { active: boolean }) {
  const bars = [0.4, 0.7, 1, 0.8, 0.5, 0.9, 0.6, 1, 0.7, 0.4];
  return (
    <div className="flex items-center justify-center gap-[3px] h-8">
      {bars.map((h, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-current"
          animate={
            active
              ? { scaleY: [h * 0.5, h, h * 0.3, h * 0.8, h * 0.5], opacity: [0.6, 1, 0.7, 1, 0.6] }
              : { scaleY: 0.15, opacity: 0.25 }
          }
          transition={
            active
              ? { duration: 0.8 + i * 0.07, repeat: Infinity, ease: 'easeInOut', delay: i * 0.06 }
              : { duration: 0.3 }
          }
          style={{ height: 28, transformOrigin: 'center' }}
        />
      ))}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────── */
export function GeminiDrawer({
  state,
  isMuted,
  error,
  autoAccept,
  setAutoAccept,
  onMinimize,
  onClose,
  onMuteToggle,
  onStop,
}: Props) {
  const effectiveState = isMuted ? AssistantState.Muted : state;
  const meta = STATE_META[effectiveState] ?? STATE_META[AssistantState.Idle];
  const isActive =
    state === AssistantState.Listening ||
    state === AssistantState.Speaking ||
    state === AssistantState.Thinking;

  return (
    <motion.section
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 320 }}
      className="fixed inset-x-0 bottom-0 z-50 rounded-t-[2rem] bg-white border-t border-stone-200/60 shadow-2xl shadow-stone-900/20"
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="h-1 w-10 rounded-full bg-stone-250" />
      </div>

      <div className="mx-auto max-w-md px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 space-y-5">

        {/* ── Header row ── */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-indigo-600">
              Julien
            </p>
            <h2 className="text-base font-extrabold text-stone-900 leading-tight">
              Assistant vocal
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Auto-accept toggle */}
            <button
              type="button"
              onClick={() => setAutoAccept(!autoAccept)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold transition cursor-pointer select-none ${
                autoAccept
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-stone-100 text-stone-500 border border-stone-200'
              }`}
            >
              {autoAccept && <Check className="h-3 w-3 stroke-[3]" />}
              Auto-valide
            </button>
            <button
              type="button"
              aria-label="Réduire"
              onClick={onMinimize}
              className="grid h-8 w-8 place-items-center rounded-xl border border-stone-200/80 bg-white text-stone-500 hover:text-stone-900 transition active:scale-95 cursor-pointer"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Fermer"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-xl border border-stone-200/80 bg-white text-stone-500 hover:text-stone-900 transition active:scale-95 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Avatar + Wave ── */}
        <div className="flex flex-col items-center gap-4 py-3">
          {/* Avatar */}
          <div className="relative">
            {/* Outer sonar rings */}
            <AnimatePresence>
              {isActive && !isMuted && (
                <>
                  {[1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className={`absolute inset-0 rounded-full ${meta.accent.split(' ')[0]} opacity-20`}
                      initial={{ scale: 1, opacity: 0.25 }}
                      animate={{ scale: 1 + i * 0.35, opacity: 0 }}
                      transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>
            <div
              className={`relative grid h-20 w-20 place-items-center rounded-full text-white shadow-xl ${meta.accent}`}
            >
              {meta.icon}
            </div>
          </div>

          {/* State label */}
          <div className="text-center">
            <p className="text-sm font-extrabold text-stone-900 tracking-tight">{meta.label}</p>
            <p className="text-[11px] font-medium text-stone-400 mt-0.5">{meta.sub}</p>
          </div>

          {/* Sound wave visualiser */}
          <div className={`text-${meta.accent.includes('emerald') ? 'emerald' : meta.accent.includes('indigo') ? 'indigo' : 'violet'}-500`}>
            <SoundWave active={meta.wave && !isMuted} />
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-medium text-rose-700">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* ── Action buttons ── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onMuteToggle}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold border transition active:scale-[0.98] cursor-pointer select-none ${
              isMuted
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-white border-stone-200/80 text-stone-600 hover:text-stone-900'
            }`}
          >
            {isMuted ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            {isMuted ? 'Reprendre' : 'Couper micro'}
          </button>
          <button
            type="button"
            onClick={onStop}
            className="flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/10 transition active:scale-[0.98] cursor-pointer select-none"
          >
            <X className="h-4 w-4" />
            Terminer
          </button>
        </div>
      </div>
    </motion.section>
  );
}
