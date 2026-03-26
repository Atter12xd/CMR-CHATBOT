import { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, ShoppingBag, Store } from 'lucide-react';

interface ShopifyIntegrationProps {
  organizationId: string;
}

type ShopifyStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface ShopifyProductPreview {
  id: string;
  title: string;
  price: string;
  image: string;
}

const MOCK_PRODUCTS: ShopifyProductPreview[] = [
  {
    id: 'shopify-1',
    title: 'Producto ejemplo #1',
    price: '$29.99',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 'shopify-2',
    title: 'Producto ejemplo #2',
    price: '$49.90',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 'shopify-3',
    title: 'Producto ejemplo #3',
    price: '$79.00',
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=300&auto=format&fit=crop',
  },
];

export default function ShopifyIntegration({ organizationId }: ShopifyIntegrationProps) {
  const hasOrganization = Boolean(organizationId);
  const [shopDomain, setShopDomain] = useState('');
  const [status, setStatus] = useState<ShopifyStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [syncedProducts, setSyncedProducts] = useState<ShopifyProductPreview[]>([]);

  const normalizedDomain = useMemo(() => {
    return shopDomain.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
  }, [shopDomain]);

  const handleConnect = async () => {
    if (!hasOrganization) {
      setError('No se detectó organización activa para esta integración.');
      return;
    }

    if (!normalizedDomain) {
      setError('Ingresa el dominio de tu tienda. Ejemplo: mi-tienda.myshopify.com');
      return;
    }

    setError(null);
    setStatus('connecting');

    try {
      // Base visual lista para conectar endpoint real de Shopify OAuth + sync.
      await new Promise((resolve) => setTimeout(resolve, 1400));

      setStatus('connected');
      setSyncedProducts(MOCK_PRODUCTS);
      setLastSyncAt(new Date().toISOString());
    } catch {
      setStatus('error');
      setError('No se pudo conectar con Shopify. Intenta nuevamente.');
    }
  };

  const handleSync = async () => {
    if (status !== 'connected') return;

    setStatus('connecting');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus('connected');
      setLastSyncAt(new Date().toISOString());
    } catch {
      setStatus('error');
      setError('No se pudo sincronizar los productos.');
    }
  };

  const handleDisconnect = () => {
    setStatus('disconnected');
    setError(null);
    setLastSyncAt(null);
    setSyncedProducts([]);
    setShopDomain('');
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-brand-500/20 bg-brand-500/10 px-4 py-3">
        <p className="text-[13px] text-brand-200 leading-relaxed">
          Con esta integración podrás traer catálogo, imágenes, precios y datos de tienda para entrenar el bot.
        </p>
      </div>

      <div className="space-y-3">
        <label className="text-[13px] font-medium text-slate-300">Dominio Shopify</label>
        <input
          value={shopDomain}
          onChange={(e) => setShopDomain(e.target.value)}
          placeholder="mi-tienda.myshopify.com"
          disabled={status === 'connecting' || status === 'connected'}
          className="w-full bg-app-bg border border-app-line rounded-xl px-3 py-2.5 text-[14px] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:opacity-70"
        />
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2">
          <AlertCircle className="size-4 text-rose-400 mt-0.5 shrink-0" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={handleConnect}
          disabled={!hasOrganization || status === 'connecting' || status === 'connected'}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold bg-brand-500 text-white hover:bg-brand-400 border border-brand-400/30 shadow-lg shadow-brand-500/20 disabled:opacity-60 transition-colors"
        >
          {status === 'connecting' ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Conectando...
            </>
          ) : (
            <>
              <Store className="size-4" />
              Conectar tienda de Shopify
            </>
          )}
        </button>

        {status === 'connected' && (
          <>
            <button
              type="button"
              onClick={handleSync}
              disabled={status === 'connecting'}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold bg-white/[0.06] text-slate-200 hover:bg-white/[0.09] border border-app-line transition-colors"
            >
              <RefreshCw className={`size-4 ${status === 'connecting' ? 'animate-spin' : ''}`} />
              Sincronizar productos
            </button>

            <button
              type="button"
              onClick={handleDisconnect}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
            >
              Desconectar
            </button>
          </>
        )}
      </div>

      {status === 'connected' && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="size-5 text-emerald-400 mt-0.5" />
              <div>
                <p className="text-[14px] font-semibold text-emerald-300">Tienda conectada correctamente</p>
                <p className="text-[13px] text-emerald-200/90 mt-0.5">
                  El sistema puede sincronizar catálogo y usar la data para entrenamiento del bot.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/[0.08] px-2 py-1 text-[11px] font-semibold text-slate-300">
              <ShoppingBag className="size-3.5" />
              {syncedProducts.length} productos
            </span>
          </div>

          {lastSyncAt && (
            <p className="text-[12px] text-slate-300 mt-3">
              Última sincronización: {new Date(lastSyncAt).toLocaleString()}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {syncedProducts.map((product) => (
              <div key={product.id} className="rounded-lg border border-app-line bg-app-card overflow-hidden">
                <img src={product.image} alt={product.title} className="w-full h-24 object-cover" />
                <div className="p-2.5">
                  <p className="text-[12px] font-medium text-slate-200 truncate">{product.title}</p>
                  <p className="text-[12px] text-emerald-400 mt-0.5">{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[12px] text-slate-500 leading-relaxed">
        Nota: esta es la base visual de la nueva sección. En la siguiente fase conectamos OAuth real de Shopify,
        sincronización persistente y guardado en base de datos para entrenamiento automático.
      </p>

    </div>
  );
}
