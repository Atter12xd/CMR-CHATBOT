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
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = { message: errorText };
      }
      console.error('Error enviando mensaje a Meta API:', {
        status: response.status,
        statusText: response.statusText,
        error: errorDetails
      });
      throw new Error(`Error de Meta API (${response.status}): ${errorDetails.error?.message || errorDetails.message || errorText}`);
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
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = { message: errorText };
      }
      console.error('Error enviando imagen a Meta API:', {
        status: response.status,
        statusText: response.statusText,
        error: errorDetails
      });
      throw new Error(`Error de Meta API (${response.status}): ${errorDetails.error?.message || errorDetails.message || errorText}`);
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
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = { message: errorText };
      }
      console.error('Error enviando documento a Meta API:', {
        status: response.status,
        statusText: response.statusText,
        error: errorDetails
      });
      throw new Error(`Error de Meta API (${response.status}): ${errorDetails.error?.message || errorDetails.message || errorText}`);
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

      console.log('=== Envío de mensaje ===');
      console.log('Chat ID:', chatId);
      console.log('Tipo:', text ? 'text' : imageUrl ? 'image' : documentUrl ? 'document' : 'unknown');

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

      if (chatError) {
        console.error('Error buscando chat:', chatError);
        return new Response(
          JSON.stringify({ 
            error: 'Error al buscar chat',
            details: chatError.message 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!chat) {
        console.error('Chat no encontrado:', { chatId, userId: user.id });
        return new Response(
          JSON.stringify({ error: 'Chat no encontrado o sin permisos' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Chat encontrado:', {
        chatId: chat.id,
        organizationId: chat.organization_id,
        platform: chat.platform,
        customerPhone: chat.customer_phone
      });

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

      if (integrationError) {
        console.error('Error buscando integración:', integrationError);
        return new Response(
          JSON.stringify({ 
            error: 'Error al buscar integración de WhatsApp',
            details: integrationError.message 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!integration) {
        // Buscar sin filtro de status para debug
        const { data: debugIntegration } = await supabase
          .from('whatsapp_integrations')
          .select('id, status, phone_number_id, access_token')
          .eq('organization_id', chat.organization_id)
          .maybeSingle();
        
        console.error('Integración no encontrada o no conectada:', {
          organizationId: chat.organization_id,
          debugIntegration: debugIntegration ? {
            status: debugIntegration.status,
            hasPhoneNumberId: !!debugIntegration.phone_number_id,
            hasAccessToken: !!debugIntegration.access_token
          } : null
        });

        return new Response(
          JSON.stringify({ 
            error: 'WhatsApp no está conectado para esta organización',
            details: debugIntegration 
              ? `Estado actual: ${debugIntegration.status}. ${!debugIntegration.phone_number_id ? 'Falta phone_number_id. ' : ''}${!debugIntegration.access_token ? 'Falta access_token.' : ''}`
              : 'No existe integración para esta organización'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // PRIORIDAD: Usar access_token de variables de entorno PRIMERO
      // El token en BD puede ser temporal (client_credentials) que NO sirve para enviar mensajes
      // Para enviar mensajes necesitas un token permanente de Meta
      let accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN') || null;
      let phoneNumberId = integration.phone_number_id || Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || null;

      // Si no hay access_token en variables de entorno, intentar usar el de BD (puede no funcionar)
      if (!accessToken && integration.access_token) {
        console.warn('⚠️ Usando access_token de BD. Este puede ser un token temporal que NO funciona para enviar mensajes.');
        console.warn('⚠️ Configura WHATSAPP_ACCESS_TOKEN en Supabase Edge Functions → Secrets para usar un token permanente.');
        accessToken = integration.access_token;
      }

      // Si aún no hay access_token, intentar obtener uno temporal (solo para debug)
      if (!accessToken) {
        console.log('Access token no encontrado, intentando obtener uno temporal...');
        try {
          const appId = Deno.env.get('WHATSAPP_APP_ID') || integration.app_id || '1697684594201061';
          const appSecret = Deno.env.get('WHATSAPP_APP_SECRET') || integration.app_secret || '75ec6c1f9c00e3ee5ca3763e5c46a920';
          
          // Este token es temporal y NO sirve para enviar mensajes, solo para operaciones administrativas
          const tempTokenResponse = await fetch(
            `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`
          );
          
          if (tempTokenResponse.ok) {
            const tempTokenData = await tempTokenResponse.json();
            console.error('❌ ERROR: Usando token temporal (client_credentials). Este token NO funcionará para enviar mensajes.');
            console.error('❌ SOLUCIÓN: Configura WHATSAPP_ACCESS_TOKEN en Supabase Edge Functions → Secrets');
            console.error('❌ Ver instrucciones en: CONFIGURAR_ACCESS_TOKEN.md');
            accessToken = tempTokenData.access_token;
          }
        } catch (err) {
          console.error('Error obteniendo token temporal:', err);
        }
      }

      if (!phoneNumberId || !accessToken) {
        console.error('Configuración incompleta:', {
          hasPhoneNumberId: !!phoneNumberId,
          hasAccessToken: !!accessToken,
          status: integration.status,
          phoneNumberIdFromEnv: !!Deno.env.get('WHATSAPP_PHONE_NUMBER_ID'),
          accessTokenFromEnv: !!Deno.env.get('WHATSAPP_ACCESS_TOKEN'),
          hasAccessTokenInBD: !!integration.access_token
        });
        
        let errorMessage = 'Configuración de WhatsApp incompleta. ';
        if (!accessToken) {
          errorMessage += 'Falta access_token. ';
          errorMessage += 'IMPORTANTE: Necesitas configurar WHATSAPP_ACCESS_TOKEN en las variables de entorno de Supabase (Edge Functions → Secrets). ';
          errorMessage += 'Este debe ser un token permanente de Meta, no un token temporal. ';
        }
        if (!phoneNumberId) {
          errorMessage += 'Falta phone_number_id. ';
        }
        errorMessage += 'Verifica la configuración en Supabase Dashboard → Edge Functions → Secrets.';
        
        return new Response(
          JSON.stringify({ 
            error: 'Configuración de WhatsApp incompleta',
            details: errorMessage
          }),
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
          phoneNumberId,
          accessToken,
          normalizedPhone,
          documentUrl,
          filename
        );
        messageType = 'document';
        messageContent = `Documento: ${filename}`;
      } else if (imageUrl) {
        whatsappResponse = await sendImageMessage(
          phoneNumberId,
          accessToken,
          normalizedPhone,
          imageUrl,
          text || undefined
        );
        messageType = 'image';
        messageContent = text || 'Imagen';
      } else if (text) {
        whatsappResponse = await sendTextMessage(
          phoneNumberId,
          accessToken,
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
        sender: 'agent',
        text: messageContent || '',
        image_url: messageType === 'image' ? imageUrl : messageType === 'document' ? documentUrl : null,
        platform_message_id: whatsappResponse.messages?.[0]?.id || null,
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
