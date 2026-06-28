
import React from "react";
import { Loader2, Minus, Package, Plus, Scan, ArrowRight } from "lucide-react";
import { CameraBarcodeScanner } from "../CameraBarcodeScanner";
import { ManualInput } from "../ManualInput";
import { ScannerInputMode, ScannerInputModeToggle } from "../ScannerInputModeToggle";
import { AnimatedQuantity } from "../AnimatedQuantity";
import { InventoryItem } from "../../types";

type ScanTabProps = {
  isOnline: boolean;
  pendingCount: number;
  syncError: string | null;
  loadingBarcode: string | null;
  actionModal: unknown;
  scannerInputMode: ScannerInputMode;
  recentlyScanned: InventoryItem[];
  onScannerInputModeChange: (mode: ScannerInputMode) => void;
  onScan: (barcode: string) => void;
  onEditProduct: (item: InventoryItem) => void;
  onEditQuantity: (item: InventoryItem) => void;
  onUpdateQuantity: (barcode: string, delta: number) => void;
};

export function ScanTab({
  isOnline,
  pendingCount,
  syncError,
  loadingBarcode,
  actionModal,
  scannerInputMode,
  recentlyScanned,
  onScannerInputModeChange,
  onScan,
  onEditProduct,
  onEditQuantity,
  onUpdateQuantity,
}: ScanTabProps) {
  const isScannerDisabled = !!loadingBarcode || !!actionModal;

  return (
    <section className="space-y-5">
      {/* Main Scanner Area */}
      <div className="relative">
        {loadingBarcode && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-700 ">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5">
              <Loader2 className="h-5 w-5 animate-spin text-slate-900" />
              <div className="text-xs font-semibold tracking-wider text-slate-900">
                Lecture {loadingBarcode}...
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {scannerInputMode === "hardware" ? (
            <button
              onClick={() => document.getElementById("barcode-input")?.focus()}
              disabled={isScannerDisabled}
              className="w-full rounded-2xl bg-slate-900 p-6 text-left text-white transition active:scale-[0.99] disabled:opacity-70 lg:p-8"
            >
              <div className="flex items-center gap-6">
                <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl bg-white/15 lg:h-16 lg:w-16">
                  <Scan className="h-7 w-7 animate-pulse lg:h-8 lg:w-8" />
                </div>
                <div>
                  <div className="text-lg font-bold lg:text-xl">
                    Scanner physique
                  </div>
                  <div className="mt-0.5 text-xs text-white/80 lg:text-sm">
                    Connectez votre scanner et ciblez un code-barres
                  </div>
                </div>
              </div>
            </button>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900  shadow-slate-900/20 lg:aspect-video">
              <CameraBarcodeScanner enabled={!isScannerDisabled} isBusy={!!loadingBarcode} onScan={onScan} />
            </div>
          )}

          <ScannerInputModeToggle
            mode={scannerInputMode}
            onModeChange={onScannerInputModeChange}
            disabled={isScannerDisabled}
          />

          {scannerInputMode === "hardware" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:p-6">
              <ManualInput onScan={onScan} isActive={!isScannerDisabled} />
            </div>
          )}
        </div>
      </div>

      {/* Recently Scanned */}
      {recentlyScanned.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Derniers scans
          </h3>
          <div className="space-y-2">
            {recentlyScanned.map((item) => (
              <RecentScanItem
                key={item.barcode}
                item={item}
                onEditProduct={onEditProduct}
                onEditQuantity={onEditQuantity}
                onUpdateQuantity={onUpdateQuantity}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

type RecentScanItemProps = {
  key?: string | number;
  item: InventoryItem;
  onEditProduct: (item: InventoryItem) => void;
  onEditQuantity: (item: InventoryItem) => void;
  onUpdateQuantity: (barcode: string, delta: number) => void;
};

const RecentScanItem: React.FC<RecentScanItemProps> = ({ item, onEditProduct, onEditQuantity, onUpdateQuantity }) => {
  return (
    <div
      onClick={() => onEditProduct(item)}
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-4 flex items-center justify-between gap-3 cursor-pointer select-none transition group lg:px-5 lg:py-4 lg:gap-6"
      >
      <div className="min-w-0 flex-1 flex items-center gap-3 lg:gap-6">
        <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl border border-slate-200 bg-white p-1 lg:h-14 lg:w-14">
          {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain rounded" /> : <Package className="h-5 w-5 text-slate-300 lg:h-6 lg:w-6" />}
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-slate-900 lg:text-base">{item.name}</h4>
          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 font-medium lg:text-xs">
            <span className="font-mono tabular">{item.barcode}</span>
            {item.brand && <span>• {item.brand}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
        {item.quantity <= 5 && (
          <div className="h-7 w-7 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-[9px] font-bold text-amber-500 lg:h-8 lg:w-8 lg:text-[10px]">
            {item.quantity}
          </div>
        )}
        <div className="flex items-center rounded-full bg-slate-50 border border-slate-200">
          <button onClick={() => onUpdateQuantity(item.barcode, -1)} className="h-9 w-9 grid place-items-center rounded-l-full text-slate-500 active:scale-90 hover:text-slate-900 transition cursor-pointer lg:h-10 lg:w-10" aria-label="Diminuer la quantité">
            <Minus className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
          </button>
          <button onClick={() => onEditQuantity(item)} className={`px-2 min-w-[32px] text-center text-xs font-bold font-mono tabular py-0.5 hover:text-slate-900 cursor-pointer lg:text-sm ${item.quantity <= 5 ? "text-amber-500" : "text-slate-900"}`}>
            <AnimatedQuantity value={item.quantity} />
          </button>
          <button onClick={() => onUpdateQuantity(item.barcode, 1)} className="h-9 w-9 grid place-items-center rounded-r-full text-slate-500 active:scale-90 hover:text-slate-900 transition cursor-pointer lg:h-10 lg:w-10" aria-label="Augmenter la quantité">
            <Plus className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
