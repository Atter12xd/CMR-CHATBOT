/**
 * Servicio para conectar WhatsApp vía Baileys (servidor Contabo).
 * No usa Meta/Facebook API: conexión directa por QR.
 *
 * Configuración: PUBLIC_BAILEYS_API_URL (ej. https://api.wazapp.ai o http://86.48.30.26:3001)
 */

const getBaseUrl = (): string => {
  const url = typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_BAILEYS_API_URL;
  return url || 'https://api.wazapp.ai';
};

export interface BaileysQRResponse {
  success: boolean;
  qrCode?: string; // Data URL de la imagen QR
  clientId?: string;
  status?: 'already_connected';
  error?: string;
  retry?: boolean;
}

export interface BaileysStatusResponse {
  status: 'not_found' | 'connecting' | 'qr' | 'connected' | 'disconnected';
  phoneNumber?: string;
}

/**
 * Solicita un QR al servidor Contabo (Baileys) para vincular WhatsApp.
 * clientId = organizationId (UUID de la organización).
 */
export async function generateBaileysQR(clientId: string): Promise<BaileysQRResponse> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/whatsapp/qr/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Error al generar QR');
  }
  return data as BaileysQRResponse;
}

/**
 * Consulta el estado de la sesión WhatsApp en el servidor Contabo.
 */
export async function getBaileysStatus(clientId: string): Promise<BaileysStatusResponse> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/whatsapp/qr/status/${encodeURIComponent(clientId)}`);
  const data = await res.json().catch(() => ({}));
  return (data as BaileysStatusResponse) || { status: 'not_found' };
}

/**
 * Desconecta la sesión WhatsApp en el servidor Contabo.
 */
export async function disconnectBaileys(clientId: string): Promise<void> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/whatsapp/qr/disconnect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Error al desconectar');
  }
}
