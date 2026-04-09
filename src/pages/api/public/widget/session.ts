import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import {
  assertWidgetOriginAllowed,
  isValidVisitorId,
  jsonResponse,
  widgetCorsHeaders,
  type WidgetOrgRow,
} from '../../../../lib/web-widget/http';
import { normalizeWidgetSiteKey } from '../../../../lib/web-widget/site-key';

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

  const siteKey = normalizeWidgetSiteKey(typeof body.siteKey === 'string' ? body.siteKey : '');
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

  if (orgErr) {
    console.error('[widget/session] DB', orgErr);
    const msg = orgErr.message || String(orgErr);
    const schemaHint =
      /web_widget_public_key|column|schema/i.test(msg)
        ? ' Ejecuta en Supabase el SQL add_web_widget_to_organizations.sql y revisa Table Editor → organizations.'
        : '';
    return jsonResponse(
      request,
      { error: 'Error al validar la clave', hint: msg + schemaHint },
      500,
    );
  }

  if (!org) {
    return jsonResponse(
      request,
      {
        error: 'Clave de sitio no válida',
        hint:
          'No hay ninguna organización con esa clave en la base de datos. En Configuración → Widget pulsa «Rotar clave» y guarda, revisa en Supabase que la columna web_widget_public_key tenga valor, y vuelve a copiar el snippet.',
      },
      401,
    );
  }

  const orgRow = org as WidgetOrgRow;
  if (!assertWidgetOriginAllowed(orgRow, request)) {
    return jsonResponse(request, { error: 'Origen no permitido para este widget' }, 403);
  }

  const { data: botCfg } = await db
    .from('organization_bot_config')
    .select('bot_name, company_name, initial_greeting')
    .eq('organization_id', orgRow.id)
    .maybeSingle();

  const trimStr = (s: unknown, max: number) => {
    const t = typeof s === 'string' ? s.trim() : '';
    if (!t) return null;
    return t.length > max ? t.slice(0, max) : t;
  };

  const orgName = trimStr(orgRow.name, 120) || 'Chat';
  const botName = trimStr(botCfg?.bot_name, 80);
  const companyName = trimStr(botCfg?.company_name, 120);
  const widgetTitle = botName || companyName || orgName;
  const widgetSubtitle =
    botName && companyName && companyName !== botName ? companyName : 'Estamos para ayudarte';
  const greeting = trimStr(botCfg?.initial_greeting, 2000);

  const widgetMeta = {
    widgetTitle,
    widgetSubtitle,
    greeting,
  };

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

    return jsonResponse(request, { chatId: existing.id, ...widgetMeta });
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

  const newChatId = (created as { id: string }).id;

  if (greeting) {
    const splitGreetingParts = (g: string): string[] => {
      const raw = g.trim();
      if (!raw) return [];
      const blocks = raw
        .split(/\n{2,}|\r\n\r\n/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (blocks.length > 1) return blocks.slice(0, 8);
      const lines = raw
        .split(/\n+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (lines.length > 1 && lines.length <= 8) return lines;
      return [raw];
    };

    const parts = splitGreetingParts(greeting);
    for (const text of parts) {
      const { error: greetErr } = await db.from('messages').insert({
        chat_id: newChatId,
        sender: 'bot',
        text,
        status: 'sent',
      });
      if (greetErr) {
        console.error('[widget/session] insert greeting message', greetErr);
        break;
      }
    }
  }

  return jsonResponse(request, { chatId: newChatId, ...widgetMeta });
};
