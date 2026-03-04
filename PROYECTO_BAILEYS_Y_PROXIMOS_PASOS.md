# Proyecto Wazapp: Lo que hicimos y próximos pasos

## 1. Idea y solución que usamos

### Idea general
- **WhatsApp sin Meta/Facebook**: Conectar WhatsApp por **QR** usando **Baileys** en un servidor propio (Contabo), sin depender de la API de Meta ni aprobaciones.
- **Arquitectura**: Dashboard (Vercel) → API en Contabo (Node + Express + Baileys) → Supabase (clientes, sesiones, chats, mensajes, IA).

### Soluciones técnicas aplicadas

| Problema | Solución |
|----------|----------|
| Mixed Content / 504 | POST `/qr/generate` devuelve al instante; el QR llega por **polling** a GET `/qr/status/:clientId` (peticiones cortas, sin timeout). |
| CORS duplicado | Solo el backend Node envía CORS; Nginx no añade headers. |
| Connection Failure / QR no salía | Uso de **fetchLatestBaileysVersion()**, logger tipo Pino (silent), **defaultQueryTimeoutMs: 60000**, **generateHighQualityLinkPreview: true**; reconexión a 3 s. |
| Timeout Nginx | `proxy_read_timeout 120s` en Nginx para el proxy al API. |
| HTTPS | Certificado Let's Encrypt con **certbot certonly --webroot**; Nginx en `/www/server/panel/vhost/nginx/api.wazapp.ai.conf` (panel tipo BT). |
| Iconos undefined en Config | Import de **Send**, **MessageCircle**, **Eye**, **Clock**, **Info** desde `lucide-react` en `WhatsAppIntegration.tsx`. |

---

## 2. Archivos y códigos que usamos

### Backend (servidor Contabo) – carpeta `wazapp-baileys/`

| Archivo | Uso |
|---------|-----|
| `src/index.ts` | Express, CORS, rutas `/api/whatsapp/qr`, `/api/whatsapp/messages`, `/api/whatsapp/status`, `load-env.js` primero para `.env`. |
| `src/load-env.ts` | Carga `dotenv` antes de cualquier import que use `process.env`. |
| `src/baileys/manager.ts` | **SessionManager**: `fetchLatestBaileysVersion()`, `useMultiFileAuthState`, `makeWASocket` (version, auth, logger, defaultQueryTimeoutMs, generateHighQualityLinkPreview), eventos `connection.update`, `creds.update`, `messages.upsert`; reconexión 3 s; escritura en `whatsapp_sessions` y Supabase. |
| `src/baileys/events.ts` | **handleIncomingMessage**: lee organización, crea/obtiene chat, guarda mensaje usuario, **generateAIResponse** (bot_context, products, historial), envía respuesta por WhatsApp, guarda mensaje bot. |
| `src/routes/qr.ts` | POST `/generate`: crea sesión y responde al instante. GET `/status/:clientId`: devuelve status, phoneNumber y **qrCode** (data URL) cuando status es `qr`. POST `/disconnect`. |
| `src/routes/messages.ts` | POST `/send`: enviar mensaje manual (clientId, to, message). |
| `src/routes/status.ts` | GET `/`: lista sesiones activas. |
| `package.json` | Baileys, Supabase, express, qrcode, openai, cors, dotenv. |
| `.env` | PORT, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY. |

### Frontend (dashboard)

| Archivo | Uso |
|---------|-----|
| `src/services/whatsapp-baileys.ts` | **generateBaileysQR(clientId)** (POST), **getBaileysStatus(clientId)** (GET), **disconnectBaileys(clientId)** (POST). Variable `PUBLIC_BAILEYS_API_URL` (ej. `https://api.wazapp.ai`). |
| `src/components/WhatsAppIntegration.tsx` | Flujo QR por polling: POST generate → polling GET status cada 1 s; muestra QR cuando `status.qrCode`; al conectar hace upsert en `whatsapp_integrations`. Import de iconos: Send, MessageCircle, Eye, Clock, Info. |
| `src/services/whatsapp-integration.ts` | Solo **getIntegrationStatus(organizationId)** desde Supabase. |
| `src/env.d.ts` | `PUBLIC_BAILEYS_API_URL` opcional. |

### Base de datos (Supabase)

| Archivo / recurso | Uso |
|-------------------|-----|
| `supabase/migrations/create_whatsapp_sessions_baileys.sql` | Tabla **whatsapp_sessions** (client_id, phone_number, status, connected_at). Columna opcional **organizations.whatsapp_client_id**. |
| Tabla `whatsapp_integrations` | Sigue usándose para mostrar en el dashboard (organization_id, phone_number, status, etc.). El front hace upsert al conectar vía Baileys. |

### Servidor (Nginx, systemd)

| Dónde | Uso |
|-------|-----|
| `/www/server/panel/vhost/nginx/api.wazapp.ai.conf` | Server 80 (redirect a HTTPS) y 443; proxy a `127.0.0.1:3001`; `proxy_read_timeout 120s`; certificados Let's Encrypt. |
| `/etc/systemd/system/wazapp-baileys.service` | Servicio que ejecuta `node dist/index.js` en `/root/wazapp-baileys`. |
| Recarga Nginx | `kill -HUP $(cat /www/server/nginx/logs/nginx.pid)` (no usar `systemctl reload nginx` si el servicio está masked). |

### Documentación de referencia

| Archivo | Contenido |
|---------|-----------|
| `integracionwazapp.md` | Plan original: arquitectura, flujo QR, código de ejemplo del backend. |
| `BAILEYS_SETUP_Y_SIGUIENTES_PASOS.md` | Pasos DNS, Nginx, Certbot, Vercel; mensaje para supervisor. |

---

## 3. Próximos pasos (implementaciones pendientes)

### 3.1 Métodos de pago (real)
- **Objetivo**: Que sea real, no solo “dar click”.
- **Qué hacer**: Poder **ingresar número de Yape y nombre** (y otros métodos si aplica); guardar en BD y mostrarlos donde corresponda (checkout, respuestas del bot, etc.). Que todo lo que se muestre sea dato real, no simulado.

### 3.2 Entrenar bot (PDF y más)
- **Objetivo**: Entrenar el bot desde **PDF y otras fuentes**; que el bot **entienda todo eso**.
- **Qué hacer**: Afinar la subida de PDFs (y texto/URL si ya existe), procesar contenido, guardar en contexto del bot (ej. `bot_context` o tabla de entrenamiento) y que las respuestas de la IA usen ese contenido. Revisar que el flujo de “entrenar bot” sea real de punta a punta.

### 3.3 Productos (subir y que el bot los use)
- **Objetivo**: **Subir productos** con fotos y datos; que el **bot entienda esos productos** y se los ofrezca al cliente.
- **Qué hacer**: CRUD de productos con imagen (y campos que falten); que la IA use la tabla `products` (y descripción, foto si se guarda URL) en el contexto al responder, para recomendar y dar info real al cliente.

### 3.4 Pedidos (bot genera pedido con código)
- **Objetivo**: Que el **bot** tome pedidos (ej. “un polo”), pida datos al usuario y **guarde el pedido en el sistema con un código**.
- **Qué hacer**: Flujo en el chat: usuario pide producto → bot pide datos necesarios (nombre, dirección, etc.) → bot confirma y **crea registro en `orders`** (o tabla de pedidos) con **código de pedido**; opcionalmente notificar al negocio. Revisar que el backend de pedidos use datos reales (productos, precios, cliente).

### 3.5 Dashboard en español y con datos reales
- **Objetivo**: Dashboard **en español** y que **todo sea real** (nada simulado).
- **Qué hacer**: Revisar todas las pantallas del dashboard: textos al español, reemplazar datos mock o estáticos por datos de Supabase (organizaciones, chats, pedidos, métricas). Quitar o reemplazar cualquier “demo” o placeholder por flujos reales.

### 3.6 Chat: verificar que los mensajes se guardan
- **Objetivo**: Confirmar que **los mensajes del chat se guardan** bien.
- **Qué hacer**: Revisar que cada mensaje (usuario y bot) se persista en `messages` (y que el bot ya lo hace vía `events.ts`); que la vista de Chats del dashboard lea esos mensajes desde la BD y que no quede nada solo en memoria o simulado.

---

## 4. Resumen rápido

- **Hecho**: WhatsApp por QR con Baileys en Contabo, API HTTPS (api.wazapp.ai), flujo de conexión/desconexión, respuestas del bot con IA, guardado de chats/mensajes en Supabase; iconos del Config arreglados.
- **Siguiente**: Métodos de pago reales (Yape + nombre), entrenar bot con PDF y que entienda todo, productos con fotos y que el bot los use, pedidos con código desde el bot, dashboard en español y 100 % real, y verificar guardado de mensajes en el chat.
