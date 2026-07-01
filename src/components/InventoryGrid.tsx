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

  const getStockTone = (quantity: number) => {
    if (quantity === 0) {
      return {
        badge: "border-rose-200 bg-rose-50 text-rose-700",
        text: "text-rose-600",
        dot: "bg-rose-500",
        label: "Rupture",
        labelColor: "text-rose-500",
        accentBorder: "border-l-rose-400",
        imageBg: "from-rose-50/50 via-stone-50 to-white",
      };
    }
    if (quantity <= 5) {
      return {
        badge: "border-amber-200 bg-amber-50 text-amber-700",
        text: "text-amber-600",
        dot: "bg-amber-500",
        label: "Stock bas",
        labelColor: "text-amber-600",
        accentBorder: "border-l-amber-400",
        imageBg: "from-amber-50/40 via-stone-50 to-white",
      };
    }
    return {
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      text: "text-stone-900",
      dot: "bg-emerald-500",
      label: "En stock",
      labelColor: "text-emerald-600",
      accentBorder: "border-l-emerald-400",
      imageBg: "from-stone-50/60 via-stone-50 to-white",
    };
  };

  const getCategoryLabel = (categoryName: string) => {
    const categoryMatch = categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
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
      <div className="rounded-3xl border border-dashed border-stone-200 dark:border-stone-700 bg-white/50 dark:bg-stone-900/50 px-4 py-14 text-center">
        <Package className="mx-auto mb-3.5 h-9 w-9 text-stone-300 dark:text-stone-600 animate-float" />
        <h3 className="font-extrabold text-stone-800 dark:text-stone-200 text-sm">Aucun produit trouvé</h3>
        <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-stone-400 dark:text-stone-500 font-semibold">
          Ajustez vos filtres ou scannez un produit pour l'ajouter à votre inventaire.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupedItems.map((group) => {
        const outCount = group.items.filter((i) => i.quantity === 0).length;
        const lowCount = group.items.filter((i) => i.quantity > 0 && i.quantity <= 5).length;

        return (
          <div key={group.category}>
            {/* ── Category header ── */}
            <div className="flex items-center gap-3 mb-3.5">
              <div className="flex items-center gap-2 shrink-0">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400">
                  {getCategoryLabel(group.category)}
                </h3>
                <span className="text-[10px] font-extrabold font-mono tabular-nums px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 rounded-full border border-stone-200/60 dark:border-stone-700/60">
                  {group.items.length}
                </span>
              </div>
              <span className="h-px flex-1 bg-gradient-to-r from-stone-200/80 dark:from-stone-700/80 to-transparent" />
              <div className="flex items-center gap-1.5 shrink-0">
                {outCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-100 dark:border-rose-700/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                    {outCount} rupture{outCount > 1 ? "s" : ""}
                  </span>
                )}
                {lowCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-700/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    {lowCount} bas
                  </span>
                )}
              </div>
            </div>

            {/* ── Items ── */}
            <div className={isCompactView ? "space-y-2" : "grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4"}>
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
                      /* ── COMPACT (mobile) ── */
                      <motion.article
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-10px" }}
                        transition={{ type: "spring", stiffness: 260, damping: 25 }}
                        whileHover={{ y: -1 }}
                        className="group flex items-center gap-3 rounded-2xl border border-stone-200 dark:border-stone-700/80 bg-white dark:bg-stone-900 px-3 py-2.5 shadow-xs hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50/20 dark:hover:bg-stone-800/50 cursor-pointer select-none"
                        onClick={() => onEditProduct(item)}
                      >
                        <div className="relative grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full rounded-lg object-contain p-1" loading="lazy" />
                          ) : (
                            <Package className="h-5 w-5 text-stone-300 dark:text-stone-600" />
                          )}
                          {item.quantity <= 5 && (
                            <span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-stone-900 ${tone.dot}`} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4 className="font-extrabold text-xs text-stone-900 dark:text-stone-100 truncate leading-snug">
                              {renderHighlightedText(item.name, "rounded bg-amber-100 dark:bg-amber-900/40 px-0.5 text-stone-950 dark:text-amber-200")}
                            </h4>
                            {isRecentTimestamp(item.lastUpdated) && (
                              <span className="inline-flex items-center rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-700/60 px-1.5 py-0.5 text-[9px] font-bold text-sky-700 dark:text-sky-400">Nouveau</span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-stone-400 dark:text-stone-500">
                            {item.brand && <span className="truncate text-stone-500 dark:text-stone-400 font-semibold">{item.brand}</span>}
                            <span className="font-mono text-[9px] text-stone-400 dark:text-stone-500">{item.barcode}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.quantity <= 5 && (
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${tone.badge}`}>
                              {item.quantity}
                            </span>
                          )}
                          <div
                            className="flex items-center rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button onClick={() => onUpdateQuantity(item.barcode, -1)} className="grid h-8 w-8 place-items-center text-stone-400 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-100 active:bg-stone-50 dark:active:bg-stone-700 rounded-l-xl transition-colors select-none cursor-pointer" aria-label="Diminuer">
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => onEditQuantity(item)} className={`min-w-[28px] px-1 py-0.5 text-center font-mono text-[11px] font-extrabold tabular-nums transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer ${tone.text}`}>
                              <AnimatedQuantity value={item.quantity} />
                            </button>
                            <button onClick={() => onUpdateQuantity(item.barcode, 1)} className="grid h-8 w-8 place-items-center text-stone-400 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-100 active:bg-stone-50 dark:active:bg-stone-700 rounded-r-xl transition-colors select-none cursor-pointer" aria-label="Augmenter">
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.article>
                    ) : (
                      /* ── CARD (desktop) ── */
                      <motion.article
                        initial={{ opacity: 0, scale: 0.97, y: 8 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true, margin: "-20px" }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        whileHover={{ y: -5, transition: { type: "spring", stiffness: 400, damping: 18 } }}
                        className={`group relative flex flex-col rounded-2xl border border-l-[3px] bg-white dark:bg-stone-900 shadow-sm hover:shadow-xl cursor-pointer select-none overflow-hidden transition-shadow duration-200 border-stone-200/80 dark:border-stone-700/80 ${tone.accentBorder}`}
                        onClick={() => onEditProduct(item)}
                        style={{ minHeight: 240 }}
                      >
                        {/* Image zone */}
                        <div
                          className={`relative flex items-center justify-center bg-gradient-to-b ${tone.imageBg} overflow-hidden`}
                          style={{ height: 136 }}
                        >
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-[1.08]" loading="lazy" />
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <Package className="h-8 w-8 text-stone-200 dark:text-stone-700" />
                              <span className="text-[9px] font-bold text-stone-300 dark:text-stone-600 uppercase tracking-widest">Aucune image</span>
                            </div>
                          )}
                          <span className={`absolute top-2 right-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black backdrop-blur-sm shadow-xs ${tone.badge}`}>
                            {item.quantity}
                          </span>
                          {isRecentTimestamp(item.lastUpdated) && (
                            <span className="absolute top-2 left-2 inline-flex items-center rounded-full bg-indigo-600 px-2 py-0.5 text-[9px] font-black text-white shadow-md">NEW</span>
                          )}
                        </div>

                        {/* Body */}
                        <div className="flex flex-1 flex-col p-3 gap-2">
                          <div className="min-w-0">
                            <h4 className="font-black text-[12px] text-stone-900 dark:text-stone-100 leading-snug line-clamp-2 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors duration-200">
                              {renderHighlightedText(item.name, "rounded bg-amber-100 dark:bg-amber-900/40 px-0.5 text-stone-950 dark:text-amber-200")}
                            </h4>
                            {item.brand && <p className="mt-0.5 text-[10px] font-medium text-stone-400 dark:text-stone-500 truncate">{item.brand}</p>}
                          </div>
                          <div className="flex items-center gap-1 flex-wrap mt-auto">
                            <span className="font-mono text-[9px] text-stone-400 dark:text-stone-500 tabular-nums bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded border border-stone-150 dark:border-stone-700 truncate max-w-[100px]">
                              {item.barcode}
                            </span>
                            {item.category && (
                              <span className="inline-flex items-center rounded border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-1.5 py-0.5 text-[9px] font-bold text-stone-500 dark:text-stone-400 truncate max-w-[90px]">
                                {getCategoryLabel(item.category)}
                              </span>
                            )}
                          </div>
                          <div
                            className="flex items-center justify-between gap-1 border-t border-stone-100 dark:border-stone-700/50 pt-2 mt-0.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className={`text-[10px] font-black uppercase tracking-wide shrink-0 ${tone.labelColor}`}>
                              {tone.label}
                            </span>
                            <div className="flex items-center rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 overflow-hidden">
                              <button
                                onClick={() => onUpdateQuantity(item.barcode, -1)}
                                className="grid h-7 w-7 place-items-center text-stone-400 dark:text-stone-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors select-none cursor-pointer"
                                aria-label="Diminuer la quantité"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => onEditQuantity(item)}
                                className={`min-w-[28px] px-1 py-0.5 text-center font-mono text-[11px] font-black tabular-nums hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors cursor-pointer ${tone.text}`}
                              >
                                <AnimatedQuantity value={item.quantity} />
                              </button>
                              <button
                                onClick={() => onUpdateQuantity(item.barcode, 1)}
                                className="grid h-7 w-7 place-items-center text-stone-400 dark:text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors select-none cursor-pointer"
                                aria-label="Augmenter la quantité"
                              >
                                <Plus className="h-3 w-3" />
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