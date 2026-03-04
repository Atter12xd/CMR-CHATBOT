import { useState } from 'react';
import { Plus, Search, Grid, List, X, Package } from 'lucide-react';
import { initialProducts, categories, searchProducts, getProductsByCategory, type Product } from '../data/products';
import ProductCard from './ProductCard';
import ProductForm from './ProductForm';


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);


  // Filtrar productos
  let filteredProducts = products;
  if (searchQuery) {
    filteredProducts = searchProducts(searchQuery, filteredProducts);
  }
  if (selectedCategory !== 'all') {
    filteredProducts = getProductsByCategory(selectedCategory, filteredProducts);
  }


  const handleAddProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setProducts([...products, newProduct]);
    setShowForm(false);
  };


  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };


  const handleUpdateProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    if (!editingProduct) return;
    
    setProducts(products.map(p => 
      p.id === editingProduct.id 
        ? { ...productData, id: editingProduct.id, createdAt: editingProduct.createdAt }
        : p
    ));
    setEditingProduct(null);
    setShowForm(false);
  };


  const handleDeleteProduct = (productId: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };


  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };


  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-violet-500"></span>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Catálogo</p>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Productos</h2>
          <p className="text-sm text-slate-500 mt-0.5">Gestiona tu catálogo de productos</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 shadow-sm shadow-violet-600/20 transition-all duration-150 active:scale-[0.97]"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Agregar Producto</span>
        </button>
      </div>


      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-10 py-2.5 text-sm bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>


        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 text-sm bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 text-slate-700 transition-all"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>


          <div className="flex border border-slate-200/80 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 transition-all ${viewMode === 'grid' ? 'bg-violet-600 text-white' : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition-all ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>


      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-slate-900/10 border border-slate-200/80">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
              </h3>
              <ProductForm
                onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
                onCancel={handleCancelForm}
                initialProduct={editingProduct || undefined}
              />
            </div>
          </div>
        </div>
      )}


      {/* Products Grid/List */}
      {filteredProducts.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-3'
        }>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center">
          <div className="w-14 h-14 bg-slate-50 ring-1 ring-slate-200/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package size={24} className="text-slate-300" />
          </div>
          <p className="text-sm text-slate-500">
            {searchQuery || selectedCategory !== 'all' 
              ? 'No se encontraron productos con estos filtros'
              : 'No hay productos. Agrega tu primer producto.'}
          </p>
        </div>
      )}
    </div>
  );
}