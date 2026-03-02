import { Router } from 'express';
import QRCode from 'qrcode';
import { sessionManager } from '../index.js';

export const qrRouter = Router();

qrRouter.post('/generate', async (req, res) => {
  try {
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'clientId requerido' });
    }

    const session = await sessionManager.createSession(clientId);

    const qrPromise = new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando QR'));
      }, 30000);

      if (session.qrCode) {
        clearTimeout(timeout);
        resolve(session.qrCode);
        return;
      }

      sessionManager.once('qr', (data: { clientId: string; qr: string }) => {
        if (data.clientId === clientId) {
          clearTimeout(timeout);
          resolve(data.qr);
        }
      });

      sessionManager.once('connected', (data: { clientId: string }) => {
        if (data.clientId === clientId) {
          clearTimeout(timeout);
          reject(new Error('already_connected'));
        }
      });
    });

    const qrCode = await qrPromise;
    const qrImage = await QRCode.toDataURL(qrCode);

    res.json({
      success: true,
      qrCode: qrImage,
      clientId
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === 'already_connected') {
      return res.json({ success: true, status: 'already_connected' });
    }
    console.error('Error generando QR:', err);
    res.status(500).json({ error: err.message });
  }
});

qrRouter.get('/status/:clientId', (req, res) => {
  const { clientId } = req.params;
  const session = sessionManager.getSession(clientId);

  if (!session) {
    return res.json({ status: 'not_found' });
  }

  res.json({
    status: session.status,
    phoneNumber: session.phoneNumber
  });
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
