import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Search, Filter, Tags } from "lucide-react";
import { InventoryGrid } from "../InventoryGrid";
import { CategoryItem, InventoryItem } from "../../types";

type SortBy = "recent" | "name" | "quantityAsc" | "quantityDesc";
type StockFilter = "all" | "low" | "out" | "instock";

type CategoryOption = {
  name: string;
  count: number;
  label: string;
};

type FinancialStats = {
  totalPurchaseVal: number;
  totalSalesVal: number;
  potentialMargin: number;
};

const ITEMS_PER_PAGE = 20;

type StockTabProps = {
  inventoryLength: number;
  filteredInventory: InventoryItem[];
  categories: string[];
  categoryOptions: CategoryOption[];
  dbCategories: CategoryItem[];
  financialStats: FinancialStats;
  searchTerm: string;
  selectedCategory: string | null;
  stockFilter: StockFilter;
  sortBy: SortBy;
  showFilters: boolean;
  hasActiveFilters: boolean;
  isInventoryLoading: boolean;
  onSearchTermChange: (term: string) => void;
  onSelectedCategoryChange: (category: string | null) => void;
  onStockFilterChange: (filter: StockFilter) => void;
  onSortByChange: (sort: SortBy) => void;
  onShowFiltersChange: (show: boolean) => void;
  onShowCategoryModal: () => void;
  onResetFilters: () => void;
  onUpdateQuantity: (barcode: string, delta: number) => void;
  onRemove: (barcode: string) => void;
  onEditQuantity: (item: InventoryItem) => void;
  onEditProduct: (item: InventoryItem) => void;
  onOpenScan: () => void;
};

export function StockTab({
  inventoryLength,
  filteredInventory,
  categories,
  categoryOptions,
  dbCategories,
  financialStats,
  searchTerm,
  selectedCategory,
  stockFilter,
  sortBy,
  showFilters,
  hasActiveFilters,
  isInventoryLoading,
  onSearchTermChange,
  onSelectedCategoryChange,
  onStockFilterChange,
  onSortByChange,
  onShowFiltersChange,
  onShowCategoryModal,
  onResetFilters,
  onUpdateQuantity,
  onRemove,
  onEditQuantity,
  onEditProduct,
  onOpenScan,
}: StockTabProps) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, stockFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredInventory.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const paginatedInventory = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInventory.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, filteredInventory]);

  const pageStart = filteredInventory.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const pageEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredInventory.length);

  return (
    <section className="space-y-4 pb-20">
      {/* Header */}
      <div className="space-y-3 px-1">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">Inventaire</h2>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-500 tabular-nums">
                {filteredInventory.length}/{inventoryLength} réf
              </span>
            </div>
            <p className="mt-0.5 text-xs text-stone-400 font-medium">
              Recherche rapide, filtres et scan en un seul écran.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onShowFiltersChange(!showFilters)}
            aria-pressed={showFilters}
            aria-label={showFilters ? "Masquer les filtres" : "Afficher les filtres"}
            style={{ minHeight: 44, minWidth: 44 }}
            className={`inline-flex flex-shrink-0 items-center justify-center rounded-xl border transition-colors duration-150 touch-manipulation select-none [-webkit-tap-highlight-color:transparent] active:scale-95 ${showFilters
                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                : "border-stone-200 bg-white text-stone-500 active:bg-stone-50"
              }`}
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>

        {/* Permanently Visible Premium Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-1.5">
          <StatCard
            label="Valeur Achat"
            value={`${financialStats.totalPurchaseVal.toFixed(2)} €`}
            tone="stone"
          />
          <StatCard
            label="CA Potentiel"
            value={`${financialStats.totalSalesVal.toFixed(2)} €`}
            tone="indigo"
          />
          <StatCard
            label="Marge Est."
            value={`${financialStats.potentialMargin.toFixed(2)} €`}
            tone="emerald"
          />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 pointer-events-none" />
        <input
          type="text"
          inputMode="search"
          enterKeyHint="search"
          placeholder="Rechercher par nom, marque..."
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          className="w-full h-12 rounded-xl border border-stone-200/80 bg-white pl-10 pr-4 text-base font-bold text-stone-900 placeholder-stone-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all duration-200"
        />
      </div>

      {/* Quick Filters */}
      <div className="relative -mx-3">
        <div className="flex gap-2 overflow-x-auto px-3 pb-1 no-scrollbar snap-x snap-mandatory scroll-px-3">
          <QuickFilter
            label="Toutes"
            active={stockFilter === "all"}
            onClick={() => onStockFilterChange("all")}
          />
          <QuickFilter
            label="Stock faible"
            active={stockFilter === "low"}
            onClick={() => onStockFilterChange("low")}
          />
          <QuickFilter
            label="Ruptures"
            active={stockFilter === "out"}
            onClick={() => onStockFilterChange("out")}
          />
          <QuickFilter
            label="En stock"
            active={stockFilter === "instock"}
            onClick={() => onStockFilterChange("instock")}
          />
          {categories.length > 0 && (
            <button
              type="button"
              onClick={onShowCategoryModal}
              style={{ minHeight: 40 }}
              className={`snap-start flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full border whitespace-nowrap transition-colors duration-150 select-none touch-manipulation [-webkit-tap-highlight-color:transparent] active:scale-95 ${selectedCategory
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "text-stone-600 bg-white border-stone-200/80 active:border-stone-300"
                }`}
            >
              <Tags className="w-3.5 h-3.5" />
              {selectedCategory || "Catégories"}
            </button>
          )}
        </div>
        {/* Fade hint indicating more scrollable content */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-white to-transparent" />
      </div>

      {/* Full Filters */}
      {showFilters && (
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-stone-200/60 bg-stone-50/50 p-3.5 text-[11px]">
          <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
            <span className="font-bold text-stone-500 uppercase tracking-wider text-[9px]">Trier par</span>
            <select
              value={sortBy}
              onChange={(event) => onSortByChange(event.target.value as SortBy)}
              style={{ minHeight: 44 }}
              className="rounded-lg border border-stone-200/80 bg-white px-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-indigo-500"
            >
              <option value="recent">Date d'ajout</option>
              <option value="name">Alphabétique (A-Z)</option>
              <option value="quantityAsc">Quantité croissante</option>
              <option value="quantityDesc">Quantité décroissante</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
            <span className="font-bold text-stone-500 uppercase tracking-wider text-[9px]">État du Stock</span>
            <select
              value={stockFilter}
              onChange={(event) => onStockFilterChange(event.target.value as StockFilter)}
              style={{ minHeight: 44 }}
              className="rounded-lg border border-stone-200/80 bg-white px-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-indigo-500"
            >
              <option value="all">Tous les articles</option>
              <option value="instock">En stock (&gt; 5)</option>
              <option value="low">Stock faible (≤ 5)</option>
              <option value="out">Rupture de stock (0)</option>
            </select>
          </div>
        </div>
      )}

      {/* Product List - Immediately visible */}
      {isInventoryLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-stone-500 border border-dashed border-stone-300 rounded-2xl bg-stone-50/50">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <span className="text-xs font-semibold tracking-wider">Chargement de l'inventaire...</span>
        </div>
      ) : (
        <InventoryGrid
          items={paginatedInventory}
          categories={dbCategories}
          isCompactView={true}
          searchTerm={searchTerm}
          onUpdateQuantity={onUpdateQuantity}
          onRemove={onRemove}
          onEditQuantity={onEditQuantity}
          onEditProduct={onEditProduct}
        />
      )}

      {!isInventoryLoading && filteredInventory.length > ITEMS_PER_PAGE && (
        <div className="rounded-2xl border border-stone-200 bg-white p-3">
          <p className="text-center text-xs font-medium text-stone-400 mb-2.5 tabular-nums">
            Articles {pageStart}-{pageEnd} sur {filteredInventory.length}
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              aria-label="Page précédente"
              className="touch-target grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl border border-stone-200 text-stone-700 transition-colors touch-manipulation [-webkit-tap-highlight-color:transparent] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <span className="min-w-[88px] text-center text-sm font-bold text-stone-900 tabular-nums">
              Page {currentPage}/{totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              aria-label="Page suivante"
              className="touch-target grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl border border-stone-200 text-stone-700 transition-colors touch-manipulation [-webkit-tap-highlight-color:transparent] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function QuickFilter({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ minHeight: 40 }}
      className={`snap-start flex-shrink-0 px-4 py-2 text-xs font-bold rounded-full border whitespace-nowrap transition-colors duration-150 select-none touch-manipulation [-webkit-tap-highlight-color:transparent] active:scale-95 ${active
          ? "bg-stone-900 text-white border-stone-900 shadow-sm"
          : "bg-white text-stone-600 border-stone-200/80 active:border-stone-300"
        }`}
    >
      {label}
    </button>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: "stone" | "indigo" | "emerald" }) {
  const dotColors = {
    stone: "bg-stone-400",
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
  }[tone];

  return (
    <div className="flex-1 min-w-[110px] rounded-xl border border-stone-200/60 bg-white p-3.5 shadow-sm">
      <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-stone-400">
        <span className={`h-1.5 w-1.5 rounded-full ${dotColors}`} />
        {label}
      </div>
      <p className="mt-1 text-sm font-extrabold font-mono text-stone-900 leading-tight tabular-nums">{value}</p>
    </div>
  );
}