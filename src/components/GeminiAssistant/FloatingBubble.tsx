import { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, useAnimation } from 'motion/react';
import { Mic, MicOff, Loader2, Volume2, Wifi } from 'lucide-react';
import { AssistantState } from './types';

interface FloatingBubbleProps {
  state: AssistantState;
  onExpand: () => void;
}

export function FloatingBubble({ state, onExpand }: FloatingBubbleProps) {
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const constraintsRef = useRef<HTMLDivElement | null>(null);
  const controls = useAnimation();

  useEffect(() => {
    const handleResize = () => {
      const padding = 16;
      const maxX = window.innerWidth - 120 - padding;
      const maxY = window.innerHeight - 48 - padding - 100;
      setPosition((prev) => ({
        x: Math.min(prev.x, Math.max(padding, maxX)),
        y: Math.min(prev.y, Math.max(padding, maxY)),
      }));
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const padding = 16;
    const maxX = window.innerWidth - 120 - padding;
    const maxY = window.innerHeight - 48 - padding - 100;
    const newX = Math.max(padding, Math.min(maxX, position.x + info.offset.x));
    const newY = Math.max(padding, Math.min(maxY, position.y + info.offset.y));
    setPosition({ x: newX, y: newY });
    void controls.start({ x: newX, y: newY });
  };

  const getConfig = () => {
    switch (state) {
      case AssistantState.Listening:
        return {
          bg: 'bg-emerald-600',
          ring: 'shadow-emerald-500/40',
          label: 'À l\'écoute',
          icon: <Mic className="h-4 w-4" />,
          pulse: true,
          pingColor: 'bg-emerald-400',
        };
      case AssistantState.Speaking:
        return {
          bg: 'bg-indigo-600',
          ring: 'shadow-indigo-500/40',
          label: 'Répond…',
          icon: <Volume2 className="h-4 w-4" />,
          pulse: true,
          pingColor: 'bg-indigo-400',
        };
      case AssistantState.Thinking:
        return {
          bg: 'bg-violet-600',
          ring: 'shadow-violet-500/40',
          label: 'Réfléchit…',
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          pulse: false,
          pingColor: 'bg-violet-400',
        };
      case AssistantState.Connecting:
        return {
          bg: 'bg-sky-500',
          ring: 'shadow-sky-500/40',
          label: 'Connexion…',
          icon: <Wifi className="h-4 w-4" />,
          pulse: false,
          pingColor: 'bg-sky-400',
        };
      case AssistantState.Error:
        return {
          bg: 'bg-rose-600',
          ring: 'shadow-rose-500/40',
          label: 'Erreur',
          icon: <MicOff className="h-4 w-4" />,
          pulse: false,
          pingColor: 'bg-rose-400',
        };
      case AssistantState.Muted:
        return {
          bg: 'bg-stone-500',
          ring: 'shadow-stone-400/30',
          label: 'Muet',
          icon: <MicOff className="h-4 w-4" />,
          pulse: false,
          pingColor: 'bg-stone-300',
        };
      default:
        return {
          bg: 'bg-indigo-600',
          ring: 'shadow-indigo-500/30',
          label: 'Julien',
          icon: <Mic className="h-4 w-4" />,
          pulse: false,
          pingColor: 'bg-indigo-400',
        };
    }
  };

  const cfg = getConfig();

  return (
    <motion.div
      ref={constraintsRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ touchAction: 'none' }}
    >
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={{
          top: 16,
          left: 16,
          right: window.innerWidth - 136,
          bottom: window.innerHeight - 64,
        }}
        onDragEnd={handleDragEnd}
        onClick={onExpand}
        initial={{ x: position.x, y: position.y }}
        animate={controls}
        className="pointer-events-auto relative"
      >
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className={`relative flex h-11 items-center gap-2.5 rounded-full px-4 text-white shadow-xl ${cfg.bg} ${cfg.ring}`}
          style={{ minWidth: 100 }}
        >
          {/* Ping/sonar rings for active states */}
          {cfg.pulse && (
            <>
              <span className={`absolute inset-0 rounded-full ${cfg.pingColor} opacity-30 animate-ping`} />
              <motion.span
                className={`absolute inset-0 rounded-full border-2 border-white/30`}
                animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </>
          )}

          {/* Icon */}
          <span className="relative z-10 flex-shrink-0">{cfg.icon}</span>

          {/* Label */}
          <span className="relative z-10 text-[11px] font-bold tracking-wide whitespace-nowrap">
            {cfg.label}
          </span>

          {/* Live dot for active states */}
          {cfg.pulse && (
            <span className="relative z-10 h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse flex-shrink-0" />
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
