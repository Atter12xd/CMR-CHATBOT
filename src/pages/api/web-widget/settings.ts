import type { APIRoute } from 'astro';
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { resolvePublicSiteUrl } from '../../../lib/shopify-public-url';

export const prerender = false;

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

  const publicKey = row?.web_widget_public_key as string | null;
  const allowedOrigins = (row?.web_widget_allowed_origins as string[] | null) ?? null;

  const base = resolvePublicSiteUrl(request);
  const scriptUrl = `${base}/widget.js`;
  const snippet = publicKey
    ? `<script src="${scriptUrl}" data-site-key="${publicKey}" defer></script>`
    : '';

  return new Response(
    JSON.stringify({
      publicKey,
      allowedOrigins: allowedOrigins ?? [],
      scriptUrl,
      snippet,
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
  if (body.rotateKey) {
    nextKey = randomBytes(32).toString('hex');
  }

  const originsUpdate =
    body.allowedOrigins !== undefined ? parseAllowedOriginsInput(body.allowedOrigins) : undefined;

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.rotateKey && nextKey) {
    patch.web_widget_public_key = nextKey;
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

  const { error: upErr } = await db.from('organizations').update(patch as never).eq('id', organizationId);
  if (upErr) {
    console.error('[web-widget/settings POST]', upErr);
    return new Response(JSON.stringify({ error: 'No se pudo guardar' }), {
      status: 500,
      headers: jsonHeaders,
    });
  }

  const base = resolvePublicSiteUrl(request);
  const scriptUrl = `${base}/widget.js`;
  const keyToShow = (body.rotateKey ? nextKey : (current?.web_widget_public_key as string | null)) || nextKey;
  const snippet = keyToShow
    ? `<script src="${scriptUrl}" data-site-key="${keyToShow}" defer></script>`
    : '';

  return new Response(
    JSON.stringify({
      publicKey: keyToShow,
      allowedOrigins: originsUpdate ?? [],
      scriptUrl,
      snippet,
    }),
    { status: 200, headers: jsonHeaders },
  );
};
