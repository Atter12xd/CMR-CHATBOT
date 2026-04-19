import type { APIRoute } from 'astro';
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { resolvePublicSiteUrl } from '../../../lib/shopify-public-url';
import { normalizeWidgetSiteKey } from '../../../lib/web-widget/site-key';

export const prerender = false;

/**
 * URL base del snippet `widget.js`: prioriza `site` de astro.config (p. ej. https://wazapp.ai).
 * Si solo usáramos el Origin del request, en `astro dev` saldría http://localhost:4321 y el widget
 * llamaría a la API local (otro .env / otra Supabase) → 401 aunque la clave exista en producción.
 */
function widgetScriptOrigin(request: Request): string {
  const site = String(import.meta.env.SITE || '')
    .trim()
    .replace(/\/+$/, '');
  if (site) return site;
  return resolvePublicSiteUrl(request);
}

const PARENT_CONSOLE_ONE_LINER =
  "window.addEventListener('message',function(e){if(e.data&&e.data.type==='wazapp-embed'){console.info('[Wazapp en tu web]',e.data.phase||'',e.data);}});";

function buildWidgetSnippets(origin: string, publicKey: string | null) {
  const bridgeUrl = `${origin}/wazapp-embed-console-bridge.js`;
  const snippetConsoleBridge = `<script src="${bridgeUrl}" defer></script>`;
  if (!publicKey) {
    return {
      snippet: '',
      snippetIframe: '',
      snippetLoader: '',
      iframeEmbedUrl: '',
      snippetConsoleBridge,
      parentConsoleOneLiner: PARENT_CONSOLE_ONE_LINER,
    };
  }
  const enc = encodeURIComponent(publicKey);
  const iframeEmbedUrl = `${origin}/widget-embed-iframe.html?siteKey=${enc}`;
  const snippet = `<script src="${origin}/widget.js?siteKey=${enc}" defer></script>`;
  const snippetIframe = `<iframe src="${iframeEmbedUrl}" title="Chat Wazapp" style="position:fixed;right:0;bottom:0;width:min(100vw,400px);height:min(100dvh,720px);max-height:720px;border:0;z-index:2147483647;background:transparent;visibility:visible;pointer-events:auto" allow="clipboard-write"></iframe>`;
  const snippetLoader = `<script src="${origin}/wazapp-embed-loader.js?siteKey=${enc}" defer></script>`;
  return {
    snippet,
    snippetIframe,
    snippetLoader,
    iframeEmbedUrl,
    snippetConsoleBridge,
    parentConsoleOneLiner: PARENT_CONSOLE_ONE_LINER,
  };
}

const jsonHeaders = { 'Content-Type': 'application/json' };

function normalizeHostname(line: string): string | null {
  const s = line.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
  return s || null;
}

function parseAllowedOriginsInput(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== 'string') continue;
    for (const part of item.split(/[\n,;]+/)) {
      const h = normalizeHostname(part);
      if (h) out.push(h);
    }
  }
  return [...new Set(out)];
}

async function assertOrgOwner(
  request: Request,
  organizationId: string,
): Promise<
  | { ok: true; supabaseUrl: string; serviceKey: string; userId: string }
  | { ok: false; status: number; body: Record<string, string> }
> {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '');
  if (!token || !organizationId) {
    return { ok: false, status: 400, body: { error: 'Sesión o organización no indicada' } };
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  const supabaseAnon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseAnon || !serviceKey) {
    return { ok: false, status: 500, body: { error: 'Configuración del servidor incompleta' } };
  }

  const supabase = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return { ok: false, status: 401, body: { error: 'Sesión inválida' } };
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('id')
    .eq('id', organizationId)
    .eq('owner_id', user.id)
    .maybeSingle();
  if (!org) {
    return { ok: false, status: 403, body: { error: 'No autorizado para esta organización' } };
  }

  return { ok: true, supabaseUrl, serviceKey, userId: user.id };
}

export const GET: APIRoute = async ({ request, url }) => {
  const organizationId = url.searchParams.get('organizationId') || '';
  const gate = await assertOrgOwner(request, organizationId);
  if (!gate.ok) {
    return new Response(JSON.stringify(gate.body), { status: gate.status, headers: jsonHeaders });
  }

  const db = createClient(gate.supabaseUrl, gate.serviceKey);
  const { data: row, error } = await db
    .from('organizations')
    .select('web_widget_public_key, web_widget_allowed_origins')
    .eq('id', organizationId)
    .single();

  if (error) {
    console.error('[web-widget/settings GET]', error);
    return new Response(JSON.stringify({ error: 'No se pudo leer configuración' }), {
      status: 500,
      headers: jsonHeaders,
    });
  }

  const rawKey = row?.web_widget_public_key as string | null;
  const publicKey = rawKey ? normalizeWidgetSiteKey(rawKey) : null;
  const allowedOrigins = (row?.web_widget_allowed_origins as string[] | null) ?? null;

  const origin = widgetScriptOrigin(request);
  const scriptUrl = `${origin}/widget.js`;
  const {
    snippet,
    snippetIframe,
    snippetLoader,
    iframeEmbedUrl,
    snippetConsoleBridge,
    parentConsoleOneLiner,
  } = buildWidgetSnippets(origin, publicKey);

  return new Response(
    JSON.stringify({
      publicKey,
      allowedOrigins: allowedOrigins ?? [],
      scriptUrl,
      snippet,
      snippetIframe,
      snippetLoader,
      iframeEmbedUrl,
      snippetConsoleBridge,
      parentConsoleOneLiner,
    }),
    { status: 200, headers: jsonHeaders },
  );
};

export const POST: APIRoute = async ({ request }) => {
  let body: {
    organizationId?: string;
    allowedOrigins?: string[];
    rotateKey?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: jsonHeaders });
  }

  const organizationId = typeof body.organizationId === 'string' ? body.organizationId.trim() : '';
  const gate = await assertOrgOwner(request, organizationId);
  if (!gate.ok) {
    return new Response(JSON.stringify(gate.body), { status: gate.status, headers: jsonHeaders });
  }

  const db = createClient(gate.supabaseUrl, gate.serviceKey);

  const { data: current } = await db
    .from('organizations')
    .select('web_widget_public_key')
    .eq('id', organizationId)
    .single();

  let nextKey = (current?.web_widget_public_key as string | null) ?? null;
  if (nextKey) nextKey = normalizeWidgetSiteKey(nextKey);
  if (body.rotateKey) {
    nextKey = normalizeWidgetSiteKey(randomBytes(32).toString('hex'));
  }

  const originsUpdate =
    body.allowedOrigins !== undefined ? parseAllowedOriginsInput(body.allowedOrigins) : undefined;

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.rotateKey && nextKey) {
    patch.web_widget_public_key = normalizeWidgetSiteKey(nextKey);
  }
  if (originsUpdate !== undefined) {
    patch.web_widget_allowed_origins = originsUpdate.length ? originsUpdate : null;
  }

  if (Object.keys(patch).length <= 1) {
    return new Response(JSON.stringify({ error: 'Nada que actualizar' }), {
      status: 400,
      headers: jsonHeaders,
    });
  }

  const { data: updatedRows, error: upErr } = await db
    .from('organizations')
    .update(patch as never)
    .eq('id', organizationId)
    .select('id, web_widget_public_key');

  if (upErr) {
    console.error('[web-widget/settings POST]', upErr);
    return new Response(
      JSON.stringify({
        error: 'No se pudo guardar',
        hint: upErr.message?.includes('web_widget') ? '¿Ejecutaste add_web_widget_to_organizations.sql en este proyecto de Supabase?' : undefined,
      }),
      { status: 500, headers: jsonHeaders },
    );
  }

  if (!updatedRows?.length) {
    return new Response(
      JSON.stringify({
        error: 'No se pudo guardar',
        hint:
          'No se actualizó ninguna fila: el id de organización no coincide con Supabase o Vercel apunta a otro proyecto (revisa PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY).',
      }),
      { status: 500, headers: jsonHeaders },
    );
  }

  const savedKeyRaw = (updatedRows[0] as { web_widget_public_key?: string | null }).web_widget_public_key;
  const savedKey = savedKeyRaw ? normalizeWidgetSiteKey(savedKeyRaw) : null;

  if (body.rotateKey && nextKey) {
    if (savedKey !== normalizeWidgetSiteKey(nextKey)) {
      return new Response(
        JSON.stringify({
          error: 'La clave no quedó guardada en la base de datos',
          hint:
            'Comprueba en Supabase → Table Editor → organizations que exista la columna web_widget_public_key y que Vercel use el service_role key del mismo proyecto.',
        }),
        { status: 500, headers: jsonHeaders },
      );
    }
  }

  const origin = widgetScriptOrigin(request);
  const scriptUrl = `${origin}/widget.js`;
  const keyToShow =
    body.rotateKey && nextKey
      ? normalizeWidgetSiteKey(nextKey)
      : savedKey || normalizeWidgetSiteKey((current?.web_widget_public_key as string | null) || '') || nextKey;
  const {
    snippet,
    snippetIframe,
    snippetLoader,
    iframeEmbedUrl,
    snippetConsoleBridge,
    parentConsoleOneLiner,
  } = buildWidgetSnippets(origin, keyToShow ? normalizeWidgetSiteKey(keyToShow) : null);

  return new Response(
    JSON.stringify({
      publicKey: keyToShow,
      allowedOrigins: originsUpdate ?? [],
      scriptUrl,
      snippet,
      snippetIframe,
      snippetLoader,
      iframeEmbedUrl,
      snippetConsoleBridge,
      parentConsoleOneLiner,
    }),
    { status: 200, headers: jsonHeaders },
  );
};
