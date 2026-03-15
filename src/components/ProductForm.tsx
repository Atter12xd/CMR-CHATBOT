import { useState } from 'react';
import { Plus, Upload, X } from 'lucide-react';
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


  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Imagen */}
      <div>
        <label className="block text-[13px] font-semibold text-slate-700 mb-2">
          Imagen del Producto
        </label>
        <div className="flex items-start gap-4">
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-28 h-28 object-cover rounded-xl ring-1 ring-slate-200/80"
              />
              <button
                type="button"
                onClick={() => {
                  setImage('');
                  setImagePreview('');
                }}
                className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-rose-500 text-white rounded-xl flex items-center justify-center hover:bg-rose-600 shadow-sm transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <div className="w-28 h-28 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-slate-50">
              <Upload size={22} className="text-slate-300" />
            </div>
          )}
          <div className="flex-1">
            <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors">
              <Upload size={15} className="text-slate-500" />
              <span className="text-[13px] font-medium text-slate-700">Subir Imagen</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            <p className="text-[11px] text-slate-400 mt-2">O ingresa una URL de imagen</p>
            <input
              type="url"
              value={image}
              onChange={(e) => {
                setImage(e.target.value);
                setImagePreview(e.target.value);
              }}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="mt-1.5 w-full px-3 py-2 text-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>


      {/* Nombre */}
      <div>
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
          Nombre del Producto <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3.5 py-2.5 text-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 transition-all placeholder:text-slate-400"
          placeholder="Ej: Camiseta Azul"
        />
      </div>


      {/* Precio y Categoría */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
            Precio <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm font-medium">S/</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full pl-8 pr-4 py-2.5 text-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 transition-all placeholder:text-slate-400"
              placeholder="0.00"
            />
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
            Categoría <span className="text-rose-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 transition-all text-slate-700"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>


      {/* Descripción */}
      <div>
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
          Descripción
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3.5 py-2.5 text-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 transition-all placeholder:text-slate-400 resize-none"
          placeholder="Describe el producto..."
        />
      </div>


      {/* Stock */}
      <div>
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
          Stock <span className="text-slate-400 font-normal">(opcional)</span>
        </label>
        <input
          type="number"
          min="0"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-full px-3.5 py-2.5 text-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 transition-all placeholder:text-slate-400"
          placeholder="Cantidad disponible"
        />
      </div>


      {/* Botones */}
      <div className="flex items-center justify-end gap-2.5 pt-5 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 shadow-sm shadow-violet-600/20 transition-all duration-150 active:scale-[0.97] flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <span className="animate-pulse">Guardando...</span>
          ) : (
            <>
              <Plus size={16} strokeWidth={2.5} />
              <span>{initialProduct ? 'Actualizar' : 'Agregar'} Producto</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}