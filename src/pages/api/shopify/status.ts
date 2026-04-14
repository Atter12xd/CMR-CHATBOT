import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { resolvePublicSiteUrl } from '../../../lib/shopify-public-url';

export const prerender = false;
const jsonHeaders = { 'Content-Type': 'application/json' };

function buildRequestId() {
  return `shopify_status_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const GET: APIRoute = async ({ request, url }) => {
  const requestId = buildRequestId();
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '');
  const organizationId = url.searchParams.get('organizationId');

  if (!token || !organizationId) {
    console.warn(`[${requestId}] Missing token or organizationId`);
    return new Response(
      JSON.stringify({ error: 'No autorizado o parámetros incompletos', requestId }),
      { status: 400, headers: jsonHeaders },
    );
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  const supabaseAnon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseAnon || !serviceKey) {
    console.error(`[${requestId}] Missing Supabase env vars`);
    return new Response(
      JSON.stringify({ error: 'Configuración del servidor incompleta', requestId }),
      { status: 500, headers: jsonHeaders },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);
  if (userError || !user) {
    console.warn(`[${requestId}] Invalid token`, userError?.message);
    return new Response(JSON.stringify({ error: 'Sesión inválida', requestId }), { status: 401, headers: jsonHeaders });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('id')
    .eq('id', organizationId)
    .eq('owner_id', user.id)
    .maybeSingle();
  if (!org) {
    console.warn(`[${requestId}] Organization access denied`, { organizationId, userId: user.id });
    return new Response(JSON.stringify({ error: 'No autorizado para esta organización', requestId }), {
      status: 403,
      headers: jsonHeaders,
    });
  }

  const { data, error } = await supabaseAdmin
    .from('shopify_integrations')
    .select('organization_id, shop_domain, status, scopes, connected_at, last_sync_at, error_message')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (error) {
    console.error(`[${requestId}] Failed to read shopify integration`, error);
    return new Response(JSON.stringify({ error: 'No se pudo cargar estado', requestId }), { status: 500, headers: jsonHeaders });
  }

  console.info(`[${requestId}] Status read success`, {
    organizationId,
    found: !!data,
    status: data?.status || 'none',
  });

  const shopifyApiKey = import.meta.env.SHOPIFY_API_KEY || process.env.SHOPIFY_API_KEY || '';
  const publicBaseUrl = resolvePublicSiteUrl(request);
  const themeEmbed =
    shopifyApiKey.length > 0
      ? {
          blockHandle: 'wazapp-chat-embed',
          clientId: shopifyApiKey,
          publicBaseUrl,
        }
      : null;

  return new Response(
    JSON.stringify({ integration: data || null, themeEmbed, requestId }),
    { status: 200, headers: jsonHeaders },
  );
};

