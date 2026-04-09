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
  const [copied, setCopied] = useState(false);

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
            Clave pública activa ({publicKey.slice(0, 10)}…). Puedes rotarla si se filtró.
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
              Usa <strong>defer</strong> como en el snippet. Si no ves la burbuja: bloqueadores, extensiones o CSP que bloqueen{' '}
              <code className="text-[10px]">wazapp.ai</code>.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
