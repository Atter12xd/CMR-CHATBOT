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
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.category}</p>
            {product.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">{product.description}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</p>
            {product.stock !== undefined && (
              <p className="text-sm text-gray-500">Stock: {product.stock}</p>
            )}
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(product)}
                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
              >
                <Edit size={18} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(product.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.category}</p>
          </div>
        </div>
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</p>
            {product.stock !== undefined && (
              <p className="text-xs text-gray-500">Stock: {product.stock}</p>
            )}
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(product)}
                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
              >
                <Edit size={18} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(product.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
