# 🚀 Guía: Configurar OAuth de Facebook para WhatsApp Business

## ✅ Implementación Completada

He implementado el flujo OAuth completo para que tus clientes puedan conectar su cuenta de Meta Business Manager fácilmente.

## 📋 Configuración Requerida en Facebook Developers

### Paso 1: Configurar Redirect URI en Facebook App

1. Ve a [Facebook Developers](https://developers.facebook.com/)
2. Selecciona tu App (ID: `1697684594201061`)
3. Ve a **Settings** → **Basic**
4. En **Valid OAuth Redirect URIs**, agrega:
   ```
   https://fsnolvozwcnbyuradiru.supabase.co/functions/v1/whatsapp-oauth-callback
   ```

### Paso 2: Configurar Productos

1. En el Dashboard de tu App, ve a **Add Product**
2. Asegúrate de tener:
   - ✅ **Facebook Login** (si no lo tienes, agrégalo)
   - ✅ **WhatsApp Business API** (debe estar activo)

### Paso 3: Configurar Permisos (Scopes)

La app ya solicita los siguientes permisos automáticamente:
- `business_management` - Para gestionar cuentas de negocio
- `whatsapp_business_management` - Para gestionar WhatsApp Business
- `whatsapp_business_messaging` - Para enviar/recibir mensajes

Estos permisos deben estar aprobados en tu App (algunos requieren revisión de Meta).

### Paso 4: Variables de Entorno en Supabase

Asegúrate de tener configuradas en Supabase Edge Functions → Secrets:
- `WHATSAPP_APP_ID` = `1697684594201061`
- `WHATSAPP_APP_SECRET` = `75ec6c1f9c00e3ee5ca3763e5c46a920`
- `FRONTEND_URL` = `https://cmr-chatbot-two.vercel.app` (o tu URL de producción)

## 🎯 Flujo del Usuario (Cliente)

### Antes (Sistema Manual):
1. ❌ Cliente debe crear app en Facebook Developers
2. ❌ Cliente debe configurar credenciales manualmente
3. ❌ Cliente debe copiar/pegar IDs y tokens
4. ❌ Muy complejo y confuso

### Ahora (Con OAuth):
1. ✅ Cliente hace clic en **"Conectar con Facebook"**
2. ✅ Se abre ventana de Facebook para autorizar
3. ✅ Cliente autoriza la app
4. ✅ ¡Listo! Sistema obtiene automáticamente:
   - Business Account ID
   - Phone Numbers disponibles
   - Access Token
   - Phone Number IDs
5. ✅ Cliente puede usar su número inmediatamente

## 🔧 Archivos Creados/Modificados

### Nuevos:
- ✅ `supabase/functions/whatsapp-oauth-callback/index.ts` - Maneja el callback de OAuth

### Modificados:
- ✅ `src/components/WhatsAppIntegration.tsx` - Agregado botón OAuth y función `handleConnectWithFacebook`
- ✅ `src/components/ConfigPage.tsx` - Agregado manejo de mensajes de éxito/error de OAuth

## 📝 Probar el Flujo

1. **Desplegar Edge Function:**
   - Ve a Supabase Dashboard → Edge Functions
   - Crea función: `whatsapp-oauth-callback`
   - Copia el código de `supabase/functions/whatsapp-oauth-callback/index.ts`
   - Click **Deploy**

2. **Configurar Redirect URI** (ver Paso 1 arriba)

3. **Probar:**
   - Ve a `/configuracion`
   - Haz clic en **"Conectar con Facebook"**
   - Autoriza la app
   - Deberías ser redirigido de vuelta con éxito

## ⚠️ Notas Importantes

1. **Access Token de Larga Duración:**
   - El sistema obtiene automáticamente un token de 60 días
   - Deberías implementar refresh token antes de que expire

2. **Múltiples Business Accounts:**
   - Por ahora usa la primera cuenta encontrada
   - Se puede mejorar para permitir al usuario elegir

3. **Encriptación de Tokens:**
   - Los tokens se guardan en BD pero **no están encriptados** todavía
   - TODO: Implementar encriptación antes de producción

4. **Permisos de App:**
   - Algunos permisos (`whatsapp_business_management`) requieren revisión de Meta
   - Asegúrate de tenerlos aprobados para que funcione

## 🎉 Ventajas del OAuth

✅ **Sencillo para el cliente** - Solo un clic y autorizar
✅ **Seguro** - Credenciales no se exponen al cliente
✅ **Automático** - Sistema obtiene todo automáticamente
✅ **Escalable** - Cada cliente usa su propia cuenta
✅ **Profesional** - Flujo similar a plataformas grandes

---

**Estado**: ✅ Implementado y listo para probar
**Siguiente paso**: Configurar Redirect URI en Facebook App y desplegar Edge Function
