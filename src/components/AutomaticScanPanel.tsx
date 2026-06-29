import { Loader2, ScanLine, Zap } from "lucide-react";
import { ManualInput } from "./ManualInput";
import { CameraBarcodeScanner } from "./CameraBarcodeScanner";
import { StockScanModeToggle, StockScanMode } from "./StockScanModeToggle";
import { ScannerInputMode, ScannerInputModeToggle } from "./ScannerInputModeToggle";
import { motion, AnimatePresence } from "motion/react";

interface AutomaticScanPanelProps {
  enabled: boolean;
  mode: StockScanMode;
  loadingBarcode: string | null;
  isOnline: boolean;
  pendingCount: number;
  syncError: string | null;
  onEnabledChange: (enabled: boolean) => void;
  onModeChange: (mode: StockScanMode) => void;
  scannerInputMode: ScannerInputMode;
  onScannerInputModeChange: (mode: ScannerInputMode) => void;
  onScan: (barcode: string) => void;
}

export function AutomaticScanPanel({
  enabled,
  mode,
  loadingBarcode,
  isOnline,
  pendingCount,
  syncError,
  onEnabledChange,
  onModeChange,
  scannerInputMode,
  onScannerInputModeChange,
  onScan,
}: AutomaticScanPanelProps) {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Scan header card */}
      <div className="rounded-2xl border border-stone-200/60 bg-white p-4.5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/15">
              <Zap className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight text-stone-900 leading-tight">
                Scan Auto
              </h2>
              <p className="mt-0.5 text-[10px] font-bold text-stone-400 leading-none">
                {!isOnline
                  ? "Hors-ligne"
                  : pendingCount > 0
                  ? `${pendingCount} modification${pendingCount > 1 ? "s" : ""} en attente`
                  : syncError
                  ? "Erreur de synchronisation"
                  : "Synchronisé"}
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
            !isOnline
              ? "bg-stone-100 text-stone-500 border border-stone-200/50"
              : pendingCount > 0
              ? "bg-amber-55/60 text-amber-700 border border-amber-250/30"
              : syncError
              ? "bg-rose-50 text-rose-600 border border-rose-200"
              : "bg-emerald-55/60 text-emerald-700 border border-emerald-250/30"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              !isOnline ? "bg-stone-400" : pendingCount > 0 ? "bg-amber-500 animate-pulse" : syncError ? "bg-rose-500" : "bg-emerald-500 animate-ping"
            }`} />
            {!isOnline ? "Hors-ligne" : pendingCount > 0 ? `${pendingCount} en attente` : syncError ? "Erreur" : "Synchro On"}
          </span>
        </div>
      </div>

      <StockScanModeToggle
        enabled={enabled}
        mode={mode}
        onEnabledChange={onEnabledChange}
        onModeChange={onModeChange}
      />

      <AnimatePresence mode="wait">
        {enabled ? (
          <motion.div
            key="enabled-scanner"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <ScannerInputModeToggle
              mode={scannerInputMode}
              onModeChange={onScannerInputModeChange}
              disabled={!!loadingBarcode}
            />

            <div className="relative">
              <AnimatePresence>
                {loadingBarcode && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl border border-stone-200/50 bg-white/95 text-stone-700 backdrop-blur-md"
                  >
                    <Loader2 className="mb-2 h-6 w-6 animate-spin text-indigo-600" />
                    <span className="font-mono text-xs font-bold tracking-wider text-stone-800">
                      Scan {loadingBarcode}...
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              {scannerInputMode === "hardware" ? (
                <ManualInput onScan={onScan} isActive={!loadingBarcode} />
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-3xl overflow-hidden shadow-lg shadow-stone-900/10 bg-stone-950 aspect-[4/3] border border-stone-200/40 relative"
                >
                  <CameraBarcodeScanner
                    enabled={!loadingBarcode}
                    isBusy={!!loadingBarcode}
                    onScan={onScan}
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="disabled-scanner-tip"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex items-start gap-2.5 rounded-2xl border border-stone-200/60 bg-stone-50/60 px-4 py-3.5 text-[11px] font-semibold text-stone-450 leading-relaxed shadow-xs"
          >
            <ScanLine className="mt-0.5 h-4 w-4 flex-shrink-0 text-stone-400" />
            Activez le scan automatique pour appliquer les mouvements de stock directement sans fenêtre de dialogue ni validation manuelle.
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
