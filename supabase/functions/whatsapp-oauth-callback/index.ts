import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const META_GRAPH_API_BASE = 'https://graph.facebook.com/v21.0';

/**
 * Intercambia código de OAuth por access token
 */
async function exchangeCodeForToken(code: string, redirectUri: string, appId: string, appSecret: string): Promise<any> {
  const response = await fetch(
    `${META_GRAPH_API_BASE}/oauth/access_token?` +
    `client_id=${appId}&` +
    `client_secret=${appSecret}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `code=${code}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error al obtener access token');
  }

  return await response.json();
}

/**
 * Obtiene información del usuario/perfil de Facebook
 */
async function getFacebookUser(accessToken: string): Promise<any> {
  const response = await fetch(
    `${META_GRAPH_API_BASE}/me?fields=id,name,email&access_token=${accessToken}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error al obtener información del usuario');
  }

  return await response.json();
}

/**
 * Obtiene WhatsApp Business Accounts del usuario
 */
async function getBusinessAccounts(accessToken: string): Promise<any> {
  const response = await fetch(
    `${META_GRAPH_API_BASE}/me?fields=whatsapp_business_accounts{id,name,message_templates,phone_numbers{id,display_phone_number,verified_name,code_verification_status}}&access_token=${accessToken}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error al obtener cuentas de negocio');
  }

  return await response.json();
}

/**
 * Obtiene access token de larga duración (60 días)
 */
async function getLongLivedToken(shortLivedToken: string, appId: string, appSecret: string): Promise<string> {
  const response = await fetch(
    `${META_GRAPH_API_BASE}/oauth/access_token?` +
    `grant_type=fb_exchange_token&` +
    `client_id=${appId}&` +
    `client_secret=${appSecret}&` +
    `fb_exchange_token=${shortLivedToken}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error al obtener token de larga duración');
  }

  const data = await response.json();
  return data.access_token;
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
    // Obtener parámetros de la URL
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // organizationId codificado
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    // Obtener URL del frontend desde variable de entorno o usar la actual
    const frontendUrl = Deno.env.get('FRONTEND_URL') || Deno.env.get('PUBLIC_SITE_URL') || 'https://cmr-chatbot-two.vercel.app';

    // Si hay error de OAuth
    if (error) {
      const redirectUrl = `${frontendUrl}/configuracion?error=${encodeURIComponent(errorDescription || error)}`;
      return Response.redirect(redirectUrl, 302);
    }

    // Validar que tenemos código y state
    if (!code || !state) {
      const redirectUrl = `${frontendUrl}/configuracion?error=${encodeURIComponent('Faltan parámetros de autorización')}`;
      return Response.redirect(redirectUrl, 302);
    }

    // Crear cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Decodificar state - puede ser organizationId o código QR (32 caracteres)
    let organizationId: string;
    let qrCode: string | null = null;
    
    try {
      const decodedState = decodeURIComponent(state);
      
      // Verificar si es un código QR (32 caracteres alfanuméricos)
      if (decodedState.length === 32 && /^[a-zA-Z0-9]+$/.test(decodedState)) {
        // Es un código QR
        qrCode = decodedState;
        
        // Buscar el código QR en la BD para obtener organization_id
        const { data: qrData, error: qrError } = await supabase
          .from('qr_codes')
          .select('organization_id, status')
          .eq('code', qrCode)
          .single();
        
        if (qrError || !qrData) {
          const redirectUrl = `${frontendUrl}/configuracion?error=${encodeURIComponent('Código QR no encontrado o inválido')}`;
          return Response.redirect(redirectUrl, 302);
        }
        
        // Verificar que el QR esté en estado válido
        if (qrData.status === 'expired' || qrData.status === 'used') {
          const redirectUrl = `${frontendUrl}/configuracion?error=${encodeURIComponent('Código QR ya fue utilizado o expiró')}`;
          return Response.redirect(redirectUrl, 302);
        }
        
        organizationId = qrData.organization_id;
      } else {
        // Es un organizationId directo (compatibilidad con flujo anterior)
        organizationId = decodedState;
      }
    } catch {
      const redirectUrl = `${frontendUrl}/configuracion?error=${encodeURIComponent('State inválido')}`;
      return Response.redirect(redirectUrl, 302);
    }

    // Obtener credenciales de la app de Meta (para intercambiar código)
    const appId = Deno.env.get('WHATSAPP_APP_ID') || '1697684594201061';
    const appSecret = Deno.env.get('WHATSAPP_APP_SECRET') || '75ec6c1f9c00e3ee5ca3763e5c46a920';

    // URL de redirección (debe coincidir con la configurada en Facebook App)
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/whatsapp-oauth-callback`;

    // Intercambiar código por access token
    const tokenData = await exchangeCodeForToken(code, redirectUri, appId, appSecret);
    const shortLivedToken = tokenData.access_token;

    // Obtener token de larga duración
    let longLivedToken: string;
    try {
      longLivedToken = await getLongLivedToken(shortLivedToken, appId, appSecret);
    } catch (err) {
      console.error('Error obteniendo token de larga duración, usando token corto:', err);
      longLivedToken = shortLivedToken;
    }

    // Obtener información del usuario
    const userInfo = await getFacebookUser(longLivedToken);

    // Obtener WhatsApp Business Accounts
    const businessAccountsData = await getBusinessAccounts(longLivedToken);
    const businessAccounts = businessAccountsData.whatsapp_business_accounts?.data || [];

    // Si no hay cuentas de negocio, redirigir con error
    if (!businessAccounts || businessAccounts.length === 0) {
      const redirectUrl = `${frontendUrl}/configuracion?error=${encodeURIComponent('No se encontraron cuentas de WhatsApp Business. Asegúrate de tener una cuenta configurada en Meta Business Manager.')}`;
      return Response.redirect(redirectUrl, 302);
    }

    // Usar la primera cuenta de negocio (o permitir al usuario elegir después)
    const businessAccount = businessAccounts[0];
    const phoneNumbers = businessAccount.phone_numbers?.data || [];

    // Actualizar o crear integración en BD
    const integrationData: any = {
      organization_id: organizationId,
      business_account_id: businessAccount.id,
      app_id: appId,
      access_token: longLivedToken, // TODO: Encriptar antes de guardar
      status: phoneNumbers.length > 0 ? 'connected' : 'pending',
      verified_at: new Date().toISOString(),
      last_sync_at: new Date().toISOString(),
    };

    // Si hay números de teléfono, usar el primero
    if (phoneNumbers.length > 0) {
      const phoneNumber = phoneNumbers[0];
      integrationData.phone_number_id = phoneNumber.id;
      integrationData.phone_number = phoneNumber.display_phone_number;
    }

    const { data: integration, error: dbError } = await supabase
      .from('whatsapp_integrations')
      .upsert(integrationData, {
        onConflict: 'organization_id',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error guardando integración:', dbError);
      const redirectUrl = `${frontendUrl}/configuracion?error=${encodeURIComponent('Error al guardar configuración')}`;
      return Response.redirect(redirectUrl, 302);
    }

    // Si se usó un código QR, marcarlo como usado
    if (qrCode) {
      await supabase
        .from('qr_codes')
        .update({
          status: 'used',
          used_at: new Date().toISOString(),
        })
        .eq('code', qrCode);
    }

    // Redirigir a la página de configuración con éxito
    const redirectUrl = `${frontendUrl}/configuracion?success=true&connected=true`;
    return Response.redirect(redirectUrl, 302);
  } catch (error: any) {
    console.error('Error en OAuth callback:', error);
    const errorMessage = error.message || 'Error desconocido en la autorización';
    const frontendUrl = Deno.env.get('FRONTEND_URL') || Deno.env.get('PUBLIC_SITE_URL') || 'https://cmr-chatbot-two.vercel.app';
    const redirectUrl = `${frontendUrl}/configuracion?error=${encodeURIComponent(errorMessage)}`;
    return Response.redirect(redirectUrl, 302);
  }
});
