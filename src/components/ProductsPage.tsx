import { useState } from 'react';
import { initialProducts, categories, searchProducts } from '../data/products';
import type { Product } from '../data/products';
import { Search, Plus, Grid, List } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredProducts = searchQuery
    ? searchProducts(searchQuery, products)
    : selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const handleDeleteProduct = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-1 sm:mb-2">Productos</h1>
          <p className="text-sm sm:text-base text-[#64748B]">Gestiona tu catálogo de productos</p>
        </div>
        <button className="px-3 sm:px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center gap-2 font-medium text-sm sm:text-base w-full sm:w-auto justify-center">
          <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="hidden sm:inline">Agregar Producto</span>
          <span className="sm:hidden">Agregar</span>
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] sm:w-[18px] sm:h-[18px]" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 sm:px-4 py-2 border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div className="flex gap-2 border border-[#E2E8F0] rounded-md p-1 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <Grid size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <List size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>

      {/* Products */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-12 text-center">
          <p className="text-[#64748B] text-lg">No se encontraron productos</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 sm:h-48 object-cover"
              />
              <div className="p-3 sm:p-4">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <h3 className="font-semibold text-sm sm:text-base text-[#0F172A] flex-1 line-clamp-2">{product.name}</h3>
                  <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary/10 text-primary rounded flex-shrink-0">
                    {product.category}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#64748B] mb-2 sm:mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg sm:text-xl font-bold text-[#0F172A]">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.stock !== undefined && (
                    <span className="text-xs sm:text-sm text-[#64748B]">Stock: {product.stock}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-5 px-3 sm:px-4 md:px-5">
            <table className="w-full min-w-[600px]">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase">Imagen</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase">Producto</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase">Categoría</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase">Precio</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase">Stock</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase">Acciones</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-3 sm:px-4 py-2 sm:py-3">
                    <img src={product.image} alt={product.name} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded" />
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3">
                    <div className="font-semibold text-xs sm:text-sm text-[#0F172A]">{product.name}</div>
                    {product.description && (
                      <div className="text-xs sm:text-sm text-[#64748B] truncate max-w-[150px] sm:max-w-xs">{product.description}</div>
                    )}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#64748B]">{product.category}</td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-[#0F172A]">${product.price.toFixed(2)}</td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#64748B]">{product.stock ?? 'N/A'}</td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3">
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-800 text-xs sm:text-sm"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
