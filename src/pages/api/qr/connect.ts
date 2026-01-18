import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { code, organizationId, phoneNumber } = await request.json();

    if (!code || !organizationId || !phoneNumber) {
      return new Response(
        JSON.stringify({ success: false, error: 'Código QR, organización y número de teléfono son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar formato de número
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Formato de número inválido. Usa formato internacional: +51987654321' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Crear cliente Supabase
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Configuración del servidor incorrecta' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar que el código QR existe y es válido
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('*, organization_id')
      .eq('code', code)
      .eq('organization_id', organizationId)
      .single();

    if (qrError || !qrCode) {
      return new Response(
        JSON.stringify({ success: false, error: 'Código QR no encontrado o inválido' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (qrCode.status === 'expired' || qrCode.status === 'used') {
      return new Response(
        JSON.stringify({ success: false, error: 'Código QR ya fue utilizado o expiró' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener credenciales del sistema
    const appId = process.env.WHATSAPP_APP_ID || '1697684594201061';
    const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '754836650218132';
    
    // Llamar a Edge Function para buscar/registrar el número específico en Meta
    // Esto obtendrá el phone_number_id único para este número específico
    const supabaseFunctionsUrl = supabaseUrl.replace('/rest/v1', '');
    
    const metaApiResponse = await fetch(`${supabaseFunctionsUrl}/functions/v1/super-worker`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'get_phone_id',
        organizationId,
        phoneNumber,
      }),
    });

    let phoneNumberId: string | null = null;
    
    if (metaApiResponse.ok) {
      const metaApiData = await metaApiResponse.json();
      phoneNumberId = metaApiData.phoneNumberId;
    }

    // Si el número no existe en Meta, intentar registrarlo
    if (!phoneNumberId) {
      const registerResponse = await fetch(`${supabaseFunctionsUrl}/functions/v1/super-worker`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
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

    // Si aún no tenemos phone_number_id, usar el número como fallback temporal
    // En producción, esto debería requerir que el número esté registrado primero
    if (!phoneNumberId) {
      console.warn(`⚠️ No se encontró phone_number_id para ${phoneNumber}. El número puede necesitar ser registrado en Meta Business Manager primero.`);
      // Continuar con conexión pero marcar como 'pending' para que el usuario complete el registro después
    }

    // Conectar usando el número y phone_number_id específicos de esta organización
    // Cada organización tendrá su propio número y phone_number_id único
    const { data: integration, error: upsertError } = await supabase
      .from('whatsapp_integrations')
      .upsert({
        organization_id: organizationId,
        phone_number: phoneNumber, // Número específico de esta organización
        phone_number_id: phoneNumberId, // ID único de este número en Meta
        business_account_id: businessAccountId,
        app_id: appId,
        status: phoneNumberId ? 'connected' : 'pending', // Connected si tiene phone_number_id, pending si no
        verified_at: phoneNumberId ? new Date().toISOString() : null,
        last_sync_at: new Date().toISOString(),
      }, {
        onConflict: 'organization_id',
      })
      .select()
      .single();

    if (upsertError) {
      console.error('Error conectando:', upsertError);
      return new Response(
        JSON.stringify({ success: false, error: upsertError.message || 'Error al conectar WhatsApp' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Marcar código QR como usado
    await supabase
      .from('qr_codes')
      .update({
        status: 'used',
        used_at: new Date().toISOString(),
      })
      .eq('code', code);

    return new Response(
      JSON.stringify({
        success: true,
        message: phoneNumberId 
          ? 'WhatsApp conectado exitosamente. Ya puedes enviar y recibir mensajes.'
          : 'Número registrado. Puede ser necesario completar la verificación en Meta Business Manager.',
        integration: {
          phone_number: integration.phone_number,
          phone_number_id: integration.phone_number_id,
          status: integration.status,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error conectando:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
