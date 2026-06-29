import { Minus, Plus, ScanLine } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type StockScanMode = "add" | "remove";

interface StockScanModeToggleProps {
  enabled: boolean;
  mode: StockScanMode;
  onEnabledChange: (enabled: boolean) => void;
  onModeChange: (mode: StockScanMode) => void;
}

export function StockScanModeToggle({
  enabled,
  mode,
  onEnabledChange,
  onModeChange,
}: StockScanModeToggleProps) {
  return (
    <div className="mb-3 rounded-[2.2rem] border border-stone-200 bg-white p-3.5 shadow-sm sm:mb-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-black text-stone-900">Scan automatique</h3>
          </div>
          <p className="mt-0.5 text-[10px] text-stone-450 font-semibold">
            Chaque scan {mode === "add" ? "ajoute" : "retire"} 1 unité sans fenêtre.
          </p>
        </div>
        
        {/* Spring Enabled Switch Knob */}
        <button
          type="button"
          onClick={() => onEnabledChange(!enabled)}
          className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 outline-none select-none ${
            enabled ? "bg-indigo-600" : "bg-stone-200"
          }`}
          role="switch"
          aria-checked={enabled}
          aria-label="Activer le scan automatique"
        >
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 ${
              enabled ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Slide Options for Mode */}
      <AnimatePresence>
        {enabled && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-3"
          >
            <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-stone-200 bg-stone-50/50 p-1 relative z-0">
              <button
                type="button"
                onClick={() => onModeChange("add")}
                className={`relative flex min-h-9 items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-black transition duration-200 select-none cursor-pointer ${
                  mode === "add"
                    ? "text-emerald-700 font-extrabold"
                    : "text-stone-400 hover:text-stone-700"
                }`}
              >
                {mode === "add" && (
                  <motion.div
                    layoutId="activeScanModeChoicePill"
                    className="absolute inset-0 bg-white rounded-xl border border-emerald-200/50 -z-10 shadow-xs"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                Ajouter
              </button>
              <button
                type="button"
                onClick={() => onModeChange("remove")}
                className={`relative flex min-h-9 items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-black transition duration-200 select-none cursor-pointer ${
                  mode === "remove"
                    ? "text-rose-700 font-extrabold"
                    : "text-stone-400 hover:text-stone-700"
                }`}
              >
                {mode === "remove" && (
                  <motion.div
                    layoutId="activeScanModeChoicePill"
                    className="absolute inset-0 bg-white rounded-xl border border-rose-200/50 -z-10 shadow-xs"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Minus className="h-3.5 w-3.5 stroke-[2.5]" />
                Retirer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
