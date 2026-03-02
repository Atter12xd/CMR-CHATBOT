# 🤖 Plan de Integración IA - Wazapp CRM

## Resumen

Conectar WhatsApp **directo por QR** (Baileys) sin depender de Meta/Facebook API, usando el servidor Contabo como backend de WhatsApp + IA.

## ⚠️ Cambio Importante

**ANTES (Meta API):** Requiere aprobación de Facebook (semanas de espera)
**AHORA (Baileys):** Conexión directa por QR, funciona al instante

## Nueva Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DASHBOARD WAZAPP.AI                                  │
│                           (Vercel + Supabase)                                │
│                                                                              │
│   Cliente se registra → Conectar WhatsApp → Escanea QR → ¡Listo!           │
│                                                                              │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  │ WebSocket / API REST
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SERVIDOR CONTABO (86.48.30.26)                          │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    BAILEYS MULTI-SESSION                             │   │
│  │                      (WhatsApp Web API)                              │   │
│  │                                                                       │   │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │   │  Cliente 1  │  │  Cliente 2  │  │  Cliente 3  │                 │   │
│  │   │ +51999...   │  │ +51988...   │  │ +51977...   │                 │   │
│  │   │  Session A  │  │  Session B  │  │  Session C  │                 │   │
│  │   └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  │                                                                       │   │
│  └──────────────────────────────┬──────────────────────────────────────┘   │
│                                 │                                           │
│                                 ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         IA ENGINE                                    │   │
│  │                                                                       │   │
│  │   Ollama (gratis)  ←→  OpenAI (producción)  ←→  Anthropic           │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SUPABASE                                          │
│                                                                              │
│   • Clientes (organizaciones)                                               │
│   • Sesiones WhatsApp (credenciales encriptadas)                            │
│   • Chats y Mensajes                                                        │
│   • Productos y Entrenamiento                                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Flujo de Conexión WhatsApp (QR)

```
1. Cliente inicia sesión en dashboard
                │
                ▼
2. Click en "Conectar WhatsApp"
                │
                ▼
3. Dashboard pide QR al servidor Contabo
   POST /api/whatsapp/qr { clientId: "uuid" }
                │
                ▼
4. Servidor genera sesión Baileys + QR
                │
                ▼
5. Dashboard muestra QR al cliente
                │
                ▼
6. Cliente escanea con su celular
                │
                ▼
7. Baileys detecta conexión exitosa
                │
                ▼
8. Servidor guarda credenciales encriptadas en Supabase
                │
                ▼
9. Dashboard muestra "✅ WhatsApp conectado"
                │
                ▼
10. Bot activo, recibiendo y respondiendo mensajes
```

## Backend: API de WhatsApp (Contabo)

Crear un servicio Node.js en Contabo que maneje múltiples sesiones de Baileys.

### Estructura del Proyecto

```
/root/wazapp-baileys/
├── package.json
├── src/
│   ├── index.ts              # Express server
│   ├── baileys/
│   │   ├── manager.ts        # Gestión de sesiones
│   │   ├── session.ts        # Clase de sesión individual
│   │   └── events.ts         # Handlers de eventos
│   ├── routes/
│   │   ├── qr.ts             # Endpoints de QR
│   │   ├── messages.ts       # Endpoints de mensajes
│   │   └── status.ts         # Estado de conexiones
│   ├── ai/
│   │   └── responder.ts      # Lógica de IA
│   └── db/
│       └── supabase.ts       # Cliente Supabase
├── sessions/                  # Credenciales (gitignore)
└── .env
```

### package.json

```json
{
  "name": "wazapp-baileys",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "build": "tsc"
  },
  "dependencies": {
    "@whiskeysockets/baileys": "^6.7.0",
    "@supabase/supabase-js": "^2.90.0",
    "express": "^4.18.2",
    "qrcode": "^1.5.3",
    "openai": "^4.20.0",
    "pino": "^8.16.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "tsx": "^4.6.0",
    "typescript": "^5.3.0"
  }
}
```

### src/index.ts (Server Principal)

```typescript
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { SessionManager } from './baileys/manager.js';
import { qrRouter } from './routes/qr.js';
import { messagesRouter } from './routes/messages.js';
import { statusRouter } from './routes/status.js';

config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
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

// Session Manager (singleton)
export const sessionManager = new SessionManager();

// Routes
app.use('/api/whatsapp/qr', qrRouter);
app.use('/api/whatsapp/messages', messagesRouter);
app.use('/api/whatsapp/status', statusRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    sessions: sessionManager.getActiveSessions().length,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Wazapp Baileys server running on port ${PORT}`);
});
```

### src/baileys/manager.ts (Gestor de Sesiones)

```typescript
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  proto
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { handleIncomingMessage } from './events.js';

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

  // Restaurar sesiones existentes al iniciar
  private async restoreExistingSessions() {
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
  }

  async createSession(clientId: string): Promise<Session> {
    // Si ya existe, retornarla
    if (this.sessions.has(clientId)) {
      return this.sessions.get(clientId)!;
    }

    const sessionPath = path.join(this.sessionsDir, clientId);
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    const socket = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ['Wazapp.ai', 'Chrome', '120.0.0'],
    });

    const session: Session = {
      socket,
      clientId,
      status: 'connecting',
    };

    this.sessions.set(clientId, session);

    // Evento: QR code generado
    socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        session.status = 'qr';
        session.qrCode = qr;
        this.emit('qr', { clientId, qr });
        console.log(`📱 QR generado para cliente: ${clientId}`);
      }

      if (connection === 'close') {
        const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;
        
        if (reason === DisconnectReason.loggedOut) {
          // Usuario cerró sesión, limpiar
          session.status = 'disconnected';
          this.sessions.delete(clientId);
          fs.rmSync(sessionPath, { recursive: true, force: true });
          
          await supabase
            .from('whatsapp_sessions')
            .update({ status: 'disconnected' })
            .eq('client_id', clientId);

          this.emit('disconnected', { clientId, reason: 'logged_out' });
        } else if (reason !== DisconnectReason.loggedOut) {
          // Reconectar
          console.log(`Reconectando sesión: ${clientId}`);
          this.sessions.delete(clientId);
          setTimeout(() => this.createSession(clientId), 3000);
        }
      }

      if (connection === 'open') {
        session.status = 'connected';
        session.phoneNumber = socket.user?.id.split(':')[0];
        
        // Guardar en Supabase
        await supabase
          .from('whatsapp_sessions')
          .upsert({
            client_id: clientId,
            phone_number: session.phoneNumber,
            status: 'connected',
            connected_at: new Date().toISOString()
          });

        this.emit('connected', { clientId, phoneNumber: session.phoneNumber });
        console.log(`✅ Cliente conectado: ${clientId} (${session.phoneNumber})`);
      }
    });

    // Guardar credenciales
    socket.ev.on('creds.update', saveCreds);

    // Mensajes entrantes
    socket.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const msg of messages) {
        if (msg.key.fromMe) continue; // Ignorar mensajes propios
        
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
    if (!session || session.status !== 'connected') {
      return false;
    }

    try {
      const jid = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;
      await session.socket.sendMessage(jid, { text: message });
      return true;
    } catch (error) {
      console.error(`Error enviando mensaje: ${error}`);
      return false;
    }
  }
}
```

### src/baileys/events.ts (Manejo de Mensajes + IA)

```typescript
import { WASocket, proto } from '@whiskeysockets/baileys';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function handleIncomingMessage(
  socket: WASocket,
  msg: proto.IWebMessageInfo,
  clientId: string
) {
  const remoteJid = msg.key.remoteJid!;
  const senderPhone = remoteJid.replace('@s.whatsapp.net', '');
  const messageText = msg.message?.conversation || 
                      msg.message?.extendedTextMessage?.text || '';

  if (!messageText) return; // Ignorar mensajes sin texto

  console.log(`📩 Mensaje de ${senderPhone}: ${messageText}`);

  try {
    // 1. Obtener configuración del cliente
    const { data: clientConfig } = await supabase
      .from('organizations')
      .select('id, name, openai_api_key, bot_active')
      .eq('whatsapp_client_id', clientId)
      .single();

    if (!clientConfig?.bot_active) {
      console.log('Bot desactivado para este cliente');
      return;
    }

    // 2. Obtener o crear chat
    const chatId = await getOrCreateChat(clientConfig.id, senderPhone, msg);

    // 3. Guardar mensaje del usuario
    await supabase.from('messages').insert({
      chat_id: chatId,
      sender_type: 'user',
      text: messageText,
      platform_message_id: msg.key.id,
      status: 'delivered'
    });

    // 4. Generar respuesta IA
    const aiResponse = await generateAIResponse(clientConfig, chatId, messageText);

    // 5. Enviar respuesta por WhatsApp
    await socket.sendMessage(remoteJid, { text: aiResponse });

    // 6. Guardar respuesta del bot
    await supabase.from('messages').insert({
      chat_id: chatId,
      sender_type: 'bot',
      text: aiResponse,
      status: 'sent'
    });

    console.log(`🤖 Respuesta enviada a ${senderPhone}`);

  } catch (error) {
    console.error('Error procesando mensaje:', error);
  }
}

async function getOrCreateChat(
  organizationId: string,
  customerPhone: string,
  msg: proto.IWebMessageInfo
): Promise<string> {
  // Buscar chat existente
  const { data: existingChat } = await supabase
    .from('chats')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('customer_phone', customerPhone)
    .single();

  if (existingChat) {
    // Actualizar last_message_at
    await supabase
      .from('chats')
      .update({ 
        last_message_at: new Date().toISOString(),
        unread_count: supabase.rpc('increment', { x: 1 })
      })
      .eq('id', existingChat.id);
    
    return existingChat.id;
  }

  // Crear nuevo chat
  const pushName = msg.pushName || `Usuario ${customerPhone.slice(-4)}`;
  
  const { data: newChat } = await supabase
    .from('chats')
    .insert({
      organization_id: organizationId,
      customer_name: pushName,
      customer_phone: customerPhone,
      platform: 'whatsapp',
      status: 'active',
      last_message_at: new Date().toISOString()
    })
    .select('id')
    .single();

  return newChat!.id;
}

async function generateAIResponse(
  clientConfig: any,
  chatId: string,
  userMessage: string
): Promise<string> {
  // Obtener contexto del bot
  const { data: contexts } = await supabase
    .from('bot_context')
    .select('context_text')
    .eq('organization_id', clientConfig.id)
    .order('priority', { ascending: false })
    .limit(10);

  const contextText = contexts?.map(c => c.context_text).join('\n\n') || '';

  // Obtener productos
  const { data: products } = await supabase
    .from('products')
    .select('name, description, price, category')
    .eq('organization_id', clientConfig.id)
    .limit(20);

  const productsContext = products?.map(p => 
    `- ${p.name}: ${p.description || 'Sin descripción'} - S/${p.price}`
  ).join('\n') || 'No hay productos cargados';

  // Obtener historial reciente
  const { data: recentMessages } = await supabase
    .from('messages')
    .select('sender_type, text')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .limit(10);

  const chatHistory = recentMessages?.reverse().map(m => 
    `${m.sender_type === 'user' ? 'Cliente' : 'Asistente'}: ${m.text}`
  ).join('\n') || '';

  // Construir prompt
  const systemPrompt = `Eres un asistente de ventas de "${clientConfig.name}".

CONTEXTO:
${contextText}

PRODUCTOS:
${productsContext}

REGLAS:
- Responde en español
- Sé amable y conciso (máximo 2-3 oraciones)
- Si no sabes algo, ofrece contactar con un agente
- Sugiere productos cuando sea apropiado`;

  // Llamar a OpenAI
  const openai = new OpenAI({
    apiKey: clientConfig.openai_api_key || process.env.OPENAI_API_KEY
  });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      ...chatHistory.split('\n').filter(Boolean).map(line => ({
        role: line.startsWith('Cliente:') ? 'user' : 'assistant' as const,
        content: line.replace(/^(Cliente|Asistente): /, '')
      })),
      { role: 'user', content: userMessage }
    ],
    max_tokens: 300,
    temperature: 0.7
  });

  return completion.choices[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje.';
}
```

### src/routes/qr.ts (Endpoints de QR)

```typescript
import { Router } from 'express';
import QRCode from 'qrcode';
import { sessionManager } from '../index.js';

export const qrRouter = Router();

// Generar QR para un cliente
qrRouter.post('/generate', async (req, res) => {
  try {
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'clientId requerido' });
    }

    // Crear sesión
    const session = await sessionManager.createSession(clientId);

    // Esperar QR (timeout 30s)
    const qrPromise = new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando QR'));
      }, 30000);

      if (session.qrCode) {
        clearTimeout(timeout);
        resolve(session.qrCode);
        return;
      }

      sessionManager.once('qr', (data) => {
        if (data.clientId === clientId) {
          clearTimeout(timeout);
          resolve(data.qr);
        }
      });

      sessionManager.once('connected', (data) => {
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

  } catch (error: any) {
    if (error.message === 'already_connected') {
      return res.json({ success: true, status: 'already_connected' });
    }
    console.error('Error generando QR:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verificar estado de conexión
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

// Desconectar sesión
qrRouter.post('/disconnect', async (req, res) => {
  try {
    const { clientId } = req.body;
    await sessionManager.disconnectSession(clientId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

### src/routes/messages.ts (Enviar Mensajes Manual)

```typescript
import { Router } from 'express';
import { sessionManager } from '../index.js';

export const messagesRouter = Router();

// Enviar mensaje (para cuando el agente humano responde)
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

## Tabla Nueva en Supabase

```sql
-- Sesiones de WhatsApp por cliente
CREATE TABLE whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id TEXT UNIQUE NOT NULL, -- UUID del cliente/organización
  phone_number TEXT,
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('connecting', 'qr', 'connected', 'disconnected')),
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar referencia en organizations
ALTER TABLE organizations 
ADD COLUMN whatsapp_client_id TEXT UNIQUE;

-- Index
CREATE INDEX idx_whatsapp_sessions_client_id ON whatsapp_sessions(client_id);
CREATE INDEX idx_whatsapp_sessions_status ON whatsapp_sessions(status);
```

## Frontend: Componente de Conexión QR

```tsx
// src/components/WhatsAppConnect.tsx
import { useState, useEffect } from 'react';

const BAILEYS_API = 'https://api.wazapp.ai'; // O IP del servidor Contabo

export function WhatsAppConnect({ clientId }: { clientId: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'qr' | 'connected' | 'error'>('idle');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  const generateQR = async () => {
    setStatus('loading');
    
    try {
      const res = await fetch(`${BAILEYS_API}/api/whatsapp/qr/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId })
      });

      const data = await res.json();

      if (data.status === 'already_connected') {
        setStatus('connected');
        return;
      }

      if (data.qrCode) {
        setQrCode(data.qrCode);
        setStatus('qr');
        pollStatus();
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const pollStatus = () => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BAILEYS_API}/api/whatsapp/qr/status/${clientId}`);
        const data = await res.json();

        if (data.status === 'connected') {
          setStatus('connected');
          setPhoneNumber(data.phoneNumber);
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    }, 2000);

    // Timeout después de 2 minutos
    setTimeout(() => clearInterval(interval), 120000);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Conectar WhatsApp</h2>

      {status === 'idle' && (
        <button
          onClick={generateQR}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Generar QR
        </button>
      )}

      {status === 'loading' && (
        <div className="flex items-center gap-2">
          <div className="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full" />
          <span>Generando QR...</span>
        </div>
      )}

      {status === 'qr' && qrCode && (
        <div className="text-center">
          <img src={qrCode} alt="QR Code" className="mx-auto mb-4" />
          <p className="text-gray-600">
            Abre WhatsApp → Dispositivos vinculados → Vincular dispositivo
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Escanea el código QR con tu teléfono
          </p>
        </div>
      )}

      {status === 'connected' && (
        <div className="text-center text-green-600">
          <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="font-bold">¡WhatsApp Conectado!</p>
          {phoneNumber && <p className="text-gray-600">+{phoneNumber}</p>}
        </div>
      )}

      {status === 'error' && (
        <div className="text-red-500">
          Error al conectar. <button onClick={generateQR} className="underline">Reintentar</button>
        </div>
      )}
    </div>
  );
}
```

## Despliegue en Contabo

```bash
# 1. Conectar al servidor
ssh root@86.48.30.26

# 2. Crear directorio
mkdir -p /root/wazapp-baileys
cd /root/wazapp-baileys

# 3. Crear archivos (copiar código de arriba)
# ... o clonar desde repo

# 4. Instalar dependencias
npm install

# 5. Crear .env
cat > .env << EOF
PORT=3001
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
OPENAI_API_KEY=sk-tu-api-key
EOF

# 6. Crear servicio systemd
cat > /etc/systemd/system/wazapp-baileys.service << EOF
[Unit]
Description=Wazapp Baileys WhatsApp Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/wazapp-baileys
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# 7. Compilar y arrancar
npm run build
systemctl daemon-reload
systemctl enable wazapp-baileys
systemctl start wazapp-baileys

# 8. Verificar
systemctl status wazapp-baileys
curl http://localhost:3001/health
```

## Exponer API (Nginx)

```nginx
# /etc/nginx/sites-available/wazapp-api
server {
    listen 80;
    server_name api.wazapp.ai;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Resumen: Ventajas de Este Approach

| Aspecto | Meta API (antes) | Baileys (ahora) |
|---------|------------------|-----------------|
| Aprobación | Semanas de espera | Instantáneo |
| Costo | $$ por mensaje | Gratis |
| Setup | Complejo | Solo QR |
| Límites | Rate limits estrictos | Sin límites |
| Control | Dependes de Meta | Control total |

## Pasos para Cursor

1. **Crear proyecto** `/root/wazapp-baileys/` con los archivos de arriba
2. **Instalar y configurar** Baileys + Supabase
3. **Crear tabla** `whatsapp_sessions` en Supabase
4. **Agregar componente** `WhatsAppConnect.tsx` al dashboard
5. **Configurar Nginx** para exponer API
6. **Probar** flujo completo de conexión QR