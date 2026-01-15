import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hub-signature-256',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
};

/**
 * Valida la firma del webhook de Meta
 */
async function validateSignature(
  payload: string,
  signature: string,
  appSecret: string
): Promise<boolean> {
  if (!signature) return false;

  // Meta usa SHA256 HMAC
  const encoder = new TextEncoder();
  const keyData = encoder.encode(appSecret);
  const messageData = encoder.encode(payload);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Meta envía la firma como "sha256=hash"
  const expectedSignature = `sha256=${hashHex}`;
  return signature === expectedSignature;
}

/**
 * Obtiene la organización basándose en el phone_number_id
 */
async function getOrganizationByPhoneNumberId(
  supabase: any,
  phoneNumberId: string
): Promise<any> {
  const { data: integration, error } = await supabase
    .from('whatsapp_integrations')
    .select('*')
    .eq('phone_number_id', phoneNumberId)
    .eq('status', 'connected')
    .maybeSingle();

  if (error || !integration) {
    return null;
  }

  return integration;
}

/**
 * Obtiene o crea un chat basándose en el número de teléfono del cliente
 */
async function getOrCreateChat(
  supabase: any,
  organizationId: string,
  customerPhone: string,
  customerName?: string
): Promise<string> {
  // Normalizar número de teléfono (remover espacios, guiones, etc.)
  const normalizedPhone = customerPhone.replace(/[\s\-\(\)]/g, '');

  // Buscar chat existente
  const { data: existingChat, error: searchError } = await supabase
    .from('chats')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('platform', 'whatsapp')
    .eq('customer_phone', normalizedPhone)
    .maybeSingle();

  if (existingChat) {
    return existingChat.id;
  }

  // Crear nuevo chat
  const { data: newChat, error: createError } = await supabase
    .from('chats')
    .insert({
      organization_id: organizationId,
      customer_name: customerName || `Usuario ${normalizedPhone.slice(-4)}`,
      customer_phone: normalizedPhone,
      platform: 'whatsapp',
      platform_conversation_id: normalizedPhone,
      status: 'active',
      last_message_at: new Date().toISOString(),
      unread_count: 1,
    })
    .select('id')
    .single();

  if (createError || !newChat) {
    throw new Error(`Error creando chat: ${createError?.message || 'Unknown error'}`);
  }

  return newChat.id;
}

/**
 * Procesa un mensaje entrante de WhatsApp
 */
async function processIncomingMessage(
  supabase: any,
  integration: any,
  messageData: any
): Promise<void> {
  const { from, id: messageId, timestamp, type, text, image, document } = messageData;

  // Obtener o crear chat
  const chatId = await getOrCreateChat(
    supabase,
    integration.organization_id,
    from,
    undefined // Meta no siempre envía el nombre
  );

  // Extraer texto del mensaje
  let messageText: string | null = null;
  let imageUrl: string | null = null;

  if (type === 'text' && text) {
    messageText = text.body;
  } else if (type === 'image' && image) {
    imageUrl = image.id; // ID de la imagen en Meta, necesitarás descargarla después
    messageText = image.caption || null;
  } else if (type === 'document' && document) {
    imageUrl = document.id; // ID del documento
    messageText = document.caption || `Documento: ${document.filename || 'sin nombre'}`;
  }

  // Guardar mensaje
  const { error: messageError } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      sender_type: 'user',
      sender_id: null,
      text: messageText,
      image_url: imageUrl,
      platform_message_id: messageId,
      read: false,
      created_at: new Date(parseInt(timestamp) * 1000).toISOString(),
    });

  if (messageError) {
    console.error('Error guardando mensaje:', messageError);
    throw messageError;
  }

  // Obtener unread_count actual y actualizar chat
  const { data: chat } = await supabase
    .from('chats')
    .select('unread_count')
    .eq('id', chatId)
    .single();

  const newUnreadCount = (chat?.unread_count || 0) + 1;

  // Actualizar chat: last_message_at y unread_count
  await supabase
    .from('chats')
    .update({
      last_message_at: new Date(parseInt(timestamp) * 1000).toISOString(),
      unread_count: newUnreadCount,
    })
    .eq('id', chatId);

  // TODO: Activar bot si está configurado
  // const { data: chatData } = await supabase.from('chats').select('bot_active').eq('id', chatId).single();
  // if (chatData?.bot_active) {
  //   // Llamar a función de bot
  // }
}

/**
 * Procesa un evento de estado de mensaje
 */
async function processMessageStatus(
  supabase: any,
  integration: any,
  statusData: any
): Promise<void> {
  const { id: messageId, status, timestamp } = statusData;

  // Buscar mensaje por platform_message_id
  const { data: message, error: findError } = await supabase
    .from('messages')
    .select('id, chat_id')
    .eq('platform_message_id', messageId)
    .maybeSingle();

  if (findError || !message) {
    console.log(`Mensaje no encontrado: ${messageId}`);
    return;
  }

  // Actualizar estado del mensaje (puedes agregar una columna status a messages si lo necesitas)
  // Por ahora solo logueamos
  console.log(`Mensaje ${messageId} actualizado a estado: ${status}`);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // GET: Verificación del webhook (Meta envía esto para verificar)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      // Obtener token de verificación de variables de entorno
      const verifyToken = Deno.env.get('WHATSAPP_WEBHOOK_VERIFY_TOKEN');

      if (mode === 'subscribe' && token === verifyToken) {
        console.log('Webhook verificado exitosamente');
        return new Response(challenge, {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
        });
      } else {
        console.error('Verificación fallida:', { mode, token, verifyToken });
        return new Response('Verification failed', {
          status: 403,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    }

    // POST: Recibir eventos de WhatsApp
    if (req.method === 'POST') {
      const rawBody = await req.text();
      const signature = req.headers.get('x-hub-signature-256');

      // Obtener app secret para validar firma
      const appSecret = Deno.env.get('WHATSAPP_APP_SECRET') || '75ec6c1f9c00e3ee5ca3763e5c46a920';

      // Validar firma (opcional pero recomendado)
      if (signature && appSecret) {
        const isValid = await validateSignature(rawBody, signature, appSecret);
        if (!isValid) {
          console.error('Firma de webhook inválida');
          return new Response('Invalid signature', {
            status: 401,
            headers: { 'Content-Type': 'text/plain' },
          });
        }
      }

      const body = JSON.parse(rawBody);

      // Meta envía eventos en este formato:
      // {
      //   "object": "whatsapp_business_account",
      //   "entry": [{
      //     "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      //     "changes": [{
      //       "value": {
      //         "messaging_product": "whatsapp",
      //         "metadata": { "phone_number_id": "..." },
      //         "messages": [...],
      //         "statuses": [...]
      //       }
      //     }]
      //   }]
      // }

      if (body.object !== 'whatsapp_business_account') {
        return new Response('Invalid object type', {
          status: 400,
          headers: { 'Content-Type': 'text/plain' },
        });
      }

      // Procesar cada entrada
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;
          const phoneNumberId = value?.metadata?.phone_number_id;

          if (!phoneNumberId) {
            console.log('No phone_number_id en el evento');
            continue;
          }

          // Obtener integración por phone_number_id
          const integration = await getOrganizationByPhoneNumberId(supabase, phoneNumberId);

          if (!integration) {
            console.log(`No se encontró integración para phone_number_id: ${phoneNumberId}`);
            continue;
          }

          // Procesar mensajes entrantes
          if (value.messages && Array.isArray(value.messages)) {
            for (const message of value.messages) {
              try {
                await processIncomingMessage(supabase, integration, message);
                console.log(`Mensaje procesado: ${message.id}`);
              } catch (error) {
                console.error(`Error procesando mensaje ${message.id}:`, error);
              }
            }
          }

          // Procesar estados de mensajes
          if (value.statuses && Array.isArray(value.statuses)) {
            for (const status of value.statuses) {
              try {
                await processMessageStatus(supabase, integration, status);
              } catch (error) {
                console.error(`Error procesando estado ${status.id}:`, error);
              }
            }
          }
        }
      }

      // Responder 200 OK a Meta
      return new Response('OK', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Método no soportado
    return new Response('Method not allowed', {
      status: 405,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error: any) {
    console.error('Error en webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
