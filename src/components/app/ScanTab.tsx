import React from "react";
import { Loader2, Minus, Package, Plus, Scan } from "lucide-react";
import { CameraBarcodeScanner } from "../CameraBarcodeScanner";
import { ManualInput } from "../ManualInput";
import { ScannerInputMode, ScannerInputModeToggle } from "../ScannerInputModeToggle";
import { AnimatedQuantity } from "../AnimatedQuantity";
import { InventoryItem } from "../../types";
import { motion, AnimatePresence } from "motion/react";

type ScanTabProps = {
  isOnline: boolean;
  pendingCount: number;
  syncError: string | null;
  loadingBarcode: string | null;
  actionModal: unknown;
  scannerInputMode: ScannerInputMode;
  cameraEnabled: boolean;
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
  cameraEnabled,
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
      {/* Main Scanner Area */}
      <div className="relative">
        <AnimatePresence>
          {loadingBarcode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-white/95 dark:bg-stone-900/95 border border-stone-200/50 dark:border-stone-700/50 text-stone-700 dark:text-stone-300 backdrop-blur-md"
            >
              <Loader2 className="mb-2 h-7 w-7 animate-spin text-indigo-650" />
              <span className="text-xs font-bold tracking-wider font-mono text-stone-800 dark:text-stone-200">
                Recherche {loadingBarcode}...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {scannerInputMode === "camera" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl overflow-hidden shadow-lg shadow-stone-900/10 mb-5 bg-stone-950 aspect-[4/3] relative border border-stone-200/40 dark:border-stone-700/40"
          >
            <CameraBarcodeScanner enabled={!isScannerDisabled} isBusy={!!loadingBarcode} onScan={onScan} />
          </motion.div>
        )}

        <ScannerInputModeToggle
          mode={scannerInputMode}
          onModeChange={onScannerInputModeChange}
          disabled={isScannerDisabled}
          cameraEnabled={cameraEnabled}
        />

        {scannerInputMode === "hardware" && (
          <div className="mt-5">
            <ManualInput onScan={onScan} isActive={!isScannerDisabled} />
          </div>
        )}
      </div>

      {/* Recently Scanned */}
      {recentlyScanned.length > 0 && (
        <div className="space-y-3 px-1 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-stone-400 dark:text-stone-500">
              Derniers scans
            </h3>
            <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 tabular lg:hidden">
              {Math.min(recentlyScanned.length, 4)} article{Math.min(recentlyScanned.length, 4) > 1 ? "s" : ""}
            </span>
            <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 tabular hidden lg:inline">
              {recentlyScanned.length} article{recentlyScanned.length > 1 ? "s" : ""}
            </span>
          </div>
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.08 } }
            }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          >
            {recentlyScanned.map((item, index) => (
              <motion.div
                key={item.barcode}
                variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
                className={`h-full ${index >= 4 ? "hidden lg:block" : ""}`}
              >
                <RecentScanGridItem
                  item={item}
                  onEditProduct={onEditProduct}
                  onEditQuantity={onEditQuantity}
                  onUpdateQuantity={onUpdateQuantity}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </section>
  );
}

type RecentScanGridItemProps = {
  item: InventoryItem;
  onEditProduct: (item: InventoryItem) => void;
  onEditQuantity: (item: InventoryItem) => void;
  onUpdateQuantity: (barcode: string, delta: number) => void;
};

const RecentScanGridItem: React.FC<RecentScanGridItemProps> = ({ item, onEditProduct, onEditQuantity, onUpdateQuantity }) => {
  const isLow = item.quantity <= 5;

  return (
    <div
      onClick={() => onEditProduct(item)}
      className="relative overflow-hidden rounded-2xl border border-stone-200/80 dark:border-stone-700/80 bg-white dark:bg-stone-900 active:scale-[0.98] transition-transform cursor-pointer select-none flex flex-col"
    >
      <div className="p-2.5 flex-1">
        <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-xl border border-stone-100 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain p-1" loading="lazy" />
          ) : (
            <div className="grid h-full w-full place-items-center text-stone-300 dark:text-stone-600">
              <Package className="h-5 w-5" />
            </div>
          )}
          {isLow && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm">
              <span className="text-[8px] font-extrabold leading-none">{item.quantity}</span>
            </span>
          )}
        </div>

        <div className="mt-2 min-w-0 text-center">
          <h4 className="text-[11px] font-extrabold text-stone-900 dark:text-stone-100 leading-snug line-clamp-2">{item.name}</h4>
          <div className="mt-1 flex items-center justify-center gap-1 text-[9px] font-semibold text-stone-400 dark:text-stone-500">
            <span className="font-mono tabular">{item.barcode}</span>
            {item.brand && (
              <>
                <span className="text-stone-300 dark:text-stone-600">•</span>
                <span className="truncate">{item.brand}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-stone-100 dark:border-stone-700/60 p-2" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onUpdateQuantity(item.barcode, -1)}
            className="touch-target grid h-9 w-9 place-items-center rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400 active:scale-90 hover:border-stone-300 dark:hover:border-stone-600 hover:text-stone-900 dark:hover:text-stone-100 transition cursor-pointer"
            aria-label="Diminuer"
          >
            <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>

          <button
            onClick={() => onEditQuantity(item)}
            className={`min-w-[32px] text-center text-sm font-extrabold font-mono tabular cursor-pointer ${isLow ? "text-amber-600 dark:text-amber-400" : "text-stone-900 dark:text-stone-100"}`}
          >
            <AnimatedQuantity value={item.quantity} />
          </button>

          <button
            onClick={() => onUpdateQuantity(item.barcode, 1)}
            className="touch-target grid h-9 w-9 place-items-center rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400 active:scale-90 hover:border-stone-300 dark:hover:border-stone-600 hover:text-stone-900 dark:hover:text-stone-100 transition cursor-pointer"
            aria-label="Augmenter"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
