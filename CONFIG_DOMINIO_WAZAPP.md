# Configuración del dominio wazapp.ai

El proyecto está configurado para usar **https://wazapp.ai** como dominio principal.

## Cambios realizados en código

- **Edge Functions (Supabase)**: `FRONTEND_URL` / `PUBLIC_SITE_URL` usan fallback `https://wazapp.ai`.
  - `whatsapp-qr-generate`: genera URLs de QR como `https://wazapp.ai/connect/qr/{code}`.
  - `whatsapp-oauth-callback`: redirige a `https://wazapp.ai/configuracion` tras OAuth.
- **Astro**: `site: 'https://wazapp.ai'` en `astro.config.mjs` (canónicas, etc.).
- **Vercel**: redirects permanentes:
  - `cmr-chatbot-two.vercel.app` → `https://wazapp.ai` (misma ruta)
  - `www.wazapp.ai` → `https://wazapp.ai` (misma ruta)

## Qué debes configurar tú

### 1. Vercel – Dominio

- En **Project Settings → Domains**: añade `wazapp.ai` (y `www.wazapp.ai` si lo usas).
- Marca `wazapp.ai` como dominio principal si aplica.
- Opcional: en **Domains**, configura redirect de `cmr-chatbot-two.vercel.app` → `wazapp.ai` (el `vercel.json` ya hace redirect por rutas).

### 2. Variables de entorno

**Vercel (tu proyecto):**
```
PUBLIC_APP_URL=https://wazapp.ai
```

**Supabase → Edge Functions → Secrets:**
```
FRONTEND_URL=https://wazapp.ai
```
(o `PUBLIC_SITE_URL`, si lo usas). Así las funciones siempre redirigen al dominio correcto.

### 3. Supabase Auth – Redirect URLs

En **Authentication → URL Configuration**:

- **Site URL**: `https://wazapp.ai`
- **Redirect URLs**: añade al menos:
  - `https://wazapp.ai`
  - `https://wazapp.ai/**`
  - `http://localhost:4321` y `http://localhost:4321/**` para desarrollo local.

### 4. Facebook / Meta – App de WhatsApp

En tu **App** (Meta for Developers):

- **App Domains**: incluye `wazapp.ai`.
- **URL de política de privacidad / términos**: usa `https://wazapp.ai/...` si las tienes.
- El **Redirect URI** de OAuth es el de Supabase (`.../whatsapp-oauth-callback`), no el frontend; no hace falta cambiarlo por el dominio.

### 5. Webhook de WhatsApp (Meta)

Si usas un webhook que apunta a tu backend:

- **Callback URL**: `https://wazapp.ai/api/webhooks/whatsapp` (o la ruta que uses).
- **Verify Token**: el mismo que tengas en tu API.

---

Tras esto, todo debe ir a **wazapp.ai**: login, registro, configuración, QR de WhatsApp y OAuth. Las visitas a `cmr-chatbot-two.vercel.app` se redirigen a `wazapp.ai` con la misma ruta.
