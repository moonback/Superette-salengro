import { AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type SyncNoticeProps = {
  syncError: string | null;
  inventorySource: "remote" | "cache";
  isOnline: boolean;
  pendingCount: number;
};

export function SyncNotice({ syncError, inventorySource, isOnline, pendingCount }: SyncNoticeProps) {
  const isWarning = !isOnline || pendingCount > 0;

  return (
    <AnimatePresence mode="wait">
      {syncError ? (
        <motion.div
          key="sync-error"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`flex gap-3 rounded-2xl border px-4 py-3.5 text-xs shadow-xs font-semibold ${
            isWarning
              ? "border-amber-200 bg-amber-50 text-amber-750"
              : "border-rose-200 bg-rose-50 text-rose-650"
          }`}
        >
          <AlertTriangle className={`mt-0.5 h-4 w-4 flex-shrink-0 ${isWarning ? "text-amber-500 animate-pulse" : "text-rose-500"}`} />
          <span className="leading-normal">{syncError}</span>
        </motion.div>
      ) : inventorySource === "cache" && !isOnline ? (
        <motion.div
          key="offline-cache"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-xs text-amber-750 shadow-xs font-semibold"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500 animate-pulse" />
          <span className="leading-normal">Mode hors-ligne — inventaire chargé depuis le cache local.</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
