import React, { useState, useMemo, useEffect, useRef } from "react";
import { InventoryItem } from "../../types";
import { Search, Plus, Minus, History, Trash2, ArrowDownToLine, ArrowUpFromLine, Package, X, Undo2, ScanLine } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { triggerHaptic } from "../../lib/haptics";

type OperationMode = "in" | "out";

type HistoryItem = {
  id: string;
  product: InventoryItem;
  delta: number;
  timestamp: number;
  reverted: boolean;
};

type POSTabProps = {
  inventory: InventoryItem[];
  onUpdateQuantity: (barcode: string, delta: number) => void;
};

export function POSTab({ inventory, onUpdateQuantity }: POSTabProps) {
  const [mode, setMode] = useState<OperationMode>("out");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => searchInputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const query = searchTerm.toLowerCase();
    return inventory.filter(
      (item) =>
        item.barcode.includes(query) ||
        item.name.toLowerCase().includes(query) ||
        (item.brand && item.brand.toLowerCase().includes(query))
    ).slice(0, 12);
  }, [searchTerm, inventory]);

  const handleApplyProduct = (product: InventoryItem) => {
    const delta = mode === "in" ? 1 : -1;
    
    if (mode === "out" && product.quantity <= 0) {
      triggerHaptic("warning");
      if (product.quantity === 0) {
        alert("Stock déjà à 0 !");
        return;
      }
    }

    triggerHaptic("success");
    onUpdateQuantity(product.barcode, delta);

    const newHistoryItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      product,
      delta,
      timestamp: Date.now(),
      reverted: false,
    };
    
    setHistory((prev) => [newHistoryItem, ...prev]);
    setSearchTerm("");
    searchInputRef.current?.focus();
  };

  const handleRevert = (historyId: string) => {
    const item = history.find(h => h.id === historyId);
    if (!item || item.reverted) return;

    triggerHaptic("warning");
    onUpdateQuantity(item.product.barcode, -item.delta);
    setHistory(prev => prev.map(h => h.id === historyId ? { ...h, reverted: true } : h));
    searchInputRef.current?.focus();
  };

  return (
    <section className="pb-20 lg:pb-0 h-full">
      {/* Mobile Title */}
      <div className="lg:hidden px-2 mb-6">
        <h2 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
          <ScanLine className="h-6 w-6 text-indigo-600" />
          Caisse / Opérations
        </h2>
        <p className="mt-1 text-sm text-stone-500 font-medium">
          Appliquez vos entrées/sorties instantanément.
        </p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start h-full">
        {/* LEFT COLUMN: Main Operations Area */}
        <div className="flex flex-col gap-6 lg:gap-8 w-full">
          {/* Desktop Header */}
          <div className="hidden lg:block px-2">
            <h2 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
              <ScanLine className="h-8 w-8 text-indigo-600" />
              Caisse & Opérations
            </h2>
            <p className="mt-1.5 text-base text-stone-500 font-medium">
              Sélectionnez le mode d'opération, puis scannez les articles pour une mise à jour instantanée.
            </p>
          </div>

          {/* Premium Mode Selector */}
          <div className="flex p-1.5 bg-stone-100/80 backdrop-blur-md rounded-[1.25rem] border border-stone-200/60 shadow-inner w-full lg:max-w-xl mx-2 lg:mx-0">
            <button
              onClick={() => { setMode("out"); searchInputRef.current?.focus(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm transition-all duration-300 ${
                mode === "out"
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-[1.02]"
                  : "bg-transparent text-stone-500 hover:text-stone-700 hover:bg-stone-200/50"
              }`}
            >
              <ArrowUpFromLine className="h-5 w-5" />
              RETRAIT (Vente)
            </button>
            <button
              onClick={() => { setMode("in"); searchInputRef.current?.focus(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm transition-all duration-300 ${
                mode === "in"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]"
                  : "bg-transparent text-stone-500 hover:text-stone-700 hover:bg-stone-200/50"
              }`}
            >
              <ArrowDownToLine className="h-5 w-5" />
              AJOUT (Livraison)
            </button>
          </div>

          {/* Massive Search Bar */}
          <div className="relative px-2 lg:px-0">
            <div className={`absolute inset-0 rounded-[2rem] blur-xl opacity-20 transition-colors duration-500 ${mode === "out" ? "bg-rose-500" : "bg-emerald-500"}`}></div>
            <div className="relative">
              <Search className={`absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 transition-colors ${mode === "out" ? "text-rose-400" : "text-emerald-400"}`} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Scanner un code-barres ou taper un nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full h-20 rounded-[2rem] border-2 bg-white/90 backdrop-blur-xl pl-16 pr-6 text-lg font-bold text-stone-900 placeholder-stone-400 outline-none transition-all shadow-xl ${
                  mode === "out" 
                    ? "border-rose-100 focus:border-rose-400 focus:ring-8 focus:ring-rose-500/10 shadow-rose-900/5" 
                    : "border-emerald-100 focus:border-emerald-400 focus:ring-8 focus:ring-emerald-500/10 shadow-emerald-900/5"
                }`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchResults.length > 0) {
                    const exactMatch = searchResults.find(r => r.barcode === searchTerm);
                    handleApplyProduct(exactMatch || searchResults[0]);
                  }
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-6 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Results Grid */}
          <div className="px-2 lg:px-0">
            <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4 ml-2">
              {searchTerm ? "Résultats de recherche" : "Inventaire rapide"}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {(searchTerm ? searchResults : inventory.slice(0, 12)).length === 0 ? (
                <div className="col-span-full p-12 text-center bg-stone-50 rounded-[2rem] border border-stone-200/60 border-dashed">
                  <Package className="h-12 w-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500 font-bold">Aucun produit trouvé.</p>
                </div>
              ) : (
                (searchTerm ? searchResults : inventory.slice(0, 12)).map((item) => (
                  <button
                    key={item.barcode}
                    onClick={() => handleApplyProduct(item)}
                    className={`flex items-center gap-3 p-3 bg-white rounded-2xl border border-stone-200/60 shadow-sm transition-all text-left group hover:-translate-y-0.5 hover:shadow-md ${
                      mode === "out" ? "hover:border-rose-200 hover:shadow-rose-900/5" : "hover:border-emerald-200 hover:shadow-emerald-900/5"
                    }`}
                  >
                    <div className="h-14 w-14 flex-shrink-0 bg-stone-50 rounded-xl border border-stone-100 overflow-hidden flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain p-1" />
                      ) : (
                        <Package className="h-6 w-6 text-stone-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-stone-900 truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-stone-400 font-mono bg-stone-100 px-1.5 py-0.5 rounded">{item.barcode}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-black text-stone-600">Stock: {item.quantity}</span>
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110 ${
                        mode === "out" ? "bg-rose-500 shadow-rose-500/30" : "bg-emerald-500 shadow-emerald-500/30"
                      }`}>
                        {mode === "out" ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Ledger / History */}
        <div className="flex flex-col bg-[#faf9f6] rounded-[2rem] border border-stone-200/80 shadow-2xl overflow-hidden lg:h-[calc(100vh-140px)] sticky top-6 mx-2 lg:mx-0">
          <div className="p-5 border-b border-stone-200/80 bg-white/50 backdrop-blur-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-stone-50 to-transparent"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-stone-900 tracking-tight flex items-center gap-2">
                  <History className="h-4 w-4 text-indigo-600" />
                  Journal d'opérations
                </h3>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                  Session active • {history.length} action{history.length > 1 ? 's' : ''}
                </p>
              </div>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-xs font-bold text-stone-500 hover:text-rose-600 bg-white border border-stone-200 shadow-sm px-3 py-1.5 rounded-lg transition-colors"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
            <AnimatePresence initial={false}>
              {history.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4 py-12"
                >
                  <div className="h-16 w-16 rounded-full bg-white shadow-sm border border-stone-100 flex items-center justify-center">
                    <History className="h-8 w-8 text-stone-300" />
                  </div>
                  <p className="text-sm font-semibold text-center max-w-[200px] text-stone-500">
                    Les articles scannés apparaîtront ici.
                  </p>
                </motion.div>
              ) : (
                history.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: item.reverted ? 0.4 : 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`bg-white rounded-2xl p-3.5 flex gap-3 shadow-sm border relative overflow-hidden ${
                      item.reverted ? "border-stone-200 grayscale" : item.delta > 0 ? "border-emerald-100" : "border-rose-100"
                    }`}
                  >
                    {/* Left edge colored bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      item.reverted ? "bg-stone-200" : item.delta > 0 ? "bg-emerald-400" : "bg-rose-400"
                    }`}></div>

                    <div className={`h-12 w-12 flex-shrink-0 rounded-xl flex items-center justify-center ${
                      item.reverted ? "bg-stone-100 text-stone-400" : item.delta > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    }`}>
                      {item.delta > 0 ? <ArrowDownToLine className="h-6 w-6" /> : <ArrowUpFromLine className="h-6 w-6" />}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className={`text-sm font-black leading-tight truncate ${item.reverted ? 'text-stone-400 line-through' : 'text-stone-900'}`}>
                        {item.product.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-xs font-black tabular-nums px-1.5 rounded ${
                          item.reverted ? "bg-stone-100 text-stone-500" : item.delta > 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}>
                          {item.delta > 0 ? `+${item.delta}` : item.delta}
                        </span>
                        <span className="text-[10px] font-bold text-stone-400 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {!item.reverted && (
                      <button
                        onClick={() => handleRevert(item.id)}
                        className="flex flex-col items-center justify-center text-stone-400 hover:text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl px-3 transition-colors active:scale-95"
                        title="Annuler cette opération"
                      >
                        <Undo2 className="h-4 w-4 mb-0.5" />
                        <span className="text-[9px] font-black uppercase">Undo</span>
                      </button>
                    )}
                    {item.reverted && (
                      <div className="flex items-center px-2 text-[10px] font-black text-stone-400 uppercase tracking-widest bg-stone-50 rounded-lg">
                        Annulé
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
