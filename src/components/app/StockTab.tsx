import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Search, Filter, Tags, TrendingUp, ShoppingCart, BarChart3 } from "lucide-react";
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
    <section className="pb-20 lg:pb-6">

      {/* ── DESKTOP TWO-COLUMN LAYOUT ── */}
      <div className="stock-desktop-layout">

        {/* ── LEFT PANEL: filters (always visible on desktop, collapsible on mobile) ── */}
        <div className="stock-filters-panel">

          {/* Mobile-only header row */}
          <div className="lg:hidden space-y-3.5 px-1">
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

            {/* Mobile stats */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.05 } }
              }}
              className="grid grid-cols-3 gap-2 pt-1"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                <StatCard label="Valeur Achat" value={`${financialStats.totalPurchaseVal.toFixed(2)} €`} tone="stone" />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                <StatCard label="CA Potentiel" value={`${financialStats.totalSalesVal.toFixed(2)} €`} tone="indigo" />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                <StatCard label="Marge Est." value={`${financialStats.potentialMargin.toFixed(2)} €`} tone="emerald" />
              </motion.div>
            </motion.div>
          </div>

          {/* ── DESKTOP SIDEBAR FILTERS PANEL ── */}
          <div className="hidden lg:flex flex-col gap-4">

            {/* Desktop section title */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-black text-stone-900 tracking-tight">Inventaire</h2>
                <span className="rounded-full bg-stone-100 border border-stone-200/50 px-2 py-0.5 text-[10px] font-bold text-stone-500 tabular-nums">
                  {filteredInventory.length}/{inventoryLength}
                </span>
              </div>
              <p className="text-xs text-stone-400 font-semibold">
                {filteredInventory.length} résultat{filteredInventory.length > 1 ? 's' : ''}
              </p>
            </div>

            {/* Desktop stat cards: stacked */}
            <div className="grid grid-cols-1 gap-2">
              <DesktopStatCard
                label="Valeur d'achat"
                value={`${financialStats.totalPurchaseVal.toFixed(2)} €`}
                icon={ShoppingCart}
                color="stone"
              />
              <DesktopStatCard
                label="CA Potentiel"
                value={`${financialStats.totalSalesVal.toFixed(2)} €`}
                icon={TrendingUp}
                color="indigo"
              />
              <DesktopStatCard
                label="Marge Estimée"
                value={`${financialStats.potentialMargin.toFixed(2)} €`}
                icon={BarChart3}
                color="emerald"
              />
            </div>

            {/* Desktop: always-visible filters */}
            <div className="rounded-2xl border border-stone-200/60 bg-white p-4 shadow-sm space-y-4">
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400">Filtres</p>

              {/* Quick stock filter */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">État du stock</span>
                <div className="flex flex-col gap-1">
                  {([
                    { val: "all", label: "Tous les articles" },
                    { val: "instock", label: "En stock (> 5)" },
                    { val: "low", label: "Stock faible (≤ 5)" },
                    { val: "out", label: "Rupture (0)" },
                  ] as const).map(({ val, label }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => onStockFilterChange(val)}
                      className={`text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        stockFilter === val
                          ? "bg-stone-900 text-white shadow-sm"
                          : "text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Trier par</span>
                <select
                  value={sortBy}
                  onChange={(e) => onSortByChange(e.target.value as SortBy)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-xs cursor-pointer"
                >
                  <option value="recent">Date d'ajout</option>
                  <option value="name">Alphabétique (A-Z)</option>
                  <option value="quantityAsc">Quantité croissante</option>
                  <option value="quantityDesc">Quantité décroissante</option>
                </select>
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Catégorie</span>
                  <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1 -mr-1">
                    <button
                      type="button"
                      onClick={() => onSelectedCategoryChange(null)}
                      className={`text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        !selectedCategory
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      Toutes ({inventoryLength})
                    </button>
                    {categoryOptions.map(({ name, count, label }) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => onSelectedCategoryChange(name)}
                        className={`text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          selectedCategory === name
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-stone-600 hover:bg-stone-100"
                        }`}
                      >
                        <span className="truncate">{label}</span>
                        <span className={`flex-shrink-0 text-[10px] tabular-nums ${selectedCategory === name ? 'text-indigo-200' : 'text-stone-400'}`}>{count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reset */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="w-full text-center text-xs font-bold text-rose-500 hover:text-rose-700 transition cursor-pointer py-1"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </div>

          {/* Mobile: collapsible filters */}
          <div className="lg:hidden">
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
          </div>
        </div>

        {/* ── RIGHT / MAIN CONTENT AREA ── */}
        <div className="stock-main-content space-y-4">

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
              placeholder="Rechercher par nom, marque, code-barres..."
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full h-12 rounded-2xl border border-stone-200 bg-white pl-10 pr-4 text-sm font-semibold text-stone-900 placeholder-stone-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all duration-200 shadow-xs"
            />
          </motion.div>

          {/* Quick Filters — mobile only (desktop has sidebar) */}
          <div className="lg:hidden relative -mx-3">
            <div className="flex gap-2 overflow-x-auto px-3 pb-1.5 no-scrollbar snap-x snap-mandatory scroll-px-3">
              <QuickFilter label="Toutes" active={stockFilter === "all"} onClick={() => onStockFilterChange("all")} />
              <QuickFilter label="Stock faible" active={stockFilter === "low"} onClick={() => onStockFilterChange("low")} />
              <QuickFilter label="Ruptures" active={stockFilter === "out"} onClick={() => onStockFilterChange("out")} />
              <QuickFilter label="En stock" active={stockFilter === "instock"} onClick={() => onStockFilterChange("instock")} />
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
            <div className="pointer-events-none absolute right-0 top-0 bottom-1.5 w-8 bg-gradient-to-l from-[#faf9f6] to-transparent" />
          </div>

          {/* Desktop: active filters summary bar */}
          {hasActiveFilters && (
            <div className="hidden lg:flex items-center gap-2 flex-wrap">
              {selectedCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                  <Tags className="h-3 w-3" />
                  {selectedCategory}
                  <button
                    type="button"
                    onClick={() => onSelectedCategoryChange(null)}
                    className="hover:text-indigo-900 transition cursor-pointer ml-0.5 leading-none"
                    aria-label="Retirer le filtre catégorie"
                  >
                    ×
                  </button>
                </span>
              )}
              {stockFilter !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-bold">
                  {stockFilter === "low" ? "Stock faible" : stockFilter === "out" ? "Rupture" : "En stock"}
                  <button
                    type="button"
                    onClick={() => onStockFilterChange("all")}
                    className="hover:text-stone-900 transition cursor-pointer ml-0.5 leading-none"
                    aria-label="Retirer le filtre stock"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-bold">
                  <Search className="h-3 w-3" />
                  "{searchTerm}"
                  <button
                    type="button"
                    onClick={() => onSearchTermChange("")}
                    className="hover:text-stone-900 transition cursor-pointer ml-0.5 leading-none"
                    aria-label="Effacer la recherche"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Product List */}
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
                  className="touch-target grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl border border-stone-200 text-stone-700 bg-white transition-all select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 disabled:pointer-events-none shadow-xs hover:bg-stone-50"
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
                  className="touch-target grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl border border-stone-200 text-stone-700 bg-white transition-all select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 disabled:pointer-events-none shadow-xs hover:bg-stone-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
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

function DesktopStatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "stone" | "indigo" | "emerald";
}) {
  const colorMap = {
    stone: {
      bg: "bg-stone-100",
      icon: "text-stone-500",
      value: "text-stone-900",
    },
    indigo: {
      bg: "bg-indigo-50",
      icon: "text-indigo-500",
      value: "text-indigo-900",
    },
    emerald: {
      bg: "bg-emerald-50",
      icon: "text-emerald-500",
      value: "text-emerald-900",
    },
  }[color];

  return (
    <motion.div
      whileHover={{ y: -1, scale: 1.01 }}
      className="flex items-center gap-3 rounded-xl border border-stone-200/70 bg-white p-3 shadow-xs transition-all duration-200"
    >
      <div className={`h-9 w-9 rounded-xl ${colorMap.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`h-4 w-4 ${colorMap.icon}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider truncate">{label}</p>
        <p className={`text-sm font-black font-mono tabular-nums leading-tight ${colorMap.value}`}>{value}</p>
      </div>
    </motion.div>
  );
}

import type React from "react";