import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { generateWebWidgetSalesReply } from '../../../../lib/web-widget/generate-web-widget-sales-reply';
import {
  assertWidgetOriginAllowed,
  isValidVisitorId,
  jsonResponse,
  widgetCorsHeaders,
  type WidgetOrgRow,
} from '../../../../lib/web-widget/http';
import { normalizeWidgetSiteKey } from '../../../../lib/web-widget/site-key';
import { fetchConnectedShopifyDomain } from '../../../../lib/web-widget/shopify-storefront';

export const prerender = false;

export const OPTIONS: APIRoute = ({ request }) =>
  new Response(null, { status: 204, headers: widgetCorsHeaders(request) });

const MAX_TEXT = 8000;

export const POST: APIRoute = async ({ request }) => {
  let body: {
    siteKey?: string;
    chatId?: string;
    visitorId?: string;
    text?: string;
  };
  try {
    body = await request.json();
  } catch {
    return jsonResponse(request, { error: 'JSON inválido' }, 400);
  }

  const siteKey = normalizeWidgetSiteKey(typeof body.siteKey === 'string' ? body.siteKey : '');
  const chatId = typeof body.chatId === 'string' ? body.chatId.trim() : '';
  const visitorId = body.visitorId;
  const text = typeof body.text === 'string' ? body.text.trim() : '';

  if (!siteKey || !chatId || !isValidVisitorId(visitorId) || !text) {
    return jsonResponse(request, { error: 'Parámetros incompletos' }, 400);
  }
  if (text.length > MAX_TEXT) {
    return jsonResponse(request, { error: 'Mensaje demasiado largo' }, 400);
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

  if (orgErr) {
    console.error('[widget/message] DB', orgErr);
    return jsonResponse(request, { error: 'Error al validar la clave', hint: orgErr.message }, 500);
  }
  if (!org) {
    return jsonResponse(request, { error: 'Clave de sitio no válida' }, 401);
  }

  const orgRow = org as WidgetOrgRow;
  const shopifyShop = await fetchConnectedShopifyDomain(db, orgRow.id);
  if (!assertWidgetOriginAllowed(orgRow, request, shopifyShop)) {
    return jsonResponse(request, { error: 'Origen no permitido' }, 403);
  }

  const { data: chat, error: chatErr } = await db
    .from('chats')
    .select('id, organization_id, platform, platform_conversation_id, bot_active, unread_count')
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

  const { data: userRow, error: userMsgErr } = await db
    .from('messages')
    .insert({
      chat_id: chatId,
      sender: 'user',
      text,
      status: 'delivered',
    })
    .select('id')
    .single();

  if (userMsgErr || !userRow) {
    console.error('[widget/message] user insert', userMsgErr);
    return jsonResponse(request, { error: 'No se pudo guardar el mensaje' }, 500);
  }

  const userMessageId = (userRow as { id: string }).id;

  const prevUnread = (chat as { unread_count?: number }).unread_count ?? 0;
  await db
    .from('chats')
    .update({
      last_message_at: new Date().toISOString(),
      unread_count: prevUnread + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', chatId);

  if (chat.bot_active === false) {
    return jsonResponse(request, { reply: null, botPaused: true, userMessageId });
  }

  let reply: string;
  try {
    reply = await generateWebWidgetSalesReply(
      db,
      { id: orgRow.id, name: orgRow.name, openai_api_key: orgRow.openai_api_key },
      chatId,
      text,
    );
  } catch (e) {
    console.error('[widget/message] OpenAI', e);
    return jsonResponse(request, { error: 'No se pudo generar la respuesta' }, 500);
  }

  const { data: botRow, error: botErr } = await db
    .from('messages')
    .insert({
      chat_id: chatId,
      sender: 'bot',
      text: reply,
      status: 'sent',
    })
    .select('id, created_at')
    .single();

  if (botErr) {
    console.error('[widget/message] bot insert', botErr);
    return jsonResponse(request, { error: 'Respuesta generada pero no guardada' }, 500);
  }

  await db
    .from('chats')
    .update({ last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', chatId);

  const botTyped = botRow as { id?: string; created_at?: string } | null;
  const cursor = botTyped?.created_at || '';
  const botMessageId = botTyped?.id;
  return jsonResponse(request, { reply, cursor, userMessageId, botMessageId });
};
