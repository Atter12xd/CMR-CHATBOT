import { Edit, Trash2 } from 'lucide-react';
import type { Product } from '../data/products';


interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  viewMode?: 'grid' | 'list';
}


export default function ProductCard({ product, onEdit, onDelete, viewMode = 'grid' }: ProductCardProps) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 hover:shadow-md shadow-sm transition-all duration-200">
        <div className="flex items-center gap-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-14 h-14 object-cover rounded-xl ring-1 ring-slate-100"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 truncate">{product.name}</h3>
            <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-md bg-slate-50 ring-1 ring-slate-200/80 text-[11px] font-medium text-slate-500">
              {product.category}
            </span>
            {product.description && (
              <p className="text-[13px] text-slate-500 mt-1 line-clamp-1">{product.description}</p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold text-slate-900">S/ {product.price.toFixed(2)}</p>
            {product.stock !== undefined && (
              <p className="text-[11px] text-slate-400 mt-0.5">Stock: {product.stock}</p>
            )}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {onEdit && (
              <button
                onClick={() => onEdit(product)}
                className="p-2 text-violet-600 hover:bg-violet-50 rounded-xl transition-colors"
              >
                <Edit size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(product.id)}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-44 object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm ring-1 ring-black/5 text-[11px] font-semibold text-slate-700 shadow-sm">
            {product.category}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-slate-900 truncate">{product.name}</h3>
        {product.description && (
          <p className="text-[13px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{product.description}</p>
        )}
        <div className="flex items-end justify-between mt-3 pt-3 border-t border-slate-100">
          <div>
            <p className="text-lg font-bold text-slate-900">S/ {product.price.toFixed(2)}</p>
            {product.stock !== undefined && (
              <p className="text-[11px] text-slate-400 mt-0.5">Stock: {product.stock}</p>
            )}
          </div>
          <div className="flex gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(product)}
                className="p-2 text-violet-600 hover:bg-violet-50 rounded-xl transition-colors"
              >
                <Edit size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(product.id)}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}