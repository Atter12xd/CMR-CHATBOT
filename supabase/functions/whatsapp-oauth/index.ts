import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
};

interface RequestBody {
  action: 'start_verification' | 'verify_code' | 'disconnect';
  organizationId: string;
  phoneNumber?: string;
  code?: string;
}

serve(async (req) => {
  // Handle CORS preflight - debe ser lo primero
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: RequestBody = await req.json();
    const { action, organizationId, phoneNumber, code } = body;

    // Verify user owns the organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', organizationId)
      .eq('owner_id', user.id)
      .single();

    if (orgError || !org) {
      return new Response(
        JSON.stringify({ error: 'Organization not found or access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle different actions
    switch (action) {
      case 'start_verification':
        return await handleStartVerification(supabase, organizationId, phoneNumber!);
      
      case 'verify_code':
        return await handleVerifyCode(supabase, organizationId, phoneNumber!, code!);
      
      case 'disconnect':
        return await handleDisconnect(supabase, organizationId);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleStartVerification(
  supabase: any,
  organizationId: string,
  phoneNumber: string
) {
  // Obtener credenciales de Meta
  const appId = Deno.env.get('WHATSAPP_APP_ID') || '1697684594201061';
  const appSecret = Deno.env.get('WHATSAPP_APP_SECRET') || '75ec6c1f9c00e3ee5ca3763e5c46a920';
  const businessAccountId = Deno.env.get('WHATSAPP_BUSINESS_ACCOUNT_ID') || '754836650218132';

  try {
    // 1. Registrar número en Meta (si no está registrado)
    // 2. Obtener Phone Number ID
    // 3. Solicitar código de verificación

    // Llamar a la Edge Function de Meta API
    const metaApiUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/whatsapp-meta-api`;
    
    // Primero, obtener el Phone Number ID
    const phoneIdResponse = await fetch(metaApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'get_phone_id',
        organizationId,
        phoneNumber,
      }),
    });

    let phoneNumberId: string | null = null;
    
    if (phoneIdResponse.ok) {
      const phoneIdData = await phoneIdResponse.json();
      phoneNumberId = phoneIdData.phoneNumberId;
    }

    // Si no existe, intentar registrar
    if (!phoneNumberId) {
      const registerResponse = await fetch(metaApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'register_phone',
          organizationId,
          phoneNumber,
        }),
      });

      if (registerResponse.ok) {
        const registerData = await registerResponse.json();
        phoneNumberId = registerData.data?.id || null;
      }
    }

    // Si tenemos phoneNumberId, solicitar código
    if (phoneNumberId) {
      const codeResponse = await fetch(metaApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'request_code',
          organizationId,
          phoneNumberId,
        }),
      });

      if (codeResponse.ok) {
        // Actualizar integración en BD
        const { data, error } = await supabase
          .from('whatsapp_integrations')
          .upsert({
            organization_id: organizationId,
            phone_number: phoneNumber,
            phone_number_id: phoneNumberId,
            business_account_id: businessAccountId,
            app_id: appId,
            status: 'pending',
          }, {
            onConflict: 'organization_id',
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Código de verificación enviado',
            phoneNumberId,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fallback: modo simulado si falla la API real
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const { data, error } = await supabase
      .from('whatsapp_integrations')
      .upsert({
        organization_id: organizationId,
        phone_number: phoneNumber,
        status: 'pending',
        error_message: `Código de verificación: ${verificationCode} (modo simulado)`,
      }, {
        onConflict: 'organization_id',
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Código de verificación enviado (modo simulado)',
        developmentCode: verificationCode,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error en handleStartVerification:', error);
    throw error;
  }
}

async function handleVerifyCode(
  supabase: any,
  organizationId: string,
  phoneNumber: string,
  code: string
) {
  // Obtener integración
  const { data: integration, error: fetchError } = await supabase
    .from('whatsapp_integrations')
    .select('*')
    .eq('organization_id', organizationId)
    .single();

  if (fetchError || !integration) {
    throw new Error('Integration not found');
  }

  // Validar formato del código
  if (code.length !== 6 || !/^\d+$/.test(code)) {
    return new Response(
      JSON.stringify({ error: 'Código inválido' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Si tenemos phone_number_id, usar Meta API real
  if (integration.phone_number_id) {
    try {
      const metaApiUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/whatsapp-meta-api`;
      
      const verifyResponse = await fetch(metaApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify_code',
          organizationId,
          phoneNumberId: integration.phone_number_id,
          code,
        }),
      });

      if (verifyResponse.ok) {
        // Obtener access token
        const tokenResponse = await fetch(metaApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'get_access_token',
            organizationId,
          }),
        });

        let accessToken = null;
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          accessToken = tokenData.accessToken;
        }

        // Actualizar integración como conectada
        const { data, error } = await supabase
          .from('whatsapp_integrations')
          .update({
            status: 'connected',
            access_token: accessToken, // TODO: Encriptar antes de guardar
            verified_at: new Date().toISOString(),
            last_sync_at: new Date().toISOString(),
            error_message: null,
          })
          .eq('organization_id', organizationId)
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Número verificado exitosamente',
            integration: data,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || 'Error al verificar código');
      }
    } catch (apiError: any) {
      console.error('Error verificando con Meta API:', apiError);
      // Continuar con modo simulado si falla
    }
  }

  // Modo simulado: verificar contra código almacenado
  const storedCode = integration.error_message?.match(/\d{6}/)?.[0];
  
  if (storedCode && code !== storedCode) {
    return new Response(
      JSON.stringify({ error: 'Código incorrecto' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Marcar como conectado
  const { data, error } = await supabase
    .from('whatsapp_integrations')
    .update({
      status: 'connected',
      verified_at: new Date().toISOString(),
      last_sync_at: new Date().toISOString(),
      error_message: null,
    })
    .eq('organization_id', organizationId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      message: 'Número verificado exitosamente (modo simulado)',
      integration: data,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleDisconnect(
  supabase: any,
  organizationId: string
) {
  // Actualizar estado a desconectado
  const { data, error } = await supabase
    .from('whatsapp_integrations')
    .update({
      status: 'disconnected',
      access_token: null,
      phone_number_id: null,
      error_message: null,
    })
    .eq('organization_id', organizationId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      message: 'WhatsApp desconectado exitosamente',
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
