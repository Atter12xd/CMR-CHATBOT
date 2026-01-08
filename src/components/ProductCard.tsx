import { Edit, Trash2 } from 'lucide-react';
import type { Product } from '../data/products';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 flex space-x-2">
          <button
            onClick={() => onEdit(product)}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            title="Editar producto"
          >
            <Edit size={16} className="text-primary-600" />
          </button>
          <button
            onClick={() => {
              if (confirm(`¿Estás seguro de eliminar "${product.name}"?`)) {
                onDelete(product.id);
              }
            }}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            title="Eliminar producto"
          >
            <Trash2 size={16} className="text-red-600" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
          <span className="text-lg font-bold text-primary-600">${product.price.toFixed(2)}</span>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded">
            {product.category}
          </span>
          {product.stock !== undefined && (
            <span className={`text-xs px-2 py-1 rounded ${
              product.stock > 10 
                ? 'bg-green-100 text-green-700' 
                : product.stock > 0 
                ? 'bg-yellow-100 text-yellow-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              Stock: {product.stock}
            </span>
          )}
        </div>
        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        )}
      </div>
    </div>
  );
}


