
import { Loader2, ScanLine, Zap } from "lucide-react";
import { ManualInput } from "./ManualInput";
import { CameraBarcodeScanner } from "./CameraBarcodeScanner";
import { StockScanModeToggle, StockScanMode } from "./StockScanModeToggle";
import { ScannerInputMode, ScannerInputModeToggle } from "./ScannerInputModeToggle";

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
    <section className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 p-4 shadow-xl shadow-amber-500/20 sm:p-6">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg sm:h-14 sm:w-14">
              <Zap className="h-5 w-5 text-white sm:h-7 sm:w-7" />
            </div>
            <div className="pt-0.5 sm:pt-1">
              <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl">Scan Auto</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm sm:px-2.5 sm:text-xs">
                  {!isOnline ? "Hors-ligne" : pendingCount > 0 ? `${pendingCount} en attente` : syncError ? "Erreur" : "Synchro On"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StockScanModeToggle
        enabled={enabled}
        mode={mode}
        onEnabledChange={onEnabledChange}
        onModeChange={onModeChange}
      />

      {enabled && (
        <>
          <ScannerInputModeToggle
            mode={scannerInputMode}
            onModeChange={onScannerInputModeChange}
            disabled={!!loadingBarcode}
          />

          <div className="relative">
            {loadingBarcode && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white/95 text-stone-700 backdrop-blur-xs">
                <Loader2 className="mb-2 h-6 w-6 animate-spin text-indigo-600" />
                <span className="font-mono text-xs font-semibold tracking-wider">
                  Scan {loadingBarcode}...
                </span>
              </div>
            )}
            {scannerInputMode === "hardware" ? (
              <ManualInput onScan={onScan} isActive={!loadingBarcode} />
            ) : (
              <CameraBarcodeScanner
                enabled={!loadingBarcode}
                isBusy={!!loadingBarcode}
                onScan={onScan}
              />
            )}
          </div>
        </>
      )}

      {!enabled && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-700">
          Activez le scan automatique pour appliquer les mouvements sans fenêtre de confirmation.
        </div>
      )}
    </section>
  );
}
