import { createClient } from '../lib/supabase';

const supabase = createClient();

export interface RegisterPhoneRequest {
  organizationId: string;
  phoneNumber: string;
}

export interface RequestCodeRequest {
  organizationId: string;
  phoneNumberId: string;
}

export interface VerifyCodeRequest {
  organizationId: string;
  phoneNumberId: string;
  code: string;
}

/**
 * Registra un número de teléfono en Meta
 */
export async function registerPhoneNumber(data: RegisterPhoneRequest) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No hay sesión activa');
  }

  try {
    const { data: result, error } = await supabase.functions.invoke('whatsapp-meta-api', {
      body: {
        action: 'register_phone',
        ...data,
      },
    });

    if (error) {
      throw new Error(error.message || 'Error al registrar número');
    }

    return result;
  } catch (err: any) {
    console.error('Error calling Meta API:', err);
    throw err;
  }
}

/**
 * Solicita código de verificación
 */
export async function requestVerificationCode(data: RequestCodeRequest) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No hay sesión activa');
  }

  try {
    const { data: result, error } = await supabase.functions.invoke('whatsapp-meta-api', {
      body: {
        action: 'request_code',
        ...data,
      },
    });

    if (error) {
      throw new Error(error.message || 'Error al solicitar código');
    }

    return result;
  } catch (err: any) {
    console.error('Error calling Meta API:', err);
    throw err;
  }
}

/**
 * Verifica código de verificación con Meta API
 */
export async function verifyCodeWithMeta(data: VerifyCodeRequest) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No hay sesión activa');
  }

  try {
    const { data: result, error } = await supabase.functions.invoke('whatsapp-meta-api', {
      body: {
        action: 'verify_code',
        ...data,
      },
    });

    if (error) {
      throw new Error(error.message || 'Error al verificar código');
    }

    return result;
  } catch (err: any) {
    console.error('Error calling Meta API:', err);
    throw err;
  }
}

/**
 * Obtiene el Phone Number ID de un número
 */
export async function getPhoneNumberId(organizationId: string, phoneNumber: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No hay sesión activa');
  }

  try {
    const { data: result, error } = await supabase.functions.invoke('whatsapp-meta-api', {
      body: {
        action: 'get_phone_id',
        organizationId,
        phoneNumber,
      },
    });

    if (error) {
      throw new Error(error.message || 'Error al obtener Phone Number ID');
    }

    return result;
  } catch (err: any) {
    console.error('Error calling Meta API:', err);
    throw err;
  }
}

