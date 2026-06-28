import { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, useAnimation } from 'motion/react';
import { Mic, MicOff, Loader as Loader2 } from 'lucide-react';
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
      const bubbleSize = 56;
      const padding = 16;
      const maxX = window.innerWidth - bubbleSize - padding;
      const maxY = window.innerHeight - bubbleSize - padding - 100;

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
    const bubbleSize = 56;
    const padding = 16;
    const maxX = window.innerWidth - bubbleSize - padding;
    const maxY = window.innerHeight - bubbleSize - padding - 100;

    const newX = Math.max(padding, Math.min(maxX, position.x + info.offset.x));
    const newY = Math.max(padding, Math.min(maxY, position.y + info.offset.y));

    setPosition({ x: newX, y: newY });
    void controls.start({ x: newX, y: newY });
  };

  const handleClick = () => {
    onExpand();
  };

  const getStateStyles = () => {
    switch (state) {
      case AssistantState.Listening:
        return 'bg-emerald-500 shadow-emerald-500/20';
      case AssistantState.Speaking:
        return 'bg-slate-900 shadow-slate-900/20';
      case AssistantState.Thinking:
        return 'bg-amber-500 shadow-amber-500/20';
      case AssistantState.Connecting:
        return 'bg-stone-400 shadow-stone-400/20';
      case AssistantState.Error:
        return 'bg-rose-500 shadow-rose-500/20';
      case AssistantState.Muted:
        return 'bg-stone-400 shadow-stone-400/20';
      default:
        return 'bg-slate-900 shadow-slate-900/20';
    }
  };

  const getStateIcon = () => {
    switch (state) {
      case AssistantState.Connecting:
      case AssistantState.Thinking:
        return <Loader2 className="h-6 w-6 animate-spin" />;
      case AssistantState.Listening:
        return <Mic className="h-6 w-6" />;
      case AssistantState.Muted:
        return <MicOff className="h-6 w-6" />;
      default:
        return <Mic className="h-6 w-6" />;
    }
  };

  const getStateLabel = () => {
    switch (state) {
      case AssistantState.Connecting:
        return 'Connexion';
      case AssistantState.Listening:
        return 'Écoute';
      case AssistantState.Speaking:
        return 'Parle';
      case AssistantState.Thinking:
        return 'Réflexion';
      case AssistantState.Muted:
        return 'Muet';
      case AssistantState.Error:
        return 'Erreur';
      default:
        return 'Julien';
    }
  };

  const isActive =
    state === AssistantState.Listening ||
    state === AssistantState.Speaking ||
    state === AssistantState.Thinking;

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
          right: window.innerWidth - 72,
          bottom: window.innerHeight - 156,
        }}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        initial={{ x: position.x, y: position.y }}
        animate={controls}
        className="pointer-events-auto relative"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-colors ${getStateStyles()}`}
        >
          {getStateIcon()}
          {isActive && (
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-white/50"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </motion.button>
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-stone-500 whitespace-nowrap"
        >
          {getStateLabel()}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
