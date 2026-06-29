import { useState, useCallback, useEffect } from 'react';
import { motion, PanInfo } from 'motion/react';
import { X, Brain, AlertTriangle } from 'lucide-react';

interface VectorizeConfirmModalProps {
  open: boolean;
  inventoryLength: number;
  productsToVectorize: number;
  isRunning: boolean;
  isPaused: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onResume?: () => void;
  onPause?: () => void;
  onStop?: () => void;
}

export function VectorizeConfirmModal({
  open,
  inventoryLength,
  productsToVectorize,
  isRunning,
  isPaused,
  onConfirm,
  onCancel,
  onResume,
  onPause,
  onStop,
}: VectorizeConfirmModalProps) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!open) {
      setDragY(0);
      setIsDragging(false);
    }
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isRunning) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onCancel, isRunning]);

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

  if (!open && !isRunning) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-stone-900/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
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
        className="w-full sm:max-w-md bg-white border-t sm:border border-stone-200 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl shadow-stone-900/25 overflow-hidden pb-safe max-h-[92vh] overflow-y-auto no-scrollbar"
        style={{ touchAction: 'pan-x' }}
      >
        <div className="flex justify-center py-3 sm:hidden sticky top-0 bg-white z-10">
          <div className="w-12 h-1.5 bg-stone-300 rounded-full" />
        </div>

        <div className="p-6">
          <div className="absolute top-4 right-4 hidden sm:block">
            <button
              type="button"
              onClick={isRunning ? undefined : onCancel}
              disabled={isRunning}
              className="p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition touch-target cursor-pointer disabled:opacity-40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full mb-3">
              <Brain className="w-3.5 h-3.5" />
              Vectorisation
            </span>
            <h3 className="font-bold text-stone-900 text-base leading-snug">
              Generer les embeddings
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              {isRunning
                ? isPaused
                  ? 'La vectorisation est en pause.'
                  : 'Vectorisation en cours...'
                : 'Confirmer le lancement de la vectorisation ?'}
            </p>
            <p className="text-[11px] text-stone-500 mt-2 leading-relaxed">
              Cela cree des representations numeriques de vos produits pour permettre des recherches intelligentes dans l'inventaire (recherche par similarite, tri automatique, suggestions contextuelles...).
            </p>
          </div>

          <div className="space-y-3">
            {!isRunning && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Cette action va generer des embeddings pour{' '}
                  <strong>{productsToVectorize}</strong> produit(s) sur{' '}
                  <strong>{inventoryLength}</strong> references.
                </p>
              </div>
            )}

            {isRunning && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-800">
                    Vectorisation {isPaused ? '(en pause)' : 'en cours'}
                  </span>
                  <span className="text-xs font-mono text-indigo-700">
                    {productsToVectorize}/{inventoryLength}
                  </span>
                </div>
              </div>
            )}

            {!isRunning ? (
              <>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={productsToVectorize === 0}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-xl text-white font-bold text-xs shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5 transition select-none cursor-pointer tap-active disabled:opacity-40"
                >
                  <Brain className="w-4 h-4" />
                  Lancer la vectorisation
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full py-2.5 text-xs font-bold text-stone-400 hover:text-stone-600 transition select-none cursor-pointer tap-active"
                >
                  Annuler
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                {isPaused ? (
                  <button
                    type="button"
                    onClick={onResume}
                    className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 transition select-none cursor-pointer tap-active"
                  >
                    Reprendre
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onPause}
                    className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 transition select-none cursor-pointer tap-active"
                  >
                    Pause
                  </button>
                )}
                <button
                  type="button"
                  onClick={onStop}
                  className="flex-1 py-3 px-4 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 transition select-none cursor-pointer tap-active"
                >
                  Arreter
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
