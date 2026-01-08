import { useState } from 'react';
import ProductForm from './ProductForm';
import ProductCard from './ProductCard';
import type { Product } from '../data/products';
import { initialProducts, categories, searchProducts } from '../data/products';
import { Plus, Search, Grid, List, X } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleAddProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    if (editingProduct) {
      // Actualizar producto existente
      setProducts(prev =>
        prev.map(p =>
          p.id === editingProduct.id
            ? { ...productData, id: editingProduct.id, createdAt: editingProduct.createdAt }
            : p
        )
      );
      setEditingProduct(null);
    } else {
      // Agregar nuevo producto
      const newProduct: Product = {
        ...productData,
        id: `prod-${Date.now()}`,
        createdAt: new Date(),
      };
      setProducts(prev => [...prev, newProduct]);
    }
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  // Filtrar productos
  let filteredProducts = products;
  
  if (searchQuery) {
    filteredProducts = searchProducts(searchQuery, filteredProducts);
  }
  
  if (selectedCategory !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 lg:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Productos</h1>
            <p className="text-sm lg:text-base text-gray-600 mt-1 lg:mt-2">Gestiona los productos de tu tienda</p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
            className="px-4 py-2.5 lg:py-2 bg-primary-500 text-white rounded-xl lg:rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
          >
            <Plus size={18} className="lg:w-5 lg:h-5" />
            <span className="text-sm lg:text-base">Agregar Producto</span>
          </button>
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-10 py-2.5 lg:py-2 text-sm lg:text-base border border-gray-300 rounded-xl lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 lg:px-4 py-2.5 lg:py-2 text-sm lg:text-base border border-gray-300 rounded-xl lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="flex items-center space-x-1 lg:space-x-2 border border-gray-300 rounded-xl lg:rounded-lg p-1 bg-white">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 lg:p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              aria-label="Vista de cuadrícula"
            >
              <Grid size={18} className="lg:w-5 lg:h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 lg:p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              aria-label="Vista de lista"
            >
              <List size={18} className="lg:w-5 lg:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="mb-4 lg:mb-6 bg-white rounded-xl lg:rounded-lg border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <button
              onClick={handleCancelForm}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              aria-label="Cerrar formulario"
            >
              <X size={20} className="lg:w-6 lg:h-6" />
            </button>
          </div>
          <ProductForm
            onSubmit={handleAddProduct}
            onCancel={handleCancelForm}
            initialProduct={editingProduct || undefined}
          />
        </div>
      )}

      {/* Lista de productos */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl lg:rounded-lg border border-gray-200 p-8 lg:p-12 text-center">
          <p className="text-gray-500 text-base lg:text-lg">
            {searchQuery || selectedCategory !== 'all'
              ? 'No se encontraron productos con los filtros aplicados'
              : 'No hay productos agregados. ¡Agrega tu primer producto!'}
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6'
          : 'space-y-3 lg:space-y-4'
        }>
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Estadísticas */}
      <div className="mt-4 lg:mt-6 bg-white rounded-xl lg:rounded-lg border border-gray-200 p-3 lg:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm gap-2 sm:gap-0">
          <span className="text-gray-600">
            Total de productos: <span className="font-semibold text-gray-900">{products.length}</span>
          </span>
          <span className="text-gray-600">
            Mostrando: <span className="font-semibold text-gray-900">{filteredProducts.length}</span>
          </span>
        </div>
      </div>
    </div>
  );
}



