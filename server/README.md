# Webhook WhatsApp - Instrucciones de Instalación

## Opción 1: Node.js/Express

1. **Instalar dependencias:**
```bash
npm install express axios
```

2. **Configurar variables de entorno:**
```bash
export SUPABASE_URL=https://fsnolvozwcnbyuradiru.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
export WHATSAPP_WEBHOOK_VERIFY_TOKEN=mi_token_secreto_123
export PORT=3000
```

3. **Ejecutar:**
```bash
node webhook-whatsapp.js
```

4. **URL del webhook:**
```
https://wazapp.ai/webhook
```
(La app y el webhook usan **wazapp.ai**. Meta requiere HTTPS.)

## Opción 2: PHP

1. **Subir archivo a tu servidor:**
   - Sube `webhook-whatsapp.php` a tu servidor
   - Asegúrate de que PHP tenga permisos para ejecutar

2. **Configurar variables de entorno:**
   - En `.htaccess` o configuración del servidor:
   ```
   SetEnv SUPABASE_URL https://fsnolvozwcnbyuradiru.supabase.co
   SetEnv SUPABASE_SERVICE_ROLE_KEY tu_service_role_key
   SetEnv WHATSAPP_WEBHOOK_VERIFY_TOKEN mi_token_secreto_123
   ```

3. **URL del webhook:**
```
https://wazapp.ai/webhook-whatsapp.php
```

## Configurar en Meta Business Manager

1. Ve a Meta Business Manager → WhatsApp → API Setup
2. Callback URL: `https://wazapp.ai/webhook` (o la URL de tu Supabase/backend)
3. Verify Token: `mi_token_secreto_123`
4. Suscribir campos: `messages`, `message_status`
5. Click "Verify and Save"

## Script recomendado: `webhook-whatsapp-fixed.js`

- Escribe logs en **consola** y en **`webhook.log`** (misma carpeta o `WEBHOOK_LOG_FILE`).
- `GET /webhook?ping=1`: prueba que el servidor recibe y que el reenvío a Supabase funciona.
- Ejecutar: `node webhook-whatsapp-fixed.js` (o con `nohup` y redirigir salida si quieres).
- Ver logs: `tail -f webhook.log`

## Notas

- El servidor debe ser accesible públicamente; **Meta suele requerir HTTPS**.
- Si usas HTTP, Meta puede rechazarlo.
- El servidor reenvía los eventos a Supabase Edge Function si `SUPABASE_SERVICE_ROLE_KEY` está configurado.
- **Meta no puede usar `localhost`**. Para configuración directa con Supabase y más detalles, ver `WEBHOOK_LOGS_Y_URL.md` en la raíz del proyecto.
