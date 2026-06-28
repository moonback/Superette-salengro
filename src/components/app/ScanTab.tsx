
import { Loader2, Minus, Package, Plus, Sparkles, Scan } from "lucide-react";
import { CameraBarcodeScanner } from "../CameraBarcodeScanner";
import { ManualInput } from "../ManualInput";
import { ScannerInputMode, ScannerInputModeToggle } from "../ScannerInputModeToggle";
import { AnimatedQuantity } from "../AnimatedQuantity";
import { InventoryItem } from "../../types";
import { formatRelativeTime } from "../../lib/utils";

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
    <section className="space-y-4">
      {/* Main Scanner Button */}
      <button
        onClick={() => onScannerInputModeChange(scannerInputMode === "hardware" ? "camera" : "hardware")}
        disabled={isScannerDisabled}
        className="w-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-lg shadow-indigo-600/25 transition active:scale-98 hover:from-indigo-700 hover:to-violet-700"
      >
        <div className="h-14 w-14 bg-white/20 rounded-2xl grid place-items-center">
          <Scan className="h-7 w-7" />
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">
            Scanner un code
          </div>
          <div className="text-xs text-white/80 mt-1">
            {scannerInputMode === "hardware" ? "Scanner physique" : "Caméra"}
          </div>
        </div>
      </button>

      {/* Manual Input */}
      <div className="relative">
        {loadingBarcode && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white/95 border border-stone-200 text-stone-700 backdrop-blur-xs">
            <Loader2 className="mb-2 h-6 w-6 animate-spin text-indigo-600" />
            <span className="text-xs font-semibold tracking-wider font-mono">Recherche {loadingBarcode}...</span>
          </div>
        )}
        {scannerInputMode === "hardware" ? (
          <ManualInput onScan={onScan} isActive={!isScannerDisabled} />
        ) : (
          <CameraBarcodeScanner enabled={!isScannerDisabled} isBusy={!!loadingBarcode} onScan={onScan} />
        )}
      </div>

      {/* Recently Scanned */}
      {recentlyScanned.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
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
  item: InventoryItem;
  onEditProduct: (item: InventoryItem) => void;
  onEditQuantity: (item: InventoryItem) => void;
  onUpdateQuantity: (barcode: string, delta: number) => void;
};

function RecentScanItem({ item, onEditProduct, onEditQuantity, onUpdateQuantity }: RecentScanItemProps) {
  return (
    <div
      onClick={() => onEditProduct(item)}
      className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white px-4 py-3 flex items-center justify-between gap-3 hover:border-stone-300 hover:shadow-sm cursor-pointer select-none transition group"
    >
      <div className="min-w-0 flex-1 flex items-center gap-3">
        <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl border border-stone-200 bg-stone-50 p-1">
          {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain rounded" /> : <Package className="h-5 w-5 text-stone-300" />}
        </div>
        <div className="min-w-0">
          <h4 className="line-clamp-1 text-sm font-bold text-stone-900 group-hover:text-indigo-600 transition-colors">{item.name}</h4>
          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-stone-400 font-medium">
            <span className="font-mono tabular">{item.barcode}</span>
            {item.brand && <span>• {item.brand}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center rounded-xl bg-stone-50 border border-stone-200">
          <button onClick={() => onUpdateQuantity(item.barcode, -1)} className="grid h-10 w-10 place-items-center text-stone-500 active:scale-90 hover:text-stone-900 transition cursor-pointer" aria-label="Diminuer la quantité">
            <Minus className="h-4 w-4" />
          </button>
          <button onClick={() => onEditQuantity(item)} className={`px-3 min-w-10 text-center text-sm font-bold font-mono tabular py-2 hover:text-indigo-600 cursor-pointer ${item.quantity <= 5 ? "text-amber-600" : "text-stone-900"}`}>
            <AnimatedQuantity value={item.quantity} />
          </button>
          <button onClick={() => onUpdateQuantity(item.barcode, 1)} className="grid h-10 w-10 place-items-center text-stone-500 active:scale-90 hover:text-stone-900 transition cursor-pointer" aria-label="Augmenter la quantité">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
