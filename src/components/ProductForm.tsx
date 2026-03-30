import { useState } from 'react';
import { Loader2, Plus, Upload, X } from 'lucide-react';
import type { Product } from '../data/products';
import { categories } from '../data/products';


interface ProductFormProps {
  onSubmit: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onCancel?: () => void;
  initialProduct?: Product;
  saving?: boolean;
}


export default function ProductForm({ onSubmit, onCancel, initialProduct, saving = false }: ProductFormProps) {
  const [name, setName] = useState(initialProduct?.name || '');
  const [price, setPrice] = useState(initialProduct?.price.toString() || '');
  const [category, setCategory] = useState(initialProduct?.category || categories[0]);
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [stock, setStock] = useState(initialProduct?.stock?.toString() || '');
  const [image, setImage] = useState(initialProduct?.image || '');
  const [imagePreview, setImagePreview] = useState(initialProduct?.image || '');


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImage(result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !price || !category) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }


    onSubmit({
      name,
      price: parseFloat(price),
      category,
      image: image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
      description: description || undefined,
      stock: stock ? parseInt(stock) : undefined,
    });


    // Reset form
    setName('');
    setPrice('');
    setCategory(categories[0]);
    setDescription('');
    setStock('');
    setImage('');
    setImagePreview('');
  };


  const inputClass =
    'w-full px-3.5 py-2.5 text-sm rounded-xl bg-white/[0.05] border border-app-line text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500/40 transition-all';

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-professional">
      <div>
        <label className="block text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
          Imagen del producto
        </label>
        <div className="rounded-2xl border border-app-line bg-gradient-to-br from-white/[0.04] to-transparent p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4">
            {imagePreview ? (
              <div className="relative shrink-0 mx-auto sm:mx-0">
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-black/25 border border-app-line flex items-center justify-center overflow-hidden">
                  <img src={imagePreview} alt="Vista previa" className="max-w-full max-h-full w-full h-full object-contain" />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImage('');
                    setImagePreview('');
                  }}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-rose-500 text-white rounded-xl flex items-center justify-center hover:bg-rose-600 border border-white/10 shadow-lg transition-colors"
                  aria-label="Quitar imagen"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 sm:w-36 sm:h-36 shrink-0 mx-auto sm:mx-0 border-2 border-dashed border-app-line rounded-2xl flex items-center justify-center bg-app-raised/50">
                <Upload size={24} className="text-slate-600" />
              </div>
            )}
            <div className="flex-1 min-w-0 space-y-3">
              <label className="cursor-pointer inline-flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 w-full sm:w-auto rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-300 hover:bg-brand-500/25 transition-colors">
                <Upload size={16} />
                <span className="text-[13px] font-semibold">Subir imagen</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              <div>
                <p className="text-[11px] text-slate-500 font-medium mb-1.5">O pega una URL</p>
                <input
                  type="url"
                  value={image.startsWith('data:') ? '' : image}
                  onChange={(e) => {
                    const v = e.target.value;
                    setImage(v);
                    setImagePreview(v);
                  }}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          Nombre <span className="text-rose-400 normal-case">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputClass}
          placeholder="Ej. Camiseta azul"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Precio <span className="text-rose-400 normal-case">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">S/</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className={`${inputClass} pl-9`}
              placeholder="0.00"
            />
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Categoría <span className="text-rose-400 normal-case">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className={`${inputClass} text-slate-200`}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-[#141a24] text-white">
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={`${inputClass} resize-none leading-relaxed`}
          placeholder="Breve descripción para el catálogo…"
        />
      </div>

      <div>
        <label className="block text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          Stock <span className="text-slate-600 font-normal normal-case">(opcional)</span>
        </label>
        <input
          type="number"
          min="0"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className={inputClass}
          placeholder="Cantidad"
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-5 border-t border-app-line">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-semibold text-slate-300 bg-white/[0.04] border border-app-line rounded-xl hover:bg-white/[0.08] transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2.5 bg-gradient-to-r from-brand-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:opacity-95 shadow-md shadow-brand-500/20 transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin shrink-0" />
              <span>Guardando…</span>
            </>
          ) : (
            <>
              <Plus size={16} strokeWidth={2.5} />
              <span>{initialProduct ? 'Actualizar producto' : 'Agregar producto'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}