import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Search, Filter, Tags } from "lucide-react";
import { InventoryGrid } from "../InventoryGrid";
import { CategoryItem, InventoryItem } from "../../types";
import { motion, AnimatePresence } from "motion/react";

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
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
    <section className="space-y-4.5 pb-20">
      {/* Header */}
      <div className="space-y-3.5 px-1">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-stone-900 tracking-tight">Inventaire</h2>
              <span className="rounded-full bg-stone-100 border border-stone-200/50 px-2 py-0.5 text-[10px] font-bold text-stone-500 tabular-nums">
                {filteredInventory.length}/{inventoryLength} réf
              </span>
            </div>
            <p className="mt-0.5 text-xs text-stone-400 font-semibold leading-relaxed">
              Recherche rapide, filtres et scan en un seul écran.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => onShowFiltersChange(!showFilters)}
            aria-pressed={showFilters}
            aria-label={showFilters ? "Masquer les filtres" : "Afficher les filtres"}
            style={{ minHeight: 44, minWidth: 44 }}
            className={`inline-flex flex-shrink-0 items-center justify-center rounded-xl border transition-all duration-200 touch-manipulation select-none cursor-pointer shadow-xs ${showFilters
                ? "border-indigo-200 bg-indigo-50 text-indigo-700 font-bold"
                : "border-stone-200 bg-white text-stone-500 active:bg-stone-50"
              }`}
          >
            <Filter className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Permanently Visible Premium Stats Grid */}
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
          className="grid grid-cols-3 gap-2 pt-1"
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
            <StatCard
              label="Valeur Achat"
              value={`${financialStats.totalPurchaseVal.toFixed(2)} €`}
              tone="stone"
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
            <StatCard
              label="CA Potentiel"
              value={`${financialStats.totalSalesVal.toFixed(2)} €`}
              tone="indigo"
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
            <StatCard
              label="Marge Est."
              value={`${financialStats.potentialMargin.toFixed(2)} €`}
              tone="emerald"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Search Bar */}
      <motion.div 
        animate={isSearchFocused ? { scale: 1.005 } : { scale: 1 }}
        className="relative"
      >
        <Search className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200 pointer-events-none ${
          isSearchFocused ? "text-indigo-650" : "text-stone-400"
        }`} />
        <input
          type="text"
          inputMode="search"
          enterKeyHint="search"
          placeholder="Rechercher par nom, marque..."
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="w-full h-12 rounded-2xl border border-stone-200 bg-white pl-10 pr-4 text-sm font-semibold text-stone-900 placeholder-stone-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all duration-200 shadow-xs"
        />
      </motion.div>

      {/* Quick Filters */}
      <div className="relative -mx-3">
        <div className="flex gap-2 overflow-x-auto px-3 pb-1.5 no-scrollbar snap-x snap-mandatory scroll-px-3">
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
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onShowCategoryModal}
              style={{ minHeight: 40 }}
              className={`snap-start flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full border whitespace-nowrap transition-colors duration-150 select-none touch-manipulation cursor-pointer ${selectedCategory
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
                  : "text-stone-500 bg-white border-stone-200 active:border-stone-300"
                }`}
            >
              <Tags className="w-3.5 h-3.5" />
              {selectedCategory || "Catégories"}
            </motion.button>
          )}
        </div>
        {/* Fade hint indicating more scrollable content */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-1.5 w-8 bg-gradient-to-l from-[#faf9f6] to-transparent" />
      </div>

      {/* Full Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-stone-200/50 bg-stone-50/50 p-3.5 text-[11px] shadow-inner mb-2">
              <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                <span className="font-bold text-stone-400 uppercase tracking-wider text-[9px]">Trier par</span>
                <select
                  value={sortBy}
                  onChange={(event) => onSortByChange(event.target.value as SortBy)}
                  style={{ minHeight: 44 }}
                  className="rounded-xl border border-stone-200 bg-white px-3 text-xs font-bold text-stone-800 outline-none transition focus:border-indigo-500 shadow-xs"
                >
                  <option value="recent">Date d'ajout</option>
                  <option value="name">Alphabétique (A-Z)</option>
                  <option value="quantityAsc">Quantité croissante</option>
                  <option value="quantityDesc">Quantité décroissante</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                <span className="font-bold text-stone-400 uppercase tracking-wider text-[9px]">État du Stock</span>
                <select
                  value={stockFilter}
                  onChange={(event) => onStockFilterChange(event.target.value as StockFilter)}
                  style={{ minHeight: 44 }}
                  className="rounded-xl border border-stone-200 bg-white px-3 text-xs font-bold text-stone-800 outline-none transition focus:border-indigo-500 shadow-xs"
                >
                  <option value="all">Tous les articles</option>
                  <option value="instock">En stock (&gt; 5)</option>
                  <option value="low">Stock faible (≤ 5)</option>
                  <option value="out">Rupture de stock (0)</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product List - Immediately visible */}
      {isInventoryLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-stone-400 border border-dashed border-stone-300 rounded-3xl bg-white/60 backdrop-blur-xs">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-650" />
          <span className="text-xs font-bold tracking-wider font-mono">Chargement de l'inventaire...</span>
        </div>
      ) : (
        <div className="min-h-[250px]">
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
        </div>
      )}

      {/* Pagination */}
      {!isInventoryLoading && filteredInventory.length > ITEMS_PER_PAGE && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-3xl border border-stone-200/50 bg-white p-3.5 shadow-sm"
        >
          <p className="text-center text-xs font-bold text-stone-400 mb-3 tabular-nums">
            Articles {pageStart}-{pageEnd} sur {filteredInventory.length}
          </p>

          <div className="flex items-center justify-center gap-4">
            <motion.button
              whileTap={{ scale: 0.90 }}
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              aria-label="Page précédente"
              className="touch-target grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl border border-stone-200 text-stone-700 bg-white transition-all select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 disabled:pointer-events-none shadow-xs"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>

            <span className="min-w-[88px] text-center text-xs font-extrabold text-stone-800 tabular-nums">
              Page {currentPage} / {totalPages}
            </span>

            <motion.button
              whileTap={{ scale: 0.90 }}
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              aria-label="Page suivante"
              className="touch-target grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl border border-stone-200 text-stone-700 bg-white transition-all select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 disabled:pointer-events-none shadow-xs"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>
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
      className={`snap-start relative flex-shrink-0 px-4 py-2 text-xs font-bold rounded-full border whitespace-nowrap transition-colors duration-250 select-none touch-manipulation cursor-pointer ${
        active
          ? "text-white border-transparent"
          : "bg-white text-stone-500 border-stone-200 hover:text-stone-700 active:border-stone-300"
      }`}
    >
      {active && (
        <motion.div
          layoutId="activeStockFilterPill"
          className="absolute inset-0 bg-stone-900 rounded-full -z-10 shadow-sm"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
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
    <motion.div 
      whileHover={{ y: -2, scale: 1.015 }}
      className="flex-1 min-w-[110px] rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm transition-all duration-200"
    >
      <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-stone-400">
        <span className={`h-1.5 w-1.5 rounded-full ${dotColors}`} />
        {label}
      </div>
      <p className="mt-1 text-sm font-black font-mono text-stone-900 leading-tight tabular-nums">{value}</p>
    </motion.div>
  );
}