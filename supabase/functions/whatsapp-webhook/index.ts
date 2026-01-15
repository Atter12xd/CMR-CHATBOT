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
  console.log(`Buscando integración con phone_number_id: "${phoneNumberId}"`);
  
  const { data: integration, error } = await supabase
    .from('whatsapp_integrations')
    .select('*')
    .eq('phone_number_id', phoneNumberId)
    .eq('status', 'connected')
    .maybeSingle();

  if (error) {
    console.error('Error en consulta:', error);
    return null;
  }

  if (!integration) {
    console.log('No se encontró integración con esos criterios');
    
    // Buscar sin filtro de status para debug
    const { data: allIntegrations } = await supabase
      .from('whatsapp_integrations')
      .select('phone_number_id, status')
      .eq('phone_number_id', phoneNumberId);
    
    console.log('Integraciones encontradas con ese phone_number_id (sin filtro status):', allIntegrations);
    return null;
  }

  console.log(`✅ Integración encontrada: organization_id=${integration.organization_id}`);
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
    .select('id, customer_name')
    .eq('organization_id', organizationId)
    .eq('platform', 'whatsapp')
    .eq('customer_phone', normalizedPhone)
    .maybeSingle();

  if (existingChat) {
    // Si el chat existe pero tenemos un nombre mejor, actualizarlo
    if (customerName && customerName !== existingChat.customer_name && !existingChat.customer_name.startsWith('Usuario ')) {
      console.log(`Actualizando nombre del chat de "${existingChat.customer_name}" a "${customerName}"`);
      await supabase
        .from('chats')
        .update({ customer_name: customerName })
        .eq('id', existingChat.id);
    }
    return existingChat.id;
  }

  // Crear nuevo chat
  // Si no hay nombre, intentar obtenerlo del número o usar un nombre genérico
  const finalCustomerName = customerName || `Usuario ${normalizedPhone.slice(-4)}`;
  
  console.log(`Creando nuevo chat para ${normalizedPhone} con nombre: ${finalCustomerName}`);
  
  const { data: newChat, error: createError } = await supabase
    .from('chats')
    .insert({
      organization_id: organizationId,
      customer_name: finalCustomerName,
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
  messageData: any,
  contactName?: string
): Promise<void> {
  const { from, id: messageId, timestamp, type, text, image, document } = messageData;

  // Obtener o crear chat con el nombre del contacto si está disponible
  const chatId = await getOrCreateChat(
    supabase,
    integration.organization_id,
    from,
    contactName // Usar el nombre del contacto si está disponible
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
  const messageToSave = {
    chat_id: chatId,
    sender_type: 'user',
    sender_id: null,
    text: messageText,
    image_url: imageUrl,
    platform_message_id: messageId,
    read: false,
    created_at: new Date(parseInt(timestamp) * 1000).toISOString(),
  };

  console.log('Guardando mensaje:', JSON.stringify(messageToSave, null, 2));

  const { data: savedMessage, error: messageError } = await supabase
    .from('messages')
    .insert(messageToSave)
    .select();

  if (messageError) {
    console.error('Error guardando mensaje:', messageError);
    console.error('Message data:', JSON.stringify(messageToSave, null, 2));
    throw messageError;
  }

  console.log('Mensaje guardado exitosamente:', savedMessage);

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

  // Mapear estados de Meta a nuestros estados
  // Meta envía: sent, delivered, read, failed
  let mappedStatus: 'sent' | 'delivered' | 'read' | 'failed' = 'sent';
  
  if (status === 'sent') {
    mappedStatus = 'sent';
  } else if (status === 'delivered') {
    mappedStatus = 'delivered';
  } else if (status === 'read') {
    mappedStatus = 'read';
    // Si el mensaje fue leído, también marcarlo como read=true
    await supabase
      .from('messages')
      .update({ read: true, status: 'read', updated_at: new Date().toISOString() })
      .eq('id', message.id);
    console.log(`Mensaje ${messageId} marcado como leído`);
    return;
  } else if (status === 'failed') {
    mappedStatus = 'failed';
  }

  // Actualizar estado del mensaje
  const { error: updateError } = await supabase
    .from('messages')
    .update({ 
      status: mappedStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', message.id);

  if (updateError) {
    console.error(`Error actualizando estado del mensaje ${messageId}:`, updateError);
  } else {
    console.log(`Mensaje ${messageId} actualizado a estado: ${mappedStatus}`);
  }
}

serve(async (req) => {
  console.log('=== Webhook recibido ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request - CORS preflight');
    return new Response('ok', {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Verificar apikey si viene en query o header (para bypass de autenticación de Supabase)
  const url = new URL(req.url);
  const apikeyFromQuery = url.searchParams.get('apikey');
  const apikeyFromHeader = req.headers.get('apikey') || req.headers.get('x-api-key');
  
  // Si viene apikey, lo validamos (opcional, pero ayuda a debuggear)
  if (apikeyFromQuery || apikeyFromHeader) {
    console.log('Apikey recibido:', apikeyFromQuery ? 'from query' : 'from header');
  }

  // GET: Verificación del webhook (Meta envía esto para verificar)
  // Este endpoint NO requiere autenticación porque Meta no puede autenticarse
  if (req.method === 'GET') {
    try {
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      console.log('Webhook verification request:', { mode, token: token ? '***' : null, challenge: challenge ? '***' : null });

      // Obtener token de verificación de variables de entorno
      const verifyToken = Deno.env.get('WHATSAPP_WEBHOOK_VERIFY_TOKEN');
      
      console.log('Verify token from env:', verifyToken ? '***' : 'NOT FOUND');

      if (!verifyToken) {
        console.error('WHATSAPP_WEBHOOK_VERIFY_TOKEN no está configurado en Secrets');
        return new Response('Verify token not configured', {
          status: 500,
          headers: { 'Content-Type': 'text/plain' },
        });
      }

      if (mode === 'subscribe' && token === verifyToken) {
        console.log('Webhook verificado exitosamente');
        return new Response(challenge || '', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
        });
      } else {
        console.error('Verificación fallida:', { 
          mode, 
          tokenReceived: token ? '***' : null, 
          tokenExpected: verifyToken ? '***' : null,
          tokensMatch: token === verifyToken
        });
        return new Response('Verification failed', {
          status: 403,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    } catch (error: any) {
      console.error('Error en verificación GET:', error);
      return new Response('Error', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Supabase client creado');

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
          console.log(`Buscando integración para phone_number_id: ${phoneNumberId}`);
          const integration = await getOrganizationByPhoneNumberId(supabase, phoneNumberId);

          if (!integration) {
            console.error(`❌ No se encontró integración para phone_number_id: ${phoneNumberId}`);
            console.error('Verifica que:');
            console.error('1. Existe un registro en whatsapp_integrations con este phone_number_id');
            console.error('2. El status es "connected"');
            console.error('3. El phone_number_id está guardado correctamente');
            
            // Intentar buscar sin filtro de status para debug
            const { data: debugIntegration } = await supabase
              .from('whatsapp_integrations')
              .select('*')
              .eq('phone_number_id', phoneNumberId)
              .maybeSingle();
            
            if (debugIntegration) {
              console.error(`Integración encontrada pero con status: ${debugIntegration.status}`);
            } else {
              console.error('No existe ninguna integración con este phone_number_id');
            }
            continue;
          }

          console.log(`✅ Integración encontrada para organización: ${integration.organization_id}`);

          // Procesar mensajes entrantes
          if (value.messages && Array.isArray(value.messages)) {
            console.log(`Procesando ${value.messages.length} mensaje(s)`);
            
            // Extraer nombre del contacto si está disponible
            const contactName = value.contacts && value.contacts.length > 0 
              ? value.contacts[0]?.profile?.name 
              : undefined;
            
            console.log('Nombre del contacto:', contactName || 'No disponible');
            
            for (const message of value.messages) {
              try {
                console.log(`Procesando mensaje: ${message.id}, tipo: ${message.type}`);
                await processIncomingMessage(supabase, integration, message, contactName);
                console.log(`Mensaje procesado exitosamente: ${message.id}`);
              } catch (error) {
                console.error(`Error procesando mensaje ${message.id}:`, error);
                console.error('Error details:', JSON.stringify(error, null, 2));
              }
            }
          } else {
            console.log('No hay mensajes en el evento o no es un array');
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
    console.error('=== ERROR EN WEBHOOK ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    console.error('Message:', error.message);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
