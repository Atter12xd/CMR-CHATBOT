import { Router } from 'express';
import QRCode from 'qrcode';
import { sessionManager } from '../index.js';

export const qrRouter = Router();

/** Crea la sesión y devuelve al instante. El QR se obtiene por GET /status/:clientId (polling). */
qrRouter.post('/generate', async (req, res) => {
  try {
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'clientId requerido' });
    }

    const session = await sessionManager.createSession(clientId);

    if (session.status === 'connected' && session.phoneNumber) {
      return res.json({ success: true, status: 'already_connected', clientId });
    }

    res.json({ success: true, clientId });
  } catch (error: unknown) {
    console.error('Error generando sesión QR:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/** Incluye qrCode (data URL) cuando status es 'qr' para que el front haga polling y muestre el QR. */
qrRouter.get('/status/:clientId', async (req, res) => {
  const { clientId } = req.params;
  const session = sessionManager.getSession(clientId);

  if (!session) {
    return res.json({ status: 'not_found' });
  }

  const payload: { status: string; phoneNumber?: string; qrCode?: string } = {
    status: session.status,
    phoneNumber: session.phoneNumber,
  };

  if (session.status === 'qr' && session.qrCode) {
    try {
      payload.qrCode = await QRCode.toDataURL(session.qrCode);
    } catch (e) {
      console.error('Error generando data URL del QR:', e);
    }
  }

  res.json(payload);
});

qrRouter.post('/disconnect', async (req, res) => {
  try {
    const { clientId } = req.body;
    await sessionManager.disconnectSession(clientId);
    res.json({ success: true });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
});
