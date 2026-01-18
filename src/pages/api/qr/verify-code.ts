import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { code, verificationCode, organizationId } = await request.json();

    if (!code || !verificationCode || !organizationId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Código QR, código de verificación y organización son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar formato del código
    if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Código de verificación inválido. Debe tener 6 dígitos' }),
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

    // Verificar que el código QR existe y obtener número de teléfono
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('*, organization_id, metadata')
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

    const phoneNumber = qrCode.metadata?.phoneNumber;
    const storedCode = qrCode.metadata?.verificationCode;
    
    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ success: false, error: 'No se encontró número de teléfono asociado al código QR' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar código de verificación
    if (storedCode && storedCode !== verificationCode) {
      return new Response(
        JSON.stringify({ success: false, error: 'Código de verificación incorrecto' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener credenciales del sistema (usar las del roadmap o variables de entorno)
    // Estas credenciales permiten enviar/recibir mensajes inmediatamente
    const appId = process.env.WHATSAPP_APP_ID || '1697684594201061';
    const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '754836650218132';
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '723144527547373';
    
    // Conectar directamente usando credenciales del sistema (tipo WhatsApp.js)
    // El access_token se obtiene de variables de entorno en la Edge Function
    // Esto permite que funcione inmediatamente sin depender de OAuth
    const { data: integration, error: upsertError } = await supabase
      .from('whatsapp_integrations')
      .upsert({
        organization_id: organizationId,
        phone_number: phoneNumber,
        phone_number_id: phoneNumberId, // ID del número registrado
        business_account_id: businessAccountId,
        app_id: appId,
        status: 'connected', // Conectado directamente - listo para enviar/recibir
        verified_at: new Date().toISOString(),
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
        message: 'WhatsApp conectado exitosamente. Ya puedes enviar y recibir mensajes.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error verificando código:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
