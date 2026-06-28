import type React from "react";
import { navItems } from "./AppNavigation";

export type AppTab = "scan" | "autoScan" | "stock" | "categories";

type SidebarNavProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
};

export function SidebarNav({ activeTab, onTabChange }: SidebarNavProps) {
  return (
    <div className="flex h-full flex-col gap-1 p-3">
      {navItems.map(({ tab, label, activeClass, activeBgClass, icon: Icon }) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 transition active:scale-[0.97] ${
              isActive
                ? `${activeClass} ${activeBgClass}`
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? "" : "text-stone-500"}`} />
            <span className="text-sm font-semibold">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

type DesktopShellProps = {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
};

export function DesktopShell({ sidebar, header, children }: DesktopShellProps) {
  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden lg:flex lg:w-64 xl:w-72 lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:border-r lg:border-stone-200/70 lg:bg-white/70 lg:backdrop-blur-xl">
        {sidebar}
      </aside>

      <div className="flex min-h-screen w-full flex-col lg:pl-64 xl:pl-72">
        {header}

        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
