import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  action: 'start_verification' | 'verify_code' | 'disconnect';
  organizationId: string;
  phoneNumber?: string;
  code?: string;
}

serve(async (req) => {
  // Handle CORS preflight
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
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
  // TODO: Implementar llamada a Meta Graph API para iniciar verificación
  // Por ahora, simulamos el proceso
  
  // Generar código de verificación (6 dígitos)
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Guardar código temporalmente (en producción, usar Redis o similar)
  // Por ahora, lo guardamos en la BD con un campo temporal
  
  // Actualizar o crear integración
  const { data, error } = await supabase
    .from('whatsapp_integrations')
    .upsert({
      organization_id: organizationId,
      phone_number: phoneNumber,
      status: 'pending',
      // En producción, el código se enviaría por SMS/WhatsApp
      // Por ahora, lo retornamos en la respuesta (solo para desarrollo)
      error_message: `Código de verificación: ${verificationCode} (solo para desarrollo)`,
    }, {
      onConflict: 'organization_id',
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  // TODO: Enviar código por SMS/WhatsApp usando Meta API
  // Por ahora, retornamos éxito (en desarrollo, el código está en error_message)

  return new Response(
    JSON.stringify({ 
      success: true,
      message: 'Código de verificación enviado',
      // En desarrollo, incluimos el código (eliminar en producción)
      developmentCode: verificationCode,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
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

  // TODO: Verificar código con Meta API
  // Por ahora, validamos que el código tenga 6 dígitos
  
  if (code.length !== 6 || !/^\d+$/.test(code)) {
    return new Response(
      JSON.stringify({ error: 'Código inválido' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // En desarrollo, verificamos contra el código en error_message
  // En producción, esto se haría con Meta API
  const storedCode = integration.error_message?.match(/\d{6}/)?.[0];
  
  if (storedCode && code !== storedCode) {
    return new Response(
      JSON.stringify({ error: 'Código incorrecto' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // TODO: Obtener tokens de Meta API después de verificación exitosa
  // Por ahora, marcamos como conectado

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
      message: 'Número verificado exitosamente',
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

