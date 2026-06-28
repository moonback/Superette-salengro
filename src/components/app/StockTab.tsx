
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Filter, Eye, Tags, Zap } from "lucide-react";
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
  const [showStats, setShowStats] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, stockFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredInventory.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedInventory = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInventory.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, filteredInventory]);

  const visiblePages = useMemo(() => {
    const maxVisiblePages = 5;
    const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - maxVisiblePages + 1));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  }, [currentPage, totalPages]);

  const pageStart = filteredInventory.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const pageEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredInventory.length);

  return (
    <section className="space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-3 px-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Inventaire</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {filteredInventory.length}/{inventoryLength} articles
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Recherche rapide, filtres et scan en un seul écran.
            </p>
          </div>
          <button
            onClick={() => onShowFiltersChange(!showFilters)}
            className={`inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border transition ${
                    showFilters
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
            aria-label={showFilters ? "Masquer les filtres" : "Afficher les filtres"}
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>

      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, marque..."
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          className="w-full h-14 rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-900"
        />
      </div>

      {/* Quick Filters */}
      <div className="-mx-3 flex gap-2 overflow-x-auto px-4 no-scrollbar">
        <QuickFilter
          label="Toutes"
          active={stockFilter === "all"}
          onClick={() => onStockFilterChange("all")}
        />
        <QuickFilter
          label="Bas"
          active={stockFilter === "low"}
          onClick={() => onStockFilterChange("low")}
        />
        <QuickFilter
          label="Rupture"
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
            onClick={onShowCategoryModal}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 whitespace-nowrap ${
              selectedCategory ? "bg-slate-900 text-white border-slate-900" : "text-slate-600 bg-white"
            }`}
          >
            <Tags className="w-3.5 h-3.5" />
            {selectedCategory || "Catégories"}
          </button>
        )}
      </div>

      {/* Show Stats Button */}
      <button
        onClick={() => setShowStats(!showStats)}
        className="w-full flex items-center justify-center gap-2 px-4 py-4 text-xs font-semibold text-slate-600 border border-slate-200 rounded-2xl bg-white hover:bg-slate-50"
      >
        <Eye className="w-4 h-4" />
        {showStats ? "Masquer les stats" : "Voir les stats"}
      </button>

      {/* Stats - only shown when toggled */}
      {showStats && (
        <div className="flex gap-2 overflow-x-auto -mx-3 px-4 no-scrollbar">
          <StatCard
            label="Achat Total"
            value={`${financialStats.totalPurchaseVal.toFixed(2)} €`}
            tone="stone"
          />
          <StatCard
            label="CA Potentiel"
            value={`${financialStats.totalSalesVal.toFixed(2)} €`}
            tone="indigo"
          />
          <StatCard
            label="Marge Brute"
            value={`${financialStats.potentialMargin.toFixed(2)} €`}
            tone="emerald"
          />
        </div>
      )}

      {/* Full Filters */}
      {showFilters && (
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-xs">
          <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
            <span className="font-semibold text-slate-500">Trier par</span>
            <select
              value={sortBy}
              onChange={(event) => onSortByChange(event.target.value as SortBy)}
              className="h-11 rounded-xl border border-slate-200 bg-white p-2 text-slate-900 outline-none transition focus:border-slate-900"
            >
              <option value="recent">Date d'ajout</option>
              <option value="name">Alphabétique (A-Z)</option>
              <option value="quantityAsc">Quantité croissante</option>
              <option value="quantityDesc">Quantité décroissante</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
            <span className="font-semibold text-slate-500">État du Stock</span>
            <select
              value={stockFilter}
              onChange={(event) => onStockFilterChange(event.target.value as StockFilter)}
              className="h-11 rounded-xl border border-slate-200 bg-white p-2 text-slate-900 outline-none transition focus:border-slate-900"
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
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500 border border-dashed border-slate-300 rounded-2xl bg-slate-50/50">
          <Loader2 className="h-6 w-6 animate-spin text-slate-900" />
          <span className="text-xs font-semibold tracking-wider">Chargement de l’inventaire...</span>
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
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-500">
            <span>
              Articles {pageStart}-{pageEnd} sur {filteredInventory.length}
            </span>
            <span>
              Page {currentPage}/{totalPages}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="min-h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Precedent
            </button>

            <div className="flex items-center gap-1">
              {visiblePages.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`grid h-10 min-w-10 place-items-center rounded-xl border px-2 text-xs font-semibold transition ${
                    currentPage === page
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                  aria-label={`Aller a la page ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="min-h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Floating Scanner Button */}
      {/* <button
        onClick={onOpenScan}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-full  shadow-slate-900/10 flex flex-col items-center justify-center px-6 py-4 z-40 active:scale-95 transition"
      >
        <Zap className="w-6 h-6 mb-0.5" />
        <span className="text-xs font-bold">Scanner</span>
      </button> */}
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
      onClick={onClick}
      className={`px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 whitespace-nowrap transition ${
        active ? "bg-slate-900 text-white border-slate-900" : "text-slate-600 bg-white"
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: "stone" | "indigo" | "emerald" }) {
  const bgClasses = {
    stone: "bg-stone-100 border-stone-200",
    indigo: "bg-stone-50 border-stone-100",
    emerald: "bg-emerald-50 border-emerald-100",
  }[tone];

  return (
    <div className={`flex-shrink-0 rounded-2xl border p-3 min-w-[120px] ${bgClasses}`}>
      <span className="block text-[9px] font-semibold uppercase text-stone-500">{label}</span>
      <span className="block mt-1 text-sm font-bold font-mono">{value}</span>
    </div>
  );
}
