import { X, Package, Pencil, ClipboardList, Barcode, Tag, Euro, Boxes, Clock, TrendingUp } from "lucide-react";
import { InventoryItem } from "../types";

interface ProductDetailsModalProps {
  product: InventoryItem;
  onClose: () => void;
  onEdit: () => void;
  onEditStock: () => void;
}

function formatPrice(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "Non renseigne";
  return `${value.toFixed(2)} EUR`;
}

function formatDate(value: number): string {
  if (!value) return "Non renseigne";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "Non renseigne";
  }
}

export function ProductDetailsModal({ product, onClose, onEdit, onEditStock }: ProductDetailsModalProps) {
  const margin =
    product.purchasePrice !== undefined &&
    product.purchasePrice !== null &&
    product.salesPrice !== undefined &&
    product.salesPrice !== null
      ? product.salesPrice - product.purchasePrice
      : null;

  return (
    <div className="fixed inset-0 z-[70] bg-white sm:hidden">
      <div className="flex h-full flex-col">
        <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-indigo-650">
                Fiche produit
              </p>
              <h2 className="mt-1 truncate text-base font-bold text-stone-900 leading-snug">
                {product.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl border border-stone-200/80 bg-white text-stone-500 hover:text-stone-900 transition active:scale-95 cursor-pointer"
              aria-label="Fermer la fiche produit"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 pb-[calc(8rem+env(safe-area-inset-bottom))]">
          <section className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-stone-50">
            <div className="flex min-h-64 items-center justify-center bg-white p-6">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="max-h-56 w-full object-contain"
                />
              ) : (
                <div className="grid h-32 w-32 place-items-center rounded-[2rem] border border-dashed border-stone-300 bg-stone-50 text-stone-300">
                  <Package className="h-12 w-12" />
                </div>
              )}
            </div>

            <div className="space-y-3 border-t border-stone-200 bg-white p-4">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                  {product.category || "Non classe"}
                </span>
                {product.brand && (
                  <span className="inline-flex items-center rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
                    {product.brand}
                  </span>
                )}
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-stone-500">Stock actuel</p>
                    <p className="mt-1 text-3xl font-bold text-stone-900">{product.quantity}</p>
                  </div>
                  {typeof product.lastMovement === "number" && (
                    <div className="rounded-2xl bg-white px-3 py-2 text-right shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Dernier mouvement
                      </p>
                      <p className={`mt-1 text-sm font-bold ${product.lastMovement >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {product.lastMovement > 0 ? "+" : ""}
                        {product.lastMovement}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-3">
            <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <Barcode className="h-4 w-4 text-stone-400" />
                <h3 className="text-sm font-bold text-stone-900">Identification</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Code-barres</p>
                  <p className="mt-1 font-mono text-stone-800">{product.barcode}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Nom</p>
                  <p className="mt-1 font-semibold text-stone-800">{product.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Marque</p>
                  <p className="mt-1 text-stone-700">{product.brand || "Non renseignee"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Categorie</p>
                  <p className="mt-1 text-stone-700">{product.category || "Non classe"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <Euro className="h-4 w-4 text-stone-400" />
                <h3 className="text-sm font-bold text-stone-900">Tarifs</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="rounded-2xl bg-stone-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Prix achat</p>
                  <p className="mt-1 font-semibold text-stone-800">{formatPrice(product.purchasePrice)}</p>
                </div>
                <div className="rounded-2xl bg-stone-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Prix vente</p>
                  <p className="mt-1 font-semibold text-stone-800">{formatPrice(product.salesPrice)}</p>
                </div>
                <div className="rounded-2xl bg-stone-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Marge</p>
                  <p className={`mt-1 font-semibold ${margin === null ? "text-stone-500" : margin >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {margin === null ? "Non calculee" : `${margin.toFixed(2)} EUR`}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <Boxes className="h-4 w-4 text-stone-400" />
                <h3 className="text-sm font-bold text-stone-900">Suivi</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-2xl bg-stone-50 p-3">
                  <Tag className="mt-0.5 h-4 w-4 flex-shrink-0 text-stone-400" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Categorie active</p>
                    <p className="mt-1 text-sm text-stone-700">{product.category || "Non classe"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-stone-50 p-3">
                  <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-stone-400" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Variation recente</p>
                    <p className="mt-1 text-sm text-stone-700">
                      {typeof product.lastMovement === "number"
                        ? `${product.lastMovement > 0 ? "+" : ""}${product.lastMovement}`
                        : "Non renseignee"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-stone-50 p-3">
                  <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-stone-400" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Derniere mise a jour</p>
                    <p className="mt-1 text-sm text-stone-700">{formatDate(product.lastUpdated)}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-250/15 bg-white/95 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3.5 backdrop-blur sm:hidden">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onEditStock}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-650 px-4 text-xs font-bold text-white shadow-md shadow-indigo-650/10 transition active:scale-[0.98] select-none cursor-pointer"
            >
              <ClipboardList className="h-4 w-4" />
              Stock
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-stone-200/80 bg-white px-4 text-xs font-bold text-stone-600 hover:text-stone-900 transition active:scale-[0.98] select-none cursor-pointer"
            >
              <Pencil className="h-4 w-4" />
              Modifier
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
