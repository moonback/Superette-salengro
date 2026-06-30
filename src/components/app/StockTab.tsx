import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Search, Filter, Tags, TrendingUp, ShoppingCart, BarChart3, Package, Layers, X } from "lucide-react";
import { InventoryGrid } from "../InventoryGrid";
import { CategoryItem, InventoryItem } from "../../types";
import { motion, AnimatePresence } from "motion/react";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches
  );
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

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

const ITEMS_PER_PAGE_MOBILE = 20;
const ITEMS_PER_PAGE_DESKTOP = 36;

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
  const [showMobileStats, setShowMobileStats] = useState(false);
  const isDesktop = useIsDesktop();
  const ITEMS_PER_PAGE = isDesktop ? ITEMS_PER_PAGE_DESKTOP : ITEMS_PER_PAGE_MOBILE;

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
                {/* <p className="mt-0.5 text-xs text-stone-400 font-semibold leading-relaxed">
                  Recherche rapide, filtres et scan en un seul écran.
                </p> */}
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => setShowMobileStats(!showMobileStats)}
                  aria-pressed={showMobileStats}
                  aria-label={showMobileStats ? "Masquer les statistiques" : "Afficher les statistiques"}
                  style={{ minHeight: 44, minWidth: 44 }}
                  className={`inline-flex flex-shrink-0 items-center justify-center rounded-xl border transition-all duration-200 touch-manipulation select-none cursor-pointer shadow-xs ${showMobileStats
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 font-bold"
                    : "border-stone-200 bg-white text-stone-500 active:bg-stone-50"
                    }`}
                >
                  <BarChart3 className="h-4 w-4" />
                </motion.button>
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
            </div>

            {/* Mobile stats */}
            <AnimatePresence>
              {showMobileStats && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 4 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-3 gap-2 pt-1 pb-2">
                    <StatCard label="Valeur Achat" value={`${financialStats.totalPurchaseVal.toFixed(2)} €`} tone="stone" />
                    <StatCard label="CA Potentiel" value={`${financialStats.totalSalesVal.toFixed(2)} €`} tone="indigo" />
                    <StatCard label="Marge Est." value={`${financialStats.potentialMargin.toFixed(2)} €`} tone="emerald" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── DESKTOP SIDEBAR FILTERS PANEL ── */}
          <div className="hidden lg:flex flex-col gap-3.5">

            {/* Desktop section title */}
            <div className="flex items-center gap-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-stone-900 tracking-tight">Inventaire</h2>
                  <span className="rounded-full bg-stone-100 border border-stone-200/60 px-2 py-0.5 text-[10px] font-black text-stone-500 tabular-nums">
                    {filteredInventory.length}/{inventoryLength}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-stone-400 font-semibold">
                  {filteredInventory.length} résultat{filteredInventory.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Desktop stat cards: 2-col grid */}
            <div className="grid grid-cols-1 gap-1.5">
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
            <div className="rounded-2xl border border-stone-200/60 bg-white shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/60">
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Filtres & Tri</p>
              </div>

              <div className="p-3.5 space-y-4">
                {/* Quick stock filter */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">État du stock</span>
                  <div className="flex flex-col gap-0.5">
                    {([
                      { val: "all", label: "Tous les articles", dot: "bg-stone-400" },
                      { val: "instock", label: "En stock (> 5)", dot: "bg-emerald-500" },
                      { val: "low", label: "Stock faible (≤ 5)", dot: "bg-amber-500" },
                      { val: "out", label: "Rupture (0)", dot: "bg-rose-500" },
                    ] as const).map(({ val, label, dot }) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => onStockFilterChange(val)}
                        className={`text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${stockFilter === val
                          ? "bg-stone-900 text-white shadow-sm"
                          : "text-stone-600 hover:bg-stone-100"
                          }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${stockFilter === val ? 'bg-white/70' : dot}`} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">Trier par</span>
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
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">Catégorie</span>
                    <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto pr-0.5">
                      <button
                        type="button"
                        onClick={() => onSelectedCategoryChange(null)}
                        className={`text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between gap-2 ${!selectedCategory
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-stone-600 hover:bg-stone-100"
                          }`}
                      >
                        <span>Toutes</span>
                        <span className={`flex-shrink-0 text-[10px] font-bold tabular-nums rounded-full px-1.5 py-0.5 ${!selectedCategory ? 'bg-indigo-500 text-white' : 'bg-stone-200 text-stone-500'}`}>
                          {inventoryLength}
                        </span>
                      </button>
                      {categoryOptions.map(({ name, count, label }) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => onSelectedCategoryChange(name)}
                          className={`text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between gap-2 ${selectedCategory === name
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-stone-600 hover:bg-stone-100"
                            }`}
                        >
                          <span className="truncate">{label}</span>
                          <span className={`flex-shrink-0 text-[10px] font-bold tabular-nums rounded-full px-1.5 py-0.5 ${selectedCategory === name ? 'bg-indigo-500 text-white' : 'bg-stone-200 text-stone-500'}`}>
                            {count}
                          </span>
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
                    className="w-full text-center text-xs font-bold text-rose-500 hover:text-white hover:bg-rose-500 transition-all cursor-pointer py-2 rounded-xl border border-rose-200 hover:border-transparent"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile: Filter & Search Modal */}
          <AnimatePresence>
            {showFilters && !isDesktop && (
              <>
                <motion.div
                  key="mobile-filter-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => onShowFiltersChange(false)}
                  className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm lg:hidden"
                />
                <motion.div
                  key="mobile-filter-modal"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="fixed inset-x-0 bottom-0 z-[101] bg-white rounded-t-3xl shadow-2xl flex flex-col lg:hidden"
                  style={{ maxHeight: "calc(100dvh - 2rem)" }}
                >
                  <div className="flex items-center justify-between p-5 pb-4 border-b border-stone-100">
                    <h3 className="text-lg font-black text-stone-900 tracking-tight">Recherche & Filtres</h3>
                    <button
                      type="button"
                      onClick={() => onShowFiltersChange(false)}
                      className="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors"
                      aria-label="Fermer les filtres"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="overflow-y-auto p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-6">
                    {/* Search Bar in modal */}
                    <div>
                      <span className="block font-bold text-stone-400 uppercase tracking-wider text-[9px] mb-1.5">Recherche</span>
                      <div className="relative">
                        <Search className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200 pointer-events-none ${isSearchFocused ? "text-indigo-650" : "text-stone-400"}`} />
                        <input
                          type="text"
                          inputMode="search"
                          enterKeyHint="search"
                          placeholder="Nom, marque, code-barres..."
                          value={searchTerm}
                          onChange={(event) => onSearchTermChange(event.target.value)}
                          onFocus={() => setIsSearchFocused(true)}
                          onBlur={() => setIsSearchFocused(false)}
                          className="w-full h-12 rounded-2xl border border-stone-200 bg-stone-50 pl-10 pr-4 text-sm font-semibold text-stone-900 placeholder-stone-400 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
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

                      <div className="flex flex-col gap-1.5">
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
                          <option value="out">Rupture (0)</option>
                        </select>
                      </div>
                    </div>

                    {/* Categories quick pick */}
                    {categoryOptions.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-stone-400 uppercase tracking-wider text-[9px]">Catégories</span>
                          {selectedCategory && (
                            <button
                              type="button"
                              onClick={() => onSelectedCategoryChange(null)}
                              className="text-[9px] font-bold text-indigo-600 uppercase"
                            >
                              Retirer
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {categoryOptions.map(cat => (
                            <button
                              key={cat.name}
                              type="button"
                              onClick={() => onSelectedCategoryChange(cat.name)}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${selectedCategory === cat.name
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
                                : "bg-white border-stone-200 text-stone-600"
                                }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={onResetFilters}
                        className="w-full text-center text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all cursor-pointer py-3.5 rounded-xl border border-rose-200 shadow-xs"
                      >
                        Réinitialiser tous les filtres
                      </button>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT / MAIN CONTENT AREA ── */}
        <div className="stock-main-content space-y-4">

          {/* Search Bar - Desktop Only */}
          <motion.div
            animate={isSearchFocused ? { scale: 1.005 } : { scale: 1 }}
            className="relative hidden lg:block"
          >
            <Search className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200 pointer-events-none ${isSearchFocused ? "text-indigo-650" : "text-stone-400"
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

          {/* ── Category picker OR product list ── */}
          {isInventoryLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-stone-400 border border-dashed border-stone-300 rounded-3xl bg-white/60 backdrop-blur-xs">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-650" />
              <span className="text-xs font-bold tracking-wider font-mono">Chargement de l'inventaire...</span>
            </div>
          ) : !selectedCategory && !searchTerm ? (
            /* ── No category selected: show category picker ── */
            <AnimatePresence mode="wait">
              <motion.div
                key="category-picker"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
              >
                {/* Prompt header */}
                {/* <div className="flex items-center text-left mb-6 pt-2">
                  <div className="h-14 w-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mr-4 shadow-sm">
                    <Layers className="h-7 w-7 text-indigo-500" />
                  </div>

                  <div>
                    <h3 className="text-base font-black text-stone-900 tracking-tight">
                      Choisissez une catégorie
                    </h3>
                    <p className="mt-1 text-xs text-stone-400 font-semibold max-w-xs">
                      Sélectionnez une catégorie pour afficher les produits correspondants.
                    </p>
                  </div>
                </div> */}

                {categoryOptions.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-stone-400">
                    <Package className="h-8 w-8 text-stone-300" />
                    <p className="text-xs font-bold">Aucune catégorie disponible</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {categoryOptions.map(({ name, count, label }, idx) => (
                      <motion.button
                        key={name}
                        type="button"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04, type: "spring", stiffness: 300, damping: 26 }}
                        whileHover={{ y: -3, transition: { type: "spring", stiffness: 400, damping: 20 } }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onSelectedCategoryChange(name)}
                        className="group relative flex flex-col items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-3 py-5 shadow-xs hover:border-indigo-300 hover:bg-indigo-50/40 hover:shadow-md transition-all cursor-pointer select-none text-center"
                      >
                        <span className="text-2xl leading-none">
                          {dbCategories.find(c => c.name.toLowerCase() === name.toLowerCase())?.icon || "📦"}
                        </span>
                        <span className="text-[11px] font-black text-stone-800 group-hover:text-indigo-700 transition-colors leading-tight line-clamp-2">
                          {label}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-stone-100 group-hover:bg-indigo-100 border border-stone-200/60 group-hover:border-indigo-200 px-2 py-0.5 text-[10px] font-black tabular-nums text-stone-500 group-hover:text-indigo-600 transition-colors">
                          {count}
                        </span>
                        {/* Hover accent */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-indigo-400/20 pointer-events-none transition-all" />
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            /* ── Category or search active: show products ── */
            <AnimatePresence mode="wait">
              <motion.div
                key={`products-${selectedCategory ?? "search"}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="space-y-4"
              >
                {/* Back button + category breadcrumb */}
                {selectedCategory && (
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      type="button"
                      onClick={() => {
                        onSelectedCategoryChange(null);
                        onSearchTermChange("");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 hover:border-stone-300 hover:bg-stone-50 transition-all shadow-xs cursor-pointer select-none"
                      aria-label="Retour aux catégories"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Retour
                    </motion.button>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-stone-300 text-xs">/</span>
                      <span className="text-xs font-black text-stone-700 truncate">
                        {dbCategories.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase())?.icon && (
                          <span className="mr-1">{dbCategories.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase())?.icon}</span>
                        )}
                        {selectedCategory}
                      </span>
                      <span className="text-[10px] font-bold text-stone-400 tabular-nums bg-stone-100 px-1.5 py-0.5 rounded-full">
                        {filteredInventory.length}
                      </span>
                    </div>
                  </div>
                )}

                <div className="min-h-[250px]">
                  <InventoryGrid
                    items={paginatedInventory}
                    categories={dbCategories}
                    isCompactView={!isDesktop}
                    searchTerm={searchTerm}
                    onUpdateQuantity={onUpdateQuantity}
                    onRemove={onRemove}
                    onEditQuantity={onEditQuantity}
                    onEditProduct={onEditProduct}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Pagination — only when products are visible */}
          {!isInventoryLoading && (selectedCategory || searchTerm) && filteredInventory.length > ITEMS_PER_PAGE && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-3xl border border-stone-200/50 bg-white p-3.5 shadow-sm"
            >
              <p className="text-center text-xs font-bold text-stone-400 mb-3 tabular-nums">
                Articles {pageStart}–{pageEnd} sur {filteredInventory.length}
              </p>

              <div className="flex items-center justify-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.90 }}
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  aria-label="Première page"
                  className="hidden lg:grid touch-target h-9 w-9 flex-shrink-0 place-items-center rounded-lg border border-stone-200 text-stone-500 bg-white transition-all select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 disabled:pointer-events-none shadow-xs hover:bg-stone-50 text-xs font-bold"
                >
                  «
                </motion.button>

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

                {/* Desktop: numbered page buttons */}
                <div className="hidden lg:flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                    .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, idx) =>
                      p === '...' ? (
                        <span key={`ellipsis-${idx}`} className="px-1 text-stone-400 text-xs font-bold select-none">…</span>
                      ) : (
                        <motion.button
                          key={p}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => setCurrentPage(p as number)}
                          aria-current={currentPage === p ? 'page' : undefined}
                          className={`h-9 min-w-[36px] px-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${currentPage === p
                            ? 'bg-stone-900 text-white shadow-sm'
                            : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                            }`}
                        >
                          {p}
                        </motion.button>
                      )
                    )
                  }
                </div>

                {/* Mobile: page indicator */}
                <span className="lg:hidden min-w-[88px] text-center text-xs font-extrabold text-stone-800 tabular-nums">
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

                <motion.button
                  whileTap={{ scale: 0.90 }}
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  aria-label="Dernière page"
                  className="hidden lg:grid touch-target h-9 w-9 flex-shrink-0 place-items-center rounded-lg border border-stone-200 text-stone-500 bg-white transition-all select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 disabled:pointer-events-none shadow-xs hover:bg-stone-50 text-xs font-bold"
                >
                  »
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
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