import React, { useMemo, useState, useRef, TouchEvent } from "react";
import { InventoryItem, CategoryItem } from "../types";
import { Package, Plus, Minus, Trash2 } from "lucide-react";
import { AnimatedQuantity } from "./AnimatedQuantity";
import { isRecentTimestamp } from "../lib/utils";
import { motion } from "motion/react";

interface SwipeableItemProps {
  children: React.ReactNode;
  key?: string;
  isCompact?: boolean;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
}

function SwipeableItem({ children, isCompact = false, onSwipeRight, onSwipeLeft }: SwipeableItemProps) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isSwiping) return;
    const diffX = e.touches[0].clientX - startX;
    const limitedX = Math.max(-120, Math.min(120, diffX));
    setCurrentX(limitedX);
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (currentX > 85) {
      onSwipeRight();
    } else if (currentX < -85) {
      onSwipeLeft();
    }
    setCurrentX(0);
  };

  // Intensity ramps from 0 to 1 as the user swipes toward the threshold,
  // used to scale the icon and deepen the tint for tactile feedback.
  const intensity = Math.min(Math.abs(currentX) / 85, 1);
  const swipeClass = isSwiping ? "" : "transition-transform duration-200 ease-out";
  const roundedClass = isCompact ? "rounded-xl" : "rounded-2xl";

  let bgClass = "bg-transparent";
  let iconLeft = false;
  let iconRight = false;
  if (currentX > 15) {
    bgClass = "bg-emerald-50/90";
    iconLeft = true;
  } else if (currentX < -15) {
    bgClass = "bg-rose-50/90";
    iconRight = true;
  }

  return (
    <div className={`relative overflow-hidden w-full ${roundedClass}`}>
      <div className={`absolute inset-0 flex items-center justify-between px-6 transition-colors duration-150 ${roundedClass} ${bgClass}`}>
        <div
          className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-[10px] uppercase tracking-wider transition-opacity duration-150"
          style={{ opacity: iconLeft ? 1 : 0, transform: `scale(${0.85 + intensity * 0.25})` }}
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Ajouter +1</span>
        </div>
        <div
          className="flex items-center gap-1.5 text-rose-600 font-extrabold text-[10px] uppercase tracking-wider transition-opacity duration-150"
          style={{ opacity: iconRight ? 1 : 0, transform: `scale(${0.85 + intensity * 0.25})` }}
        >
          <span>Supprimer</span>
          <Trash2 className="w-4 h-4" />
        </div>
      </div>

      <div
        ref={itemRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateX(${currentX}px)` }}
        className={`relative z-10 w-full ${swipeClass}`}
      >
        {children}
      </div>
    </div>
  );
}

interface InventoryGridProps {
  items: InventoryItem[];
  categories?: CategoryItem[];
  isCompactView?: boolean;
  searchTerm?: string;
  onUpdateQuantity: (barcode: string, delta: number) => void;
  onRemove: (barcode: string) => void;
  onEditQuantity: (item: InventoryItem) => void;
  onEditProduct: (item: InventoryItem) => void;
}

export function InventoryGrid({
  items,
  categories = [],
  isCompactView = false,
  searchTerm = "",
  onUpdateQuantity,
  onRemove,
  onEditQuantity,
  onEditProduct,
}: InventoryGridProps) {
  const searchTokens = useMemo(
    () =>
      searchTerm
        .trim()
        .split(/\s+/)
        .map((token) => token.trim())
        .filter(Boolean),
    [searchTerm],
  );

  const renderHighlightedText = (text: string, highlightClassName: string) => {
    if (!text || searchTokens.length === 0) {
      return text;
    }

    const escapedTokens = searchTokens.map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const regex = new RegExp(`(${escapedTokens.join("|")})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      escapedTokens.some((token) => new RegExp(`^${token}$`, "i").test(part)) ? (
        <mark key={`${part}-${index}`} className={highlightClassName}>
          {part}
        </mark>
      ) : (
        <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
      ),
    );
  };

  const renderNewBadge = (item: InventoryItem) => {
    if (!isRecentTimestamp(item.lastUpdated)) return null;

    return (
      <span className="inline-flex items-center rounded-full bg-sky-50 border border-sky-200 px-2 py-0.5 text-[9px] font-bold text-sky-700">
        Nouveau
      </span>
    );
  };

  const getStockTone = (quantity: number) => {
    if (quantity === 0) {
      return {
        badge: "border-rose-200 bg-rose-50 text-rose-700 animate-pulse",
        text: "text-rose-600",
        dot: "bg-rose-500",
      };
    }
    if (quantity <= 5) {
      return {
        badge: "border-amber-200 bg-amber-50 text-amber-750",
        text: "text-amber-600",
        dot: "bg-amber-500",
      };
    }
    return {
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      text: "text-stone-900",
      dot: "bg-emerald-500",
    };
  };

  const renderStockBadge = (quantity: number, expanded = false) => {
    const tone = getStockTone(quantity);
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${
          expanded ? "min-h-7 text-[11px]" : ""
        } ${tone.badge}`}
      >
        {expanded ? `${quantity} en rayon` : quantity}
      </span>
    );
  };

  const getCategoryLabel = (categoryName: string) => {
    const categoryMatch = categories.find((category) => category.name.toLowerCase() === categoryName.toLowerCase());
    return categoryMatch?.icon ? `${categoryMatch.icon} ${categoryName}` : categoryName;
  };

  const groupedItems = useMemo(() => {
    const groups: Record<string, InventoryItem[]> = {};
    items.forEach((item) => {
      const cat = item.category ? item.category.trim() : "Non classé";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return Object.keys(groups)
      .sort((a, b) => {
        if (a === "Non classé") return 1;
        if (b === "Non classé") return -1;
        return a.localeCompare(b);
      })
      .map((category) => ({ category, items: groups[category] }));
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-stone-250 bg-white/50 px-4 py-14 text-center">
        <Package className="mx-auto mb-3.5 h-9 w-9 text-stone-300 animate-float" />
        <h3 className="font-extrabold text-stone-850 text-sm">Aucun produit trouvé</h3>
        <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-stone-400 font-semibold">
          Ajustez vos filtres ou scannez un produit pour l'ajouter à votre inventaire.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5.5">
      {groupedItems.map((group) => {
        const lowStockCount = group.items.filter((item) => item.quantity <= 5).length;

        return (
          <div key={group.category} className="space-y-2.5">
            <div className="flex items-center gap-2 px-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-400">
                {getCategoryLabel(group.category)}
              </h3>
              <span className="h-px flex-1 bg-stone-200/60" aria-hidden="true" />
              {lowStockCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {lowStockCount} bas
                </span>
              )}
              <span className="text-[10px] font-extrabold font-mono tabular-nums px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full border border-stone-200/50">
                {group.items.length}
              </span>
            </div>

            <div className={isCompactView ? "space-y-2" : "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"}>
              {group.items.map((item) => {
                const tone = getStockTone(item.quantity);

                return (
                  <SwipeableItem
                    key={item.barcode}
                    isCompact={isCompactView}
                    onSwipeRight={() => onUpdateQuantity(item.barcode, 1)}
                    onSwipeLeft={() => onRemove(item.barcode)}
                  >
                    {isCompactView ? (
                      <motion.article
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-10px" }}
                        transition={{ type: "spring", stiffness: 260, damping: 25 }}
                        whileHover={{ y: -1 }}
                        className="group flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-3 py-2.5 shadow-xs hover:border-stone-300 hover:bg-stone-50/20 cursor-pointer select-none"
                        onClick={() => onEditProduct(item)}
                      >
                        <div className="relative grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl border border-stone-200 bg-stone-50/50">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full rounded-lg object-contain p-1" loading="lazy" />
                          ) : (
                            <Package className="h-5 w-5 text-stone-300" />
                          )}
                          {item.quantity <= 5 && (
                            <span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${tone.dot}`} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4 className="font-extrabold text-xs text-stone-850 truncate leading-snug">
                              {renderHighlightedText(item.name, "rounded bg-amber-100 px-0.5 text-stone-950")}
                            </h4>
                            {renderNewBadge(item)}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-stone-400">
                            {item.brand && <span className="truncate text-stone-500 font-semibold">{item.brand}</span>}
                            <span className="font-mono text-[9px] text-stone-450">{item.barcode}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.quantity <= 5 && renderStockBadge(item.quantity)}
                          <div
                            className="flex items-center rounded-xl border border-stone-200 bg-white shadow-xs"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              onClick={() => onUpdateQuantity(item.barcode, -1)}
                              className="grid h-8 w-8 place-items-center text-stone-400 hover:text-stone-800 active:bg-stone-50 rounded-l-xl transition-colors select-none cursor-pointer"
                              aria-label="Diminuer la quantité"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => onEditQuantity(item)}
                              className={`min-w-[28px] px-1 py-0.5 text-center font-mono text-[11px] font-extrabold tabular-nums transition-colors hover:text-indigo-650 cursor-pointer ${tone.text}`}
                            >
                              <AnimatedQuantity value={item.quantity} />
                            </button>
                            <button
                              onClick={() => onUpdateQuantity(item.barcode, 1)}
                              className="grid h-8 w-8 place-items-center text-stone-400 hover:text-stone-800 active:bg-stone-50 rounded-r-xl transition-colors select-none cursor-pointer"
                              aria-label="Augmenter la quantité"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.article>
                    ) : (
                      <motion.article
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-10px" }}
                        transition={{ type: "spring", stiffness: 260, damping: 25 }}
                        whileHover={{ y: -3, boxShadow: "0 8px 24px -4px rgba(0,0,0,0.10)" }}
                        className="group relative flex flex-col rounded-2xl border border-stone-200 bg-white shadow-xs hover:border-stone-300 cursor-pointer select-none overflow-hidden transition-shadow duration-200"
                        onClick={() => onEditProduct(item)}
                      >
                        {/* Image header */}
                        <div className="relative flex items-center justify-center bg-stone-50 border-b border-stone-100" style={{ height: 120 }}>
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain p-3" loading="lazy" />
                          ) : (
                            <Package className="h-10 w-10 text-stone-200" />
                          )}

                          {/* Stock badge top-right */}
                          <div className="absolute top-2 right-2">
                            {renderStockBadge(item.quantity, false)}
                          </div>

                          {/* New badge top-left */}
                          {isRecentTimestamp(item.lastUpdated) && (
                            <div className="absolute top-2 left-2">
                              <span className="inline-flex items-center rounded-full bg-sky-50 border border-sky-200 px-2 py-0.5 text-[9px] font-bold text-sky-700">
                                Nouveau
                              </span>
                            </div>
                          )}

                          {/* Low-stock dot indicator */}
                          {item.quantity <= 5 && (
                            <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full ring-2 ring-white ${tone.dot}`} />
                          )}
                        </div>

                        {/* Card body */}
                        <div className="flex flex-1 flex-col gap-2 p-3">
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-[13px] text-stone-900 leading-snug line-clamp-2">
                              {renderHighlightedText(item.name, "rounded bg-amber-100 px-0.5 text-stone-950")}
                            </h4>
                            {item.brand && (
                              <p className="mt-0.5 text-[10px] font-semibold text-stone-400 truncate">{item.brand}</p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1 mt-auto">
                            {item.category && (
                              <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[9px] font-bold text-stone-500 truncate max-w-[120px]">
                                {getCategoryLabel(item.category)}
                              </span>
                            )}
                            <span className="ml-auto font-mono text-[9px] text-stone-350 tabular-nums">{item.barcode}</span>
                          </div>

                          {/* Quantity controls */}
                          <div
                            className="flex items-center justify-between gap-2 border-t border-stone-100 pt-2.5 mt-0.5"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <span className={`text-[10px] font-bold uppercase tracking-wide ${
                              item.quantity === 0 ? 'text-rose-500' : item.quantity <= 5 ? 'text-amber-600' : 'text-stone-400'
                            }`}>
                              {item.quantity === 0 ? 'Rupture' : item.quantity <= 5 ? 'Stock bas' : 'En stock'}
                            </span>
                            <div className="flex items-center rounded-xl border border-stone-200 bg-white shadow-xs">
                              <button
                                onClick={() => onUpdateQuantity(item.barcode, -1)}
                                className="grid h-8 w-8 place-items-center text-stone-400 hover:text-stone-850 active:bg-stone-50 rounded-l-xl transition-colors select-none cursor-pointer"
                                aria-label="Diminuer la quantité"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => onEditQuantity(item)}
                                className={`min-w-[32px] px-2 py-0.5 text-center font-mono text-xs font-extrabold tabular-nums transition-colors hover:text-indigo-650 cursor-pointer ${tone.text}`}
                              >
                                <AnimatedQuantity value={item.quantity} />
                              </button>
                              <button
                                onClick={() => onUpdateQuantity(item.barcode, 1)}
                                className="grid h-8 w-8 place-items-center text-stone-400 hover:text-stone-850 active:bg-stone-50 rounded-r-xl transition-colors select-none cursor-pointer"
                                aria-label="Augmenter la quantité"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    )}
                  </SwipeableItem>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}