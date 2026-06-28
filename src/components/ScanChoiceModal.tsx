import { useState, useCallback, useEffect } from 'react';
import { Package, CreditCard as Edit3, ClipboardList, X } from 'lucide-react';
import { motion, PanInfo } from 'motion/react';
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
    <div className="fixed inset-0 bg-stone-900/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 ">
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{
          opacity: isDragging ? opacity : 1,
          y: isDragging ? dragY : 0,
          scale: isDragging ? scale : 1,
        }}
        exit={{ opacity: 0, y: '100%' }}
        transition={
          isDragging
            ? { duration: 0 }
            : { type: 'spring', damping: 30, stiffness: 350 }
        }
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className="w-full sm:max-w-md bg-white border-t sm:border border-stone-200 rounded-t-2xl sm:rounded-2xl shadow-sm overflow-hidden pb-safe max-h-[92vh] overflow-y-auto no-scrollbar"
        style={{ touchAction: 'pan-x' }}
      >
        <div className="flex justify-center py-4 sm:hidden sticky top-0 bg-white z-10">
          <div className="w-12 h-1.5 bg-stone-300 rounded-full" />
        </div>

        <div className="p-6">
          <div className="absolute top-6 right-4 hidden sm:block">
            <button
              onClick={onCancel}
              className="p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition touch-target"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center mb-6">
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full mb-3">
              Produit trouvé
            </span>
            <div className="w-20 h-20 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-center p-2 mx-auto mb-3">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain rounded-xl" />
              ) : (
                <Package className="w-8 h-8 text-stone-300" />
              )}
            </div>
            <h3 className="font-bold text-stone-900 text-base leading-snug line-clamp-1">{product.name}</h3>
            <p className="text-xs font-mono tabular text-stone-400 mt-1">{product.barcode}</p>
            {product.brand && <p className="text-xs text-stone-500 font-semibold">{product.brand}</p>}

            <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-1 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600">
              Stock actuel : <strong className="text-slate-900 font-bold font-mono tabular">{product.quantity}</strong>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={onChooseStock}
              className="w-full py-4 px-4 bg-slate-900 hover:bg-slate-900 active:scale-[0.98] rounded-2xl text-white font-bold text-sm  shadow-slate-900/10 flex items-center justify-center gap-2.5 transition touch-target"
            >
              <ClipboardList className="w-5 h-5" />
              Modifier le stock (+ ou -)
            </button>

            <button
              onClick={onChooseEdit}
              className="w-full py-4 px-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 active:scale-[0.98] rounded-2xl text-stone-700 font-bold text-sm flex items-center justify-center gap-2.5 transition touch-target"
            >
              <Edit3 className="w-5 h-5 text-stone-500" />
              Modifier la fiche produit
            </button>

            <button
              onClick={onCancel}
              className="w-full py-4 text-xs font-semibold text-stone-400 hover:text-stone-600 transition touch-target"
            >
              Fermer
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
