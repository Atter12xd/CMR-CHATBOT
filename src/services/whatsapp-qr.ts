import { createClient } from '../lib/supabase';

const supabase = createClient();

export interface QRCodeResponse {
  code: string;
  qrImage: string;
  qrUrl: string;
  expiresAt: string;
}

export interface QRStatusResponse {
  code: string;
  status: 'pending' | 'scanned' | 'expired' | 'used';
  expiresAt: string;
  scannedAt?: string;
  usedAt?: string;
}

/**
 * Genera un nuevo código QR para conectar WhatsApp
 */
export async function generateQR(organizationId: string): Promise<QRCodeResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No hay sesión activa');
  }

  try {
    const { data, error } = await supabase.functions.invoke('whatsapp-qr-generate', {
      body: {
        organizationId,
      },
    });

    if (error) {
      console.error('Error generando QR:', error);
      throw new Error(error.message || 'Error al generar código QR');
    }

    return data as QRCodeResponse;
  } catch (err: any) {
    console.error('Error llamando Edge Function:', err);
    if (err.message?.includes('CORS') || err.message?.includes('Failed to fetch')) {
      throw new Error('Error de conexión. Verifica que la Edge Function esté desplegada correctamente.');
    }
    throw err;
  }
}

/**
 * Verifica el estado de un código QR
 */
export async function checkQRStatus(code: string): Promise<QRStatusResponse> {
  const { data: { session } = {} } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No hay sesión activa');
  }

  try {
    // Usar fetch directo con query params (no headers personalizados para evitar CORS)
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
    const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';
    
    const response = await fetch(
      `${supabaseUrl}/functions/v1/whatsapp-qr-generate?code=${encodeURIComponent(code)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseKey,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al verificar estado del QR');
    }

    return await response.json() as QRStatusResponse;
  } catch (err: any) {
    console.error('Error verificando estado QR:', err);
    throw err;
  }
}

/**
 * Polling para verificar estado del QR
 */
export function pollQRStatus(
  code: string,
  callback: (status: QRStatusResponse) => void,
  onComplete: () => void,
  interval: number = 3000
): () => void {
  let isPolling = true;

  const poll = async () => {
    if (!isPolling) return;

    try {
      const status = await checkQRStatus(code);
      callback(status);

      // Si el QR fue usado o expiró, detener polling
      if (status.status === 'used' || status.status === 'expired') {
        isPolling = false;
        onComplete();
        return;
      }
    } catch (error) {
      console.error('Error en polling:', error);
      // Continuar polling aunque haya error
    }

    if (isPolling) {
      setTimeout(poll, interval);
    }
  };

  // Iniciar polling
  poll();

  // Retornar función para detener polling
  return () => {
    isPolling = false;
  };
}

/**
 * Verifica código QR desde servidor (para página móvil)
 */
export async function verifyQRCode(code: string): Promise<{ success: boolean; oauthUrl?: string; error?: string }> {
  try {
    // Llamar al endpoint del servidor
    const response = await fetch(`/api/qr/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al verificar código QR');
    }

    return await response.json();
  } catch (err: any) {
    console.error('Error verificando QR:', err);
    return { success: false, error: err.message };
  }
}
