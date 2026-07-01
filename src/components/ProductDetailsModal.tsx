import { X, Package, Pencil, ClipboardList, Barcode, Tag, Euro, Clock, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { InventoryItem } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";

interface ProductDetailsModalProps {
  product: InventoryItem;
  onClose: () => void;
  onEdit: () => void;
  onEditStock: () => void;
}

function formatPrice(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

function formatDate(value: number): string {
  if (!value) return "Non renseigné";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "Non renseigné";
  }
}

function getStockStyle(quantity: number) {
  if (quantity === 0)
    return {
      badge: "bg-rose-50 border-rose-200 text-rose-700",
      label: "Rupture",
      qtyColor: "text-rose-600",
      heroBg: "from-rose-50/70 via-rose-25/30 to-white",
      dot: "bg-rose-500",
      movBg: "border-rose-200 bg-rose-50",
      movColor: "text-rose-600",
    };
  if (quantity <= 5)
    return {
      badge: "bg-amber-50 border-amber-200 text-amber-700",
      label: "Stock bas",
      qtyColor: "text-amber-600",
      heroBg: "from-amber-50/70 via-amber-25/30 to-white",
      dot: "bg-amber-400",
      movBg: "border-amber-200 bg-amber-50",
      movColor: "text-amber-600",
    };
  return {
    badge: "bg-emerald-50 border-emerald-200 text-emerald-700",
    label: "En stock",
    qtyColor: "text-emerald-600",
    heroBg: "from-emerald-50/50 via-stone-25/20 to-white",
    dot: "bg-emerald-500",
    movBg: "border-emerald-200 bg-emerald-50",
    movColor: "text-emerald-600",
  };
}

export function ProductDetailsModal({ product, onClose, onEdit, onEditStock }: ProductDetailsModalProps) {
  const margin =
    product.purchasePrice != null && product.salesPrice != null
      ? product.salesPrice - product.purchasePrice
      : null;

  const marginPct =
    margin !== null && product.purchasePrice && product.purchasePrice > 0
      ? (margin / product.purchasePrice) * 100
      : null;

  const stock = getStockStyle(product.quantity);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — bottom sheet mobile / centered wide modal desktop */}
      <motion.div
        key="panel"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="fixed inset-x-0 bottom-0 z-[71] flex flex-col bg-white dark:bg-stone-900 shadow-2xl rounded-t-[2rem]
                   sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
                   sm:w-[90vw] sm:max-w-3xl sm:rounded-3xl"
        style={{ maxHeight: "calc(100dvh - 2rem)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle mobile */}
        <div className="flex justify-center pt-3 pb-0 sm:hidden">
          <div className="h-1 w-12 rounded-full bg-stone-200 dark:bg-stone-700" />
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 grid h-8 w-8 place-items-center rounded-xl border border-stone-200 dark:border-stone-700 bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:border-stone-300 transition active:scale-95 cursor-pointer shadow-sm"
          aria-label="Fermer"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* ══ TWO-COLUMN LAYOUT ══ */}
        <div className="flex flex-col sm:flex-row flex-1 min-h-0 overflow-hidden sm:rounded-3xl">

          {/* ── LEFT COLUMN ── */}
          <div className={`sm:w-64 sm:flex-shrink-0 flex flex-col items-center justify-start bg-gradient-to-b ${stock.heroBg} sm:rounded-l-3xl px-5 pt-7 pb-5 sm:border-r sm:border-stone-100 dark:sm:border-stone-700/50`}>
            <div className="relative mb-4 flex items-center justify-center" style={{ height: 148 }}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="max-h-36 w-auto max-w-[160px] object-contain drop-shadow-lg" />
              ) : (
                <div className="grid h-28 w-28 place-items-center rounded-3xl border-2 border-dashed border-stone-200 dark:border-stone-600 bg-white/60 dark:bg-stone-800/60 text-stone-300 dark:text-stone-600">
                  <Package className="h-10 w-10" />
                </div>
              )}
            </div>

            <h2 className="text-center text-[13px] font-black text-stone-900 dark:text-stone-100 leading-snug px-1 mb-3">
              {product.name}
            </h2>
            <div className="flex flex-wrap justify-center gap-1.5 mb-5">
              {product.brand && (
                <span className="inline-flex items-center rounded-full bg-white/80 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 px-2.5 py-0.5 text-[10px] font-bold text-stone-600 dark:text-stone-300 shadow-xs">
                  {product.brand}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/50 dark:border-indigo-700/50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                <Tag className="h-2.5 w-2.5" />
                {product.category || "Non classé"}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${stock.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${stock.dot}`} />
                {stock.label}
              </span>
            </div>

            {/* Stock qty card */}
            <div className="w-full rounded-2xl border border-white/80 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-md px-4 py-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-1">Stock actuel</p>
              <div className="flex items-end gap-2">
                <span className={`text-5xl font-black tabular-nums leading-none ${stock.qtyColor}`}>{product.quantity}</span>
                <span className="text-sm font-bold text-stone-400 dark:text-stone-500 mb-1 leading-none">unités</span>
              </div>
              {typeof product.lastMovement === "number" && (
                <div className={`mt-3 flex items-center justify-between rounded-xl border px-3 py-2 ${stock.movBg}`}>
                  <span className="text-[9px] font-black uppercase tracking-wider text-stone-400">Dernier mvt</span>
                  <div className="flex items-center gap-1">
                    {product.lastMovement > 0 ? <ArrowUp className={`h-3 w-3 ${stock.movColor}`} /> : product.lastMovement < 0 ? <ArrowDown className="h-3 w-3 text-rose-600" /> : null}
                    <span className={`text-sm font-black tabular-nums ${product.lastMovement > 0 ? "text-emerald-600" : product.lastMovement < 0 ? "text-rose-600" : "text-stone-500"}`}>
                      {product.lastMovement > 0 ? "+" : ""}{product.lastMovement}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">

              {/* Tarifs */}
              <div className="rounded-2xl border border-stone-200/80 dark:border-stone-700/60 bg-white dark:bg-stone-800 overflow-hidden shadow-xs">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-100 dark:border-stone-700/50 bg-stone-50/70 dark:bg-stone-800/70">
                  <Euro className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-stone-500 dark:text-stone-400">Tarifs</h3>
                </div>
                <div className="grid grid-cols-3 divide-x divide-stone-100 dark:divide-stone-700/50">
                  {[
                    { label: "Achat", value: formatPrice(product.purchasePrice), color: "text-stone-800 dark:text-stone-200" },
                    { label: "Vente", value: formatPrice(product.salesPrice), color: "text-stone-800 dark:text-stone-200" },
                    {
                      label: "Marge",
                      value: margin === null ? "—" : formatPrice(margin),
                      color: margin === null ? "text-stone-400" : margin >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
                      sub: marginPct !== null ? `${marginPct >= 0 ? "+" : ""}${marginPct.toFixed(1)}%` : undefined,
                      subColor: marginPct !== null && marginPct >= 0 ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50" : "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/50",
                    },
                  ].map(({ label, value, color, sub, subColor }) => (
                    <div key={label} className="flex flex-col items-center px-3 py-4 gap-1">
                      <p className="text-[9px] font-black uppercase tracking-wider text-stone-400 dark:text-stone-500">{label}</p>
                      <p className={`text-sm font-black ${color}`}>{value}</p>
                      {sub && <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${subColor}`}>{sub}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Identification */}
              <div className="rounded-2xl border border-stone-200/80 dark:border-stone-700/60 bg-white dark:bg-stone-800 overflow-hidden shadow-xs">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-100 dark:border-stone-700/50 bg-stone-50/70 dark:bg-stone-800/70">
                  <Barcode className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-stone-500 dark:text-stone-400">Identification</h3>
                </div>
                <div className="px-4 py-3.5 space-y-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-stone-400 dark:text-stone-500">Nom complet</p>
                    <p className="mt-1 text-xs font-semibold text-stone-800 dark:text-stone-200 leading-relaxed">{product.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider text-stone-400 dark:text-stone-500">Marque</p>
                      <p className="mt-1 text-xs font-semibold text-stone-700 dark:text-stone-300">{product.brand || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider text-stone-400 dark:text-stone-500">Code-barres</p>
                      <p className="mt-1 font-mono text-[11px] text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-700 rounded-lg px-2 py-1 border border-stone-100 dark:border-stone-600 break-all">{product.barcode}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historique */}
              <div className="rounded-2xl border border-stone-200/80 dark:border-stone-700/60 bg-white dark:bg-stone-800 overflow-hidden shadow-xs">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-100 dark:border-stone-700/50 bg-stone-50/70 dark:bg-stone-800/70">
                  <Clock className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-stone-500 dark:text-stone-400">Historique</h3>
                </div>
                <div className="divide-y divide-stone-100 dark:divide-stone-700/50">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
                      <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400">Variation récente</p>
                    </div>
                    <p className={`text-xs font-bold ${typeof product.lastMovement === "number" ? product.lastMovement > 0 ? "text-emerald-600 dark:text-emerald-400" : product.lastMovement < 0 ? "text-rose-600 dark:text-rose-400" : "text-stone-500" : "text-stone-400"}`}>
                      {typeof product.lastMovement === "number" ? `${product.lastMovement > 0 ? "+" : ""}${product.lastMovement}` : "—"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
                      <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400">Dernière mise à jour</p>
                    </div>
                    <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">{formatDate(product.lastUpdated)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-stone-100 dark:border-stone-700/50 bg-white dark:bg-stone-900 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 sm:rounded-br-3xl">
              <div className="grid grid-cols-2 gap-2.5">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={onEditStock}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 dark:bg-indigo-700 px-4 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700 dark:hover:bg-indigo-600 select-none cursor-pointer"
                >
                  <ClipboardList className="h-4 w-4" />
                  Ajuster stock
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={onEdit}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-stone-100 transition select-none cursor-pointer shadow-xs"
                >
                  <Pencil className="h-4 w-4" />
                  Modifier infos
                </motion.button>
              </div>
            </footer>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
