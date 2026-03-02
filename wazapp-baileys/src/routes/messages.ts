import { Router } from 'express';
import { sessionManager } from '../index.js';

export const messagesRouter = Router();

messagesRouter.post('/send', async (req, res) => {
  try {
    const { clientId, to, message } = req.body;

    if (!clientId || !to || !message) {
      return res.status(400).json({ error: 'clientId, to y message requeridos' });
    }

    const success = await sessionManager.sendMessage(clientId, to, message);

    if (success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'No se pudo enviar el mensaje' });
    }
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
});
