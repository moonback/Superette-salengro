import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, PanInfo, useAnimation } from 'motion/react';
import { Mic, MicOff, Loader2, Volume2, Wifi } from 'lucide-react';
import { AssistantState } from './types';

interface FloatingBubbleProps {
  state: AssistantState;
  onExpand: () => void;
}

// Single source of truth for bubble dimensions + screen padding.
const BUBBLE_WIDTH = 120;
const BUBBLE_HEIGHT = 44;
const EDGE_PADDING = 16;
// Extra clearance reserved at the bottom for app chrome (nav bar, etc.)
const BOTTOM_RESERVED = 84;
// If the pointer moves further than this during a press, treat it as a
// drag rather than a tap — prevents accidental opens while repositioning.
const TAP_DRAG_THRESHOLD = 6;

function getBounds() {
  // visualViewport reflects the visible area when the mobile keyboard is
  // open, unlike window.innerHeight which is inconsistent across browsers.
  const vv = typeof window !== 'undefined' ? window.visualViewport : null;
  const width = vv?.width ?? window.innerWidth;
  const height = vv?.height ?? window.innerHeight;
  return {
    minX: EDGE_PADDING,
    minY: EDGE_PADDING,
    maxX: Math.max(EDGE_PADDING, width - BUBBLE_WIDTH - EDGE_PADDING),
    maxY: Math.max(EDGE_PADDING, height - BUBBLE_HEIGHT - EDGE_PADDING - BOTTOM_RESERVED),
  };
}

function clampPosition(pos: { x: number; y: number }, bounds: ReturnType<typeof getBounds>) {
  return {
    x: Math.min(Math.max(pos.x, bounds.minX), bounds.maxX),
    y: Math.min(Math.max(pos.y, bounds.minY), bounds.maxY),
  };
}

export function FloatingBubble({ state, onExpand }: FloatingBubbleProps) {
  const [position, setPosition] = useState(() => clampPosition({ x: 16, y: 16 }, getBounds()));
  const controls = useAnimation();
  const dragDistanceRef = useRef(0);

  // Re-clamp on resize, orientation change, and keyboard open/close
  // (visualViewport fires resize when the keyboard appears on supported browsers).
  useEffect(() => {
    const reposition = () => {
      setPosition((prev) => {
        const next = clampPosition(prev, getBounds());
        void controls.start({ x: next.x, y: next.y, transition: { duration: 0.2 } });
        return next;
      });
    };

    window.addEventListener('resize', reposition);
    window.addEventListener('orientationchange', reposition);
    window.visualViewport?.addEventListener('resize', reposition);

    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('orientationchange', reposition);
      window.visualViewport?.removeEventListener('resize', reposition);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDrag = useCallback((_: any, info: PanInfo) => {
    dragDistanceRef.current += Math.abs(info.delta.x) + Math.abs(info.delta.y);
  }, []);

  const handleDragStart = useCallback(() => {
    dragDistanceRef.current = 0;
  }, []);

  const handleDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      const bounds = getBounds();
      const next = clampPosition(
        { x: position.x + info.offset.x, y: position.y + info.offset.y },
        bounds
      );
      setPosition(next);
      void controls.start({ x: next.x, y: next.y });
    },
    [position, controls]
  );

  const handleTap = useCallback(() => {
    // Only treat this as an intentional tap if the pointer barely moved.
    if (dragDistanceRef.current < TAP_DRAG_THRESHOLD) {
      onExpand();
    }
  }, [onExpand]);

  const getConfig = () => {
    switch (state) {
      case AssistantState.Listening:
        return {
          bg: 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-650',
          ring: 'shadow-emerald-500/40',
          label: "À l'écoute",
          icon: <Mic className="h-4 w-4 animate-pulse" />,
          pulse: true,
          pingColor: 'bg-emerald-400',
        };
      case AssistantState.Speaking:
        return {
          bg: 'bg-gradient-to-r from-indigo-500 via-indigo-650 to-violet-650',
          ring: 'shadow-indigo-500/40',
          label: 'Répond…',
          icon: <Volume2 className="h-4 w-4" />,
          pulse: true,
          pingColor: 'bg-indigo-400',
        };
      case AssistantState.Thinking:
        return {
          bg: 'bg-gradient-to-r from-violet-500 via-violet-600 to-purple-650',
          ring: 'shadow-violet-500/40',
          label: 'Réfléchit…',
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          pulse: false,
          pingColor: 'bg-violet-400',
        };
      case AssistantState.Connecting:
        return {
          bg: 'bg-gradient-to-r from-sky-400 via-sky-500 to-blue-550',
          ring: 'shadow-sky-500/40',
          label: 'Connexion…',
          icon: <Wifi className="h-4 w-4" />,
          pulse: false,
          pingColor: 'bg-sky-400',
        };
      case AssistantState.Error:
        return {
          bg: 'bg-gradient-to-r from-rose-500 via-rose-600 to-pink-650',
          ring: 'shadow-rose-500/40',
          label: 'Erreur',
          icon: <MicOff className="h-4 w-4" />,
          pulse: false,
          pingColor: 'bg-rose-400',
        };
      case AssistantState.Muted:
        return {
          bg: 'bg-gradient-to-r from-stone-400 via-stone-500 to-stone-600',
          ring: 'shadow-stone-400/30',
          label: 'Muet',
          icon: <MicOff className="h-4 w-4" />,
          pulse: false,
          pingColor: 'bg-stone-300',
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-indigo-500 via-indigo-650 to-violet-650',
          ring: 'shadow-indigo-500/30',
          label: 'Lina',
          icon: <Mic className="h-4 w-4" />,
          pulse: false,
          pingColor: 'bg-indigo-400',
        };
    }
  };

  const cfg = getConfig();

  return (
    <div className="fixed inset-0 pointer-events-none z-55">
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
        initial={{ x: position.x, y: position.y }}
        animate={controls}
        className="pointer-events-auto absolute touch-none select-none [-webkit-tap-highlight-color:transparent]"
        style={{ left: 0, top: 0 }}
      >
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          aria-label={`Assistant Lina — ${cfg.label}. Glisser pour déplacer, appuyer pour ouvrir.`}
          className={`relative flex h-11 items-center gap-2.5 rounded-full px-4.5 text-white shadow-xl ${cfg.bg} ${cfg.ring} border border-white/10`}
          style={{ minWidth: BUBBLE_WIDTH }}
        >
          {/* Multiple Sonar Rings for a richer soundwave visual */}
          {cfg.pulse && (
            <>
              <span className={`absolute inset-0 rounded-full ${cfg.pingColor} opacity-25 animate-ping`} aria-hidden="true" />
              <motion.span
                className="absolute inset-0 rounded-full border border-white/40"
                aria-hidden="true"
                animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.span
                className="absolute inset-0 rounded-full border border-white/20"
                aria-hidden="true"
                animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              />
            </>
          )}

          {/* Icon */}
          <span className="relative z-10 flex-shrink-0" aria-hidden="true">{cfg.icon}</span>

          {/* Label */}
          <span className="relative z-10 text-[11px] font-black tracking-wide whitespace-nowrap">
            {cfg.label}
          </span>

          {/* Live indicator dot */}
          {cfg.pulse && (
            <span className="relative z-10 h-1.5 w-1.5 rounded-full bg-white animate-pulse flex-shrink-0" aria-hidden="true" />
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}