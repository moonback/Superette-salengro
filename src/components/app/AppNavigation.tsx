import type React from "react";
import { Bot, Package, Scan, Tags, Zap } from "lucide-react";
import { useGeminiAssistant } from "../../hooks/useGeminiAssistant";
import { motion } from "motion/react";

export type AppTab = "scan" | "autoScan" | "stock" | "categories";

type NavItem = {
  tab: AppTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { tab: "scan", label: "Scanner", icon: Scan },
  { tab: "autoScan", label: "Auto", icon: Zap },
  { tab: "stock", label: "Stock", icon: Package },
  { tab: "categories", label: "Catég.", icon: Tags },
];

type AppNavigationProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
};

export function AppNavigation({ activeTab, onTabChange }: AppNavigationProps) {
  const assistant = useGeminiAssistant();
  const isAssistantActive = assistant.isOpen && !assistant.isMinimized;

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