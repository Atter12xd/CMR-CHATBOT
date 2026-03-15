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
      <div className="bg-[#111827]/80 rounded-2xl border border-white/[0.06] p-4 hover:border-white/[0.1] transition-all duration-300">
        <div className="flex items-center gap-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-14 h-14 object-cover rounded-xl ring-1 ring-white/[0.06]"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{product.name}</h3>
            <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] font-medium text-slate-500">
              {product.category}
            </span>
            {product.description && (
              <p className="text-[13px] text-slate-500 mt-1 line-clamp-1">{product.description}</p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold text-white tabular-nums">S/ {product.price.toFixed(2)}</p>
            {product.stock !== undefined && (
              <p className="text-[11px] text-slate-500 mt-0.5">Stock: {product.stock}</p>
            )}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {onEdit && (
              <button
                onClick={() => onEdit(product)}
                className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors"
              >
                <Edit size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(product.id)}
                className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
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
    <div className="bg-[#111827]/80 rounded-2xl border border-white/[0.06] overflow-hidden hover:border-white/[0.1] transition-all duration-300 group">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-44 object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/[0.08] border border-white/[0.08] text-[11px] font-semibold text-slate-300 shadow-sm">
            {product.category}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-white truncate">{product.name}</h3>
        {product.description && (
          <p className="text-[13px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{product.description}</p>
        )}
        <div className="flex items-end justify-between mt-3 pt-3 border-t border-white/[0.04]">
          <div>
            <p className="text-lg font-bold text-white tabular-nums">S/ {product.price.toFixed(2)}</p>
            {product.stock !== undefined && (
              <p className="text-[11px] text-slate-500 mt-0.5">Stock: {product.stock}</p>
            )}
          </div>
          <div className="flex gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(product)}
                className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors"
              >
                <Edit size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(product.id)}
                className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
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
