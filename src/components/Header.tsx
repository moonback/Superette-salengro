
import { Store, Download, LogOut, CloudOff, CloudUpload, RefreshCw, Check, Brain, Pause, Play, X } from 'lucide-react';
import type { useEmbeddingGenerator } from '../hooks/useEmbeddingGenerator';

interface HeaderProps {
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
  embeddingGenerator: ReturnType<typeof useEmbeddingGenerator>;
}

export function Header({
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
}: HeaderProps) {
  const { isRunning, isPaused, progress, start, pause, resume, stop, canStart, currentProductName } = embeddingGenerator;
  const embeddedCount = inventoryLength - progress.total + progress.current;
  const canSync = isOnline && pendingCount > 0 && !!onSyncNow;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 pt-safe">
      <div className="mx-auto w-full px-4 pb-3 pt-3">
        {/* Identity row */}
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl border border-slate-900 bg-slate-900 text-white">
            <Store className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-extrabold tracking-tight text-stone-950">
              NeuroStocks
            </h1>
            {/* Compact stats */}
            <div className="mt-1 flex items-center gap-3 text-[11px] font-semibold text-stone-500">
              <span className="flex items-center gap-1">
                <span className="text-stone-400">📦</span> {inventoryLength} articles
              </span>
              {/* <span className="flex items-center gap-1">
                <span className="text-emerald-500">🧾</span> {totalItems}
              </span>
              <span className="flex items-center gap-1">
                <span className={lowStockCount > 0 ? "text-amber-500" : "text-stone-400"}>⚠️</span> {lowStockCount}
              </span> */}
            </div>
          </div>

          {/* Action icons: always reachable with the thumb, never wrap, never crowd the title */}
          <div className="flex flex-shrink-0 items-center gap-1.5">
            {canSync && (
              <button
                onClick={onSyncNow}
                disabled={isSyncing}
                aria-label={isSyncing ? "Synchronisation en cours" : "Synchroniser les modifications en attente"}
                className="touch-target grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition tap-active hover:bg-slate-50 disabled:opacity-50"
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <CloudUpload className="h-4 w-4" />
                )}
              </button>
            )}
            {showExport && (
              <div className="relative">
                <button
                  onClick={() => isRunning ? (isPaused ? resume() : pause()) : start()}
                  disabled={!canStart && !isRunning}
                  aria-label={
                    isRunning ? (isPaused ? "Reprendre la génération" : "Mettre en pause")
                      : embeddedCount === inventoryLength
                        ? "Tous les produits sont vectorisés"
                        : `Générer les embeddings (${embeddedCount}/${inventoryLength})`
                  }
                  className={`touch-target grid h-10 w-10 place-items-center rounded-2xl border transition tap-active disabled:opacity-50 ${
                    embeddedCount === inventoryLength && !isRunning
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  {isRunning ? (
                    isPaused ? (
                      <Play className="h-4 w-4" />
                    ) : (
                      <Pause className="h-4 w-4" />
                    )
                  ) : (
                    <Brain className="h-4 w-4" />
                  )}
                </button>
                {isRunning && (
                  <button
                    onClick={stop}
                    aria-label="Arrêter la génération"
                    className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-slate-900 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
            {showExport && (
              <button
                onClick={onExport}
                aria-label="Exporter l'inventaire en CSV"
                className="touch-target grid h-10 w-10 place-items-center rounded-2xl border border-stone-200 bg-white text-stone-600 shadow-sm transition tap-active hover:border-stone-300 hover:text-stone-900"
              >
                <Download className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onLogout}
              aria-label="Se déconnecter"
              className="touch-target grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition tap-active hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Single connection banner — tappable only when there's something to do */}
        {(!isOnline || pendingCount > 0) && (
          <button
            type="button"
            onClick={canSync ? onSyncNow : undefined}
            disabled={!canSync}
            aria-label={`Statut réseau : ${!isOnline ? "Hors-ligne" : `${pendingCount} en attente`}${canSync ? ", touchez pour synchroniser" : ""}`}
            className={`mt-2.5 flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-left text-xs font-semibold text-slate-700 transition ${canSync ? 'tap-active cursor-pointer' : 'cursor-default'}`}
          >
            {!isOnline ? (
              <CloudOff className="h-3.5 w-3.5 flex-shrink-0" />
            ) : (
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-slate-900" />
            )}
            <span className="min-w-0 flex-1 truncate">{!isOnline ? "Hors-ligne" : `${pendingCount} opération${pendingCount > 1 ? "s" : ""} en attente`}</span>
            {canSync && (
              <span className="flex-shrink-0 text-[11px] font-bold underline-offset-2 opacity-80">
                {isSyncing ? "..." : "Synchroniser"}
              </span>
            )}
          </button>
        )}

        {/* Embedding progress banner */}
        {isRunning && (
          <div className="mt-2.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-900">
                Vectorisation {isPaused ? "(en pause)" : "en cours"}
              </span>
              <span className="text-xs font-mono text-slate-700">
                {progress.current}/{progress.total} ({progress.percentage}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-900 transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            {currentProductName && (
              <p className="mt-1 text-[10px] text-slate-500 truncate">
                En cours : {currentProductName}
              </p>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
