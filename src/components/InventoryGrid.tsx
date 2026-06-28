
import React, { useMemo, useState, useRef, TouchEvent } from "react";
import { InventoryItem, CategoryItem } from "../types";
import { Package, Plus, Minus, Trash2, AlertTriangle, Edit2 } from "lucide-react";
import { AnimatedQuantity } from "./AnimatedQuantity";
import { isRecentTimestamp } from "../lib/utils";

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

  const swipeClass = isSwiping ? "" : "transition-transform duration-200 ease-out";
  const roundedClass = isCompact ? "rounded-xl" : "rounded-2xl";

  let bgClass = "bg-transparent border-transparent";
  let iconLeft = false;
  let iconRight = false;
  if (currentX > 15) {
    bgClass = "bg-emerald-100 border-emerald-300";
    iconLeft = true;
  } else if (currentX < -15) {
    bgClass = "bg-rose-100 border-rose-300";
    iconRight = true;
  }

  return (
    <div className={`relative overflow-hidden w-full ${roundedClass}`}>
      <div className={`absolute inset-0 flex items-center justify-between px-6 transition-colors border ${roundedClass} ${bgClass}`}>
        <div className={`flex items-center gap-1.5 text-emerald-700 font-bold text-[10px] uppercase tracking-wider transition-opacity duration-150 ${iconLeft ? 'opacity-100' : 'opacity-0'}`}>
          <Plus className="w-4 h-4 animate-pulse" />
          <span>Ajouter +1</span>
        </div>
        <div className={`flex items-center gap-1.5 text-rose-600 font-bold text-[10px] uppercase tracking-wider transition-opacity duration-150 ${iconRight ? 'opacity-100' : 'opacity-0'}`}>
          <span>Supprimer</span>
          <Trash2 className="w-4 h-4 animate-pulse" />
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
      <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50/50 px-4 py-14 text-center">
        <Package className="mx-auto mb-3 h-8 w-8 text-stone-300" />
        <h3 className="font-bold text-stone-900 text-sm">Aucun produit en stock</h3>
        <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-stone-500">
          Scannez un code-barres ou saisissez-le manuellement pour ajouter votre premier article.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groupedItems.map((group) => (
        <div key={group.category} className="space-y-2 product-grid-enter">
          {/* Category Header */}
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {(() => {
                const catObj = categories.find(c => c.name.toLowerCase() === group.category.toLowerCase());
                return catObj?.icon ? `${catObj.icon} ${group.category}` : group.category;
              })()}
            </h3>
            <span className="text-[10px] font-bold font-mono tabular px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full">
              {group.items.length}
            </span>
          </div>

          {/* Cards */}
          <div className="space-y-2">
            {group.items.map((item) => (
              <SwipeableItem
                key={item.barcode}
                isCompact={true}
                onSwipeRight={() => onUpdateQuantity(item.barcode, 1)}
                onSwipeLeft={() => onRemove(item.barcode)}
              >
                <article
                  className="flex items-center gap-3 bg-white border border-stone-200 rounded-2xl px-3 py-3"
                  onClick={() => onEditProduct(item)}
                >
                  {/* Image */}
                  <div className="h-12 w-12 flex-shrink-0 grid place-items-center rounded-xl border border-stone-200 bg-stone-50">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain rounded-lg" />
                    ) : (
                      <Package className="h-5 w-5 text-stone-300" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-stone-900">
                        {renderHighlightedText(item.name, "rounded bg-amber-100 px-0.5 text-stone-950")}
                      </h4>
                      {renderNewBadge(item)}
                    </div>
                    <div className="text-xs text-stone-500 mt-1">
                      {item.brand && <span>{item.brand}</span>}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center">
                    {item.quantity <= 5 && (
                      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-amber-50 border border-amber-200 text-[9px] font-bold text-amber-700">
                        {item.quantity}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center rounded-full bg-stone-100 border border-stone-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onUpdateQuantity(item.barcode, -1)}
                      className="h-9 w-9 grid place-items-center rounded-l-full text-stone-600 hover:bg-stone-200"
                      aria-label="Diminuer la quantité"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onEditQuantity(item)}
                      className={`px-2 min-w-[32px] text-center font-mono text-xs font-bold tabular py-0.5 ${item.quantity <= 5 ? "text-amber-600" : "text-stone-900"}`}
                    >
                      <AnimatedQuantity value={item.quantity} />
                    </button>
                    <button
                      onClick={() => onUpdateQuantity(item.barcode, 1)}
                      className="h-9 w-9 grid place-items-center rounded-r-full text-stone-600 hover:bg-stone-200"
                      aria-label="Augmenter la quantité"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </article>
              </SwipeableItem>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
