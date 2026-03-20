import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Grid, List, X, Package, Loader2, Sparkles, Check, Trash2 } from 'lucide-react';
import { categories, searchProducts, getProductsByCategory, type Product } from '../data/products';
import { loadProducts, createProduct, updateProduct, deleteProduct, uploadProductImage } from '../services/products';
import { loadProductSuggestions, approveProductSuggestion, rejectProductSuggestion, type ProductSuggestion } from '../services/product-suggestions';
import { useOrganization } from '../hooks/useOrganization';
import ProductCard from './ProductCard';
import ProductForm from './ProductForm';
import PageHeader from './PageHeader';

export default function ProductsPage() {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!organizationId) return;
    try {
      setLoading(true);
      const [list, sugg] = await Promise.all([
        loadProducts(organizationId),
        loadProductSuggestions(organizationId).catch(() => []),
      ]);
      setProducts(list);
      setSuggestions(sugg);
    } catch (err) {
      console.error('Error cargando productos:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    fetchProducts();
  }, [organizationId, fetchProducts]);

  let filteredProducts = products;
  if (searchQuery) {
    filteredProducts = searchProducts(searchQuery, filteredProducts);
  }
  if (selectedCategory !== 'all') {
    filteredProducts = getProductsByCategory(selectedCategory, filteredProducts);
  }

  const resolveImageUrl = async (image: string): Promise<string> => {
    if (!image) return '';
    if (image.startsWith('data:')) {
      return await uploadProductImage(image);
    }
    return image;
  };

  const handleAddProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    if (!organizationId) return;
    setSaving(true);
    try {
      const imageUrl = await resolveImageUrl(productData.image || '');
      await createProduct(organizationId, {
        ...productData,
        image: imageUrl || productData.image,
      });
      await fetchProducts();
      setShowForm(false);
    } catch (err: any) {
      console.error('Error agregando producto:', err);
      alert(err.message || 'Error al agregar producto');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    if (!editingProduct) return;
    setSaving(true);
    try {
      const imageUrl = await resolveImageUrl(productData.image || '');
      await updateProduct(editingProduct.id, {
        ...productData,
        image: imageUrl || productData.image,
      });
      await fetchProducts();
      setEditingProduct(null);
      setShowForm(false);
    } catch (err: any) {
      console.error('Error actualizando producto:', err);
      alert(err.message || 'Error al actualizar producto');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await deleteProduct(productId);
      await fetchProducts();
    } catch (err: any) {
      console.error('Error eliminando producto:', err);
      alert(err.message || 'Error al eliminar producto');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (orgLoading || !organizationId) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="app-spinner">
          <Loader2 size={20} className="animate-spin text-brand-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título sobre fondo oscuro */}
      <PageHeader
        eyebrow="Catálogo"
        title="Productos"
        description="Gestiona tu catálogo de productos."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
            className="app-btn-primary"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Agregar producto</span>
          </button>
        }
      />

      <div className="app-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="flex border border-app-line rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 transition-all ${viewMode === 'grid' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-white/[0.04] text-slate-500 hover:bg-white/[0.06] hover:text-slate-300'}`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition-all ${viewMode === 'list' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-white/[0.04] text-slate-500 hover:bg-white/[0.06] hover:text-slate-300'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

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
                saving={saving}
              />
            </div>
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/15 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center">
              <Sparkles size={16} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-white">Sugeridos desde web</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Productos extraídos por IA. Aprueba para añadirlos al catálogo.
              </p>
            </div>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {suggestions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl border border-app-line bg-app-card/90"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{s.name}</p>
                  <p className="text-[12px] text-slate-500 font-mono">
                    S/ {Number(s.price).toFixed(2)} · {s.category}
                    {s.sourceRef ? ` · ${s.sourceRef}` : ''}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={async () => {
                      try {
                        await approveProductSuggestion(s.id, organizationId!);
                        await fetchProducts();
                      } catch (e) {
                        alert(e instanceof Error ? e.message : 'Error al aprobar');
                      }
                    }}
                    disabled={saving}
                    className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
                    title="Añadir al catálogo"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await rejectProductSuggestion(s.id, organizationId!);
                        await fetchProducts();
                      } catch (e) {
                        alert(e instanceof Error ? e.message : 'Error al rechazar');
                      }
                    }}
                    disabled={saving}
                    className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:bg-white/[0.08] disabled:opacity-50"
                    title="Rechazar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="app-spinner">
            <Loader2 size={20} className="animate-spin text-brand-400" />
          </div>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-3'
        }>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={(p) => { setEditingProduct(p); setShowForm(true); }}
              onDelete={handleDeleteProduct}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="app-card p-12 text-center">
          <div className="w-14 h-14 bg-white/[0.03] border border-app-line rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package size={24} className="text-slate-600" />
          </div>
          <p className="text-[14px] font-medium text-slate-400">
            {searchQuery || selectedCategory !== 'all'
              ? 'No se encontraron productos con estos filtros'
              : 'No hay productos. Agrega tu primer producto.'}
          </p>
        </div>
      )}
    </div>
  );
}
