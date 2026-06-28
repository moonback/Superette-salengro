import type React from "react";
import { Header } from "../Header";
import { navItems, AppTab } from "./AppNavigation";
import { SidebarNav } from "./DesktopShell";

export function AdminDesktopLayout({
  activeTab,
  onTabChange,
  email,
  inventoryLength,
  totalItems,
  lowStockCount,
  showExport,
  isOnline,
  pendingCount,
  isSyncing,
  onExport,
  onLogout,
  onSyncNow,
  embeddingGenerator,
  children,
}: {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  email: string;
  inventoryLength: number;
  totalItems: number;
  lowStockCount: number;
  showExport: boolean;
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  onExport: () => void;
  onLogout: () => void;
  onSyncNow?: () => void;
  embeddingGenerator: unknown;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden lg:flex lg:w-64 xl:w-72 lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:border-r lg:border-slate-200 lg:bg-white">
        <div className="flex h-full flex-col">
          <div className="px-4 pt-5 pb-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-900 bg-slate-900 text-white">
                <span className="text-sm font-black">NS</span>
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-extrabold tracking-tight text-slate-900">
                  NeuroStocks
                </div>
                <div className="text-[11px] font-semibold text-slate-500">Admin</div>
              </div>
            </div>
          </div>
          <div className="mx-4 h-px bg-slate-200" aria-hidden="true" />
          <SidebarNav activeTab={activeTab} onTabChange={onTabChange} />
        </div>
      </aside>

      <div className="flex min-h-screen w-full flex-col lg:pl-64 xl:pl-72">
        <header className="sticky top-0 z-40 hidden lg:block border-b border-slate-200 bg-white">
          <div className="mx-auto w-full max-w-6xl px-4 pb-3 pt-3">
            <Header
              email={email}
              inventoryLength={inventoryLength}
              totalItems={totalItems}
              lowStockCount={lowStockCount}
              showExport={showExport}
              isOnline={isOnline}
              pendingCount={pendingCount}
              isSyncing={isSyncing}
              onExport={onExport}
              onLogout={onLogout}
              onSyncNow={onSyncNow}
              embeddingGenerator={embeddingGenerator as never}
            />
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
