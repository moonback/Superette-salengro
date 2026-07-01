import { useState, useEffect, useRef, useCallback } from 'react';
import { Package, Plus, Minus, Check, X } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';

interface QuantityModalProps {
  product: {
    barcode: string;
    name: string;
    imageUrl?: string;
    brand?: string;
    category?: string;
    format?: string;
    nutriScore?: string;
  };
  existingQty: number;
  isNew: boolean;
  onSave: (quantity: number, mode: 'add' | 'set') => void;
  onCancel: () => void;
}

export function QuantityModal({ product, existingQty, isNew, onSave, onCancel }: QuantityModalProps) {
  const [mode, setMode] = useState<'set' | 'add'>('set');
  const [qty, setQty] = useState(isNew ? '1' : String(existingQty));
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [mode]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  const handleSave = () => {
    const num = parseInt(qty, 10);
    if (!isNaN(num) && num >= 0) {
      onSave(num, mode);
    }
  };

  const adjustQty = (delta: number) => {
    const current = parseInt(qty, 10) || 0;
    const nextVal = Math.max(0, current + delta);
    setQty(String(nextVal));
  };

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDrag = useCallback((_: any, info: PanInfo) => {
    if (info.delta.y > 0) {
      setDragY(info.offset.y);
    }
  }, []);

  const handleDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      setIsDragging(false);
      const velocity = info.velocity.y;
      const offset = info.offset.y;

      if (velocity > 500 || offset > 150) {
        onCancel();
      } else {
        setDragY(0);
      }
    },
    [onCancel],
  );

  const opacity = Math.max(0, 1 - dragY / 300);
  const scale = Math.max(0.95, 1 - dragY / 1000);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop animée */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-stone-900/50 backdrop-blur-md"
        />

        {/* Bottom Sheet Modal */}
        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ opacity: isDragging ? opacity : 1, y: isDragging ? dragY : 0, scale: isDragging ? scale : 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={isDragging ? { duration: 0 } : { type: 'spring', damping: 28, stiffness: 320 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.25}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          className="relative w-full sm:max-w-md bg-white dark:bg-stone-900 rounded-t-[2.2rem] sm:rounded-[2.2rem] shadow-2xl overflow-hidden pb-safe max-h-[92vh] overflow-y-auto no-scrollbar border-t border-stone-200/40 dark:border-stone-700/40 sm:border"
          style={{ touchAction: 'pan-x' }}
        >
          {/* Pull handle */}
          <div className="flex justify-center py-3.5 sm:hidden sticky top-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs z-10">
            <div className="w-12 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full" />
          </div>

          <div className="p-6 pt-2 sm:pt-6">
            <div className="absolute top-5 right-5 hidden sm:block">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className="p-2 text-stone-400 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-100 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition duration-150 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Product header */}
            <div className="flex items-center gap-4.5 mb-6">
              <div className="w-20 h-20 bg-stone-50 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700/60 rounded-2xl flex items-center justify-center p-2 flex-shrink-0 shadow-inner">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain rounded-lg" loading="lazy" />
                ) : (
                  <Package className="w-8 h-8 text-stone-300 dark:text-stone-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="inline-block text-[10px] uppercase font-black tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100/30 dark:border-indigo-700/40 px-2.5 py-0.5 rounded-full mb-1">
                  {product.category || 'Général'}
                </span>
                <h3 className="font-extrabold text-stone-900 dark:text-stone-100 leading-snug truncate text-base">{product.name}</h3>
                <p className="text-xs font-mono tabular text-stone-400 dark:text-stone-500 mt-0.5">{product.barcode}</p>
                {product.brand && <p className="text-xs text-stone-500 dark:text-stone-400 font-semibold mt-0.5">{product.brand}</p>}
                {(product.format || product.nutriScore) && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    {product.format && (
                      <span className="inline-flex items-center rounded-md bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-1.5 py-0.5 text-[9px] font-bold font-mono text-stone-600 dark:text-stone-400">
                        {product.format}
                      </span>
                    )}
                    {product.nutriScore && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700/60 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-400">
                        Nutri-Score {product.nutriScore.toUpperCase()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {!isNew && (
              <div className="mb-5 flex justify-between items-center bg-stone-50 dark:bg-stone-800 border border-stone-200/50 dark:border-stone-700/50 rounded-2xl p-4">
                <span className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wide">Stock actuel</span>
                <span className="text-base font-black font-mono tabular text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/50 border border-indigo-100/30 dark:border-indigo-700/40 px-3 py-1 rounded-xl">
                  {existingQty} {existingQty > 1 ? 'unités' : 'unité'}
                </span>
              </div>
            )}

            {/* Mode switch */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100/60 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 rounded-2xl mb-5">
              <button
                type="button"
                onClick={() => { setMode('set'); setQty(isNew ? '1' : String(existingQty)); }}
                className={`relative py-2.5 text-xs font-bold rounded-xl transition-all duration-200 select-none cursor-pointer ${
                  mode === 'set'
                    ? 'bg-white dark:bg-stone-700 text-indigo-600 dark:text-indigo-400 shadow-sm border border-stone-200/30 dark:border-stone-600'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                Définir le stock
              </button>
              <button
                type="button"
                onClick={() => { setMode('add'); setQty('1'); }}
                className={`relative py-2.5 text-xs font-bold rounded-xl transition-all duration-200 select-none cursor-pointer ${
                  mode === 'add'
                    ? 'bg-white dark:bg-stone-700 text-indigo-600 dark:text-indigo-400 shadow-sm border border-stone-200/30 dark:border-stone-600'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                Ajouter au stock
              </button>
            </div>

            {/* Counter */}
            <div className="relative flex items-center justify-between gap-3 bg-stone-50/60 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-2xl p-3.5 mb-5 shadow-xs">
              <motion.button
                whileTap={{ scale: 0.90 }}
                type="button"
                onClick={() => adjustQty(-1)}
                className="w-12 h-12 flex items-center justify-center text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl transition cursor-pointer shadow-xs hover:border-stone-300 dark:hover:border-stone-600"
                aria-label="Diminuer"
              >
                <Minus className="w-5 h-5 stroke-[2.5]" />
              </motion.button>
              <div className="flex-1 text-center">
                <input
                  ref={inputRef}
                  type="number"
                  min="0"
                  max="99999"
                  value={qty}
                  onChange={e => { if (e.target.value.length > 5) return; setQty(e.target.value); }}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  className="w-full bg-transparent text-stone-900 dark:text-stone-100 text-3xl font-black font-mono tabular text-center outline-none border-none focus:ring-0 p-0"
                  placeholder="0"
                  inputMode="numeric"
                />
                <p className="text-[9px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mt-1.5">
                  {mode === 'set' ? 'Stock total' : 'Quantité à ajouter'}
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.90 }}
                type="button"
                onClick={() => adjustQty(1)}
                className="w-12 h-12 flex items-center justify-center text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl transition cursor-pointer shadow-xs hover:border-stone-300 dark:hover:border-stone-600"
                aria-label="Augmenter"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </motion.button>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {(mode === 'add' ? [1, 5, 10, 25] : [0, 5, 10, 50]).map((preset) => (
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  key={preset}
                  type="button"
                  onClick={() => setQty(String(preset))}
                  className="py-2.5 text-xs font-extrabold font-mono tabular text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 rounded-xl transition cursor-pointer shadow-xs"
                >
                  {mode === 'add' ? `+${preset}` : `${preset}`}
                </motion.button>
              ))}
            </div>

            {/* Footer CTA */}
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onCancel}
                className="flex-1 py-3.5 text-xs font-bold text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl transition select-none cursor-pointer"
              >
                Annuler
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleSave}
                disabled={qty.trim() === '' || isNaN(parseInt(qty, 10)) || parseInt(qty, 10) < 0}
                className="flex-1 py-3.5 text-xs font-bold text-white bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-40 disabled:pointer-events-none rounded-xl shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-1.5 transition select-none cursor-pointer"
              >
                <Check className="w-4 h-4" />
                {mode === 'set' ? 'Définir' : 'Ajouter'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
