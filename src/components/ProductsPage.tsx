import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Grid,
  List,
  X,
  Package,
  Loader2,
  Sparkles,
  Check,
  Trash2,
  Layers,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import { categories, searchProducts, getProductsByCategory, type Product } from '../data/products';
import { loadProducts, createProduct, updateProduct, deleteProduct, uploadProductImage } from '../services/products';
import {
  loadProductSuggestions,
  approveProductSuggestion,
  rejectProductSuggestion,
  type ProductSuggestion,
} from '../services/product-suggestions';
import { useOrganization } from '../hooks/useOrganization';
import ProductCard from './ProductCard';
import ProductForm from './ProductForm';
import PageHeader from './PageHeader';
import StatsCard from './StatsCard';
import StatsCardSkeleton from './StatsCardSkeleton';
import ProductCardSkeleton from './ProductCardSkeleton';

const statsContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const statsItem = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 380, damping: 30 },
  },
};

const cardGrid = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 360, damping: 28 },
  },
};

const SKELETON_COUNT = 8;

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

  const productStats = useMemo(() => {
    const categoryCount = new Set(products.map((p) => p.category)).size;
    const lowStock = products.filter((p) => p.stock !== undefined && p.stock <= 5).length;
    const inventoryValue = products.reduce((s, p) => s + p.price * (p.stock ?? 0), 0);
    return {
      total: products.length,
      categoryCount,
      lowStock,
      inventoryValue,
    };
  }, [products]);

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

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] font-professional">
        <div className="flex flex-col items-center gap-3">
          <div className="app-spinner">
            <Loader2 size={20} className="animate-spin text-brand-400" />
          </div>
          <p className="text-[14px] text-slate-500">Cargando…</p>
        </div>
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div className="space-y-5 font-professional">
        <PageHeader
          eyebrow="Catálogo"
          title="Productos"
          description="Gestiona tu catálogo de productos."
        />
        <div className="app-card p-5">
          <div className="flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
            <p className="text-slate-400 text-[14px] leading-relaxed">
              Necesitas una organización para gestionar productos. Ve a{' '}
              <a href="/configuracion" className="text-brand-400 font-semibold hover:text-brand-300">
                Configuración
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 font-professional">
      <PageHeader
        eyebrow="Catálogo"
        title="Productos"
        description="Gestiona tu catálogo de productos."
        actions={
          <motion.button
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold bg-brand-500 text-white hover:bg-brand-400 border border-brand-400/30 shadow-lg shadow-brand-500/20 transition-colors"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Agregar producto</span>
          </motion.button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3" aria-busy="true" aria-label="Cargando métricas">
          {[0, 1, 2, 3].map((k) => (
            <StatsCardSkeleton key={k} />
          ))}
        </div>
      ) : (
        <motion.div
          variants={statsContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3"
        >
          <motion.div variants={statsItem} className="min-w-0">
            <StatsCard
              title="Productos en catálogo"
              value={productStats.total}
              icon={Package}
              accentClassName="text-brand-400"
            />
          </motion.div>
          <motion.div variants={statsItem} className="min-w-0">
            <StatsCard
              title="Categorías usadas"
              value={productStats.categoryCount}
              icon={Layers}
              accentClassName="text-sky-400"
            />
          </motion.div>
          <motion.div variants={statsItem} className="min-w-0">
            <StatsCard
              title="Stock bajo (≤5)"
              value={productStats.lowStock}
              icon={AlertTriangle}
              accentClassName="text-amber-400"
            />
          </motion.div>
          <motion.div variants={statsItem} className="min-w-0">
            <StatsCard
              title="Valor inventario"
              value={`S/ ${productStats.inventoryValue.toFixed(2)}`}
              icon={DollarSign}
              accentClassName="text-purple-400"
            />
          </motion.div>
        </motion.div>
      )}

      <div className="rounded-2xl border border-app-line bg-app-card overflow-hidden shadow-app-card">
        <div className="px-5 py-3.5 sm:px-6 bg-gradient-to-br from-brand-500/10 via-app-card to-purple-600/10 border-b border-app-line">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em]">Buscar y filtrar</p>
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative min-w-0">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Buscar por nombre, categoría o descripción…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-w-0 pl-10 pr-10 py-2.5 text-[14px] bg-white/[0.05] border border-app-line rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 text-[14px] bg-white/[0.05] border border-app-line rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all min-w-[200px]"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="flex border border-app-line rounded-xl overflow-hidden shrink-0">
              <motion.button
                type="button"
                onClick={() => setViewMode('grid')}
                whileTap={{ scale: 0.98 }}
                className={`p-2.5 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-brand-500 to-purple-600 text-white shadow-md shadow-brand-500/20'
                    : 'bg-white/[0.04] text-slate-500 hover:bg-white/[0.07] hover:text-slate-300'
                }`}
              >
                <Grid size={17} />
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setViewMode('list')}
                whileTap={{ scale: 0.98 }}
                className={`p-2.5 transition-all ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-brand-500 to-purple-600 text-white shadow-md shadow-brand-500/20'
                    : 'bg-white/[0.04] text-slate-500 hover:bg-white/[0.07] hover:text-slate-300'
                }`}
              >
                <List size={17} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50 border border-app-line bg-app-card">
            <div className="p-6 sm:p-7">
              <div className="mb-5 pb-4 border-b border-app-line">
                <h3 className="text-lg font-bold text-white font-display tracking-tight">
                  {editingProduct ? 'Editar producto' : 'Agregar producto'}
                </h3>
                <p className="text-[13px] text-slate-500 mt-1">
                  Completa los datos; la imagen se muestra completa en el catálogo.
                </p>
              </div>
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
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-app-line bg-app-card overflow-hidden shadow-app-card"
        >
          <div className="px-5 py-4 sm:px-6 bg-gradient-to-br from-amber-500/12 via-app-card to-orange-600/10 border-b border-app-line flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/[0.06] border border-app-line text-amber-400 shrink-0">
              <Sparkles className="size-[18px]" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-white tracking-tight">Sugeridos desde web</h3>
              <p className="text-[12px] text-slate-500 mt-0.5 font-medium">
                Productos detectados por IA. Aprueba para añadirlos al catálogo.
              </p>
            </div>
          </div>
          <div className="p-4 sm:p-5 space-y-2 max-h-56 overflow-y-auto">
            {suggestions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 py-3 px-4 rounded-xl border border-app-line bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-white truncate">{s.name}</p>
                  <p className="text-[12px] text-slate-500 font-mono tabular-nums mt-0.5">
                    S/ {Number(s.price).toFixed(2)} · {s.category}
                    {s.sourceRef ? ` · ${s.sourceRef}` : ''}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <motion.button
                    type="button"
                    onClick={async () => {
                      try {
                        await approveProductSuggestion(s.id, organizationId!);
                        await fetchProducts();
                      } catch (e) {
                        alert(e instanceof Error ? e.message : 'Error al aprobar');
                      }
                    }}
                    disabled={saving}
                    whileTap={{ scale: saving ? 1 : 0.95 }}
                    className="p-2.5 rounded-xl bg-emerald-500/12 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
                    title="Añadir al catálogo"
                  >
                    <Check size={16} />
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={async () => {
                      try {
                        await rejectProductSuggestion(s.id, organizationId!);
                        await fetchProducts();
                      } catch (e) {
                        alert(e instanceof Error ? e.message : 'Error al rechazar');
                      }
                    }}
                    disabled={saving}
                    whileTap={{ scale: saving ? 1 : 0.95 }}
                    className="p-2.5 rounded-xl bg-white/[0.05] border border-app-line text-slate-400 hover:bg-white/[0.08] disabled:opacity-50"
                    title="Rechazar"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {loading ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'
              : 'space-y-3'
          }
          aria-busy="true"
          aria-label="Cargando productos"
        >
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <ProductCardSkeleton key={i} viewMode={viewMode} />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <motion.div
          variants={cardGrid}
          initial="hidden"
          animate="show"
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'
              : 'space-y-3'
          }
        >
          {filteredProducts.map((product) => (
            <motion.div key={product.id} variants={cardItem} className="min-w-0">
              <ProductCard
                product={product}
                onEdit={(p) => {
                  setEditingProduct(p);
                  setShowForm(true);
                }}
                onDelete={handleDeleteProduct}
                viewMode={viewMode}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-app-line bg-app-card shadow-app-card overflow-hidden"
        >
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-purple-600/15 border border-brand-500/20 flex items-center justify-center mb-4">
              <Package className="size-7 text-slate-500" />
            </div>
            <p className="text-[15px] font-medium text-slate-300">
              {searchQuery || selectedCategory !== 'all'
                ? 'No hay productos con estos filtros'
                : 'No hay productos aún'}
            </p>
            <p className="text-[13px] text-slate-500 mt-1 max-w-sm">
              {searchQuery || selectedCategory !== 'all'
                ? 'Prueba otra búsqueda o categoría.'
                : 'Agrega tu primer producto con el botón superior.'}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
