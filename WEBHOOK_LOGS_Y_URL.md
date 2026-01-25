# Webhook WhatsApp: logs y URL para Meta

## Por qué no ves logs

1. **Meta no puede usar `localhost`**  
   Si en Meta configuraste `http://localhost:3001/webhook`, los servidores de Meta nunca llegan a tu máquina. Tienen que usar una **URL pública**.

2. **Meta exige HTTPS** (salvo excepciones)  
   Una URL `http://tu-ip:3001/webhook` suele ser rechazada. Meta suele requerir HTTPS.

3. **Recomendado: Meta → Supabase directo o Meta → wazapp.ai**  
   Usa la Edge Function (`.../whatsapp-webhook`) o el proxy en la app: `https://wazapp.ai/api/webhooks/whatsapp`. Todo en HTTPS.

---

## Opción A: Meta apunta directo a Supabase (recomendado)

### 1. URL del webhook en Meta

En **Meta for Developers** → tu app → **WhatsApp** → **Configuración** → **Webhook**:

- **Callback URL** (elige una):
  - **Opción A:** `https://<TU_PROJECT_REF>.supabase.co/functions/v1/whatsapp-webhook`  
    Ejemplo: `https://fsnolvozwcnbyuradiru.supabase.co/functions/v1/whatsapp-webhook`
  - **Opción A' (app):** `https://wazapp.ai/api/webhooks/whatsapp`  
    (proxy en Vercel que reenvía a la Edge Function; todo bajo **wazapp.ai**)

- **Verify token:**  
  El mismo valor que tienes en **Supabase** → Edge Functions → `whatsapp-webhook` → **Secrets** → `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.

### 2. Comprobar que hay logs en Supabase

```bash
curl "https://fsnolvozwcnbyuradiru.supabase.co/functions/v1/whatsapp-webhook?ping=1"
```

Si tu proyecto exige auth, usa la **anon key** (Supabase → Settings → API):

```bash
curl "https://fsnolvozwcnbyuradiru.supabase.co/functions/v1/whatsapp-webhook?ping=1" \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -H "apikey: TU_ANON_KEY"
```

Deberías recibir `OK`. En **Supabase** → **Edge Functions** → **whatsapp-webhook** → **Logs** debe aparecer algo como:

```text
🏓 PING / health check – si ves esto en Supabase Logs, el webhook está vivo
```

Si no aparece nada, (1) que la función esté desplegada, (2) que no bloquee requests sin auth. **Meta no envía Authorization.** Si tu proyecto exige JWT, las peticiones de Meta pueden devolver 401 sin ejecutar código; en ese caso permite invocación sin auth o usa Opción B. Antes, revisa que la función esté desplegada y que no haya restricciones (por ejemplo, “Enforce JWT” que bloquee requests sin auth).

### 3. Secrets de la Edge Function

En la función `whatsapp-webhook` configura al menos:

- `WHATSAPP_WEBHOOK_VERIFY_TOKEN` (el mismo que en Meta)
- `WHATSAPP_APP_SECRET` (opcional; si falta, se omitirá validación de firma)
- `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya vienen inyectados.

---

## Opción B: Meta → servidor en VPS → Supabase

Si usas el servidor Node en el VPS (`/opt/whatsapp-webhook` o similar):

### 1. URL pública y HTTPS

Meta tiene que llamar a una URL **pública y HTTPS**, por ejemplo:

- `https://wazapp.ai/webhook`, o  
- `https://api.wazapp.ai/webhook` (si expones el webhook en un subdominio)  
con un reverse proxy (nginx, Caddy, etc.) y SSL. **No uses `http://localhost:3001`** en Meta.

### 2. Variables de entorno en el servidor

En `.env` o donde cargues env:

```bash
SUPABASE_URL=https://fsnolvozwcnbyuradiru.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
WHATSAPP_WEBHOOK_VERIFY_TOKEN=mi_token_secreto_123
PORT=3001
WEBHOOK_LOG_FILE=/opt/whatsapp-webhook/webhook.log
```

### 3. Probar servidor local y reenvío a Supabase

```bash
curl "http://localhost:3001/webhook?ping=1"
# o, si tienes dominio:
curl "https://wazapp.ai/webhook?ping=1"
```

Deberías recibir JSON tipo `{ "ok": true, "source": "local", "supabase": "ok" }` y en `webhook.log` líneas como:

```text
GET /webhook?ping=1 — ping local OK
Supabase ping OK: 200
```

Y en **Supabase** → **whatsapp-webhook** → **Logs**, el mismo “PING” de antes.

### 4. Logs del servidor

El script escribe en **consola** y en **archivo** (`WEBHOOK_LOG_FILE` o `webhook.log` por defecto):

```bash
tail -f /opt/whatsapp-webhook/webhook.log
```

Cuando Meta envía un POST, deberías ver `=== Webhook POST recibido ===` y el reenvío a Supabase.

---

## Resumen

| Dónde configuras | Valor |
|------------------|--------|
| **Meta → Callback URL** | `https://<project>.supabase.co/.../whatsapp-webhook` (Supabase) o `https://wazapp.ai/api/webhooks/whatsapp` (app) o `https://wazapp.ai/webhook` (servidor Node) |
| **Meta → Verify token** | Igual que `WHATSAPP_WEBHOOK_VERIFY_TOKEN` en Supabase |
| **Logs Supabase** | Dashboard → Edge Functions → whatsapp-webhook → Logs |
| **Probar Supabase** | `curl "https://.../whatsapp-webhook?ping=1"` |
| **Probar servidor local** | `curl "http://localhost:3001/webhook?ping=1"` y `tail -f webhook.log` |

Si tras esto sigues sin logs, indica: qué URL tienes en Meta, si usas Opción A o B, y qué aparece (o no) en Supabase Logs y en `webhook.log`.
