import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { code, phoneNumber, organizationId } = await request.json();

    if (!code || !phoneNumber || !organizationId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Código QR, número de teléfono y organización son requeridos' }),
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

    // Generar código de verificación simple (6 dígitos)
    // En producción real, esto enviaría SMS, pero por ahora usamos código simple
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Guardar número y código temporalmente en metadata (se usará para verificar)
    await supabase
      .from('qr_codes')
      .update({
        metadata: { phoneNumber, verificationCode },
      })
      .eq('code', code);

    // En modo desarrollo, devolver el código para que el usuario lo ingrese
    // En producción, esto se enviaría por SMS
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    return new Response(
      JSON.stringify({
        success: true,
        message: isDevelopment 
          ? `Código de verificación: ${verificationCode} (modo desarrollo)`
          : 'Código de verificación enviado por SMS',
        ...(isDevelopment && { developmentCode: verificationCode }),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error solicitando código:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
