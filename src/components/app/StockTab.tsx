
import { useState } from "react";
import { Loader2, Search, Filter, SlidersHorizontal, Eye, List, LayoutGrid, Plus, Tags, Zap } from "lucide-react";
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
  isCompactView: boolean;
  hasActiveFilters: boolean;
  isInventoryLoading: boolean;
  onSearchTermChange: (term: string) => void;
  onSelectedCategoryChange: (category: string | null) => void;
  onStockFilterChange: (filter: StockFilter) => void;
  onSortByChange: (sort: SortBy) => void;
  onShowFiltersChange: (show: boolean) => void;
  onShowCategoryModal: () => void;
  onCompactViewChange: (isCompact: boolean) => void;
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
  isCompactView,
  hasActiveFilters,
  isInventoryLoading,
  onSearchTermChange,
  onSelectedCategoryChange,
  onStockFilterChange,
  onSortByChange,
  onShowFiltersChange,
  onShowCategoryModal,
  onCompactViewChange,
  onResetFilters,
  onUpdateQuantity,
  onRemove,
  onEditQuantity,
  onEditProduct,
  onOpenScan,
}: StockTabProps) {
  const [showStats, setShowStats] = useState(false);

  return (
    <section className="space-y-4 pb-20">
      {/* Simple Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-stone-900">Inventaire</h2>
          <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
            📦 {filteredInventory.length} articles
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onCompactViewChange(!isCompactView)}
            className="p-2 text-stone-500 hover:bg-stone-100 rounded-xl"
          >
            {isCompactView ? <LayoutGrid className="w-5 h-5" /> : <List className="w-5 h-5" />}
          </button>
          <button
            onClick={() => onShowFiltersChange(!showFilters)}
            className="p-2 text-stone-500 hover:bg-stone-100 rounded-xl"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, marque..."
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          className="w-full h-14 rounded-2xl border border-stone-200 bg-white pl-12 pr-4 text-sm font-semibold text-stone-900 outline-none focus:border-indigo-500 transition"
        />
      </div>

      {/* Quick Filters */}
      <div className="-mx-3 flex gap-2 overflow-x-auto px-3 no-scrollbar">
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
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border border-stone-200 whitespace-nowrap ${
              selectedCategory ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "text-stone-600 bg-white"
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
        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-stone-600 border border-stone-200 rounded-2xl hover:bg-stone-50"
      >
        <Eye className="w-4 h-4" />
        {showStats ? "Masquer les stats" : "Voir les stats"}
      </button>

      {/* Stats - only shown when toggled */}
      {showStats && (
        <div className="flex gap-2 overflow-x-auto -mx-3 px-3 no-scrollbar">
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
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-3 text-xs">
          <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
            <span className="font-semibold text-stone-500">Trier par</span>
            <select
              value={sortBy}
              onChange={(event) => onSortByChange(event.target.value as SortBy)}
              className="h-11 rounded-xl border border-stone-200 bg-white p-2 text-stone-900 outline-none transition focus:border-indigo-500"
            >
              <option value="recent">Date d'ajout</option>
              <option value="name">Alphabétique (A-Z)</option>
              <option value="quantityAsc">Quantité croissante</option>
              <option value="quantityDesc">Quantité décroissante</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
            <span className="font-semibold text-stone-500">État du Stock</span>
            <select
              value={stockFilter}
              onChange={(event) => onStockFilterChange(event.target.value as StockFilter)}
              className="h-11 rounded-xl border border-stone-200 bg-white p-2 text-stone-900 outline-none transition focus:border-indigo-500"
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
          <span className="text-xs font-semibold tracking-wider">Chargement de l’inventaire...</span>
        </div>
      ) : (
        <InventoryGrid
          items={filteredInventory}
          categories={dbCategories}
          isCompactView={true}
          searchTerm={searchTerm}
          onUpdateQuantity={onUpdateQuantity}
          onRemove={onRemove}
          onEditQuantity={onEditQuantity}
          onEditProduct={onEditProduct}
        />
      )}

      {/* Floating Scanner Button */}
      <button
        onClick={onOpenScan}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-full shadow-lg shadow-indigo-600/30 flex flex-col items-center justify-center px-6 py-3 z-40 active:scale-95 transition"
      >
        <Zap className="w-6 h-6 mb-0.5" />
        <span className="text-xs font-bold">Scanner</span>
      </button>
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
      className={`px-3 py-2 text-xs font-semibold rounded-xl border border-stone-200 whitespace-nowrap transition ${
        active ? "bg-indigo-600 text-white border-indigo-600" : "text-stone-600 bg-white"
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: "stone" | "indigo" | "emerald" }) {
  const bgClasses = {
    stone: "bg-stone-100 border-stone-200",
    indigo: "bg-indigo-50 border-indigo-100",
    emerald: "bg-emerald-50 border-emerald-100",
  }[tone];

  return (
    <div className={`flex-shrink-0 rounded-2xl border p-3 min-w-[120px] ${bgClasses}`}>
      <span className="block text-[9px] font-semibold uppercase text-stone-500">{label}</span>
      <span className="block mt-1 text-sm font-bold font-mono">{value}</span>
    </div>
  );
}
