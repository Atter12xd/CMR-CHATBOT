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

  const response = await fetch(`${import.meta.env.PUBLIC_SUPABASE_URL}/functions/v1/whatsapp-oauth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      action: 'start_verification',
      ...data,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al iniciar la verificación');
  }

  return await response.json();
}

/**
 * Verifica el código de verificación
 */
export async function verifyCode(data: VerifyCodeRequest) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No hay sesión activa');
  }

  const response = await fetch(`${import.meta.env.PUBLIC_SUPABASE_URL}/functions/v1/whatsapp-oauth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      action: 'verify_code',
      ...data,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al verificar el código');
  }

  return await response.json();
}

/**
 * Desconecta la integración de WhatsApp
 */
export async function disconnectWhatsApp(data: DisconnectRequest) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No hay sesión activa');
  }

  const response = await fetch(`${import.meta.env.PUBLIC_SUPABASE_URL}/functions/v1/whatsapp-oauth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      action: 'disconnect',
      ...data,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al desconectar');
  }

  return await response.json();
}

/**
 * Obtiene el estado de la integración
 */
export async function getIntegrationStatus(organizationId: string) {
  const { data, error } = await supabase
    .from('whatsapp_integrations')
    .select('*')
    .eq('organization_id', organizationId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
}

