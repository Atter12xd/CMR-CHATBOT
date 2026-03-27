import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Store } from 'lucide-react';
import { createClient } from '../lib/supabase';

interface ShopifyIntegrationProps {
  organizationId: string;
}

type ShopifyStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export default function ShopifyIntegration({ organizationId }: ShopifyIntegrationProps) {
  const hasOrganization = Boolean(organizationId);
  const [shopDomain, setShopDomain] = useState('');
  const [status, setStatus] = useState<ShopifyStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [connectedShop, setConnectedShop] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [syncedCount, setSyncedCount] = useState<number | null>(null);
  const supabase = createClient();

  const normalizedDomain = useMemo(() => {
    return shopDomain.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
  }, [shopDomain]);

  const getAccessToken = async (): Promise<string | null> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  const loadStatus = async () => {
    if (!hasOrganization) {
      setLoadingStatus(false);
      return;
    }

    try {
      setLoadingStatus(true);
      const token = await getAccessToken();
      if (!token) {
        console.warn('[ShopifyIntegration] No session token while loading status');
        setStatus('disconnected');
        return;
      }

      const res = await fetch(`/api/shopify/status?organizationId=${encodeURIComponent(organizationId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      console.info('[ShopifyIntegration] Status response', data);

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo cargar estado de Shopify');
      }

      if (!data.integration) {
        setStatus('disconnected');
        setConnectedShop(null);
        return;
      }

      setStatus(data.integration.status === 'connected' ? 'connected' : 'disconnected');
      setConnectedShop(data.integration.shop_domain || null);
      setLastSyncAt(data.integration.last_sync_at || data.integration.connected_at || null);
      if (data.integration.error_message) {
        setError(data.integration.error_message);
      }
    } catch (err: any) {
      console.error('[ShopifyIntegration] loadStatus error', err);
      setStatus('error');
      setError(err.message || 'No se pudo cargar estado de Shopify');
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, [organizationId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const shopifyState = params.get('shopify');
    const message = params.get('message');
    const requestId = params.get('requestId');
    const shop = params.get('shop');
    if (!shopifyState) return;

    console.info('[ShopifyIntegration] OAuth redirect params', {
      shopifyState,
      message,
      requestId,
      shop,
    });

    if (shopifyState === 'connected') {
      setStatus('connected');
      setConnectedShop(shop || connectedShop);
      setError(null);
      setLastSyncAt(new Date().toISOString());
      loadStatus();
    } else if (shopifyState === 'error') {
      setStatus('error');
      setError(message || 'Error conectando con Shopify');
    }

    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete('shopify');
    cleanUrl.searchParams.delete('message');
    cleanUrl.searchParams.delete('requestId');
    cleanUrl.searchParams.delete('shop');
    window.history.replaceState({}, '', cleanUrl.pathname + cleanUrl.search);
  }, []);

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
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Tu sesión expiró, vuelve a iniciar sesión');
      }

      const res = await fetch('/api/shopify/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shopDomain: normalizedDomain,
          organizationId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      console.info('[ShopifyIntegration] Connect response', data);

      if (!res.ok || !data.authUrl) {
        throw new Error(data.error || 'No se pudo iniciar conexión OAuth');
      }

      window.location.href = data.authUrl as string;
    } catch (err: any) {
      console.error('[ShopifyIntegration] handleConnect error', err);
      setStatus('error');
      setError(err.message || 'No se pudo conectar con Shopify. Intenta nuevamente.');
    }
  };

  const handleSync = async () => {
    if (status !== 'connected') return;

    console.info('[ShopifyIntegration] Manual sync requested', {
      organizationId,
      shop: connectedShop || normalizedDomain,
    });
    setError(null);
    setStatus('connecting');
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Tu sesión expiró, vuelve a iniciar sesión');
      }

      const res = await fetch('/api/shopify/sync-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ organizationId }),
      });
      const data = await res.json().catch(() => ({}));
      console.info('[ShopifyIntegration] Sync response', data);

      if (!res.ok) {
        throw new Error(data.error || data.detail || 'No se pudo sincronizar productos');
      }

      setStatus('connected');
      setSyncedCount(typeof data.synced === 'number' ? data.synced : 0);
      setLastSyncAt(new Date().toISOString());
      await loadStatus();
      console.info('[ShopifyIntegration] Manual sync finished', { synced: data.synced });
    } catch (err) {
      console.error('[ShopifyIntegration] Manual sync error', err);
      setStatus('connected');
      setError(err instanceof Error ? err.message : 'No se pudo sincronizar los productos.');
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('¿Seguro que deseas desconectar Shopify?')) return;

    try {
      setStatus('connecting');
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Tu sesión expiró, vuelve a iniciar sesión');
      }

      const res = await fetch('/api/shopify/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ organizationId }),
      });
      const data = await res.json().catch(() => ({}));
      console.info('[ShopifyIntegration] Disconnect response', data);

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo desconectar');
      }

      setStatus('disconnected');
      setError(null);
      setLastSyncAt(null);
      setConnectedShop(null);
      setShopDomain('');
    } catch (err: any) {
      console.error('[ShopifyIntegration] handleDisconnect error', err);
      setStatus('error');
      setError(err.message || 'No se pudo desconectar Shopify');
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-brand-500/20 bg-brand-500/10 px-4 py-3">
        <p className="text-[13px] text-brand-200 leading-relaxed">
          Con esta integración podrás traer catálogo, imágenes, precios y datos de tienda para entrenar el bot.
        </p>
      </div>

      {loadingStatus ? (
        <div className="flex items-center gap-2 text-[13px] text-slate-400">
          <Loader2 className="size-4 animate-spin" />
          Cargando estado de Shopify...
        </div>
      ) : (
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
      )}

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
          disabled={!hasOrganization || loadingStatus || status === 'connecting' || status === 'connected'}
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
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="size-5 text-emerald-400 mt-0.5" />
            <div>
              <p className="text-[14px] font-semibold text-emerald-300">Tienda conectada correctamente</p>
              <p className="text-[13px] text-emerald-200/90 mt-0.5">
                Tienda: <span className="font-semibold">{connectedShop || normalizedDomain}</span>
              </p>
              <p className="text-[13px] text-emerald-200/90 mt-0.5">
                Pulsa sincronizar para traer catálogo a tu CRM (productos, precios, imágenes).
              </p>
              {syncedCount != null && (
                <p className="text-[12px] text-slate-300 mt-2">
                  Última sync: <span className="font-semibold text-emerald-200">{syncedCount}</span> productos
                  guardados en el sistema.
                </p>
              )}
            </div>
          </div>

          {lastSyncAt && (
            <p className="text-[12px] text-slate-300 mt-3">
              Última sincronización: {new Date(lastSyncAt).toLocaleString()}
            </p>
          )}

        </div>
      )}

      <p className="text-[12px] text-slate-500 leading-relaxed">
        Nota: abre la consola del navegador y revisa logs con prefijo [ShopifyIntegration]. En el servidor
        (Vercel/Railway) verás logs con requestId para diagnosticar errores exactos.
      </p>

    </div>
  );
}
