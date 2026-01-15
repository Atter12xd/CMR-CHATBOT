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
http://tu-servidor.com:3000/webhook
```

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
https://tu-servidor.com/webhook-whatsapp.php
```

## Configurar en Meta Business Manager

1. Ve a Meta Business Manager → WhatsApp → API Setup
2. Callback URL: `https://tu-servidor.com/webhook` (o la URL de tu servidor)
3. Verify Token: `mi_token_secreto_123`
4. Suscribir campos: `messages`, `message_status`
5. Click "Verify and Save"

## Notas

- El servidor debe ser accesible públicamente (HTTPS recomendado)
- Si usas HTTP, Meta puede rechazarlo (requiere HTTPS)
- El servidor reenvía los eventos a Supabase Edge Function automáticamente
- Si no configuras `SUPABASE_SERVICE_ROLE_KEY`, solo responderá a Meta pero no guardará en BD
