import { createClient } from '../lib/supabase';

const supabase = createClient();

export interface StartVerificationRequest {
  organizationId: string;
  phoneNumber: string;
}

export interface VerifyCodeRequest {
  organizationId: string;
  phoneNumber: string;
  code: string;
}

export interface DisconnectRequest {
  organizationId: string;
}

/**
 * Inicia el proceso de verificación de número de WhatsApp
 */
export async function requestVerificationCode(data: StartVerificationRequest) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No hay sesión activa');
  }

  try {
    // Usar funciones.invoke de Supabase para llamar Edge Functions
    const { data: result, error } = await supabase.functions.invoke('smart-endpoint', {
      body: {
        action: 'start_verification',
        ...data,
      },
    });

    if (error) {
      console.error('Error from Edge Function:', error);
      throw new Error(error.message || 'Error al iniciar la verificación');
    }

    return result;
  } catch (err: any) {
    console.error('Error calling Edge Function:', err);
    // Si es error de CORS, dar mensaje más claro
    if (err.message?.includes('CORS') || err.message?.includes('Failed to fetch')) {
      throw new Error('Error de conexión. Verifica que la Edge Function esté desplegada correctamente en Supabase.');
    }
    throw err;
  }
}

/**
 * Verifica el código de verificación
 */
export async function verifyCode(data: VerifyCodeRequest) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No hay sesión activa');
  }

  try {
    const { data: result, error } = await supabase.functions.invoke('smart-endpoint', {
      body: {
        action: 'verify_code',
        ...data,
      },
    });

    if (error) {
      console.error('Error from Edge Function:', error);
      throw new Error(error.message || 'Error al verificar el código');
    }

    return result;
  } catch (err: any) {
    console.error('Error calling Edge Function:', err);
    if (err.message?.includes('CORS') || err.message?.includes('Failed to fetch')) {
      throw new Error('Error de conexión. Verifica que la Edge Function esté desplegada correctamente en Supabase.');
    }
    throw err;
  }
}

/**
 * Desconecta la integración de WhatsApp
 */
export async function disconnectWhatsApp(data: DisconnectRequest) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No hay sesión activa');
  }

  try {
    const { data: result, error } = await supabase.functions.invoke('smart-endpoint', {
      body: {
        action: 'disconnect',
        ...data,
      },
    });

    if (error) {
      console.error('Error from Edge Function:', error);
      throw new Error(error.message || 'Error al desconectar');
    }

    return result;
  } catch (err: any) {
    console.error('Error calling Edge Function:', err);
    if (err.message?.includes('CORS') || err.message?.includes('Failed to fetch')) {
      throw new Error('Error de conexión. Verifica que la Edge Function esté desplegada correctamente en Supabase.');
    }
    throw err;
  }
}

/**
 * Obtiene el estado de la integración
 */
export async function getIntegrationStatus(organizationId: string) {
  const { data, error } = await supabase
    .from('whatsapp_integrations')
    .select('*')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Verifica el estado del número en Meta API
 */
export async function checkNumberStatus(organizationId: string, phoneNumberId?: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No hay sesión activa');
  }

  try {
    const { data: result, error } = await supabase.functions.invoke('super-worker', {
      body: {
        action: 'check_status',
        organizationId,
        phoneNumberId,
      },
    });

    if (error) {
      throw new Error(error.message || 'Error al verificar estado');
    }

    return result;
  } catch (err: any) {
    console.error('Error checking number status:', err);
    throw err;
  }
}