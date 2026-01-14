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

  // Usar funciones.invoke de Supabase para llamar Edge Functions
  const { data: result, error } = await supabase.functions.invoke('whatsapp-oauth', {
    body: {
      action: 'start_verification',
      ...data,
    },
  });

  if (error) {
    throw new Error(error.message || 'Error al iniciar la verificación');
  }

  return result;
}

/**
 * Verifica el código de verificación
 */
export async function verifyCode(data: VerifyCodeRequest) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No hay sesión activa');
  }

  const { data: result, error } = await supabase.functions.invoke('whatsapp-oauth', {
    body: {
      action: 'verify_code',
      ...data,
    },
  });

  if (error) {
    throw new Error(error.message || 'Error al verificar el código');
  }

  return result;
}

/**
 * Desconecta la integración de WhatsApp
 */
export async function disconnectWhatsApp(data: DisconnectRequest) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No hay sesión activa');
  }

  const { data: result, error } = await supabase.functions.invoke('whatsapp-oauth', {
    body: {
      action: 'disconnect',
      ...data,
    },
  });

  if (error) {
    throw new Error(error.message || 'Error al desconectar');
  }

  return result;
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

