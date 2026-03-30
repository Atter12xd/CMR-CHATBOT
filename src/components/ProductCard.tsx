import { Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
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
      <motion.div
        whileHover={{ y: -1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="rounded-[22px] border border-app-line bg-white overflow-hidden shadow-app-card font-professional"
      >
        <div className="h-0.5 bg-gradient-to-r from-brand-400/60 via-violet-400/50 to-emerald-400/50" />
        <div className="p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-xl p-[2px] bg-app-field border border-app-line shrink-0 w-[4.5rem] h-[4.5rem] flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="max-w-full max-h-full w-full h-full object-contain rounded-[10px] bg-white"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-semibold text-app-ink truncate leading-snug">{product.name}</h3>
              <span className="inline-flex items-center mt-1.5 px-2.5 py-1 rounded-lg bg-app-field border border-app-line text-[11px] font-semibold text-app-muted">
                {product.category}
              </span>
              {product.description && (
                <p className="text-[13px] text-app-muted mt-1 line-clamp-1 leading-snug">{product.description}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-[17px] font-bold text-app-ink tabular-nums font-display">
                S/ {product.price.toFixed(2)}
              </p>
              {product.stock !== undefined && (
                <p className="text-[12px] text-app-muted mt-0.5 tabular-nums">Stock: {product.stock}</p>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              {onEdit && (
                <motion.button
                  type="button"
                  onClick={() => onEdit(product)}
                  whileTap={{ scale: 0.94 }}
                  className="p-2.5 text-brand-600 hover:bg-brand-500/10 rounded-xl border border-transparent hover:border-brand-500/20 transition-colors"
                >
                  <Edit size={17} />
                </motion.button>
              )}
              {onDelete && (
                <motion.button
                  type="button"
                  onClick={() => onDelete(product.id)}
                  whileTap={{ scale: 0.94 }}
                  className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20 transition-colors"
                >
                  <Trash2 size={17} />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="rounded-[22px] border border-app-line bg-white overflow-hidden shadow-app-card group font-professional h-full flex flex-col"
    >
      <div className="h-1 bg-gradient-to-r from-brand-400/60 via-violet-400/50 to-emerald-400/50 shrink-0" />
      <div className="relative aspect-[4/3] bg-app-field flex items-center justify-center overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-2 group-hover:scale-[1.03] transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-md border border-app-line text-[11px] font-semibold text-app-ink shadow-sm">
            {product.category}
          </span>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col min-h-0">
        <h3 className="text-[15px] font-semibold text-app-ink truncate leading-snug">{product.name}</h3>
        {product.description && (
          <p className="text-[13px] text-app-muted mt-1 line-clamp-2 leading-relaxed flex-1">{product.description}</p>
        )}
        <div className="flex items-end justify-between mt-3 pt-3 border-t border-app-line gap-2">
          <div>
            <p className="text-[18px] font-bold text-app-ink tabular-nums font-display leading-none">
              S/ {product.price.toFixed(2)}
            </p>
            {product.stock !== undefined && (
              <p className="text-[12px] text-app-muted mt-1 tabular-nums">Stock: {product.stock}</p>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            {onEdit && (
              <motion.button
                type="button"
                onClick={() => onEdit(product)}
                whileTap={{ scale: 0.94 }}
                className="p-2 text-brand-600 hover:bg-brand-500/10 rounded-xl border border-transparent hover:border-brand-500/20 transition-colors"
              >
                <Edit size={17} />
              </motion.button>
            )}
            {onDelete && (
              <motion.button
                type="button"
                onClick={() => onDelete(product.id)}
                whileTap={{ scale: 0.94 }}
                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20 transition-colors"
              >
                <Trash2 size={17} />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
