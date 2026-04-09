import { useCallback, useEffect, useState } from 'react';
import { Copy, Globe, Loader2, RefreshCw, Shield } from 'lucide-react';
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
      setError('No se pudo copiar el iframe.');
    }
  };

  const copySnippetLoader = async () => {
    if (!snippetLoader) return;
    try {
      await navigator.clipboard.writeText(snippetLoader);
      setCopiedLoader(true);
      setTimeout(() => setCopiedLoader(false), 2000);
    } catch {
      setError('No se pudo copiar el loader.');
    }
  };

  const copyBridge = async () => {
    if (!snippetConsoleBridge) return;
    try {
      await navigator.clipboard.writeText(snippetConsoleBridge);
      setCopiedBridge(true);
      setTimeout(() => setCopiedBridge(false), 2000);
    } catch {
      setError('No se pudo copiar el bridge.');
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

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-app-muted text-[14px]">
        <Loader2 className="size-4 animate-spin" />
        Cargando widget web…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <p className="text-[13px] text-rose-600 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">{error}</p>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {!publicKey ? (
          <button
            type="button"
            onClick={generateKey}
            disabled={generating}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {generating ? <Loader2 className="size-4 animate-spin" /> : <Globe className="size-4" />}
            Generar clave del widget
          </button>
        ) : (
          <p className="text-[13px] text-app-muted">
            Ya tienes clave activa. Cópiala abajo y pégala en <code className="text-[11px]">data-site-key</code> de tu sitio.
            Rotar solo si se filtró.
          </p>
        )}
        {publicKey && (
          <button
            type="button"
            onClick={generateKey}
            disabled={generating}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold border border-app-line text-app-ink hover:bg-app-field/80 disabled:opacity-60"
          >
            <RefreshCw className={`size-3.5 ${generating ? 'animate-spin' : ''}`} />
            Rotar clave
          </button>
        )}
      </div>

      {publicKey && (
        <div className="rounded-xl border-2 border-brand-500/30 bg-brand-500/5 p-4 space-y-3">
          <p className="text-[13px] font-semibold text-app-ink">Dónde va la clave en tu web</p>
          <p className="text-[12px] text-app-muted leading-relaxed">
            El snippet copiado abajo pone la clave en la <strong>URL</strong>{' '}
            <code className="text-[11px] bg-app-field px-1 rounded">widget.js?siteKey=…</code> ({publicKey.length}{' '}
            caracteres). Muchos CMS <strong>recortan</strong> <code className="text-[11px]">data-site-key</code> a unos
            16 caracteres y el chat falla con 401; por eso usamos el parámetro <code className="text-[11px]">siteKey</code>.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <input
              type="text"
              readOnly
              value={publicKey}
              className="flex-1 rounded-xl border border-app-line bg-ref-card text-app-ink text-[12px] px-3 py-2 font-mono"
              aria-label="Clave pública del widget"
            />
            <button
              type="button"
              onClick={copyKeyOnly}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 shrink-0"
            >
              <Copy className="size-4" />
              {copiedKey ? 'Clave copiada' : 'Copiar clave'}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-app-line bg-app-field/40 p-4 space-y-2">
        <div className="flex items-center gap-2 text-app-ink font-semibold text-[14px]">
          <Shield className="size-4 text-brand-600" />
          Dominios permitidos (opcional)
        </div>
        <p className="text-[12px] text-app-muted leading-relaxed">
          Un dominio por línea (ej. <code className="text-[11px] bg-app-field px-1 rounded">mitienda.com</code>). Si
          dejas vacío, se acepta cualquier origen (solo recomendable en pruebas).
        </p>
        <textarea
          value={allowedText}
          onChange={(e) => setAllowedText(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-app-line bg-ref-card text-app-ink text-[13px] px-3 py-2 font-mono"
          placeholder="www.mitienda.com&#10;mitienda.com"
        />
        <button
          type="button"
          onClick={saveOrigins}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-app-ink text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          Guardar dominios
        </button>
      </div>

      {snippet && (
        <div className="rounded-xl border border-app-line bg-ref-card p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[14px] font-semibold text-app-ink">Código para tu web</span>
            <button
              type="button"
              onClick={copySnippet}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-600 hover:text-brand-500"
            >
              <Copy className="size-3.5" />
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <pre className="text-[11px] text-app-muted overflow-x-auto p-3 rounded-lg bg-app-field/80 border border-app-line whitespace-pre-wrap break-all">
            {snippet}
          </pre>
          <p className="text-[11px] text-app-muted leading-relaxed space-y-2">
            <span className="block">
              Debes pegar la <strong>etiqueta completa</strong> <code className="text-[10px]">&lt;script …&gt;&lt;/script&gt;</code>.
              Si solo pegas la URL del <code className="text-[10px]">.js</code> en el editor, verás texto/código: el navegador no ejecuta el
              widget así.
            </span>
            <span className="block">
              Prueba en producción:{' '}
              <a
                href="/widget-embed-test.html"
                className="text-brand-600 hover:text-brand-500 font-medium"
                target="_blank"
                rel="noreferrer"
              >
                /widget-embed-test.html
              </a>{' '}
              (pon tu clave o <code className="text-[10px]">?key=…</code>). Añade{' '}
              <code className="text-[10px]">data-debug=&quot;true&quot;</code> al script para ver logs{' '}
              <code className="text-[10px]">[Wazapp]</code> en la consola.
            </span>
            <span className="block">
              Pega el snippet <strong>tal cual</strong> (con <code className="text-[10px]">?siteKey=</code> largo). Si no ves la burbuja:
              bloqueadores o CSP que bloqueen <code className="text-[10px]">wazapp.ai</code>.
            </span>
          </p>
        </div>
      )}

      {snippetIframe && (
        <div className="rounded-xl border-2 border-brand-500/25 bg-brand-500/5 p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[14px] font-semibold text-app-ink">Si tu web bloquea scripts (CSP / CMS)</span>
            <button
              type="button"
              onClick={copySnippetIframe}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-600 hover:text-brand-500"
            >
              <Copy className="size-3.5" />
              {copiedIframe ? 'Copiado' : 'Copiar iframe'}
            </button>
          </div>
          <p className="text-[12px] text-app-muted leading-relaxed">
            Muchas plantillas <strong>no ejecutan</strong> <code className="text-[10px]">&lt;script src=&quot;…&quot;&gt;</code> externos.
            Este <code className="text-[10px]">&lt;iframe&gt;</code> suele pasar: pégalo antes de <code className="text-[10px]">&lt;/body&gt;</code> igual
            que el script. El chat corre dentro de wazapp.ai; la clave sigue siendo la misma. Si aún falla, la política CSP del sitio puede
            exigir <code className="text-[10px]">frame-src https://wazapp.ai</code>. Soporte: en consola elige el{' '}
            <strong>marco del iframe</strong> para ver líneas <code className="text-[10px]">[Wazapp]</code> y{' '}
            <code className="text-[10px]">[Wazapp iframe]</code>.
          </p>
          <pre className="text-[11px] text-app-muted overflow-x-auto p-3 rounded-lg bg-app-field/80 border border-app-line whitespace-pre-wrap break-all">
            {snippetIframe}
          </pre>
          <p className="text-[12px] font-semibold text-app-ink pt-2">Orden recomendado en el HTML del cliente</p>
          <ol className="text-[11px] text-app-muted list-decimal pl-5 space-y-1">
            <li>
              <strong>Bridge de consola</strong> (abajo): así los eventos del iframe aparecen en la consola de la web del
              cliente (no solo dentro del marco).
            </li>
            <li>
              El <strong>iframe</strong> del chat justo después.
            </li>
          </ol>
        </div>
      )}

      {snippetLoader && (
        <div className="rounded-xl border-2 border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[14px] font-semibold text-app-ink">Si en la web publicada no existe el iframe</span>
            <button
              type="button"
              onClick={copySnippetLoader}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-600 hover:text-brand-500"
            >
              <Copy className="size-3.5" />
              {copiedLoader ? 'Copiado' : 'Copiar loader (1 script)'}
            </button>
          </div>
          <p className="text-[12px] text-app-muted leading-relaxed">
            Si en tu archivo HTML <strong>sí</strong> está el <code className="text-[10px]">&lt;iframe wazapp…&gt;</code> pero en
            la página en vivo <code className="text-[10px]">document.querySelector(&apos;iframe[src*=&quot;wazapp&quot;]&apos;)</code> da{' '}
            <code className="text-[10px]">null</code>, el servidor o el editor <strong>está quitando el iframe</strong> al publicar.
            Prueba: <strong>Ver código fuente</strong> (<code className="text-[10px]">Ctrl+U</code>) en la URL real y busca{' '}
            <code className="text-[10px]">wazapp</code>. Si no aparece, usa <strong>solo</strong> esta línea (quita bridge + iframe del HTML):
            crea el iframe por JavaScript al cargar.
          </p>
          <pre className="text-[11px] text-app-muted overflow-x-auto p-3 rounded-lg bg-app-field/80 border border-app-line whitespace-pre-wrap break-all">
            {snippetLoader}
          </pre>
        </div>
      )}

      {snippetConsoleBridge && (
        <div className="rounded-xl border border-app-line bg-ref-card p-4 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[14px] font-semibold text-app-ink">Consola de la web del cliente (soporte)</span>
            <button
              type="button"
              onClick={copyBridge}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-600 hover:text-brand-500"
            >
              <Copy className="size-3.5" />
              {copiedBridge ? 'Copiado' : 'Copiar script bridge'}
            </button>
          </div>
          <p className="text-[12px] text-app-muted leading-relaxed">
            Los mensajes <code className="text-[10px]">[Wazapp]</code> del chat viven en la consola del{' '}
            <strong>iframe</strong>. En la pestaña normal del sitio (Loom, etc.) no los verás. Este script escucha{' '}
            <code className="text-[10px]">postMessage</code> y escribe <code className="text-[10px]">[Wazapp en tu web]</code>{' '}
            en la consola <strong>de esa misma página</strong>. Ponlo <strong>antes</strong> del iframe.
          </p>
          <pre className="text-[11px] text-app-muted overflow-x-auto p-3 rounded-lg bg-app-field/80 border border-app-line whitespace-pre-wrap break-all">
            {snippetConsoleBridge}
          </pre>
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
            <span className="text-[12px] text-app-muted">O pega <strong>una vez</strong> en la consola (F12) y recarga:</span>
            <button
              type="button"
              onClick={copyOneLiner}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-600 hover:text-brand-500"
            >
              <Copy className="size-3.5" />
              {copiedOneLiner ? 'Copiado' : 'Copiar una línea'}
            </button>
          </div>
          <pre className="text-[10px] text-app-muted overflow-x-auto p-3 rounded-lg bg-app-field/80 border border-app-line whitespace-pre-wrap break-all">
            {parentConsoleOneLiner}
          </pre>
        </div>
      )}
    </div>
  );
}
