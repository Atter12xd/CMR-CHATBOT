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
| `src/baileys/events.ts` | **handleIncomingMessage**: lee organización, crea/obtiene chat, guarda mensaje usuario; si `bot_active` → **generateAIResponse**; si pregunta de producto → **sendProductImages** (fetch URL, envía imagen + caption por WA, guarda en messages); envía texto bot, guarda mensaje; detección pagos (4.5) e intención compra (4.6). |
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

## 3. Pasos ya implementados (hechos)

### 3.1 Métodos de pago (real) ✅
- **Objetivo**: Que sea real, no solo “dar click”.
- **Qué hacer**: Poder **ingresar número de Yape y nombre** (y otros métodos si aplica); guardar en BD y mostrarlos donde corresponda (checkout, respuestas del bot, etc.). Que todo lo que se muestre sea dato real, no simulado.

### 3.2 Entrenar bot (PDF y más) ✅
- **Objetivo**: Entrenar el bot desde **PDF y otras fuentes**; que el bot **entienda todo eso**.
- **Qué hacer**: Afinar la subida de PDFs (y texto/URL si ya existe), procesar contenido, guardar en contexto del bot (ej. `bot_context` o tabla de entrenamiento) y que las respuestas de la IA usen ese contenido. Revisar que el flujo de “entrenar bot” sea real de punta a punta.

### 3.3 Productos (subir y que el bot los use) ✅
- CRUD de productos con imagen (Storage `product-images`); el bot recibe productos (nombre, descripción, precio, imagen) en el contexto y puede ofrecerlos.

### 3.4 Pedidos (bot genera pedido con código) ✅
- **Objetivo**: Que el **bot** tome pedidos (ej. “un polo”), pida datos al usuario y **guarde el pedido en el sistema con un código**.
- **Qué hacer**: Flujo en el chat: usuario pide producto → bot pide datos necesarios (nombre, dirección, etc.) → bot confirma y **crea registro en `orders`** (o tabla de pedidos) con **código de pedido**; opcionalmente notificar al negocio. Revisar que el backend de pedidos use datos reales (productos, precios, cliente).

### 3.5 Dashboard en español y con datos reales ✅
- **Objetivo**: Dashboard **en español** y que **todo sea real** (nada simulado).
- **Qué hacer**: Revisar todas las pantallas del dashboard: textos al español, reemplazar datos mock o estáticos por datos de Supabase (organizaciones, chats, pedidos, métricas). Quitar o reemplazar cualquier “demo” o placeholder por flujos reales.

### 3.6 Chat: mensajes en BD ✅
- Backend Baileys usa columna `sender`; mensajes usuario y bot se persisten en `messages`; el dashboard lee desde Supabase.

### 3.7 Modo humano (bot pausado) ✅
- Si `chats.bot_active === false`, el backend solo guarda el mensaje del usuario y **no** genera ni envía respuesta (log `[CHAT] Modo humano: bot pausado`). Chats nuevos con `bot_active: true`. Dashboard: en cabecera del chat y menú ⋮, botón "Bot activo" / "Modo humano" y servicio `updateChatBotActive(chatId, botActive)`. Migración `set_default_bot_active_true.sql`.

### 3.8 Fotos de productos en el chat ✅
- Cuando el usuario **pide información de producto** o el bot va a vender, en vez de solo poner un enlace se **envía la foto en el chat** por WhatsApp.
- **Backend** (`events.ts`): `isProductQuestion(text)` detecta palabras tipo producto, catálogo, precio, foto, qué venden, etc. Si aplica, `sendProductImages()` obtiene hasta 5 productos con `image_url`, hace `fetch` de cada URL → buffer → `socket.sendMessage(remoteJid, { image: buffer, caption: "Nombre - S/ precio" })`. Cada envío se guarda en `messages` con `image_url` y texto (caption). Luego se envía el mensaje de texto de la IA. El prompt indica al bot que **no** ponga enlaces de imagen ("las fotos se envían aparte").

---

## 4. Siguientes pasos: que el bot entienda todo

Objetivo: que el bot **sepa cómo hablar**, **cómo ofrecer productos**, **cómo indicar pagos** y **cómo avisar al sistema** cuando alguien paga o está por comprar.

### 4.1 Cómo hablar a la gente (tono y estilo)
- **Objetivo**: Que el bot tenga un tono consistente: amable, claro, en español, sin respuestas largas.
- **Qué hacer**:
  - Afinar el **system prompt** en `wazapp-baileys/src/baileys/events.ts`: reglas de tono (trato de tú/usted según negocio), longitud máxima, emojis opcionales.
  - Opcional: campo en `organizations` o `bot_context` para "personalidad del bot" (formal / cercano) y usarlo en el prompt.
  - Probar con distintos tipos de mensaje (consulta, queja, pedido) y ajustar el prompt.

### 4.2 Cómo dar y ofrecer productos ✅ (con fotos en chat)
- **Objetivo**: Que el bot ofrezca productos con nombre, precio y **foto en el chat** (no solo enlace).
- **Implementado**: Al detectar pregunta de producto, el backend envía hasta 5 imágenes (fetch URL → buffer → WhatsApp con caption "Nombre - S/ precio") y guarda cada mensaje en `messages` con `image_url`; luego envía el texto de la IA. El prompt pide al bot no poner enlaces de imagen. Las URLs de producto deben ser accesibles desde el servidor (p. ej. Supabase Storage público).

### 4.3 Cómo decir a qué método de pago pagar
- **Objetivo**: Que cuando el cliente pregunte "¿cómo pago?" o "¿Yape?", el bot responda con los métodos configurados (Yape/Plin/BCP) y el texto exacto a mostrar (ej. "Yape a nombre de: Juan Pérez").
- **Qué hacer**:
  - El contexto ya incluye métodos de pago activos (hecho en 3.1). En el prompt, añadir: cuando pregunten por pagos, indica solo los métodos que aparecen en MÉTODOS DE PAGO; di el nombre y a nombre de quién (o número de cuenta para BCP).
  - Revisar que el texto generado no invente datos; que use solo lo que viene de `payment_methods_config`.

### 4.4 Cómo hacer que el bot entienda los métodos de pago
- **Objetivo**: Que el bot sepa qué es Yape, Plin, BCP y cuándo ofrecer cada uno (horarios, tipo de pago, etc.) si el negocio lo indica.
- **Qué hacer**:
  - Añadir en el prompt o en `bot_context` un párrafo fijo tipo: "Yape y Plin son pagos por celular; BCP es transferencia/depósito. Indica al cliente que puede pagar por el método que prefiera de la lista."
  - Si el negocio quiere mensajes distintos por método (ej. "Para Yape: …"), guardar ese texto en BD (ej. en `payment_methods_config` o en `bot_context`) y que el bot lo use.

### 4.5 Avisar en el sistema que alguien ya pagó
- **Objetivo**: Cuando el cliente envíe un comprobante o diga "ya pagué", que el sistema lo registre y, si aplica, actualice el pedido.
- **Qué hacer**:
  - **Detectar intención**: en el flujo del bot, detectar mensajes como "ya pagué", "te envío el comprobante", o recepción de imagen en un chat con pedido pendiente.
  - **Registro de pago**: crear registro en tabla `payments` (organization_id, chat_id, customer_name, amount, method, status 'pending', receipt_image_url si subieron foto).
  - **Vincular con pedido**: si hay un pedido reciente (por chat_id) con status 'pending', opcionalmente actualizar el pedido a "en proceso" o marcar "pago reportado".
  - **Notificación al negocio**: opcional: webhook, email o notificación en dashboard ("Cliente X reportó pago de S/ Y").

### 4.6 Ver / avisar sobre persona que está a punto de comprar
- **Objetivo**: Saber quién está por comprar (tiene carrito mental, preguntó precios o dijo "lo quiero") para seguimiento o ofertas.
- **Qué hacer**:
  - **Intención "a punto de comprar"**: en el prompt o con una herramienta, que el bot detecte frases como "cuánto es", "lo tomo", "quiero ese", "me lo reservas", "cómo pago".
  - **Registro en BD**: crear tabla `leads` o usar campo en `chats` (ej. `last_intent`, `interested_in_order_at`); o insertar en `payments` con status 'pending' cuando el cliente dice que va a pagar.
  - **Dashboard**: en Chats o en una vista "Leads / Por cerrar", listar chats con intención reciente de compra o con pedido pendiente de pago.
  - **Opcional**: notificación en tiempo real (Supabase Realtime o polling) para que el negocio vea "Cliente X está preguntando por pago".

---

## 5. Resumen rápido

- **Hecho**: WhatsApp por QR con Baileys, dashboard y flujos reales: mensajes en BD, productos con imagen, pedidos con código, métodos de pago en BD, entrenamiento con PDF/web, dashboard en español con datos de Supabase; **modo humano** (bot pausado por chat); **fotos de productos en el chat** (envío real por WhatsApp cuando preguntan por productos).
- **Siguiente**: Afinar que el bot **entienda todo**: tono (4.1), productos con foto (4.2 hecho), métodos de pago (4.3–4.4), **avisar cuando alguien pagó** (4.5) y **ver quién está a punto de comprar** (4.6).

---

## 6. Para el siguiente Cursor (contexto reciente)

- **Fotos de producto**: En `wazapp-baileys/src/baileys/events.ts` están `isProductQuestion()`, `sendProductImages()` y la llamada antes de enviar el texto de la IA. Las imágenes se obtienen con `fetch` desde `product.image_url`; si el bucket es privado, hace falta URL firmada o hacer el bucket público para esas imágenes.
- **Modo humano**: `chats.bot_active`; si `false`, no se llama a `generateAIResponse` ni se envía mensaje; el dashboard usa `updateChatBotActive` en `src/services/chats.ts` y el botón en `ChatWindow.tsx`.
- **Despliegue backend**: subir `events.ts` al servidor, `npm run build`, `sudo systemctl restart wazapp-baileys`. Logs: `sudo journalctl -u wazapp-baileys -f`.
