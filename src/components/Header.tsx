
import { Store, Download, LogOut, CloudOff, CloudUpload, RefreshCw, Brain, Pause, Play, X, Package, HelpCircle } from 'lucide-react';
import type { useEmbeddingGenerator } from '../hooks/useEmbeddingGenerator';
import { motion } from 'motion/react';
import { useState } from 'react';
import { HelpModal } from './HelpModal';

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
  onRequestVectorize?: () => void;
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
  onRequestVectorize,
  embeddingGenerator,
}: HeaderProps) {
  const { isRunning, isPaused, progress, start, pause, resume, stop, canStart, currentProductName, embeddedCount } = embeddingGenerator;
  const canSync = isOnline && pendingCount > 0 && !!onSyncNow;
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
    <header className="sticky top-0 z-40 glass-panel border-b border-stone-200/50 pt-safe transition-all duration-300">
      <div className="mx-auto w-full max-w-2xl px-4 pb-3 pt-3">
        {/* Identity row */}
        <div className="flex items-center justify-between gap-3">
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="min-w-0 flex-1 flex flex-col justify-center"
          >
            <h1 className="text-base font-black tracking-tight text-stone-900 leading-tight flex items-center gap-1.5">
              <Store className="h-4 w-4 text-indigo-600" />
              <span>NeuroStock</span>
            </h1>
            {/* Compact stats */}
            <div className="mt-1 flex items-center flex-wrap gap-x-2.5 gap-y-0.5 text-[10px] font-bold text-stone-400">
              <span className="flex items-center gap-1 bg-stone-100/60 px-1.5 py-0.5 rounded-md">
                <Package className="h-3 w-3 text-stone-400" />
                <span>{inventoryLength} articles</span>
              </span>
            </div>
          </motion.div>

          {/* Action icons: always reachable with the thumb, never wrap, never crowd the title */}
          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-shrink-0 items-center gap-1.5"
          >
            {canSync && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSyncNow}
                disabled={isSyncing}
                aria-label={isSyncing ? "Synchronisation en cours" : "Synchroniser les modifications en attente"}
                className="touch-target grid h-10 w-10 place-items-center rounded-xl border border-amber-200 bg-amber-50/60 text-amber-700 transition-colors duration-200 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-amber-700" />
                ) : (
                  <CloudUpload className="h-4 w-4 text-amber-700" />
                )}
              </motion.button>
            )}
            {showExport && (embeddedCount < inventoryLength || isRunning) && (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => isRunning ? (isPaused ? resume() : pause()) : (onRequestVectorize ? onRequestVectorize() : start())}
                  disabled={!canStart && !isRunning}
                  aria-label={
                    isRunning ? (isPaused ? "Reprendre la génération" : "Mettre en pause")
                      : `Générer les embeddings (${embeddedCount}/${inventoryLength})`
                  }
                  className={`touch-target grid h-10 w-10 place-items-center rounded-xl border transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-xs ${isRunning
                    ? isPaused
                      ? "border-amber-200 bg-amber-50/50 text-amber-600 animate-pulse"
                      : "border-indigo-200 bg-indigo-50/55 text-indigo-600 animate-glow-pulse"
                    : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                    }`}
                >
                  {isRunning ? (
                    isPaused ? (
                      <Play className="h-4 w-4 text-amber-600" />
                    ) : (
                      <Pause className="h-4 w-4 text-indigo-600" />
                    )
                  ) : (
                    <Brain className="h-4 w-4" />
                  )}
                </motion.button>
                {isRunning && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    onClick={stop}
                    aria-label="Arrêter la génération"
                    className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-rose-500 text-white text-[9px] font-bold shadow-sm"
                  >
                    <X className="h-2.5 w-2.5" />
                  </motion.button>
                )}
              </div>
            )}
            {/* Help button — always visible */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHelp(true)}
              aria-label="Guide des fonctionnalités"
              className="touch-target grid h-10 w-10 place-items-center rounded-xl border border-stone-200 bg-white text-stone-500 shadow-xs transition-colors duration-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
            >
              <HelpCircle className="h-4 w-4" />
            </motion.button>
            {showExport && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onExport}
                aria-label="Exporter l'inventaire en CSV"
                className="touch-target grid h-10 w-10 place-items-center rounded-xl border border-stone-200 bg-white text-stone-600 shadow-xs transition-colors duration-200 hover:bg-stone-50 hover:text-stone-900"
              >
                <Download className="h-4 w-4" />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              aria-label="Se déconnecter"
              className="touch-target grid h-10 w-10 place-items-center rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-rose-600 transition-colors duration-200 shadow-xs"
            >
              <LogOut className="h-4 w-4" />
            </motion.button>
          </motion.div>
        </div>


        {/* Single connection banner — tappable only when there's something to do */}
        {(!isOnline || pendingCount > 0) && (
          <button
            type="button"
            onClick={canSync ? onSyncNow : undefined}
            disabled={!canSync}
            aria-label={`Statut réseau : ${!isOnline ? "Hors-ligne" : `${pendingCount} en attente`}${canSync ? ", touchez pour synchroniser" : ""}`}
            className={`mt-2.5 flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${!isOnline
              ? "text-rose-600 bg-rose-50 border-rose-200"
              : "text-amber-600 bg-amber-50 border-amber-200"
              } ${canSync ? "tap-active cursor-pointer" : "cursor-default"}`}
          >
            {!isOnline ? (
              <CloudOff className="h-3.5 w-3.5 flex-shrink-0" />
            ) : (
              <span className={`h-2 w-2 flex-shrink-0 rounded-full ${!isOnline ? "bg-rose-500" : "bg-amber-500 animate-pulse"}`} />
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
          <div className="mt-2.5 w-full rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-indigo-800">
                Vectorisation {isPaused ? "(en pause)" : "en cours"}
              </span>
              <span className="text-xs font-mono text-indigo-700">
                {progress.current}/{progress.total} ({progress.percentage}%)
              </span>
            </div>
            <div className="w-full h-2 bg-indigo-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            {currentProductName && (
              <p className="mt-1 text-[10px] text-indigo-600 truncate">
                En cours : {currentProductName}
              </p>
            )}
          </div>
        )}
      </div>
    </header>

    <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
}
