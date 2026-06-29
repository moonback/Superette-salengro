import type React from "react";
import { Bot, Package, Scan, Tags, Zap } from "lucide-react";
import { useGeminiAssistant } from "../../hooks/useGeminiAssistant";

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
              onClick={() => onTabChange(tab)}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 transition select-none tap-active ${
                isActive ? "text-indigo-600" : "text-stone-400 hover:text-stone-700"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-colors duration-200 ${isActive ? "bg-indigo-50/70" : ""}`}>
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
              </div>
              <span className="text-[10px] font-bold tracking-wide">{label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => void assistant.open()}
          className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 transition select-none tap-active ${
            isAssistantActive ? "text-violet-650" : "text-stone-400 hover:text-stone-700"
          }`}
          aria-label="Ouvrir l’assistant vocal"
        >
          <div className={`p-1.5 rounded-xl transition-colors duration-200 ${isAssistantActive ? "bg-violet-50" : ""}`}>
            <Bot className={`w-5 h-5 ${isAssistantActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
          </div>
          <span className="text-[10px] font-bold tracking-wide">Julien</span>
        </button>
      </div>
    </nav>
  );
}
