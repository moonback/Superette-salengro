
import { useState, FormEvent } from 'react';
import { Plus, Edit2, Trash2, HelpCircle, RefreshCw, X, Check, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CategoryItem, InventoryItem } from '../types';
import { upsertCategory, deleteCategory } from '../lib/supabaseCategories';
import { suggestCategory } from '../lib/autoCategorization';
import { syncInventoryItem } from '../lib/inventorySync';
import { triggerHaptic } from '../lib/haptics';

interface CategoriesManagerProps {
  categories: CategoryItem[];
  inventory: InventoryItem[];
  onRefreshCategories: () => Promise<void>;
  onRefreshInventory: () => Promise<void>;
  showToast: (text: string) => void;
}

const COMMON_EMOJIS = [
  '🥛', '🍖', '🐟', '🥫', '🍝', '🍚', '🥦', '🍎', '🍪', '🍫', '🥤', '🧂', '🧊', '🧹', '🧻',
  '🍞', '🥐', '🥩', '🧀', '🥚', '🍯', '🍵', '🍷', '🍺', '🧴', '🧼', '💊', '🔋', '📦', '🏷️'
];

export function CategoriesManager({
  categories,
  inventory,
  onRefreshCategories,
  onRefreshInventory,
  showToast
}: CategoriesManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📦');
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoCategorizing, setIsAutoCategorizing] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    triggerHaptic('light');

    try {
      const categoryToSave: CategoryItem = {
        name: name.trim(),
        icon: icon.trim() || undefined,
      };

      if (editingCategory) {
        categoryToSave.id = editingCategory.id;
      }

      const previousCategoryName = editingCategory?.name;

      await upsertCategory(categoryToSave);

      let renamedProductsCount = 0;
      if (previousCategoryName && previousCategoryName !== categoryToSave.name) {
        const previousNameLower = previousCategoryName.trim().toLowerCase();
        const productsToRename = inventory.filter(
          (item) => item.category?.trim().toLowerCase() === previousNameLower
        );

        for (const item of productsToRename) {
          await syncInventoryItem({
            ...item,
            category: categoryToSave.name,
            lastUpdated: Date.now(),
          });
          renamedProductsCount++;
        }
      }

      showToast(
        editingCategory
          ? renamedProductsCount > 0
            ? `Catégorie modifiée et ${renamedProductsCount} produit(s) déplacé(s) !`
            : 'Catégorie modifiée !'
          : 'Catégorie créée !'
      );
      if (previousCategoryName && selectedCategoryName === previousCategoryName) {
        setSelectedCategoryName(categoryToSave.name);
      }

      // Reset form
      setName('');
      setIcon('📦');
      setIsAdding(false);
      setEditingCategory(null);
      await onRefreshCategories();
      if (renamedProductsCount > 0) {
        await onRefreshInventory();
      }
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la sauvegarde de la catégorie.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category: CategoryItem) => {
    setEditingCategory(category);
    setName(category.name);
    setIcon(category.icon || '📦');
    setIsAdding(true);
  };

  const handleDelete = async (category: CategoryItem) => {
    if (!category.id) return;

    const itemCount = inventory.filter(
      (item) => item.category?.trim().toLowerCase() === category.name.trim().toLowerCase()
    ).length;

    const msg = itemCount > 0
      ? `Attention : ${itemCount} article(s) appartienne(nt) à cette catégorie. Si vous la supprimez, ils ne seront pas supprimés mais n'auront plus de catégorie. Confirmer la suppression ?`
      : `Voulez-vous vraiment supprimer la catégorie "${category.icon || ''} ${category.name}" ?`;

    if (confirm(msg)) {
      triggerHaptic('warning');
      try {
        await deleteCategory(category.id);
        showToast('Catégorie supprimée.');
        if (selectedCategoryName === category.name) {
          setSelectedCategoryName(null);
        }
        await onRefreshCategories();
      } catch (err) {
        console.error(err);
        showToast('Erreur lors de la suppression.');
      }
    }
  };

  const handleAutoCategorize = async () => {
    setIsAutoCategorizing(true);
    triggerHaptic('success');
    let updatedCount = 0;

    try {
      for (const item of inventory) {
        // If item doesn't have a category, or has an invalid/blank one
        const currentCat = item.category?.trim();
        const hasValidCat = currentCat && categories.some(
          (c) => c.name.toLowerCase() === currentCat.toLowerCase()
        );

        if (!hasValidCat) {
          const suggested = suggestCategory(item.name, item.category, categories);
          if (suggested && suggested !== currentCat) {
            const updatedItem: InventoryItem = {
              ...item,
              category: suggested,
              lastUpdated: Date.now()
            };
            await syncInventoryItem(updatedItem);
            updatedCount++;
          }
        }
      }

      if (updatedCount > 0) {
        showToast(`${updatedCount} produit(s) classé(s) automatiquement !`);
        await onRefreshInventory();
      } else {
        showToast('Aucun produit à classer automatiquement.');
      }
    } catch (err) {
      console.error(err);
      showToast('Erreur lors du classement automatique.');
    } finally {
      setIsAutoCategorizing(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-900 shadow-sm sm:h-14 sm:w-14">
              <Package className="h-5 w-5 sm:h-7 sm:w-7" />
            </div>
            <div className="pt-0.5 sm:pt-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight sm:text-2xl">Catégories</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-900 sm:px-2.5 sm:text-xs">
                  {categories.length} {categories.length > 1 ? 'catégories' : 'catégorie'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Header Card */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:p-6">
        <div>
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            Administration des Catégories
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Ajoutez, modifiez ou organisez les catégories de produits en base de données.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:flex">
          {/* <button
            onClick={handleAutoCategorize}
            disabled={isAutoCategorizing || categories.length === 0}
            className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-stone-100 bg-stone-50 px-4 py-2 text-[10px] font-bold text-slate-900 transition hover:bg-stone-100 disabled:opacity-40 sm:flex-none"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAutoCategorizing ? 'animate-spin' : ''}`} />
            Classer automatiquement
          </button> */}

          <button
            onClick={() => {
              setIsAdding(true);
              setEditingCategory(null);
              setName('');
              setIcon('📦');
            }}
            className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-bold text-white transition hover:bg-slate-800 sm:flex-none"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouvelle
          </button>
        </div>
      </div>

      {/* Add / Edit Category Dialog */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSave} className="p-6 rounded-2xl border border-slate-200 bg-white space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">
                  {editingCategory ? 'Modifier la catégorie' : 'Créer une catégorie'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-slate-400 hover:text-slate-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Icône</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full h-10 text-center border border-slate-200 bg-white rounded-xl text-lg outline-none transition"
                    placeholder="📦"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Nom de la catégorie *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-4 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-900 outline-none transition"
                    placeholder="Ex: Épicerie, Boissons..."
                    required
                  />
                </div>
              </div>

              {/* Common Emojis Quick Picker */}
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Suggestions d'icônes</label>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1 bg-white rounded-xl border border-slate-200">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className={`w-7 h-7 flex items-center justify-center rounded-xl text-sm transition hover:bg-slate-100 ${
                          icon === emoji ? 'bg-slate-900 text-white' : ''
                        }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-[10px] font-bold text-slate-500 bg-transparent border border-slate-200 hover:bg-white rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !name.trim()}
                  className="px-4 py-2 text-[10px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition flex items-center gap-1 disabled:opacity-40"
                >
                  <Check className="w-3.5 h-3.5" />
                  Sauvegarder
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories Grid List */}
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-400 border border-dashed border-slate-300 rounded-2xl bg-white">
          <HelpCircle className="h-7 w-7 text-slate-300" />
          <span className="text-xs font-semibold">Aucune catégorie configurée</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {categories.map((category) => {
            const associatedProducts = inventory.filter(
              (item) => item.category?.trim().toLowerCase() === category.name.trim().toLowerCase()
            );
            const count = associatedProducts.length;
            const isSelected = selectedCategoryName === category.name;

            return (
              <div
                key={category.id || category.name}
                className="rounded-xl border border-slate-200 bg-white transition group"
                style={isSelected ? { borderColor: '#6366f1', boxShadow: '0 0 0 3px #e0e7ff' } : undefined}
              >
                <button
                  type="button"
                  onClick={() => setSelectedCategoryName(isSelected ? null : category.name)}
                  className="flex min-h-[4.25rem] w-full items-center justify-between p-3 pr-20 text-left"
                  aria-expanded={isSelected}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-lg border border-slate-200">
                      {category.icon || '📦'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{category.name}</h4>
                      <span className="text-[9px] font-bold text-slate-400 font-mono tabular">
                        {count} {count > 1 ? 'articles' : 'article'}
                      </span>
                    </div>
                  </div>
                </button>

                <div className="absolute right-3 top-3 flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleEdit(category);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
                    title="Modifier"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(category);
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-100 px-4 pb-3 pt-2">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Produits associés
                          </span>
                          <span className="rounded-full bg-slate-900 text-white px-2 py-0.5 text-[9px] font-bold">
                            {associatedProducts.length}
                          </span>
                        </div>

                        {associatedProducts.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-4 text-center text-[10px] font-semibold text-slate-400">
                            Aucun produit dans cette catégorie.
                          </div>
                        ) : (
                          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                            {associatedProducts.map((item) => (
                              <div
                                key={item.barcode}
                                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-2"
                              >
                                <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl border border-slate-200 bg-white p-1">
                                  {item.imageUrl ? (
                                    <img
                                      src={item.imageUrl}
                                      alt={item.name}
                                      className="h-full w-full rounded object-contain"
                                    />
                                  ) : (
                                    <Package className="h-4 w-4 text-stone-300" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h5 className="line-clamp-1 text-[11px] font-bold text-stone-800">
                                    {item.name}
                                  </h5>
                                  <p className="mt-0.5 truncate font-mono text-[9px] text-stone-400">
                                    {item.barcode}{item.brand ? ` • ${item.brand}` : ''}
                                  </p>
                                </div>
                                <span className="rounded-xl border border-slate-200 bg-white px-2 py-1 font-mono text-[10px] font-bold tabular text-slate-900">
                                  x{item.quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
