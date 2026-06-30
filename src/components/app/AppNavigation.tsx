import type React from "react";
import { Bot, Package, Scan, Store, Tags, Zap } from "lucide-react";
import { useGeminiAssistant } from "../../hooks/useGeminiAssistant";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export type AppTab = "scan" | "autoScan" | "stock" | "categories";

type NavItem = {
  tab: AppTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { tab: "scan", label: "Scanner", icon: Scan },
  { tab: "autoScan", label: "Auto-Scan", icon: Zap },
  { tab: "stock", label: "Stock", icon: Package },
  { tab: "categories", label: "Catégories", icon: Tags },
];

type AppNavigationProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
};

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches
  );

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isDesktop;
}

export function AppNavigation({ activeTab, onTabChange }: AppNavigationProps) {
  const assistant = useGeminiAssistant();
  const isAssistantActive = assistant.isOpen && !assistant.isMinimized;
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <aside className="desktop-sidebar">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-3 pb-4 pt-1">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25 flex-shrink-0">
            <Store className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-black text-stone-900 leading-none tracking-tight">NeuroStock</p>
            <p className="text-[10px] text-stone-400 font-semibold mt-0.5 leading-none">Gestion intelligente</p>
          </div>
        </div>

        <div className="sidebar-divider" />

        {/* Nav items */}
        <nav className="flex flex-col gap-0.5 mt-1 flex-1">
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400 px-3 py-1.5">
            Navigation
          </p>
          {navItems.map(({ tab, label, icon: Icon }) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onTabChange(tab)}
                aria-current={isActive ? "page" : undefined}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktopActiveTabPill"
                    className="absolute inset-0 bg-indigo-50/80 rounded-[0.875rem] -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-indigo-600 stroke-[2.5]" : "text-stone-500 stroke-[2]"}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-divider mt-1" />

        {/* Assistant Lina at bottom */}
        <div className="mt-1">
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400 px-3 py-1.5">
            Assistant IA
          </p>
          <button
            type="button"
            onClick={() => void assistant.open()}
            aria-label="Ouvrir l'assistant vocal Lina"
            aria-pressed={isAssistantActive}
            className={`sidebar-nav-item w-full ${isAssistantActive ? "active !text-violet-600 !bg-violet-50/80 !border-violet-200/60" : ""}`}
          >
            {isAssistantActive && (
              <motion.div
                layoutId="desktopActiveTabPill"
                className="absolute inset-0 bg-violet-50/80 rounded-[0.875rem] -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Bot className={`w-4 h-4 flex-shrink-0 ${isAssistantActive ? "text-violet-600 stroke-[2.5]" : "text-stone-500 stroke-[2]"}`} />
            <span>Lina</span>
            {isAssistantActive && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_6px_2px_rgba(139,92,246,0.4)]"
              />
            )}
          </button>
        </div>
      </aside>
    );
  }

  /* ── Mobile bottom nav ── */
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-safe bg-gradient-to-t from-stone-100/30 to-transparent pointer-events-none">
      <div className="glass-panel mx-auto flex max-w-md justify-around rounded-2xl border border-stone-200/60 px-2 py-1.5 shadow-xl shadow-stone-900/5 pointer-events-auto">
        {navItems.map(({ tab, label, icon: Icon }) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 transition-colors duration-250 select-none touch-manipulation [-webkit-tap-highlight-color:transparent] ${
                isActive ? "text-indigo-600 font-bold" : "text-stone-400 hover:text-stone-600 active:text-stone-850"
              }`}
              style={{ minHeight: 48 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-indigo-50/80 rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <motion.div
                animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className="p-1"
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
              </motion.div>
              <span className="text-[10px] tracking-wide leading-none">{label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => void assistant.open()}
          aria-label="Ouvrir l'assistant vocal"
          aria-pressed={isAssistantActive}
          className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 transition-colors duration-250 select-none touch-manipulation [-webkit-tap-highlight-color:transparent] ${
            isAssistantActive ? "text-violet-600 font-bold" : "text-stone-400 hover:text-stone-600 active:text-stone-850"
          }`}
          style={{ minHeight: 48 }}
        >
          {isAssistantActive && (
            <motion.div
              layoutId="activeTabPill"
              className="absolute inset-0 bg-violet-50/80 rounded-xl -z-10"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <motion.div
            animate={isAssistantActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            className="p-1"
          >
            <Bot className={`w-5 h-5 ${isAssistantActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
          </motion.div>
          <span className="text-[10px] tracking-wide leading-none">Lina</span>
        </button>
      </div>
    </nav>
  );
}