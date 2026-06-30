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
  { label: string; sub: string; accent: string; icon: ReactNode; wave: boolean; bgPulse: string }
> = {
  [AssistantState.Idle]: {
    label: 'Prêt',
    sub: 'Dites quelque chose…',
    accent: 'bg-indigo-600 shadow-indigo-600/30',
    bgPulse: 'bg-indigo-500',
    icon: <Mic className="h-5 w-5" />,
    wave: false,
  },
  [AssistantState.Connecting]: {
    label: 'Connexion',
    sub: 'Établissement…',
    accent: 'bg-sky-500 shadow-sky-500/30',
    bgPulse: 'bg-sky-400',
    icon: <Wifi className="h-5 w-5" />,
    wave: false,
  },
  [AssistantState.Listening]: {
    label: "À l'écoute",
    sub: 'Parlez maintenant',
    accent: 'bg-emerald-500 shadow-emerald-500/30',
    bgPulse: 'bg-emerald-400',
    icon: <Mic className="h-5 w-5" />,
    wave: true,
  },
  [AssistantState.Speaking]: {
    label: 'Lina parle',
    sub: 'Écoutez la réponse',
    accent: 'bg-indigo-600 shadow-indigo-600/30',
    bgPulse: 'bg-indigo-400',
    icon: <Volume2 className="h-5 w-5" />,
    wave: true,
  },
  [AssistantState.Thinking]: {
    label: 'Réflexion',
    sub: 'Traitement…',
    accent: 'bg-violet-600 shadow-violet-600/30',
    bgPulse: 'bg-violet-500',
    icon: <Loader2 className="h-5 w-5 animate-spin" />,
    wave: false,
  },
  [AssistantState.Muted]: {
    label: 'En pause',
    sub: 'Micro coupé',
    accent: 'bg-stone-500 shadow-stone-500/30',
    bgPulse: 'bg-stone-400',
    icon: <MicOff className="h-5 w-5" />,
    wave: false,
  },
  [AssistantState.Error]: {
    label: 'Erreur',
    sub: 'Session interrompue',
    accent: 'bg-rose-500 shadow-rose-500/30',
    bgPulse: 'bg-rose-400',
    icon: <AlertTriangle className="h-5 w-5" />,
    wave: false,
  },
};

/* ── Sound wave bars ────────────────────────────────────────── */
function SoundWave({ active, colorClass }: { active: boolean, colorClass: string }) {
  const bars = [0.4, 0.7, 1, 0.8, 0.5, 0.9, 0.6, 1];
  return (
    <div className={`flex items-center justify-center gap-[2px] h-4 ${colorClass}`}>
      {bars.map((h, i) => (
        <motion.span
          key={i}
          className="w-[2px] rounded-full bg-current"
          animate={
            active
              ? { scaleY: [h * 0.4, h, h * 0.3, h * 0.9, h * 0.4], opacity: [0.6, 1, 0.7, 1, 0.6] }
              : { scaleY: 0.2, opacity: 0.3 }
          }
          transition={
            active
              ? { duration: 0.6 + i * 0.05, repeat: Infinity, ease: 'easeInOut', delay: i * 0.05 }
              : { duration: 0.3 }
          }
          style={{ height: 16, transformOrigin: 'center' }}
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

  // Derive text color for soundwave from accent
  const waveColorClass = meta.accent.includes('emerald') ? 'text-emerald-500' :
                         meta.accent.includes('sky') ? 'text-sky-500' :
                         meta.accent.includes('violet') ? 'text-violet-500' :
                         meta.accent.includes('rose') ? 'text-rose-500' :
                         meta.accent.includes('stone') ? 'text-stone-400' :
                         'text-indigo-500';

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end p-3 pb-[max(1rem,env(safe-area-inset-bottom))]">

      <motion.section
        initial={{ y: 150, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 150, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="pointer-events-auto mx-auto w-full max-w-md rounded-[2rem] bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.2)] overflow-hidden"
      >
        <div className="p-4 flex flex-col gap-5">
          
          {/* Top Row: Avatar & Info */}
          <div className="flex items-center gap-3">
            {/* Glowing Avatar */}
            <div className="relative flex-shrink-0">
              <AnimatePresence>
                {isActive && !isMuted && (
                  <motion.div
                    className={`absolute -inset-1 rounded-full opacity-20 blur-sm ${meta.bgPulse}`}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </AnimatePresence>
              <div
                className={`relative flex h-12 w-12 items-center justify-center rounded-full text-white shadow-xl ring-1 ring-white/20 ${meta.accent}`}
              >
                {meta.icon}
              </div>
            </div>

            {/* Status Text & Wave */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-black text-stone-900 leading-none tracking-tight">
                  {meta.label}
                </h2>
                <SoundWave active={meta.wave && !isMuted} colorClass={waveColorClass} />
              </div>
              <p className="text-[11px] font-bold text-stone-400 mt-1 truncate uppercase tracking-widest">
                {meta.sub}
              </p>
            </div>

            {/* Quick Actions (Top Right) */}
            <div className="flex items-center gap-1.5 self-start">
              <button
                type="button"
                onClick={() => setAutoAccept(!autoAccept)}
                title="Auto-validation des commandes"
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  autoAccept 
                    ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' 
                    : 'bg-stone-100 text-stone-400 hover:bg-stone-200 hover:text-stone-600'
                }`}
              >
                <Check className={`h-4 w-4 ${autoAccept ? 'stroke-[3]' : 'stroke-[2]'}`} />
              </button>
              <button
                type="button"
                onClick={onMinimize}
                title="Réduire"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-400 hover:bg-stone-200 hover:text-stone-600 transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-2 rounded-xl bg-rose-50/80 border border-rose-100 p-2.5 text-xs font-semibold text-rose-600 mb-1">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Actions */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onMuteToggle}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold border transition-all active:scale-[0.98] ${
                isMuted
                  ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm'
                  : 'bg-stone-50 border-stone-200/60 text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              {isMuted ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              {isMuted ? 'Reprendre' : 'Couper micro'}
            </button>
            <button
              type="button"
              onClick={onStop}
              className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold bg-rose-50 border border-rose-200/60 text-rose-600 hover:bg-rose-100 hover:border-rose-300 transition-all active:scale-[0.98]"
            >
              <X className="h-4 w-4 stroke-[2.5]" />
              Fermer Lina
            </button>
          </div>

        </div>
      </motion.section>
    </div>
  );
}
