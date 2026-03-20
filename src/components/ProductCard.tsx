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
        className="rounded-2xl border border-app-line bg-app-card overflow-hidden shadow-app-card font-professional"
      >
        <div className="h-0.5 bg-gradient-to-r from-brand-500/50 via-purple-500/35 to-emerald-500/35" />
        <div className="p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-xl p-[2px] bg-gradient-to-br from-white/15 to-white/5 shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-14 h-14 object-cover rounded-[10px] bg-app-raised"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-semibold text-white truncate leading-snug">{product.name}</h3>
              <span className="inline-flex items-center mt-1.5 px-2.5 py-1 rounded-lg bg-white/[0.06] border border-app-line text-[11px] font-semibold text-slate-400">
                {product.category}
              </span>
              {product.description && (
                <p className="text-[13px] text-slate-500 mt-1 line-clamp-1 leading-snug">{product.description}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-[17px] font-bold text-white tabular-nums font-display">
                S/ {product.price.toFixed(2)}
              </p>
              {product.stock !== undefined && (
                <p className="text-[12px] text-slate-500 mt-0.5 tabular-nums">Stock: {product.stock}</p>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              {onEdit && (
                <motion.button
                  type="button"
                  onClick={() => onEdit(product)}
                  whileTap={{ scale: 0.94 }}
                  className="p-2.5 text-brand-400 hover:bg-brand-500/12 rounded-xl border border-transparent hover:border-brand-500/20 transition-colors"
                >
                  <Edit size={17} />
                </motion.button>
              )}
              {onDelete && (
                <motion.button
                  type="button"
                  onClick={() => onDelete(product.id)}
                  whileTap={{ scale: 0.94 }}
                  className="p-2.5 text-rose-400 hover:bg-rose-500/12 rounded-xl border border-transparent hover:border-rose-500/20 transition-colors"
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
      className="rounded-2xl border border-app-line bg-app-card overflow-hidden shadow-app-card group font-professional h-full flex flex-col"
    >
      <div className="h-1 bg-gradient-to-r from-brand-500/50 via-purple-500/40 to-emerald-500/35 shrink-0" />
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-44 object-cover group-hover:scale-[1.04] transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-black/45 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-slate-100">
            {product.category}
          </span>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col min-h-0">
        <h3 className="text-[15px] font-semibold text-white truncate leading-snug">{product.name}</h3>
        {product.description && (
          <p className="text-[13px] text-slate-500 mt-1 line-clamp-2 leading-relaxed flex-1">{product.description}</p>
        )}
        <div className="flex items-end justify-between mt-3 pt-3 border-t border-app-line gap-2">
          <div>
            <p className="text-[18px] font-bold text-white tabular-nums font-display leading-none">
              S/ {product.price.toFixed(2)}
            </p>
            {product.stock !== undefined && (
              <p className="text-[12px] text-slate-500 mt-1 tabular-nums">Stock: {product.stock}</p>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            {onEdit && (
              <motion.button
                type="button"
                onClick={() => onEdit(product)}
                whileTap={{ scale: 0.94 }}
                className="p-2 text-brand-400 hover:bg-brand-500/12 rounded-xl border border-transparent hover:border-brand-500/20 transition-colors"
              >
                <Edit size={17} />
              </motion.button>
            )}
            {onDelete && (
              <motion.button
                type="button"
                onClick={() => onDelete(product.id)}
                whileTap={{ scale: 0.94 }}
                className="p-2 text-rose-400 hover:bg-rose-500/12 rounded-xl border border-transparent hover:border-rose-500/20 transition-colors"
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
