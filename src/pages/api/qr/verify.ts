import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

// Handler GET opcional (para evitar warning)
export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({ error: 'Método no permitido. Use POST para verificar códigos QR.' }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { code } = await request.json();

    if (!code) {
      return new Response(
        JSON.stringify({ success: false, error: 'Código QR requerido' }),
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

    // Buscar código QR
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('*, organization_id')
      .eq('code', code)
      .single();

    if (qrError || !qrCode) {
      return new Response(
        JSON.stringify({ success: false, error: 'Código QR no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar si expiró
    const now = new Date();
    const expiresAt = new Date(qrCode.expires_at);
    if (now > expiresAt && qrCode.status === 'pending') {
      await supabase
        .from('qr_codes')
        .update({ status: 'expired' })
        .eq('code', code);
      return new Response(
        JSON.stringify({ success: false, error: 'Código QR expirado' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar estado
    if (qrCode.status === 'used') {
      return new Response(
        JSON.stringify({ success: false, error: 'Este código QR ya fue utilizado' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Marcar como escaneado
    if (qrCode.status === 'pending') {
      await supabase
        .from('qr_codes')
        .update({ 
          status: 'scanned',
          scanned_at: new Date().toISOString()
        })
        .eq('code', code);
    }

    // Retornar organización ID y número de teléfono del QR
    const phoneNumber = qrCode.metadata?.phoneNumber || null;
    
    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Este código QR no tiene un número asociado. Por favor genera un nuevo QR.'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        organizationId: qrCode.organization_id,
        phoneNumber: phoneNumber, // Número que viene del QR
        code: code
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error verificando QR:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
