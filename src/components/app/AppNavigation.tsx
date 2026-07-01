'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useCallback, useContext, type ElementType } from 'react';
import {
  Home,
  Package,
  LayoutDashboard,
  ShoppingCart,
  Mic,
  MicOff,
  Loader2,
} from 'lucide-react';
import { GeminiAssistantContext } from '../../providers/GeminiAssistantProvider';
import { AssistantState } from '../GeminiAssistant/types';

// ─── Types ───────────────────────────────────────────────────────────────────

export type AppTab = 'scan' | 'stock' | 'categories' | 'pos' | 'dashboard' | 'settings';

interface AppNavigationProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  assistantName?: string;
  /** Badge count shown on the Stock tab (e.g. low-stock items) */
  stockBadge?: number;
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

type TabDef = { id: AppTab; icon: ElementType; label: string };

const LEFT_TABS: TabDef[] = [
  { id: 'scan',      icon: Home,            label: 'Accueil'  },
  { id: 'stock',     icon: Package,         label: 'Stock'    },
];

const RIGHT_TABS: TabDef[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Stats'   },
  { id: 'pos',       icon: ShoppingCart,    label: 'Opérations'  },
];

// Swipe order (assistant FAB in the middle)
const SWIPE_ORDER: AppTab[] = ['scan', 'stock', 'dashboard', 'pos'];

// ─── AppNavigation ────────────────────────────────────────────────────────────

export function AppNavigation({
  activeTab,
  onTabChange,
  assistantName = 'Lina',
  stockBadge = 0,
}: AppNavigationProps) {
  // ── assistant context ─────────────────────────────────────────────────────
  const assistant = useContext(GeminiAssistantContext);
  const assistantState = assistant?.state ?? AssistantState.Idle;
  const isAssistantOpen = assistant?.isOpen ?? false;

  const isListening   = assistantState === AssistantState.Listening;
  const isSpeaking    = assistantState === AssistantState.Speaking;
  const isThinking    = assistantState === AssistantState.Thinking;
  const isConnecting  = assistantState === AssistantState.Connecting;
  const isError       = assistantState === AssistantState.Error;
  const isActive      = isAssistantOpen && assistantState !== AssistantState.Idle;

  // ── haptics ──────────────────────────────────────────────────────────────
  const triggerHaptic = useCallback((type: 'light' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      navigator.vibrate(type === 'heavy' ? [10, 20, 10] : 5);
    }
    try {
      // @ts-ignore – iOS WebView bridge
      window?.webkit?.messageHandlers?.haptic?.postMessage(type);
    } catch {}
  }, []);

  const handleChange = useCallback(
    (id: AppTab) => {
      triggerHaptic('light');
      onTabChange(id);
    },
    [triggerHaptic, onTabChange],
  );

  const handleFabClick = useCallback(() => {
    triggerHaptic('heavy');
    if (!assistant) return;
    if (isAssistantOpen) {
      void assistant.close();
    } else {
      void assistant.open();
    }
  }, [triggerHaptic, assistant, isAssistantOpen]);

  // ── swipe ─────────────────────────────────────────────────────────────────
  const swipeIndex = SWIPE_ORDER.indexOf(activeTab);

  const handleDragEnd = useCallback(
    (_e: unknown, info: { offset: { x: number } }) => {
      if (info.offset.x > 60 && swipeIndex > 0) {
        handleChange(SWIPE_ORDER[swipeIndex - 1]);
      } else if (info.offset.x < -60 && swipeIndex < SWIPE_ORDER.length - 1) {
        handleChange(SWIPE_ORDER[swipeIndex + 1]);
      }
    },
    [swipeIndex, handleChange],
  );

  // ── active-pill position ──────────────────────────────────────────────────
  const pillIndex =
    activeTab === 'scan'      ? 0 :
    activeTab === 'stock'     ? 1 :
    activeTab === 'dashboard' ? 2 :
    activeTab === 'pos'       ? 3 :
    -1;

  // ── FAB icon & colors ─────────────────────────────────────────────────────
  const fabLabel = isAssistantOpen
    ? isConnecting ? 'Connexion…'
    : isListening  ? 'Écoute…'
    : isSpeaking   ? `${assistantName} parle…`
    : isThinking   ? 'Réflexion…'
    : isError      ? 'Erreur'
    : 'Actif'
    : assistantName;

  return (
    <motion.div
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[env(safe-area-inset-bottom)]"
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.08}
        onDragEnd={handleDragEnd}
        className="
          relative flex items-center justify-between
          w-[92%] max-w-md
          px-2 py-1.5 mb-3
          rounded-[28px]
          bg-white/80 dark:bg-zinc-900/70
          backdrop-blur-3xl
          border border-white/30 dark:border-white/10
          shadow-[0_12px_48px_-8px_rgba(0,0,0,0.22),0_2px_8px_rgba(0,0,0,0.08)]
        "
      >
        {/* ── Active pill ───────────────────────────────────────── */}
        <AnimatePresence>
          {pillIndex >= 0 && (
            <motion.div
              key="pill"
              layoutId="nav-pill"
              initial={false}
              animate={{ left: `calc(${pillIndex * 25}% + 4px)`, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="
                pointer-events-none absolute top-1.5 bottom-1.5
                w-[calc(25%-8px)]
                rounded-[20px]
                bg-gradient-to-b from-indigo-50 to-indigo-100/80
                dark:from-indigo-500/20 dark:to-indigo-600/10
                border border-indigo-200/60 dark:border-indigo-500/20
                shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]
              "
            />
          )}
        </AnimatePresence>

        {/* ── LEFT tabs ─────────────────────────────────────────── */}
        {LEFT_TABS.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onClick={() => handleChange(tab.id)}
            badge={tab.id === 'stock' ? stockBadge : 0}
          />
        ))}

        {/* ── FAB — Voice Assistant ──────────────────────────────── */}
        <div className="relative flex flex-col items-center justify-center w-16 flex-shrink-0">
          {/* Ripple rings when listening or speaking */}
          <AnimatePresence>
            {(isListening || isSpeaking) && (
              <>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className={`absolute rounded-full pointer-events-none ${
                      isSpeaking
                        ? 'border border-violet-400/50'
                        : 'border border-indigo-400/50'
                    }`}
                    style={{ width: 56, height: 56 }}
                    animate={{
                      scale: [1, 1.8 + i * 0.4],
                      opacity: [0.6, 0],
                    }}
                    transition={{
                      duration: 1.6,
                      delay: i * 0.35,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleFabClick}
            whileTap={{ scale: 0.88 }}
            animate={isActive ? { y: -14, scale: 1.06 } : { y: -12, scale: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            aria-label={isAssistantOpen ? `Fermer ${assistantName}` : `Ouvrir ${assistantName}`}
            aria-pressed={isAssistantOpen}
            className={`
              relative h-14 w-14 rounded-[18px] text-white
              flex items-center justify-center
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
              transition-shadow duration-300
              ${isError
                ? 'bg-gradient-to-br from-rose-400 to-red-600 shadow-[0_8px_24px_-4px_rgba(239,68,68,0.55)] focus-visible:ring-rose-400'
                : isAssistantOpen
                  ? 'bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 shadow-[0_8px_28px_-4px_rgba(139,92,246,0.65)] focus-visible:ring-violet-400'
                  : 'bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 shadow-[0_8px_24px_-4px_rgba(99,102,241,0.50)] focus-visible:ring-indigo-400'
              }
            `}
          >
            {/* Shine */}
            <div className="absolute inset-0 rounded-[18px] bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />

            {/* Icon */}
            <AnimatePresence mode="wait" initial={false}>
              {isConnecting ? (
                <motion.span
                  key="connecting"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Loader2 className="h-6 w-6 animate-spin" />
                </motion.span>
              ) : isError ? (
                <motion.span
                  key="error"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <MicOff className="h-6 w-6" />
                </motion.span>
              ) : isAssistantOpen ? (
                <motion.span
                  key="mic-active"
                  initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0, rotate: 20 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {/* Sound wave bars when speaking */}
                  {isSpeaking ? (
                    <SoundWave />
                  ) : (
                    <Mic className="h-6 w-6" strokeWidth={2.25} />
                  )}
                </motion.span>
              ) : (
                <motion.span
                  key="mic-idle"
                  initial={{ scale: 0.5, opacity: 0, rotate: 20 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0, rotate: -20 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Mic className="h-6 w-6" strokeWidth={1.75} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Label below FAB */}
          <motion.span
            animate={
              isActive
                ? { opacity: 1, y: 0 }
                : { opacity: 0.5, y: 1 }
            }
            className={`
              absolute -bottom-0.5
              text-[9px] font-bold tracking-wide
              transition-colors duration-200
              ${isActive ? 'text-indigo-600' : 'text-stone-400'}
            `}
          >
            {fabLabel}
          </motion.span>
        </div>

        {/* ── RIGHT tabs ────────────────────────────────────────── */}
        {RIGHT_TABS.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onClick={() => handleChange(tab.id)}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─── Sound wave animation (shown when assistant is speaking) ─────────────────

function SoundWave() {
  const bars = [0.5, 1, 0.7, 1, 0.5];
  return (
    <span className="flex items-center gap-[2px] h-6 w-6 justify-center">
      {bars.map((height, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-white"
          animate={{ scaleY: [height, 1, height * 0.6, 1, height] }}
          transition={{
            duration: 0.8,
            delay: i * 0.1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ height: 18, originY: 0.5 }}
        />
      ))}
    </span>
  );
}

// ─── TabButton ────────────────────────────────────────────────────────────────

function TabButton({
  tab,
  isActive,
  onClick,
  badge = 0,
}: {
  tab: TabDef;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
}) {
  const Icon = tab.icon;

  return (
    <button
      onClick={onClick}
      aria-label={tab.label}
      aria-current={isActive ? 'page' : undefined}
      className="relative flex flex-col items-center justify-center flex-1 h-14 gap-0.5 select-none"
    >
      <motion.div
        whileTap={{ scale: 0.78 }}
        animate={isActive ? { y: -2, scale: 1.12 } : { y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 460, damping: 28 }}
        className="relative"
      >
        {/* Glow dot */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              key="glow"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.8, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="absolute inset-0 rounded-full bg-indigo-400/20 blur-md pointer-events-none"
            />
          )}
        </AnimatePresence>

        <Icon
          strokeWidth={isActive ? 2.25 : 1.75}
          className={`h-[22px] w-[22px] transition-colors duration-150 ${
            isActive ? 'text-indigo-600' : 'text-stone-400 dark:text-stone-500'
          }`}
        />

        
      </motion.div>

      {/* Label — always visible */}
      <motion.span
        animate={
          isActive
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0.45, y: 1, scale: 0.92 }
        }
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className={`text-[10px] leading-none font-semibold transition-colors duration-150 ${
          isActive ? 'text-indigo-600' : 'text-stone-400 dark:text-stone-500'
        }`}
      >
        {tab.label}
      </motion.span>
    </button>
  );
}
