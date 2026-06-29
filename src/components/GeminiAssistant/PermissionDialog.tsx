import { motion, AnimatePresence } from 'motion/react';
import { TriangleAlert as AlertTriangle, Check, X } from 'lucide-react';

interface PermissionDialogProps {
  isOpen: boolean;
  toolName: string;
  description: string;
  args: Record<string, unknown>;
  autoAccept: boolean;
  setAutoAccept: (value: boolean) => void;
  onConfirm: () => void;
  onDeny: () => void;
}

export function PermissionDialog({
  isOpen,
  toolName,
  description,
  args,
  autoAccept,
  setAutoAccept,
  onConfirm,
  onDeny,
}: PermissionDialogProps) {
  const formatArgs = (argsObj: Record<string, unknown>): string => {
    return Object.entries(argsObj)
      .map(([key, value]) => {
        if (typeof value === 'boolean') return null;
        return `${key}: ${value}`;
      })
      .filter(Boolean)
      .join(', ');
  };

  const getActionLabel = (name: string): string => {
    switch (name) {
      case 'deleteProduct':
        return 'Supprimer le produit';
      case 'deleteCategory':
        return 'Supprimer la catégorie';
      case 'updateStock':
        return 'Modifier le stock';
      default:
        return 'Confirmer l\'action';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-sm bg-white rounded-2xl border border-stone-200/60 shadow-2xl shadow-stone-900/15 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-stone-900">
                    {getActionLabel(toolName)}
                  </h3>
                  <p className="mt-1 text-xs text-stone-500">
                    Confirmation requise
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs text-stone-600 leading-relaxed">
                  {description}
                </p>
                {Object.keys(args).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-stone-200">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                      Détails
                    </p>
                    <p className="text-xs font-mono text-stone-700">
                      {formatArgs(args)}
                    </p>
                  </div>
                )}
              </div>

              <p className="text-xs text-stone-500 text-center">
                Cette action est irréversible. Voulez-vous continuer ?
              </p>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div 
                  className={`grid h-6 w-6 flex-shrink-0 place-items-center rounded-lg border-2 transition ${
                    autoAccept 
                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                      : 'border-stone-300 hover:border-stone-400'
                  }`}
                  onClick={(e) => { e.stopPropagation(); setAutoAccept(!autoAccept); }}
                >
                  {autoAccept && <Check className="h-4 w-4" />}
                </div>
                <span className="text-xs font-medium text-stone-700">
                  Accepter automatiquement toutes les actions
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onDeny}
                  className="flex-1 py-3 text-xs font-bold text-stone-500 bg-white border border-stone-200/80 hover:bg-stone-50 hover:text-stone-900 active:scale-[0.98] rounded-xl transition cursor-pointer select-none flex items-center justify-center gap-1.5"
                >
                  <X className="h-4 w-4" />
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="flex-1 py-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] rounded-xl shadow-md shadow-rose-600/10 transition cursor-pointer select-none flex items-center justify-center gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  Confirmer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
