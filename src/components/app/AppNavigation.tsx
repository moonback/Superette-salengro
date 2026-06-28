import type React from "react";
import { Bot, Package, Scan, Tags, Zap } from "lucide-react";
import { useGeminiAssistant } from "../../hooks/useGeminiAssistant";

export type AppTab = "scan" | "autoScan" | "stock" | "categories";

type NavItem = {
  tab: AppTab;
  label: string;
  activeClass: string;
  activeBgClass: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const navItems: NavItem[] = [
  { tab: "scan", label: "Scanner", activeClass: "text-slate-900", activeBgClass: "bg-stone-50", icon: Scan },
  { tab: "autoScan", label: "Scan Rapide", activeClass: "text-amber-500", activeBgClass: "bg-amber-50", icon: Zap },
  { tab: "stock", label: "Gestion Stock", activeClass: "text-emerald-500", activeBgClass: "bg-emerald-50", icon: Package },
  { tab: "categories", label: "Catégories", activeClass: "text-slate-900", activeBgClass: "bg-stone-50", icon: Tags },
];

type AppNavigationProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
};

export function AppNavigation({ activeTab, onTabChange }: AppNavigationProps) {
  const assistant = useGeminiAssistant();
  const isAssistantActive = assistant.isOpen && !assistant.isMinimized;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-safe">
      <div className="bg-white border border-slate-200 mx-auto flex max-w-md justify-around rounded-2xl px-2 py-2 shadow-sm shadow-stone-900/10">
        {navItems.map(({ tab, label, activeClass, activeBgClass, icon: Icon }) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition select-none tap-active ${isActive ? activeClass : "text-stone-400 hover:text-stone-700"
                }`}
            >
              <div className={`p-2 rounded-2xl transition ${isActive ? activeBgClass : ""}`}>
                <Icon className={`w-6 h-6 ${isActive ? "fill-current" : ""}`} />
              </div>
              <span className="text-[11px] font-bold tracking-wide">{label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => void assistant.open()}
          className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition select-none tap-active ${isAssistantActive ? "text-violet-600" : "text-stone-400 hover:text-stone-700"
            }`}
          aria-label="Ouvrir l’assistant vocal"
        >
          <div className={`p-2 rounded-2xl transition ${isAssistantActive ? "bg-violet-50" : ""}`}>
            <Bot className={`w-6 h-6 ${isAssistantActive ? "fill-current" : ""}`} />
          </div>
          <span className="text-[11px] font-bold tracking-wide">Julien</span>
        </button>
      </div>
    </nav>
  );
}
