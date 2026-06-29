import { useState, useCallback, useEffect } from 'react';
import { Package, CreditCard as Edit3, ClipboardList, X } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { InventoryItem } from '../types';

interface ScanChoiceModalProps {
  product: InventoryItem;
  onChooseStock: () => void;
  onChooseEdit: () => void;
  onCancel: () => void;
}

export function ScanChoiceModal({ product, onChooseStock, onChooseEdit, onCancel }: ScanChoiceModalProps) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

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

        {/* Bottom Sheet Card */}
        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{
            opacity: isDragging ? opacity : 1,
            y: isDragging ? dragY : 0,
            scale: isDragging ? scale : 1,
          }}
          exit={{ y: '100%', opacity: 0 }}
          transition={
            isDragging
              ? { duration: 0 }
              : { type: 'spring', damping: 28, stiffness: 320 }
          }
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.25}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          className="relative w-full sm:max-w-md bg-white border-t sm:border border-stone-200/50 rounded-t-[2.2rem] sm:rounded-[2.2rem] shadow-2xl overflow-hidden pb-safe max-h-[92vh] overflow-y-auto no-scrollbar"
          style={{ touchAction: 'pan-x' }}
        >
          {/* Pull handle mobile */}
          <div className="flex justify-center py-3.5 sm:hidden sticky top-0 bg-white/95 backdrop-blur-xs z-10">
            <div className="w-12 h-1.5 bg-stone-250 rounded-full" />
          </div>

          <div className="p-6 pt-2 sm:pt-6">
            <div className="absolute top-5 right-5 hidden sm:block">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className="p-2 text-stone-400 hover:text-stone-850 rounded-full hover:bg-stone-100 transition duration-150 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="text-center mb-6">
              <motion.span 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="inline-block text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-3 py-1 rounded-full mb-3.5"
              >
                Produit trouvé
              </motion.span>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.2 }}
                className="w-20 h-20 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-center p-2 mx-auto mb-3.5 shadow-inner"
              >
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain rounded-lg" loading="lazy" />
                ) : (
                  <Package className="w-8 h-8 text-stone-300" />
                )}
              </motion.div>
              <h3 className="font-extrabold text-stone-900 text-base leading-snug line-clamp-1">{product.name}</h3>
              <p className="text-xs font-mono tabular text-stone-405 mt-1">{product.barcode}</p>
              {product.brand && <p className="text-xs text-stone-500 font-bold mt-0.5">{product.brand}</p>}

              <div className="mt-4.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-50 border border-stone-200/60 rounded-xl text-xs text-stone-500 font-semibold shadow-xs">
                Stock actuel : <strong className="text-indigo-600 font-extrabold font-mono tabular bg-indigo-50 border border-indigo-100/30 px-2 py-0.5 rounded-lg ml-0.5">{product.quantity}</strong>
              </div>
            </div>

            <div className="space-y-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onChooseStock}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-bold text-xs shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-1.5 transition select-none cursor-pointer"
              >
                <ClipboardList className="w-4 h-4" />
                Modifier la quantité en stock
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onChooseEdit}
                className="w-full py-3.5 px-4 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl text-stone-600 hover:text-stone-900 font-bold text-xs flex items-center justify-center gap-1.5 transition select-none cursor-pointer shadow-xs"
              >
                <Edit3 className="w-4 h-4" />
                Modifier la fiche produit
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={onCancel}
                className="w-full py-2.5 text-xs font-bold text-stone-400 hover:text-stone-600 transition select-none cursor-pointer mt-1"
              >
                Fermer
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
