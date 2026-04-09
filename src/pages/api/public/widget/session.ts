import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import {
  assertWidgetOriginAllowed,
  isValidVisitorId,
  jsonResponse,
  widgetCorsHeaders,
  type WidgetOrgRow,
} from '../../../../lib/web-widget/http';

export const prerender = false;

export const OPTIONS: APIRoute = ({ request }) =>
  new Response(null, { status: 204, headers: widgetCorsHeaders(request) });

export const POST: APIRoute = async ({ request }) => {
  let body: { siteKey?: string; visitorId?: string };
  try {
    body = await request.json();
  } catch {
    return jsonResponse(request, { error: 'JSON inválido' }, 400);
  }

  const siteKey = typeof body.siteKey === 'string' ? body.siteKey.trim() : '';
  const visitorId = body.visitorId;

  if (!siteKey || !isValidVisitorId(visitorId)) {
    return jsonResponse(request, { error: 'siteKey o visitorId inválido' }, 400);
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return jsonResponse(request, { error: 'Servidor no configurado' }, 500);
  }

  const db = createClient(supabaseUrl, serviceKey);

  const { data: org, error: orgErr } = await db
    .from('organizations')
    .select('id, name, openai_api_key, web_widget_allowed_origins')
    .eq('web_widget_public_key', siteKey)
    .maybeSingle();

  if (orgErr || !org) {
    return jsonResponse(request, { error: 'Clave de sitio no válida' }, 401);
  }

  const orgRow = org as WidgetOrgRow;
  if (!assertWidgetOriginAllowed(orgRow, request)) {
    return jsonResponse(request, { error: 'Origen no permitido para este widget' }, 403);
  }

  const { data: existing } = await db
    .from('chats')
    .select('id')
    .eq('organization_id', orgRow.id)
    .eq('platform', 'web')
    .eq('platform_conversation_id', visitorId)
    .maybeSingle();

  if (existing?.id) {
    await db
      .from('chats')
      .update({ last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', existing.id);

    return jsonResponse(request, { chatId: existing.id });
  }

  const short = visitorId.replace(/-/g, '').slice(0, 8);
  const { data: created, error: insErr } = await db
    .from('chats')
    .insert({
      organization_id: orgRow.id,
      customer_name: `Visitante web ${short}`,
      customer_phone: null,
      platform: 'web',
      platform_conversation_id: visitorId,
      status: 'active',
      bot_active: true,
      last_message_at: new Date().toISOString(),
      unread_count: 0,
    })
    .select('id')
    .single();

  if (insErr || !created) {
    console.error('[widget/session] insert chat', insErr);
    return jsonResponse(request, { error: 'No se pudo crear la conversación' }, 500);
  }

  return jsonResponse(request, { chatId: (created as { id: string }).id });
};
