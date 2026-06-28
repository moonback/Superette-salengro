import type React from "react";
import { useMemo } from "react";
import { AppTab } from "./AppNavigation";
import { navItems } from "./AppNavigation";

export function SidebarNav({
  activeTab,
  onTabChange,
}: {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}) {
  const items = useMemo(
    () =>
      navItems.map(({ tab, label, icon: Icon }) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
            activeTab === tab
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          aria-current={activeTab === tab ? "page" : undefined}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </button>
      )),
    [activeTab, onTabChange],
  );

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3">
      <div className="space-y-1">{items}</div>
    </nav>
  );
}
