import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
};

const META_GRAPH_API_BASE = 'https://graph.facebook.com/v21.0';

interface RequestBody {
  action: 'register_phone' | 'get_phone_id' | 'request_code' | 'verify_code' | 'get_access_token';
  organizationId: string;
  phoneNumber?: string;
  code?: string;
  phoneNumberId?: string;
}

/**
 * Obtiene el Access Token de Meta usando App ID y App Secret
 */
async function getMetaAccessToken(appId: string, appSecret: string): Promise<string> {
  const response = await fetch(
    `${META_GRAPH_API_BASE}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`,
    { method: 'GET' }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Error obteniendo access token: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Registra un número de teléfono en Meta
 */
async function registerPhoneNumber(
  accessToken: string,
  businessAccountId: string,
  phoneNumber: string
): Promise<any> {
  const response = await fetch(
    `${META_GRAPH_API_BASE}/${businessAccountId}/phone_numbers`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        verified_name: 'Business Name', // TODO: Obtener del perfil de negocio
        code_verification_method: 'SMS',
        phone_number: phoneNumber,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error al registrar número');
  }

  return await response.json();
}

/**
 * Solicita código de verificación
 */
async function requestVerificationCode(
  accessToken: string,
  phoneNumberId: string,
  codeMethod: 'SMS' | 'VOICE' = 'SMS'
): Promise<any> {
  const response = await fetch(
    `${META_GRAPH_API_BASE}/${phoneNumberId}/request_code`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code_method: codeMethod,
        language: 'es',
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error al solicitar código');
  }

  return await response.json();
}

/**
 * Verifica código de verificación
 */
async function verifyCode(
  accessToken: string,
  phoneNumberId: string,
  code: string
): Promise<any> {
  const response = await fetch(
    `${META_GRAPH_API_BASE}/${phoneNumberId}/verify_code`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error al verificar código');
  }

  return await response.json();
}

/**
 * Obtiene información del número de teléfono
 */
async function getPhoneNumberInfo(
  accessToken: string,
  phoneNumberId: string
): Promise<any> {
  const response = await fetch(
    `${META_GRAPH_API_BASE}/${phoneNumberId}?fields=verified_name,display_phone_number,quality_rating,code_verification_status`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error al obtener información del número');
  }

  return await response.json();
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
    const { action, organizationId, phoneNumber, code, phoneNumberId } = body;

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

    // Get WhatsApp integration
    const { data: integration, error: integrationError } = await supabase
      .from('whatsapp_integrations')
      .select('*')
      .eq('organization_id', organizationId)
      .maybeSingle();

    // Get Meta API credentials from environment or integration
    const appId = Deno.env.get('WHATSAPP_APP_ID') || integration?.app_id || '1697684594201061';
    const appSecret = Deno.env.get('WHATSAPP_APP_SECRET') || integration?.app_secret || '75ec6c1f9c00e3ee5ca3763e5c46a920';
    const businessAccountId = Deno.env.get('WHATSAPP_BUSINESS_ACCOUNT_ID') || integration?.business_account_id || '754836650218132';

    // Get access token
    const accessToken = await getMetaAccessToken(appId, appSecret);

    // Handle different actions
    switch (action) {
      case 'register_phone':
        if (!phoneNumber) {
          return new Response(
            JSON.stringify({ error: 'Phone number required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const registrationResult = await registerPhoneNumber(accessToken, businessAccountId, phoneNumber!);
        return new Response(
          JSON.stringify({ success: true, data: registrationResult }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'request_code':
        if (!phoneNumberId) {
          return new Response(
            JSON.stringify({ error: 'Phone number ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const codeResult = await requestVerificationCode(accessToken, phoneNumberId!);
        return new Response(
          JSON.stringify({ success: true, data: codeResult }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'verify_code':
        if (!phoneNumberId || !code) {
          return new Response(
            JSON.stringify({ error: 'Phone number ID and code required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const verifyResult = await verifyCode(accessToken, phoneNumberId!, code!);
        return new Response(
          JSON.stringify({ success: true, data: verifyResult }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'get_phone_id':
        if (!phoneNumber) {
          return new Response(
            JSON.stringify({ error: 'Phone number required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        // Buscar número en la cuenta de negocio
        const phoneNumbersResponse = await fetch(
          `${META_GRAPH_API_BASE}/${businessAccountId}/phone_numbers`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );
        const phoneNumbers = await phoneNumbersResponse.json();
        const phone = phoneNumbers.data?.find((p: any) => p.display_phone_number === phoneNumber);
        return new Response(
          JSON.stringify({ success: true, phoneNumberId: phone?.id || null }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'get_access_token':
        return new Response(
          JSON.stringify({ success: true, accessToken }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

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

