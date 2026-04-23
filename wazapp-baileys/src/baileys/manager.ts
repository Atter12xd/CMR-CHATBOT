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

type ReminderStageKey = 'h2' | 'h24' | 'h72';

const REMINDER_STAGES: { key: ReminderStageKey; hours: number }[] = [
  { key: 'h2', hours: 2 },
  { key: 'h24', hours: 24 },
  { key: 'h72', hours: 72 },
];

export class SessionManager extends EventEmitter {
  private sessions: Map<string, Session> = new Map();
  private sessionsDir = './sessions';
  private abandonedCartTimer: NodeJS.Timeout | null = null;

  constructor() {
    super();
    if (!fs.existsSync(this.sessionsDir)) {
      fs.mkdirSync(this.sessionsDir, { recursive: true });
    }
    this.restoreExistingSessions();
    this.startAbandonedCartReminderLoop();
  }

  private startAbandonedCartReminderLoop() {
    const run = () => this.processAbandonedCarts().catch((e) => console.error('Error en recordatorios de carrito:', e));
    void run();
    this.abandonedCartTimer = setInterval(run, 15 * 60 * 1000);
  }

  private getNextReminderStage(elapsedHours: number, remindersSent: ReminderStageKey[]): ReminderStageKey | null {
    let next: ReminderStageKey | null = null;
    for (const stage of REMINDER_STAGES) {
      if (elapsedHours >= stage.hours && !remindersSent.includes(stage.key)) {
        next = stage.key;
      }
    }
    return next;
  }

  private buildAbandonedCartReminderMessage(input: {
    customerName?: string | null;
    items: { product_name: string; quantity: number; price: number }[];
    subtotal: number;
    stage: ReminderStageKey;
  }): string {
    const name = (input.customerName || 'hola').trim();
    const introByStage: Record<ReminderStageKey, string> = {
      h2: `Hola ${name}, notamos que dejaste tu carrito pendiente y podemos ayudarte a terminar tu pedido.`,
      h24: `Hola ${name}, te recordamos que tu carrito sigue reservado por ahora. Si deseas, lo cerramos hoy mismo.`,
      h72: `Hola ${name}, tu carrito continúa pendiente. ¿Deseas comprarlo o prefieres que lo cancelemos?`,
    };
    const previewItems = input.items
      .slice(0, 3)
      .map((item) => `- ${item.product_name} x${item.quantity} (S/ ${Number(item.price).toFixed(2)})`)
      .join('\n');
    const extraCount = Math.max(0, input.items.length - 3);
    const extraText = extraCount > 0 ? `\n... y ${extraCount} producto(s) más.` : '';

    return [
      introByStage[input.stage],
      previewItems ? `\nTu carrito:\n${previewItems}${extraText}` : '',
      `\nSubtotal: S/ ${Number(input.subtotal || 0).toFixed(2)}`,
      '\nRespóndenos con "sí, comprar" para continuar o "no, cancelar" para cerrarlo.',
    ]
      .filter(Boolean)
      .join('\n');
  }

  private async processAbandonedCarts() {
    const clientIds = this.getActiveSessions();
    if (!clientIds.length) return;

    for (const clientId of clientIds) {
      const session = this.sessions.get(clientId);
      if (!session || session.status !== 'connected') continue;

      const { data: draftRows } = await supabase
        .from('order_drafts')
        .select(
          'id, organization_id, chat_id, customer_name, subtotal, metadata, status, source, last_customer_message_at, created_at'
        )
        .eq('organization_id', clientId)
        .eq('source', 'whatsapp')
        .in('status', ['draft', 'ready'])
        .not('chat_id', 'is', null)
        .limit(200);

      const drafts = (draftRows || []) as {
        id: string;
        organization_id: string;
        chat_id: string;
        customer_name?: string | null;
        subtotal?: number | null;
        metadata?: Record<string, unknown> | null;
        last_customer_message_at?: string | null;
        created_at: string;
      }[];
      if (!drafts.length) continue;

      const draftIds = drafts.map((d) => d.id);
      const chatIds = drafts.map((d) => d.chat_id);
      const [{ data: itemRows }, { data: chatRows }] = await Promise.all([
        supabase
          .from('order_draft_items')
          .select('draft_id, product_name, quantity, price')
          .in('draft_id', draftIds),
        supabase
          .from('chats')
          .select('id, customer_phone, customer_name, bot_active')
          .in('id', chatIds),
      ]);

      const itemsByDraft = new Map<string, { product_name: string; quantity: number; price: number }[]>();
      for (const row of
        ((itemRows || []) as { draft_id: string; product_name: string; quantity: number; price: number | string }[])) {
        const list = itemsByDraft.get(row.draft_id) || [];
        list.push({
          product_name: row.product_name,
          quantity: row.quantity,
          price: Number(row.price),
        });
        itemsByDraft.set(row.draft_id, list);
      }

      const chatById = new Map<string, { customer_phone?: string | null; customer_name?: string | null; bot_active?: boolean }>();
      for (const row of
        ((chatRows || []) as { id: string; customer_phone?: string | null; customer_name?: string | null; bot_active?: boolean }[])) {
        chatById.set(row.id, row);
      }

      const now = Date.now();
      for (const draft of drafts) {
        const chat = chatById.get(draft.chat_id);
        const phone = chat?.customer_phone?.trim();
        if (!phone || chat?.bot_active === false) continue;

        const baseAt = draft.last_customer_message_at
          ? new Date(draft.last_customer_message_at).getTime()
          : new Date(draft.created_at).getTime();
        if (!baseAt || Number.isNaN(baseAt)) continue;
        const elapsedHours = (now - baseAt) / 3600000;
        if (elapsedHours < 2) continue;

        const metadata = (draft.metadata || {}) as { reminders_sent?: unknown };
        const remindersSent = Array.isArray(metadata.reminders_sent)
          ? metadata.reminders_sent.filter((x): x is ReminderStageKey => x === 'h2' || x === 'h24' || x === 'h72')
          : [];
        const nextStage = this.getNextReminderStage(elapsedHours, remindersSent);
        if (!nextStage) continue;

        const items = itemsByDraft.get(draft.id) || [];
        const subtotal =
          typeof draft.subtotal === 'number'
            ? draft.subtotal
            : items.reduce((sum, i) => sum + i.quantity * Number(i.price), 0);
        const message = this.buildAbandonedCartReminderMessage({
          customerName: draft.customer_name || chat?.customer_name || undefined,
          items,
          subtotal,
          stage: nextStage,
        });

        const sent = await this.sendMessage(clientId, phone, message);
        const currentMeta = (draft.metadata || {}) as Record<string, unknown>;
        const nextRemindersSent = sent ? [...remindersSent, nextStage] : remindersSent;
        const updatedMetadata = {
          ...currentMeta,
          reminders_sent: nextRemindersSent,
          last_reminder_stage: sent ? nextStage : currentMeta.last_reminder_stage,
          last_reminder_at: sent ? new Date().toISOString() : currentMeta.last_reminder_at,
          last_reminder_attempt_stage: nextStage,
          last_reminder_attempt_at: new Date().toISOString(),
          reminder_attempts: Number(currentMeta.reminder_attempts || 0) + 1,
        };

        await supabase
          .from('order_drafts')
          .update({ metadata: updatedMetadata })
          .eq('id', draft.id)
          .eq('organization_id', clientId);

        if (sent) {
          await supabase.from('messages').insert({
            chat_id: draft.chat_id,
            sender: 'bot',
            text: message,
            status: 'sent',
          });
        }
      }
    }
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
