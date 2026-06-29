import { useState, useRef, useEffect, useCallback, ChangeEvent } from 'react';
import { Sparkles, Check, X, Minus, Plus, CreditCard as Edit2, Camera, Trash2, Loader as Loader2 } from 'lucide-react';
import { motion, PanInfo } from 'motion/react';
import { uploadProductImage } from '../lib/supabaseInventory';
import { CategoryItem } from '../types';
import { suggestCategory } from '../lib/autoCategorization';

interface ManualProductModalProps {
  barcode: string;
  categories: CategoryItem[];
  initialValues?: {
    name: string;
    brand?: string;
    category?: string;
    quantity: number;
    imageUrl?: string;
    purchasePrice?: number;
    salesPrice?: number;
  };
  onSave: (
    product: {
      name: string;
      brand?: string;
      category?: string;
      imageUrl?: string;
      purchasePrice?: number;
      salesPrice?: number;
    },
    quantity: number
  ) => void;
  onCancel: () => void;
}

export function ManualProductModal({ barcode, categories, initialValues, onSave, onCancel }: ManualProductModalProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [qty, setQty] = useState(String(initialValues?.quantity ?? '1'));
  const [brand, setBrand] = useState(initialValues?.brand ?? '');
  const [category, setCategory] = useState(initialValues?.category ?? '');
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl ?? '');
  const [purchasePrice, setPurchasePrice] = useState(initialValues?.purchasePrice !== undefined ? String(initialValues.purchasePrice) : '');
  const [salesPrice, setSalesPrice] = useState(initialValues?.salesPrice !== undefined ? String(initialValues.salesPrice) : '');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputPhotoRef = useRef<HTMLInputElement>(null);
  const fileInputGalleryRef = useRef<HTMLInputElement>(null);

  const isEditing = !!initialValues;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  useEffect(() => {
    if (name.trim()) {
      const suggestion = suggestCategory(name, undefined, categories);
      if (suggestion) {
        setCategory(suggestion);
      }
    }
  }, [name, categories]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const publicUrl = await uploadProductImage(barcode, file);
      setImageUrl(publicUrl);
    } catch (err) {
      console.error("Erreur de téléchargement d'image:", err);
      setUploadError(
        err instanceof Error
          ? err.message
          : "Impossible d'uploader la photo."
      );
    } finally {
      setIsUploading(false);
      // Reset the inputs so the user can select the same file again
      e.target.value = '';
    }
  };

  const handleSave = () => {
    const num = parseInt(qty, 10);
    if (name.trim() && !isNaN(num) && num >= 0) {
      const pPrice = purchasePrice.trim() !== '' ? parseFloat(purchasePrice) : undefined;
      const sPrice = salesPrice.trim() !== '' ? parseFloat(salesPrice) : undefined;
      onSave({
        name: name.trim(),
        brand: brand.trim() || undefined,
        category: category.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        purchasePrice: pPrice !== undefined && !isNaN(pPrice) ? pPrice : undefined,
        salesPrice: sPrice !== undefined && !isNaN(sPrice) ? sPrice : undefined,
      }, num);
    }
  };

  const adjustQty = (delta: number) => {
    const current = parseInt(qty, 10) || 0;
    const nextVal = Math.max(0, current + delta);
    setQty(String(nextVal));
  };

  const opacity = Math.max(0, 1 - dragY / 300);
  const scale = Math.max(0.95, 1 - dragY / 1000);

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
              onClick={onCancel}
              className="p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition touch-target"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
              {isEditing ? <Edit2 className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                {isEditing ? "Modifier le produit" : "Nouveau produit"}
              </h3>
              <p className="text-xs text-stone-500 font-medium font-mono tabular mt-0.5">Code: {barcode}</p>
            </div>
          </div>

          <p className="text-xs text-stone-500 leading-relaxed mb-5">
            {isEditing
              ? "Modifiez les informations du produit ci-dessous. Les changements seront synchronisés."
              : "Ce produit n'a pas été trouvé automatiquement. Veuillez renseigner ses informations."}
          </p>

          <div className="space-y-4 mb-6">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Photo du produit</label>

              <input
                type="file"
                ref={fileInputPhotoRef}
                onChange={handleFileChange}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
              <input
                type="file"
                ref={fileInputGalleryRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {imageUrl ? (
                <div className="relative h-28 w-full rounded-2xl border border-stone-200 overflow-hidden bg-stone-50 flex items-center justify-center group">
                  <img
                    src={imageUrl}
                    alt="Aperçu du produit"
                    className="h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputPhotoRef.current?.click()}
                      className="p-2 bg-white/95 rounded-xl border border-stone-200 text-stone-700 hover:text-stone-900 transition active:scale-95 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer touch-target"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Prendre photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputGalleryRef.current?.click()}
                      className="p-2 bg-white/95 rounded-xl border border-indigo-200 text-indigo-600 hover:text-indigo-700 transition active:scale-95 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer touch-target"
                    >
                      <span>Importer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="p-2 bg-white/95 rounded-xl border border-rose-200 text-rose-600 hover:text-rose-700 transition active:scale-95 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer touch-target"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputPhotoRef.current?.click()}
                    disabled={isUploading}
                    className="h-28 rounded-2xl border border-dashed border-stone-300 hover:border-indigo-400 bg-stone-50 hover:bg-indigo-50/50 transition flex flex-col items-center justify-center gap-2 text-stone-400 hover:text-stone-600 disabled:opacity-50 cursor-pointer touch-target"
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {isUploading ? "Téléchargement..." : "Prendre une photo"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputGalleryRef.current?.click()}
                    disabled={isUploading}
                    className="h-28 rounded-2xl border border-dashed border-stone-300 hover:border-indigo-400 bg-stone-50 hover:bg-indigo-50/50 transition flex flex-col items-center justify-center gap-2 text-stone-400 hover:text-stone-600 disabled:opacity-50 cursor-pointer touch-target"
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                    ) : (
                      <Edit2 className="w-5 h-5" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {isUploading ? "Téléchargement..." : "Importer une photo"}
                    </span>
                  </button>
                </div>
              )}

              {uploadError && (
                <p className="text-[10px] font-semibold text-rose-600">{uploadError}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">Nom du produit *</label>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && document.getElementById('brand-input')?.focus()}
                className="w-full h-11 px-4 glass-input rounded-xl text-sm font-semibold text-stone-900 outline-none transition"
                placeholder="Ex: Coca-Cola 33cl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">Marque</label>
                <input
                  id="brand-input"
                  type="text"
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && document.getElementById('category-input')?.focus()}
                  className="w-full h-11 px-4 glass-input rounded-xl text-sm font-semibold text-stone-900 outline-none transition"
                  placeholder="Ex: Coca-Cola"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">Catégorie</label>
                <select
                  id="category-input"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full h-11 px-4 glass-input rounded-xl text-sm font-semibold text-stone-900 outline-none transition cursor-pointer"
                >
                  <option value="">Non classé</option>
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name}>
                      {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">URL de l'image (Optionnel)</label>
              <input
                type="text"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="w-full h-11 px-4 glass-input rounded-xl text-sm font-semibold font-mono text-stone-900 outline-none transition"
                placeholder="Ex: https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">Prix d'achat (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={purchasePrice}
                  onChange={e => setPurchasePrice(e.target.value)}
                  inputMode="decimal"
                  className="w-full h-11 px-4 glass-input rounded-xl text-sm font-semibold font-mono tabular text-stone-900 outline-none transition"
                  placeholder="Ex: 10.50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">Prix de vente (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={salesPrice}
                  onChange={e => setSalesPrice(e.target.value)}
                  inputMode="decimal"
                  className="w-full h-11 px-4 glass-input rounded-xl text-sm font-semibold font-mono tabular text-stone-900 outline-none transition"
                  placeholder="Ex: 15.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">Stock en rayon</label>
              <div className="relative flex items-center justify-between gap-4 bg-stone-50/50 border border-stone-200/60 rounded-2xl p-3">
                <button
                  type="button"
                  onClick={() => adjustQty(-1)}
                  className="w-12 h-12 flex items-center justify-center text-stone-700 bg-white hover:bg-stone-50 active:scale-95 border border-stone-200/80 shadow-xs rounded-xl transition cursor-pointer"
                  aria-label="Diminuer"
                >
                  <Minus className="w-5 h-5" />
                </button>

                <div className="flex-1 text-center">
                  <input
                    id="qty-input"
                    type="number"
                    min="0"
                    max="99999"
                    value={qty}
                    onChange={e => {
                      if (e.target.value.length > 5) return;
                      setQty(e.target.value);
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                    className="w-full bg-transparent text-stone-900 text-3xl font-extrabold font-mono tabular text-center outline-none border-none focus:ring-0 p-0"
                    placeholder="1"
                    inputMode="numeric"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => adjustQty(1)}
                  className="w-12 h-12 flex items-center justify-center text-stone-700 bg-white hover:bg-stone-50 active:scale-95 border border-stone-200/80 shadow-xs rounded-xl transition cursor-pointer"
                  aria-label="Augmenter"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 text-xs font-bold text-stone-500 hover:text-stone-850 hover:bg-stone-50 border border-stone-200/80 rounded-xl transition select-none tap-active cursor-pointer"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || qty.trim() === '' || isNaN(parseInt(qty, 10)) || parseInt(qty, 10) < 0 || isUploading}
              className="flex-1 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none rounded-xl shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5 transition select-none tap-active cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Sauvegarder
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
