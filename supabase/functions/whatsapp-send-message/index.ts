import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * Envía un mensaje de texto a WhatsApp usando Meta Graph API
 */
async function sendTextMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  text: string
): Promise<any> {
  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
  
  const payload = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'text',
    text: {
      body: text,
    },
  };

  console.log('Enviando mensaje a WhatsApp:', { phoneNumberId, to, textLength: text.length });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error enviando mensaje:', errorText);
    throw new Error(`Error de Meta API: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('Mensaje enviado exitosamente:', result);
  return result;
}

/**
 * Envía un mensaje con imagen a WhatsApp
 */
async function sendImageMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  imageUrl: string,
  caption?: string
): Promise<any> {
  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
  
  const payload = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'image',
    image: {
      link: imageUrl,
      caption: caption || '',
    },
  };

  console.log('Enviando imagen a WhatsApp:', { phoneNumberId, to, imageUrl });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error enviando imagen:', errorText);
    throw new Error(`Error de Meta API: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('Imagen enviada exitosamente:', result);
  return result;
}

/**
 * Envía un documento a WhatsApp
 */
async function sendDocumentMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  documentUrl: string,
  filename: string
): Promise<any> {
  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
  
  const payload = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'document',
    document: {
      link: documentUrl,
      filename: filename,
    },
  };

  console.log('Enviando documento a WhatsApp:', { phoneNumberId, to, filename });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error enviando documento:', errorText);
    throw new Error(`Error de Meta API: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('Documento enviado exitosamente:', result);
  return result;
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
    // Verificar autenticación
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Crear cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obtener usuario del token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parsear body
    const body = await req.json();
    const { chatId, text, imageUrl, documentUrl, filename } = body;

    if (!chatId) {
      return new Response(
        JSON.stringify({ error: 'chatId es requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obtener chat y verificar que pertenece a una organización del usuario
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select(`
        id,
        organization_id,
        customer_phone,
        platform,
        organizations!inner(owner_id)
      `)
      .eq('id', chatId)
      .eq('organizations.owner_id', user.id)
      .single();

    if (chatError || !chat) {
      return new Response(
        JSON.stringify({ error: 'Chat no encontrado o sin permisos' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar que es un chat de WhatsApp
    if (chat.platform !== 'whatsapp') {
      return new Response(
        JSON.stringify({ error: 'Este chat no es de WhatsApp' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obtener integración de WhatsApp
    const { data: integration, error: integrationError } = await supabase
      .from('whatsapp_integrations')
      .select('*')
      .eq('organization_id', chat.organization_id)
      .eq('status', 'connected')
      .single();

    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ error: 'WhatsApp no está conectado para esta organización' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!integration.phone_number_id || !integration.access_token) {
      return new Response(
        JSON.stringify({ error: 'Configuración de WhatsApp incompleta' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalizar número de teléfono (remover espacios, guiones, etc.)
    const normalizedPhone = chat.customer_phone?.replace(/[\s\-\(\)]/g, '') || '';

    if (!normalizedPhone) {
      return new Response(
        JSON.stringify({ error: 'Número de teléfono no disponible' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enviar mensaje según el tipo
    let whatsappResponse;
    let messageType: 'text' | 'image' | 'document' = 'text';
    let messageContent = text || '';

    if (documentUrl && filename) {
      whatsappResponse = await sendDocumentMessage(
        integration.phone_number_id,
        integration.access_token,
        normalizedPhone,
        documentUrl,
        filename
      );
      messageType = 'document';
      messageContent = `Documento: ${filename}`;
    } else if (imageUrl) {
      whatsappResponse = await sendImageMessage(
        integration.phone_number_id,
        integration.access_token,
        normalizedPhone,
        imageUrl,
        text || undefined
      );
      messageType = 'image';
      messageContent = text || 'Imagen';
    } else if (text) {
      whatsappResponse = await sendTextMessage(
        integration.phone_number_id,
        integration.access_token,
        normalizedPhone,
        text
      );
      messageType = 'text';
      messageContent = text;
    } else {
      return new Response(
        JSON.stringify({ error: 'Debe proporcionar text, imageUrl o documentUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Guardar mensaje en la base de datos
    const messageData = {
      chat_id: chatId,
      sender_type: 'agent',
      sender_id: user.id,
      text: messageType === 'text' ? messageContent : null,
      image_url: messageType === 'image' ? imageUrl : messageType === 'document' ? documentUrl : null,
      platform_message_id: whatsappResponse.messages?.[0]?.id || null,
      read: false,
      status: 'sent', // Estado inicial: enviado
    };

    const { data: savedMessage, error: messageError } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (messageError) {
      console.error('Error guardando mensaje:', messageError);
      // Aún así retornamos éxito porque el mensaje se envió a WhatsApp
    }

    // Actualizar chat: last_message_at y resetear unread_count
    await supabase
      .from('chats')
      .update({
        last_message_at: new Date().toISOString(),
        unread_count: 0, // Resetear porque el agente respondió
      })
      .eq('id', chatId);

    return new Response(
      JSON.stringify({
        success: true,
        messageId: savedMessage?.id,
        whatsappMessageId: whatsappResponse.messages?.[0]?.id,
        status: 'sent',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('=== ERROR EN ENVÍO DE MENSAJE ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    console.error('Message:', error.message);

    return new Response(
      JSON.stringify({
        error: error.message || 'Error interno del servidor',
        details: error.toString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
