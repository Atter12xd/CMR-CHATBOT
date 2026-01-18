import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { code, organizationId, phoneNumber } = await request.json();

    console.log('🔗 Iniciando conexión QR:', { code, organizationId, phoneNumber });

    if (!code || !organizationId || !phoneNumber) {
      console.error('❌ Faltan parámetros:', { code: !!code, organizationId: !!organizationId, phoneNumber: !!phoneNumber });
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
    
    // Para WhatsApp Business API, usamos las credenciales del sistema
    // El phone_number_id se obtiene de las credenciales globales o se busca dinámicamente
    // Por ahora, conectamos directamente usando las credenciales del sistema
    // Cada organización tendrá su número guardado, pero usará las credenciales compartidas
    
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '723144527547373';
    
    console.log('📱 Usando phone_number_id:', phoneNumberId);
    console.log('📞 Número a conectar:', phoneNumber);

    // Conectar usando el número específico de esta organización
    // Guardamos el número del usuario, pero usamos las credenciales del sistema para enviar/recibir
    console.log('💾 Guardando integración en BD...');
    const { data: integration, error: upsertError } = await supabase
      .from('whatsapp_integrations')
      .upsert({
        organization_id: organizationId,
        phone_number: phoneNumber, // Número específico de esta organización (para identificación)
        phone_number_id: phoneNumberId, // Usamos el phone_number_id del sistema (compartido)
        business_account_id: businessAccountId,
        app_id: appId,
        status: 'connected', // Conectado - listo para usar
        verified_at: new Date().toISOString(),
        last_sync_at: new Date().toISOString(),
      }, {
        onConflict: 'organization_id',
      })
      .select()
      .single();

    if (upsertError) {
      console.error('❌ Error guardando integración:', upsertError);
      return new Response(
        JSON.stringify({ success: false, error: upsertError.message || 'Error al conectar WhatsApp' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Integración guardada exitosamente:', integration.id);

    // Marcar código QR como usado
    console.log('✅ Marcando QR como usado...');
    await supabase
      .from('qr_codes')
      .update({
        status: 'used',
        used_at: new Date().toISOString(),
      })
      .eq('code', code);

    console.log('🎉 Conexión completada exitosamente!');
    return new Response(
      JSON.stringify({
        success: true,
        message: 'WhatsApp conectado exitosamente. Ya puedes enviar y recibir mensajes.',
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
