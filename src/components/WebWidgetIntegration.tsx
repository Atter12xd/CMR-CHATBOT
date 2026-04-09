import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, Copy, Globe, Loader2, RefreshCw, Shield } from 'lucide-react';
import { createClient } from '../lib/supabase';

interface WebWidgetIntegrationProps {
  organizationId: string;
}

export default function WebWidgetIntegration({ organizationId }: WebWidgetIntegrationProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [allowedText, setAllowedText] = useState('');
  const [snippet, setSnippet] = useState('');
  const [snippetIframe, setSnippetIframe] = useState('');
  const [snippetLoader, setSnippetLoader] = useState('');
  const [snippetConsoleBridge, setSnippetConsoleBridge] = useState('');
  const [parentConsoleOneLiner, setParentConsoleOneLiner] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedIframe, setCopiedIframe] = useState(false);
  const [copiedLoader, setCopiedLoader] = useState(false);
  const [copiedBridge, setCopiedBridge] = useState(false);
  const [copiedOneLiner, setCopiedOneLiner] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const getToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        setError('Inicia sesión para gestionar el widget.');
        return;
      }
      const res = await fetch(`/api/web-widget/settings?organizationId=${encodeURIComponent(organizationId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo cargar');
      setPublicKey(data.publicKey || null);
      const list = Array.isArray(data.allowedOrigins) ? data.allowedOrigins : [];
      setAllowedText(list.join('\n'));
      setSnippet(data.snippet || '');
      setSnippetIframe(data.snippetIframe || '');
      setSnippetLoader(data.snippetLoader || '');
      setSnippetConsoleBridge(data.snippetConsoleBridge || '');
      setParentConsoleOneLiner(data.parentConsoleOneLiner || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    load();
  }, [load]);

  const saveOrigins = async () => {
    setSaving(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        setError('Inicia sesión.');
        return;
      }
      const lines = allowedText
        .split(/[\n,;]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch('/api/web-widget/settings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organizationId, allowedOrigins: lines }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar');
      setSnippet(data.snippet || snippet);
      setSnippetIframe(data.snippetIframe || '');
      setSnippetLoader(data.snippetLoader || '');
      setSnippetConsoleBridge(data.snippetConsoleBridge || '');
      setParentConsoleOneLiner(data.parentConsoleOneLiner || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const generateKey = async () => {
    setGenerating(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        setError('Inicia sesión.');
        return;
      }
      const res = await fetch('/api/web-widget/settings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organizationId, rotateKey: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo generar la clave');
      setPublicKey(data.publicKey || null);
      setSnippet(data.snippet || '');
      setSnippetIframe(data.snippetIframe || '');
      setSnippetLoader(data.snippetLoader || '');
      setSnippetConsoleBridge(data.snippetConsoleBridge || '');
      setParentConsoleOneLiner(data.parentConsoleOneLiner || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setGenerating(false);
    }
  };

  const copySnippet = async () => {
    if (!snippet) return;
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('No se pudo copiar al portapapeles.');
    }
  };

  const copySnippetIframe = async () => {
    if (!snippetIframe) return;
    try {
      await navigator.clipboard.writeText(snippetIframe);
      setCopiedIframe(true);
      setTimeout(() => setCopiedIframe(false), 2000);
    } catch {
      setError('No se pudo copiar.');
    }
  };

  const copySnippetLoader = async () => {
    if (!snippetLoader) return;
    try {
      await navigator.clipboard.writeText(snippetLoader);
      setCopiedLoader(true);
      setTimeout(() => setCopiedLoader(false), 2000);
    } catch {
      setError('No se pudo copiar.');
    }
  };

  const copyBridge = async () => {
    if (!snippetConsoleBridge) return;
    try {
      await navigator.clipboard.writeText(snippetConsoleBridge);
      setCopiedBridge(true);
      setTimeout(() => setCopiedBridge(false), 2000);
    } catch {
      setError('No se pudo copiar.');
    }
  };

  const copyOneLiner = async () => {
    if (!parentConsoleOneLiner) return;
    try {
      await navigator.clipboard.writeText(parentConsoleOneLiner);
      setCopiedOneLiner(true);
      setTimeout(() => setCopiedOneLiner(false), 2000);
    } catch {
      setError('No se pudo copiar.');
    }
  };

  const copyKeyOnly = async () => {
    if (!publicKey) return;
    try {
      await navigator.clipboard.writeText(publicKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {
      setError('No se pudo copiar la clave.');
    }
  };

  const hasAdvanced =
    Boolean(snippetIframe || snippetLoader || snippetConsoleBridge || parentConsoleOneLiner || publicKey);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-app-muted text-[14px]">
        <Loader2 className="size-4 animate-spin" />
        Cargando…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <p className="text-[13px] text-rose-600 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">{error}</p>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        {!publicKey ? (
          <div className="space-y-2">
            <p className="text-[13px] text-app-muted leading-relaxed">
              Genera tu código en un clic. Luego solo tendrás que pegarlo en tu web.
            </p>
            <button
              type="button"
              onClick={generateKey}
              disabled={generating}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {generating ? <Loader2 className="size-4 animate-spin" /> : <Globe className="size-4" />}
              Obtener código para mi web
            </button>
          </div>
        ) : (
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-[13px] text-app-muted leading-relaxed">
              Copia el <strong>recuadro de abajo</strong> y pégalo en tu página (pie de página, “HTML personalizado” o
              donde tu plataforma lo permita). El código ya incluye todo lo necesario.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={generateKey}
                disabled={generating}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold border border-app-line text-app-muted hover:bg-app-field/80 hover:text-app-ink disabled:opacity-60"
              >
                <RefreshCw className={`size-3 ${generating ? 'animate-spin' : ''}`} />
                Generar código nuevo
              </button>
              <span className="text-[11px] text-app-muted">Solo si crees que alguien copió tu instalación sin permiso.</span>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-app-line bg-app-field/40 p-4 space-y-2">
        <div className="flex items-center gap-2 text-app-ink font-semibold text-[14px]">
          <Shield className="size-4 text-brand-600" />
          ¿En qué sitios puede usarse? (opcional)
        </div>
        <p className="text-[12px] text-app-muted leading-relaxed">
          Si conoces el dominio de tu web (ej. <span className="font-medium text-app-ink">mitienda.com</span>), puedes
          escribirlo aquí para mayor seguridad. Si no estás seguro, déjalo vacío y quien te arme la página lo puede
          completar después.
        </p>
        <textarea
          value={allowedText}
          onChange={(e) => setAllowedText(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-app-line bg-ref-card text-app-ink text-[13px] px-3 py-2 font-mono"
          placeholder={'mitienda.com\nwww.mitienda.com'}
        />
        <button
          type="button"
          onClick={saveOrigins}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-app-ink text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          Guardar
        </button>
      </div>

      {snippet && (
        <div className="rounded-xl border-2 border-brand-500/25 bg-brand-500/[0.06] p-4 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[15px] font-semibold text-app-ink">Paso 1: copiar y pegar</span>
            <button
              type="button"
              onClick={copySnippet}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600"
            >
              <Copy className="size-4" />
              {copied ? '¡Copiado!' : 'Copiar código'}
            </button>
          </div>
          <pre className="text-[11px] text-app-muted overflow-x-auto p-3 rounded-lg bg-ref-card border border-app-line whitespace-pre-wrap break-all">
            {snippet}
          </pre>
          <p className="text-[12px] text-app-muted leading-relaxed">
            Debe pegarse el <strong>bloque entero</strong> (desde <code className="text-[10px]">&lt;script</code> hasta{' '}
            <code className="text-[10px]">&lt;/script&gt;</code>). Si solo pegas un enlace suelto, no funcionará.
          </p>
        </div>
      )}

      {publicKey && hasAdvanced && (
        <details className="group rounded-xl border border-app-line bg-app-field/30 overflow-hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-[13px] font-semibold text-app-ink hover:bg-app-field/50 [&::-webkit-details-marker]:hidden">
            <span>No funciona, o te ayuda alguien con la técnica</span>
            <ChevronDown className="size-4 shrink-0 text-app-muted transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-4 pb-4 pt-0 space-y-5 border-t border-app-line/80">
            <p className="text-[12px] text-app-muted leading-relaxed pt-3">
              La mayoría de webs solo necesitan el código de arriba. Si tu plantilla bloquea scripts, prueba la ventana
              incrustada. Si aún falla, un técnico puede usar el cargador automático.
            </p>

            {snippetIframe && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[13px] font-semibold text-app-ink">Opción: ventana de chat (iframe)</span>
                  <button
                    type="button"
                    onClick={copySnippetIframe}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-600 hover:text-brand-500"
                  >
                    <Copy className="size-3.5" />
                    {copiedIframe ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <pre className="text-[11px] text-app-muted overflow-x-auto p-3 rounded-lg bg-ref-card border border-app-line whitespace-pre-wrap break-all">
                  {snippetIframe}
                </pre>
              </div>
            )}

            {snippetLoader && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[13px] font-semibold text-app-ink">Si la web “borra” el marco al publicar</span>
                  <button
                    type="button"
                    onClick={copySnippetLoader}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-600 hover:text-brand-500"
                  >
                    <Copy className="size-3.5" />
                    {copiedLoader ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <pre className="text-[11px] text-app-muted overflow-x-auto p-3 rounded-lg bg-ref-card border border-app-line whitespace-pre-wrap break-all">
                  {snippetLoader}
                </pre>
              </div>
            )}

            {publicKey && (
              <div className="space-y-2">
                <span className="text-[13px] font-semibold text-app-ink">Si solo te piden la clave (texto largo)</span>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <input
                    type="text"
                    readOnly
                    value={publicKey}
                    className="flex-1 rounded-xl border border-app-line bg-ref-card text-app-ink text-[12px] px-3 py-2 font-mono"
                    aria-label="Clave del widget"
                  />
                  <button
                    type="button"
                    onClick={copyKeyOnly}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border border-app-line text-app-ink hover:bg-app-field/80 shrink-0"
                  >
                    <Copy className="size-4" />
                    {copiedKey ? 'Copiada' : 'Copiar clave'}
                  </button>
                </div>
              </div>
            )}

            {(snippetConsoleBridge || parentConsoleOneLiner) && (
              <div className="space-y-2 rounded-lg bg-app-field/50 p-3 border border-app-line/80">
                <span className="text-[12px] font-semibold text-app-ink">Para soporte (mensajes de diagnóstico)</span>
                <p className="text-[11px] text-app-muted leading-relaxed">
                  Solo si alguien de soporte te lo pide: va <strong>antes</strong> del iframe, si usas esa opción.
                </p>
                {snippetConsoleBridge && (
                  <>
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={copyBridge}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-600 hover:text-brand-500"
                      >
                        <Copy className="size-3.5" />
                        {copiedBridge ? 'Copiado' : 'Copiar script'}
                      </button>
                    </div>
                    <pre className="text-[10px] text-app-muted overflow-x-auto p-2 rounded-md bg-ref-card border border-app-line whitespace-pre-wrap break-all">
                      {snippetConsoleBridge}
                    </pre>
                  </>
                )}
                {parentConsoleOneLiner && (
                  <div className="space-y-1 pt-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] text-app-muted">Una línea para pegar en la consola (F12)</span>
                      <button
                        type="button"
                        onClick={copyOneLiner}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-600 hover:text-brand-500"
                      >
                        <Copy className="size-3.5" />
                        {copiedOneLiner ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                    <pre className="text-[9px] text-app-muted overflow-x-auto p-2 rounded-md bg-ref-card border border-app-line whitespace-pre-wrap break-all">
                      {parentConsoleOneLiner}
                    </pre>
                  </div>
                )}
                <p className="text-[11px] text-app-muted pt-1">
                  Página de prueba:{' '}
                  <a
                    href="/widget-embed-test.html"
                    className="text-brand-600 hover:text-brand-500 font-medium"
                    target="_blank"
                    rel="noreferrer"
                  >
                    widget-embed-test.html
                  </a>
                  . En el script puedes añadir <code className="text-[10px]">data-debug=&quot;true&quot;</code> para más
                  detalle en consola.
                </p>
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );
}
