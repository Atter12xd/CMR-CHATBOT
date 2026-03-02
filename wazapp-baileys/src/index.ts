import './load-env.js';
import express from 'express';
import cors from 'cors';
import { SessionManager } from './baileys/manager.js';
import { qrRouter } from './routes/qr.js';
import { messagesRouter } from './routes/messages.js';
import { statusRouter } from './routes/status.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'https://wazapp.ai',
    'https://www.wazapp.ai',
    'http://localhost:3000',
    'http://localhost:4321'
  ],
  credentials: true
}));
app.use(express.json());

export const sessionManager = new SessionManager();

app.use('/api/whatsapp/qr', qrRouter);
app.use('/api/whatsapp/messages', messagesRouter);
app.use('/api/whatsapp/status', statusRouter);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    sessions: sessionManager.getActiveSessions().length,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Wazapp Baileys server running on port ${PORT}`);
});
