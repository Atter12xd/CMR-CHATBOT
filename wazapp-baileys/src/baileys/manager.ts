import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  WASocket,
  proto
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { handleIncomingMessage } from './events.js';

const noop = () => {};
const logger = {
  level: 'silent' as const,
  trace: noop,
  debug: noop,
  info: noop,
  warn: noop,
  error: noop,
  fatal: noop,
  child: () => logger,
};

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Session {
  socket: WASocket;
  clientId: string;
  phoneNumber?: string;
  status: 'connecting' | 'qr' | 'connected' | 'disconnected';
  qrCode?: string;
}

export class SessionManager extends EventEmitter {
  private sessions: Map<string, Session> = new Map();
  private sessionsDir = './sessions';

  constructor() {
    super();
    if (!fs.existsSync(this.sessionsDir)) {
      fs.mkdirSync(this.sessionsDir, { recursive: true });
    }
    this.restoreExistingSessions();
  }

  private async restoreExistingSessions() {
    try {
      const { data: clients } = await supabase
        .from('whatsapp_sessions')
        .select('client_id')
        .eq('status', 'connected');

      for (const client of clients || []) {
        const sessionPath = path.join(this.sessionsDir, client.client_id);
        if (fs.existsSync(sessionPath)) {
          console.log(`Restaurando sesión: ${client.client_id}`);
          await this.createSession(client.client_id);
        }
      }
    } catch (e) {
      console.error('Error restaurando sesiones:', e);
    }
  }

  async createSession(clientId: string): Promise<Session> {
    if (this.sessions.has(clientId)) {
      return this.sessions.get(clientId)!;
    }

    const sessionPath = path.join(this.sessionsDir, clientId);
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    const { version } = await fetchLatestBaileysVersion();

    const socket = makeWASocket({
      version,
      auth: state,
      logger,
      printQRInTerminal: false,
      generateHighQualityLinkPreview: true,
      defaultQueryTimeoutMs: 60000,
    });

    const session: Session = {
      socket,
      clientId,
      status: 'connecting',
    };

    this.sessions.set(clientId, session);

    socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        session.status = 'qr';
        session.qrCode = qr;
        this.emit('qr', { clientId, qr });
        console.log(`QR generado para cliente: ${clientId}`);
      }

      if (connection === 'close') {
        const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;

        if (reason === DisconnectReason.loggedOut) {
          session.status = 'disconnected';
          this.sessions.delete(clientId);
          try {
            fs.rmSync(sessionPath, { recursive: true, force: true });
          } catch {}
          await supabase
            .from('whatsapp_sessions')
            .update({ status: 'disconnected' })
            .eq('client_id', clientId);
          this.emit('disconnected', { clientId, reason: 'logged_out' });
        } else if (reason !== DisconnectReason.loggedOut) {
          console.log(`Reconectando sesión: ${clientId} en 3s`);
          this.sessions.delete(clientId);
          setTimeout(() => this.createSession(clientId), 3000);
        }
      }

      if (connection === 'open') {
        session.status = 'connected';
        session.phoneNumber = socket.user?.id?.split(':')[0];

        await supabase
          .from('whatsapp_sessions')
          .upsert({
            client_id: clientId,
            phone_number: session.phoneNumber,
            status: 'connected',
            connected_at: new Date().toISOString()
          }, { onConflict: 'client_id' });

        this.emit('connected', { clientId, phoneNumber: session.phoneNumber });
        console.log(`Cliente conectado: ${clientId} (${session.phoneNumber})`);
      }
    });

    socket.ev.on('creds.update', saveCreds);

    socket.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;
      for (const msg of messages) {
        if (msg.key.fromMe) continue;
        await handleIncomingMessage(socket, msg, clientId);
      }
    });

    return session;
  }

  getSession(clientId: string): Session | undefined {
    return this.sessions.get(clientId);
  }

  getActiveSessions(): string[] {
    return Array.from(this.sessions.keys());
  }

  async disconnectSession(clientId: string): Promise<void> {
    const session = this.sessions.get(clientId);
    if (session) {
      await session.socket.logout();
      this.sessions.delete(clientId);
    }
  }

  async sendMessage(clientId: string, to: string, message: string): Promise<boolean> {
    const session = this.sessions.get(clientId);
    if (!session || session.status !== 'connected') return false;
    try {
      const jid = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;
      await session.socket.sendMessage(jid, { text: message });
      return true;
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      return false;
    }
  }
}
