import { Store, Download, LogOut, CloudOff, CloudUpload, RefreshCw, Brain, Pause, Play, X, Package, HelpCircle, TrendingUp, AlertTriangle, User, Settings } from 'lucide-react';
import type { useEmbeddingGenerator } from '../hooks/useEmbeddingGenerator';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { HelpModal } from './HelpModal';

interface HeaderProps {
  email: string;
  assistantName: string;
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
  onOpenSettings?: () => void;
  embeddingGenerator: ReturnType<typeof useEmbeddingGenerator>;
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  );
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

export function Header({
  email,
  assistantName,
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
  onOpenSettings,
  embeddingGenerator,
}: HeaderProps) {
  const { isRunning, isPaused, progress, start, pause, resume, stop, canStart, currentProductName, embeddedCount } = embeddingGenerator;
  const canSync = isOnline && pendingCount > 0 && !!onSyncNow;
  const [showHelp, setShowHelp] = useState(false);
  const isDesktop = useIsDesktop();
  const showNetworkBanner = !isOnline || pendingCount > 0;

  return (
    <>
      <header className="sticky top-0 z-40 glass-panel border-b border-stone-200/50 dark:border-stone-700/50 pt-safe transition-all duration-300">
        <div className={`mx-auto w-full transition-all duration-300 ${isDesktop ? 'px-8 py-1.5 max-w-none' : 'px-4 py-3 max-w-2xl'}`}>
          {/* Identity row */}
          <div className="flex items-center justify-between gap-3">
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="min-w-0 flex-1 flex items-center gap-3"
            >
              {!isDesktop && (
                <div className="flex flex-col justify-center min-w-0">
                  <h1 className="text-base font-black tracking-tight text-stone-900 dark:text-stone-100 leading-tight flex items-center gap-1.5">
                    <Store className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span>NeuroStock</span>
                  </h1>
                  <div className="mt-1 flex items-center flex-wrap gap-x-2.5 gap-y-0.5 text-[10px] font-bold text-stone-400 dark:text-stone-500">
                    <span className="flex items-center gap-1 bg-stone-100/60 dark:bg-stone-800/60 px-1.5 py-0.5 rounded-md">
                      <Package className="h-3 w-3 text-stone-400 dark:text-stone-500" />
                      <motion.span key={inventoryLength}>{inventoryLength} articles</motion.span>
                    </span>
                  </div>
                </div>
              )}

              {isDesktop && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="desktop-stat-badge bg-stone-100/80 dark:bg-stone-800/80 border-stone-200/60 dark:border-stone-700/60 text-stone-700 dark:text-stone-300">
                    <Package className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
                    <span className="tabular">{inventoryLength}</span>
                    <span className="text-stone-400 dark:text-stone-500 font-semibold">articles</span>
                  </span>

                  <AnimatePresence>
                    {totalItems > 0 && (
                      <motion.span
                        key="total-items"
                        initial={{ opacity: 0, scale: 0.85, width: 0 }}
                        animate={{ opacity: 1, scale: 1, width: 'auto' }}
                        exit={{ opacity: 0, scale: 0.85, width: 0 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                        className="desktop-stat-badge bg-indigo-50/80 dark:bg-indigo-950/80 border-indigo-200/50 dark:border-indigo-700/50 text-indigo-700 dark:text-indigo-300 overflow-hidden whitespace-nowrap"
                      >
                        <TrendingUp className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                        <span className="tabular">{totalItems}</span>
                        <span className="text-indigo-400 dark:text-indigo-500 font-semibold">unités</span>
                      </motion.span>
                    )}

                    {lowStockCount > 0 && (
                      <motion.span
                        key="low-stock"
                        initial={{ opacity: 0, scale: 0.85, width: 0 }}
                        animate={{ opacity: 1, scale: 1, width: 'auto' }}
                        exit={{ opacity: 0, scale: 0.85, width: 0 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                        className="desktop-stat-badge bg-amber-50/80 dark:bg-amber-950/80 border-amber-200/50 dark:border-amber-700/50 text-amber-700 dark:text-amber-300 overflow-hidden whitespace-nowrap"
                      >
                        <motion.span
                          animate={{ rotate: [0, -8, 8, -8, 0] }}
                          transition={{ duration: 0.5, delay: 0.15 }}
                        >
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                        </motion.span>
                        <span className="tabular">{lowStockCount}</span>
                        <span className="text-amber-500 dark:text-amber-400 font-semibold">stock faible</span>
                      </motion.span>
                    )}
                  </AnimatePresence>

                  <motion.span
                    layout
                    className={`desktop-stat-badge ${isOnline ? 'bg-emerald-50/80 dark:bg-emerald-950/80 border-emerald-200/50 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300' : 'bg-rose-50/80 dark:bg-rose-950/80 border-rose-200/50 dark:border-rose-700/50 text-rose-700 dark:text-rose-300'}`}
                  >
                    <motion.span
                      animate={isOnline ? { scale: 1 } : { scale: [1, 1.3, 1] }}
                      transition={isOnline ? {} : { duration: 1.2, repeat: Infinity }}
                      className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-rose-500 dark:bg-rose-400'}`}
                    />
                    <span className="font-semibold">{isOnline ? 'En ligne' : 'Hors-ligne'}</span>
                  </motion.span>
                </div>
              )}
            </motion.div>

            {/* Action icons */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="flex flex-shrink-0 items-center gap-1"
            >
              {/* {isDesktop && (
                <span className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl border border-stone-200 bg-white text-[11px] font-semibold text-stone-600 shadow-xs mr-1">
                  <User className="h-3 w-3 text-stone-400" />
                  <span className="max-w-[180px] truncate">{email}</span>
                </span>
              )} */}

              <AnimatePresence>
                {canSync && (
                  <motion.button
                    key="sync-btn"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onSyncNow}
                    disabled={isSyncing}
                    aria-label={isSyncing ? 'Synchronisation en cours' : 'Synchroniser les modifications en attente'}
                    className={`touch-target grid place-items-center rounded-xl border border-amber-200 bg-amber-50/60 text-amber-700 transition-colors duration-200 disabled:opacity-50 cursor-pointer shadow-xs ${isDesktop ? 'h-7 px-2 flex items-center gap-1.5 w-auto' : 'h-10 w-10'
                      }`}
                  >
                    {isSyncing ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-700" />
                    ) : (
                      <CloudUpload className="h-3.5 w-3.5 text-amber-700" />
                    )}
                    {isDesktop && <span className="text-[11px] font-bold">{isSyncing ? 'Sync...' : 'Synchroniser'}</span>}
                  </motion.button>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.05, rotate: 8 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowHelp(true)}
                aria-label="Guide des fonctionnalités"
                className={`touch-target grid place-items-center rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400 shadow-xs transition-colors duration-200 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-700 ${isDesktop ? 'h-7 px-2 flex items-center gap-1.5 w-auto' : 'h-10 w-10'
                  }`}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                {isDesktop && <span className="text-[11px] font-bold">Aide</span>}
              </motion.button>

              {onOpenSettings && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onOpenSettings}
                  aria-label="Paramètres"
                  className={`touch-target grid place-items-center rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400 shadow-xs transition-colors duration-200 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-700 ${isDesktop ? 'h-7 px-2 flex items-center gap-1.5 w-auto' : 'h-10 w-10'
                    }`}
                >
                  <Settings className="h-3.5 w-3.5" />
                  {isDesktop && <span className="text-[11px] font-bold">Paramètres</span>}
                </motion.button>
              )}

              {/* {showExport && (
                <div className="relative">
                  <motion.button
                    layout
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => (isRunning ? (isPaused ? resume() : pause()) : onRequestVectorize ? onRequestVectorize() : start())}
                    disabled={false}
                    aria-label={
                      isRunning
                        ? isPaused
                          ? 'Reprendre la génération'
                          : 'Mettre en pause'
                        : `Générer les embeddings (${embeddedCount}/${inventoryLength})`
                    }
                    className={`touch-target grid place-items-center rounded-xl border transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-xs ${isRunning
                      ? isPaused
                        ? 'border-amber-200 bg-amber-50/50 text-amber-600 animate-pulse'
                        : 'border-indigo-200 bg-indigo-50/55 text-indigo-600 animate-glow-pulse'
                      : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                      } ${isDesktop ? 'h-7 px-2 flex items-center gap-1.5 w-auto' : 'h-10 w-10'}`}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={isRunning ? (isPaused ? 'play' : 'pause') : 'brain'}
                        initial={{ opacity: 0, scale: 0.6, rotate: -45 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.6, rotate: 45 }}
                        transition={{ duration: 0.18 }}
                        className="flex items-center gap-1.5"
                      >
                        {isRunning ? (
                          isPaused ? <Play className="h-3.5 w-3.5 text-amber-600" /> : <Pause className="h-3.5 w-3.5 text-indigo-600" />
                        ) : (
                          <Brain className="h-3.5 w-3.5" />
                        )}
                        {isDesktop && (
                          <span className="text-[11px] font-bold">
                            {isRunning ? (isPaused ? 'Reprendre' : 'Pause') : 'Vectoriser'}
                          </span>
                        )}
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>
                  <AnimatePresence>
                    {isRunning && (
                      <motion.button
                        key="stop-btn"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={stop}
                        aria-label="Arrêter la génération"
                        className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-rose-500 text-white text-[9px] font-bold shadow-sm"
                      >
                        <X className="h-2.5 w-2.5" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              )} */}

              {/* Embedding progress banner */}
              <AnimatePresence>
                {isRunning && (
                  <motion.div
                    key="embedding-progress"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    className="w-full rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-indigo-800">
                        Vectorisation {isPaused ? '(en pause)' : 'en cours'}
                      </span>
                      <span className="text-xs font-mono text-indigo-700">
                        {progress.current}/{progress.total} ({progress.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-indigo-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                        animate={{ width: `${progress.percentage}%` }}
                        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                      />
                    </div>
                    {currentProductName && (
                      <p className="mt-1 text-[10px] text-indigo-600 truncate">En cours : {currentProductName}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {showExport && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onExport}
                  aria-label="Exporter l'inventaire en CSV"
                  className={`touch-target grid place-items-center rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 shadow-xs transition-colors duration-200 hover:bg-stone-50 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-stone-100 ${isDesktop ? 'h-7 px-2 flex items-center gap-1.5 w-auto' : 'h-10 w-10'
                    }`}
                >
                  <Download className="h-3.5 w-3.5" />
                  {isDesktop && <span className="text-[11px] font-bold">Exporter</span>}
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                aria-label="Se déconnecter"
                className={`touch-target grid place-items-center rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-200 shadow-xs ${isDesktop ? 'h-7 px-2 flex items-center gap-1.5 w-auto' : 'h-10 w-10'
                  }`}
              >
                <LogOut className="h-3.5 w-3.5" />
                {isDesktop && <span className="text-[11px] font-bold">Déconnexion</span>}
              </motion.button>
            </motion.div>
          </div>

          {/* Single connection banner */}
          <AnimatePresence initial={false}>
            {showNetworkBanner && (
              <motion.button
                key="network-banner"
                type="button"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                onClick={canSync ? onSyncNow : undefined}
                disabled={!canSync}
                aria-label={`Statut réseau : ${!isOnline ? 'Hors-ligne' : `${pendingCount} en attente`}${canSync ? ', touchez pour synchroniser' : ''}`}
                className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition overflow-hidden ${!isOnline ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-700' : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-700'
                  } ${canSync ? 'tap-active cursor-pointer' : 'cursor-default'}`}
              >
                {!isOnline ? (
                  <CloudOff className="h-3.5 w-3.5 flex-shrink-0" />
                ) : (
                  <span className="h-2 w-2 flex-shrink-0 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
                )}
                <span className="min-w-0 flex-1 truncate">
                  {!isOnline ? 'Hors-ligne' : `${pendingCount} opération${pendingCount > 1 ? 's' : ''} en attente`}
                </span>
                {canSync && (
                  <span className="flex-shrink-0 text-[11px] font-bold underline-offset-2 opacity-80">
                    {isSyncing ? '...' : 'Synchroniser'}
                  </span>
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </header>

      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} assistantName={assistantName} />
    </>
  );
}