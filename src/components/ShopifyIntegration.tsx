import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Radio, RefreshCw, Store } from 'lucide-react';
import { createClient } from '../lib/supabase';

interface ShopifyIntegrationProps {
  organizationId: string;
}

type ShopifyStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

function ts() {
  return new Date().toISOString().slice(11, 23);
}

export default function ShopifyIntegration({ organizationId }: ShopifyIntegrationProps) {
  const hasOrganization = Boolean(organizationId);
  const [shopDomain, setShopDomain] = useState('');
  const [status, setStatus] = useState<ShopifyStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [connectedShop, setConnectedShop] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [syncedCount, setSyncedCount] = useState<number | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [webhooksRegistering, setWebhooksRegistering] = useState(false);
  const [activityLog, setActivityLog] = useState<string[]>([]);
  const supabase = createClient();

  const pushLog = (line: string) => {
    const full = `[${ts()}] ${line}`;
    console.info('[ShopifyIntegration]', full);
    setActivityLog((prev) => [...prev.slice(-12), full]);
  };

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
      const shop = data.integration.shop_domain || null;
      setConnectedShop(shop);
      if (shop && !shopDomain.trim()) {
        setShopDomain(shop);
      }
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
    if (status !== 'connected' || syncInProgress) return;

    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/api/shopify/sync-products`
        : '/api/shopify/sync-products';

    pushLog('Botón Sincronizar: inicio');
    pushLog(`POST ${url}`);
    pushLog(`organizationId=${organizationId}`);

    console.groupCollapsed('[ShopifyIntegration] SYNC — trazado completo');
    console.info('Tienda', connectedShop || normalizedDomain);
    console.info('URL', url);

    setError(null);
    setSyncInProgress(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        pushLog('ERROR: sin token de sesión');
        throw new Error('Tu sesión expiró, vuelve a iniciar sesión');
      }
      pushLog('Token de sesión OK (longitud ' + token.length + ')');

      const res = await fetch('/api/shopify/sync-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ organizationId }),
      });

      const rawText = await res.clone().text();
      pushLog(`HTTP ${res.status} ${res.statusText}`);

      let data: Record<string, unknown> = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        pushLog('Respuesta no es JSON (primeros 200 chars): ' + rawText.slice(0, 200));
        console.warn('[ShopifyIntegration] Body raw', rawText.slice(0, 800));
        throw new Error('El servidor no devolvió JSON. ¿Existe /api/shopify/sync-products en este deploy?');
      }

      if (data.requestId) {
        pushLog(`requestId servidor: ${data.requestId}`);
        console.info('requestId', data.requestId);
      }
      console.info('JSON respuesta', data);

      if (!res.ok) {
        const msg =
          (typeof data.error === 'string' && data.error) ||
          (typeof data.detail === 'string' && data.detail) ||
          `Error HTTP ${res.status}`;
        pushLog('ERROR: ' + msg);
        throw new Error(msg);
      }

      const n = typeof data.synced === 'number' ? data.synced : 0;
      pushLog(`OK: ${n} productos sincronizados`);
      if (typeof data.message === 'string' && data.message) pushLog(String(data.message));

      setSyncedCount(n);
      setLastSyncAt(new Date().toISOString());
      await loadStatus();
      console.info('Sync terminado OK', { synced: n });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      pushLog('EXCEPCIÓN: ' + msg);
      console.error('[ShopifyIntegration] Manual sync error', err);
      setError(msg || 'No se pudo sincronizar los productos.');
    } finally {
      setSyncInProgress(false);
      console.groupEnd();
    }
  };

  const handleRegisterWebhooks = async () => {
    if (status !== 'connected' || webhooksRegistering) return;
    pushLog('Activar avisos automáticos (webhooks)…');
    setError(null);
    setWebhooksRegistering(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Tu sesión expiró, vuelve a iniciar sesión');
      }
      const res = await fetch('/api/shopify/register-webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ organizationId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data.error as string) || 'No se pudieron registrar los avisos automáticos');
      }
      pushLog('Listo: cuando cambies productos en Shopify, se actualizarán aquí (sin pulsar sincronizar).');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      pushLog('Error: ' + msg);
      setError(msg);
    } finally {
      setWebhooksRegistering(false);
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
        <div className="rounded-[22px] border border-app-line bg-app-field/50 p-4 sm:p-5 space-y-3">
          <label className="block text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
            Dominio Shopify
          </label>
          <p className="text-[12px] text-slate-500 leading-snug mb-1">
            Formato: <span className="text-slate-400 font-medium">tu-tienda.myshopify.com</span> (sin https://)
          </p>
          <input
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={shopDomain}
            onChange={(e) => setShopDomain(e.target.value)}
            placeholder="mi-tienda.myshopify.com"
            disabled={status === 'connecting' || status === 'connected'}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-app-field border border-app-line text-app-ink placeholder:text-app-muted focus:outline-none focus:ring-2 focus:ring-app-charcoal/15 focus:border-app-charcoal/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-[14px] font-semibold bg-app-charcoal text-white hover:bg-black shadow-md disabled:opacity-60 transition-colors"
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
              disabled={syncInProgress || webhooksRegistering}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-[14px] font-semibold bg-white text-app-ink hover:bg-app-field border border-app-line transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`size-4 ${syncInProgress ? 'animate-spin' : ''}`} />
              {syncInProgress ? 'Sincronizando…' : 'Sincronizar productos'}
            </button>

            <button
              type="button"
              onClick={handleRegisterWebhooks}
              disabled={syncInProgress || webhooksRegistering}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-[14px] font-semibold bg-white text-app-ink hover:bg-app-field border border-app-line transition-colors disabled:opacity-60"
              title="Registra avisos en Shopify para que los cambios de productos lleguen solos"
            >
              <Radio className={`size-4 ${webhooksRegistering ? 'animate-pulse' : ''}`} />
              {webhooksRegistering ? 'Activando avisos…' : 'Actualización automática'}
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
        <div className="rounded-xl border border-app-line bg-app-field p-3 font-mono text-[11px] text-app-muted space-y-1 max-h-44 overflow-y-auto">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Resumen de sincronización</p>
          {activityLog.length === 0 ? (
            <p className="text-slate-500 text-[11px] font-sans leading-relaxed">
              Cuando pulses <span className="text-slate-400">Sincronizar productos</span>, aquí verás el avance y cualquier
              mensaje útil si algo falla.
            </p>
          ) : (
            activityLog.map((line, i) => (
              <div key={i} className="break-all text-slate-400">
                {line}
              </div>
            ))
          )}
        </div>
      )}

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
        Al sincronizar, tus productos de Shopify se copian aquí para usarlos en el CRM y el bot. El recuadro de arriba te
        muestra cómo va el proceso. Si algo no sale bien, anota el mensaje que aparezca o la hora aproximada y escríbenos:
        con eso podemos revisarlo contigo sin complicaciones.
      </p>

    </div>
  );
}
