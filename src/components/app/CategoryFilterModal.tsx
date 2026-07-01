import { useState, useCallback, useEffect, type ReactNode } from "react";
import { motion, PanInfo } from "motion/react";
import { Check, Package, Tags, X } from "lucide-react";

type CategoryOption = {
  name: string;
  count: number;
  label: string;
  icon?: string;
};

type CategoryFilterModalProps = {
  inventoryLength: number;
  selectedCategory: string | null;
  categoryOptions: CategoryOption[];
  onSelectCategory: (category: string | null) => void;
  onClose: () => void;
};

export function CategoryFilterModal({
  inventoryLength,
  selectedCategory,
  categoryOptions,
  onSelectCategory,
  onClose,
}: CategoryFilterModalProps) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

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
        onClose();
      } else {
        setDragY(0);
      }
    },
    [onClose],
  );

  const selectAndClose = (category: string | null) => {
    onSelectCategory(category);
    onClose();
  };

  const opacity = Math.max(0, 1 - dragY / 300);
  const scale = Math.max(0.95, 1 - dragY / 1000);

  return (
    <div className="fixed inset-0 bg-stone-900/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: isDragging ? opacity : 1, y: isDragging ? dragY : 0, scale: isDragging ? scale : 1 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={isDragging ? { duration: 0 } : { type: 'spring', damping: 30, stiffness: 350 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className="w-full sm:max-w-md bg-white dark:bg-stone-900 border-t sm:border border-stone-200 dark:border-stone-700 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl shadow-stone-900/25 overflow-hidden pb-safe max-h-[92vh] overflow-y-auto no-scrollbar"
        style={{ touchAction: 'pan-x' }}
      >
        <div className="flex justify-center py-3 sm:hidden sticky top-0 bg-white dark:bg-stone-900 z-10">
          <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full" />
        </div>

        <div className="p-6">
          <div className="absolute top-4 right-4 hidden sm:block">
            <button
              onClick={onClose}
              className="p-2 text-stone-400 dark:text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition touch-target"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 dark:bg-indigo-700 text-white shadow-md shadow-indigo-600/25">
              <Tags className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Filtrer par catégorie</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">Sélectionnez une catégorie pour affiner votre inventaire</p>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <CategoryButton
              active={selectedCategory === null}
              title="Toutes les catégories"
              subtitle={`${inventoryLength} articles`}
              icon={<Package className={`w-4 h-4 ${selectedCategory === null ? "text-white" : "text-stone-400 dark:text-stone-500"}`} />}
              onClick={() => selectAndClose(null)}
            />
            {categoryOptions.map((category) => {
              const isActive = selectedCategory === category.name;
              return (
                <CategoryButton
                  key={category.name}
                  active={isActive}
                  title={category.name}
                  subtitle={`${category.count} article${category.count > 1 ? "s" : ""}`}
                  icon={
                    category.icon ? (
                      <span className="text-base leading-none">{category.icon}</span>
                    ) : (
                      <Package className={`h-4 w-4 ${isActive ? "text-white" : "text-stone-400 dark:text-stone-500"}`} />
                    )
                  }
                  onClick={() => selectAndClose(isActive ? null : category.name)}
                />
              );
            })}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 text-xs font-bold text-stone-500 dark:text-stone-400 bg-transparent border border-stone-200/80 dark:border-stone-700/80 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-100 active:scale-[0.98] rounded-xl transition cursor-pointer select-none tap-active"
          >
            Annuler
          </button>
        </div>
      </motion.div>
    </div>
  );
}

type CategoryButtonProps = {
  active: boolean;
  title: string;
  subtitle: string;
  icon: ReactNode;
  onClick: () => void;
};

function CategoryButton({ active, title, subtitle, icon, onClick }: CategoryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between p-3 rounded-xl border transition select-none tap-active cursor-pointer ${
        active
          ? "bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-700/60 text-indigo-950 dark:text-indigo-100 shadow-xs"
          : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50/50 dark:hover:bg-stone-700/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          active
            ? "bg-indigo-100/60 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300"
            : "bg-stone-50 dark:bg-stone-700 border border-stone-150 dark:border-stone-600 text-stone-500 dark:text-stone-400"
        }`}>
          {icon}
        </div>
        <div className="text-left">
          <p className={`text-xs font-bold ${active ? "text-indigo-950 dark:text-indigo-100" : "text-stone-800 dark:text-stone-200"}`}>{title}</p>
          <p className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-stone-400 dark:text-stone-500"}`}>{subtitle}</p>
        </div>
      </div>
      {active && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 stroke-[3.5]" />}
    </button>
  );
}
