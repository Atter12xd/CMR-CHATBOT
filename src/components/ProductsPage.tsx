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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Productos</h1>
          <p className="text-[#64748B]">Gestiona tu catálogo de productos</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center gap-2 font-medium">
          <Plus size={18} />
          Agregar Producto
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div className="flex gap-2 border border-[#E2E8F0] rounded-md p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Products */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-12 text-center">
          <p className="text-[#64748B] text-lg">No se encontraron productos</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-[#0F172A]">{product.name}</h3>
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                    {product.category}
                  </span>
                </div>
                <p className="text-sm text-[#64748B] mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-[#0F172A]">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.stock !== undefined && (
                    <span className="text-sm text-[#64748B]">Stock: {product.stock}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Imagen</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Producto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Categoría</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Precio</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3">
                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#0F172A]">{product.name}</div>
                    {product.description && (
                      <div className="text-sm text-[#64748B] truncate max-w-xs">{product.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{product.category}</td>
                  <td className="px-4 py-3 font-semibold text-[#0F172A]">${product.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{product.stock ?? 'N/A'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
