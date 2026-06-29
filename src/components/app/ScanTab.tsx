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
      {/* Main Scanner Area */}
      <div className="relative">
        <AnimatePresence>
          {loadingBarcode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-white/95 border border-stone-200/50 text-stone-700 backdrop-blur-md"
            >
              <Loader2 className="mb-2 h-7 w-7 animate-spin text-indigo-650" />
              <span className="text-xs font-bold tracking-wider font-mono text-stone-800">
                Recherche {loadingBarcode}...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {scannerInputMode === "hardware" ? (
          <motion.button
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.98 }}
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }
            }}
            onClick={() => document.getElementById("barcode-input")?.focus()}
            disabled={isScannerDisabled}
            className="w-full bg-gradient-to-br from-indigo-600 via-indigo-650 to-violet-600 text-white rounded-3xl p-6.5 flex flex-col items-center justify-center gap-4.5 shadow-xl shadow-indigo-650/20 transition-all disabled:opacity-50 cursor-pointer select-none mb-5"
          >
            <div className="h-14 w-14 bg-white/15 rounded-2xl grid place-items-center shadow-inner">
              <Scan className="h-7 w-7 animate-pulse text-white" />
            </div>
            <div className="text-center">
              <div className="text-lg font-black tracking-tight">Prêt à scanner</div>
              <div className="text-[11px] text-indigo-100 font-semibold mt-1">
                Utilisez votre scanner physique ou touchez ici
              </div>
            </div>
          </motion.button>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl overflow-hidden shadow-lg shadow-stone-900/10 mb-5 bg-stone-950 aspect-[4/3] relative border border-stone-200/40"
          >
            <CameraBarcodeScanner enabled={!isScannerDisabled} isBusy={!!loadingBarcode} onScan={onScan} />
          </motion.div>
        )}

        {/* Scanner Mode Toggle */}
        <ScannerInputModeToggle
          mode={scannerInputMode}
          onModeChange={onScannerInputModeChange}
          disabled={isScannerDisabled}
        />

        {/* Input Area (only visible in hardware mode) */}
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
            <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-stone-400">
              Derniers scans
            </h3>
            <span className="text-[10px] font-bold text-stone-400 tabular">
              {recentlyScanned.length} article{recentlyScanned.length > 1 ? "s" : ""}
            </span>
          </div>
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08
                }
              }
            }}
            className="grid grid-cols-2 gap-3"
          >
            {recentlyScanned.map((item) => (
              <motion.div
                key={item.barcode}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0 }
                }}
                className="h-full"
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
      className="relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white active:scale-[0.98] transition-transform cursor-pointer select-none flex flex-col"
    >
      <div className="p-2.5 flex-1">
        <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-xl border border-stone-100 bg-stone-50">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain p-1" loading="lazy" />
          ) : (
            <div className="grid h-full w-full place-items-center text-stone-300">
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
          <h4 className="text-[11px] font-extrabold text-stone-900 leading-snug line-clamp-2">{item.name}</h4>
          <div className="mt-1 flex items-center justify-center gap-1 text-[9px] font-semibold text-stone-400">
            <span className="font-mono tabular">{item.barcode}</span>
            {item.brand && (
              <>
                <span className="text-stone-300">•</span>
                <span className="truncate">{item.brand}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-stone-100 p-2" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onUpdateQuantity(item.barcode, -1)}
            className="touch-target grid h-9 w-9 place-items-center rounded-full border border-stone-200 bg-white text-stone-500 active:scale-90 hover:border-stone-300 hover:text-stone-900 transition cursor-pointer"
            aria-label="Diminuer"
          >
            <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>

          <button
            onClick={() => onEditQuantity(item)}
            className={`min-w-[32px] text-center text-sm font-extrabold font-mono tabular cursor-pointer ${
              isLow ? "text-amber-600" : "text-stone-900"
            }`}
          >
            <AnimatedQuantity value={item.quantity} />
          </button>

          <button
            onClick={() => onUpdateQuantity(item.barcode, 1)}
            className="touch-target grid h-9 w-9 place-items-center rounded-full border border-stone-200 bg-white text-stone-500 active:scale-90 hover:border-stone-300 hover:text-stone-900 transition cursor-pointer"
            aria-label="Augmenter"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
