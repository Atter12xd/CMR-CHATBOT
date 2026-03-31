import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;
const jsonHeaders = { 'Content-Type': 'application/json' };

function buildRequestId() {
  return `shopify_disconnect_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const POST: APIRoute = async ({ request }) => {
  const requestId = buildRequestId();
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '');
  const { organizationId } = await request.json().catch(() => ({}));

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

  const { error } = await supabaseAdmin
    .from('shopify_integrations')
    .update({
      status: 'disconnected',
      error_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq('organization_id', organizationId);
  if (error) {
    console.error(`[${requestId}] Failed to disconnect`, error);
    return new Response(JSON.stringify({ error: 'No se pudo desconectar', requestId }), {
      status: 500,
      headers: jsonHeaders,
    });
  }

  // Limpiar solo productos sincronizados desde Shopify de esta organización.
  const { error: deleteProductsError } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('organization_id', organizationId)
    .not('shopify_product_id', 'is', null);
  if (deleteProductsError) {
    console.error(`[${requestId}] Disconnected but failed to delete Shopify products`, deleteProductsError);
    return new Response(
      JSON.stringify({ error: 'Tienda desconectada, pero no se pudo limpiar el catálogo sincronizado', requestId }),
      { status: 500, headers: jsonHeaders },
    );
  }

  console.info(`[${requestId}] Shopify disconnected and synced products deleted`, { organizationId });
  return new Response(JSON.stringify({ ok: true, requestId }), { status: 200, headers: jsonHeaders });
};

