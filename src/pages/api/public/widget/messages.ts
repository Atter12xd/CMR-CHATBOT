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

export const GET: APIRoute = async ({ request, url }) => {
  const siteKey = (url.searchParams.get('siteKey') || '').trim();
  const chatId = (url.searchParams.get('chatId') || '').trim();
  const visitorId = url.searchParams.get('visitorId') || '';
  const after = url.searchParams.get('after') || '';

  if (!siteKey || !chatId || !isValidVisitorId(visitorId)) {
    return jsonResponse(request, { error: 'Parámetros incompletos' }, 400);
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
    return jsonResponse(request, { error: 'Origen no permitido' }, 403);
  }

  const { data: chat, error: chatErr } = await db
    .from('chats')
    .select('id, organization_id, platform, platform_conversation_id')
    .eq('id', chatId)
    .maybeSingle();

  if (chatErr || !chat) {
    return jsonResponse(request, { error: 'Chat no encontrado' }, 404);
  }

  if (
    chat.organization_id !== orgRow.id ||
    chat.platform !== 'web' ||
    chat.platform_conversation_id !== visitorId
  ) {
    return jsonResponse(request, { error: 'No autorizado' }, 403);
  }

  let query = db
    .from('messages')
    .select('id, sender, text, created_at')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (after) {
    query = query.gt('created_at', after);
  }

  const { data: rows, error: msgErr } = await query;

  if (msgErr) {
    console.error('[widget/messages]', msgErr);
    return jsonResponse(request, { error: 'No se pudieron cargar mensajes' }, 500);
  }

  return jsonResponse(request, { messages: rows || [] });
};
