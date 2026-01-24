# 📱 Resumen: Implementación QR WhatsApp Business API

## 🎯 Objetivo Actual
Implementar un sistema de conexión de WhatsApp mediante QR code similar a WhatsApp Web, donde:
- Usuario ingresa número en el dashboard
- Se genera QR
- Usuario escanea QR con WhatsApp móvil (Dispositivos vinculados)
- Se conecta automáticamente sin pasar por OAuth de Facebook
- Cada organización puede tener su propio número individual

---

## 📋 Estado Actual del Proyecto

### ✅ Lo que está implementado:

1. **Generación de QR Codes**
   - Edge Function: `supabase/functions/whatsapp-qr-generate/index.ts`
   - Guarda QR en tabla `qr_codes` con número asociado en metadata
   - URL generada: `https://wazapp.ai/connect/qr/{code}`
   - Expiración: 5 minutos

2. **Componente Frontend de QR**
   - `src/components/QRConnectionDisplay.tsx` - Muestra QR y hace polling del estado
   - `src/components/WhatsAppIntegration.tsx` - Integrado en página de configuración
   - Campo para ingresar número ANTES de generar QR

3. **Página de Conexión QR**
   - `src/pages/connect/qr/[code].astro` - Página que se abre al escanear QR
   - Procesa conexión automáticamente en background
   - Intenta cerrarse automáticamente después de conectar

4. **APIs de Verificación y Conexión**
   - `src/pages/api/qr/verify.ts` - Verifica código QR y retorna organizationId + phoneNumber
   - `src/pages/api/qr/connect.ts` - Conecta número usando credenciales del sistema

5. **Sistema de Mensajería** (YA FUNCIONANDO)
   - `supabase/functions/whatsapp-send-message` - Envía mensajes
   - `supabase/functions/whatsapp-webhook` - Recibe mensajes
   - Ambos usan `phone_number_id` para identificar organización

---

## ⚠️ Problema Actual Identificado

**Problema**: Cuando el usuario escanea el QR con WhatsApp móvil:
1. WhatsApp abre la URL del QR en el navegador (no se puede evitar)
2. La página se carga y muestra "Conectando WhatsApp..."
3. La página se queda cargando indefinidamente
4. No se completa la conexión

**Causa posible**: 
- La página se está procesando pero hay algún error que no se está mostrando
- O el flujo está esperando algo que no sucede
- O hay un problema con las credenciales/configuración

---

## 🔍 Flujo Implementado Actualmente

```
1. Usuario ingresa número en dashboard → WhatsAppIntegration.tsx
   ↓
2. Click "Generar QR y Vincular" → Llama generateQR(organizationId, phoneNumber)
   ↓
3. Edge Function whatsapp-qr-generate → Crea QR con número en metadata
   ↓
4. Muestra QR en pantalla → QRConnectionDisplay.tsx hace polling
   ↓
5. Usuario escanea QR con WhatsApp móvil → Abre /connect/qr/[code]
   ↓
6. Página verifica QR → /api/qr/verify (retorna organizationId + phoneNumber)
   ↓
7. Página conecta automáticamente → /api/qr/connect (guarda en whatsapp_integrations)
   ↓
8. Marca QR como 'used' → Actualiza status en BD
   ↓
9. Redirige/cierra ventana → /configuracion?success=true
```

---

## 📁 Archivos Modificados/Creados

### Edge Functions (Supabase):
- `supabase/functions/whatsapp-qr-generate/index.ts` - Genera QR con número en metadata
- `supabase/functions/whatsapp-webhook/index.ts` - Ya existía, busca por phone_number_id
- `supabase/functions/whatsapp-send-message/index.ts` - Ya existía, usa phone_number_id de integración
- `supabase/functions/whatsapp-oauth-callback/index.ts` - Ya existía, redirige a wazapp.ai

### Frontend:
- `src/components/QRConnectionDisplay.tsx` - Recibe phoneNumber como prop
- `src/components/WhatsAppIntegration.tsx` - Campo para ingresar número antes de QR
- `src/services/whatsapp-qr.ts` - generateQR() ahora requiere phoneNumber

### APIs:
- `src/pages/api/qr/verify.ts` - Verifica QR y retorna phoneNumber del metadata
- `src/pages/api/qr/connect.ts` - Conecta número usando credenciales del sistema
- `src/pages/api/qr/request-code.ts` - (Puede eliminarse, no se usa)
- `src/pages/api/qr/verify-code.ts` - (Puede eliminarse, no se usa)

### Páginas:
- `src/pages/connect/qr/[code].astro` - Página que se abre al escanear QR, procesa automáticamente

### Migraciones:
- `supabase/migrations/create_qr_codes_table.sql` - Ya existía, tabla para QR codes

---

## 🔧 Configuración Necesaria

### Variables de Entorno en Supabase (Edge Functions → Secrets):
```
WHATSAPP_APP_ID=1697684594201061
WHATSAPP_APP_SECRET=75ec6c1f9c00e3ee5ca3763e5c46a920
WHATSAPP_BUSINESS_ACCOUNT_ID=754836650218132
WHATSAPP_PHONE_NUMBER_ID=723144527547373
WHATSAPP_ACCESS_TOKEN=<token permanente de Meta>
WHATSAPP_WEBHOOK_VERIFY_TOKEN=<token de verificación>
FRONTEND_URL=https://wazapp.ai
SUPABASE_URL=<tu URL de Supabase>
SUPABASE_SERVICE_ROLE_KEY=<tu service role key>
```

### Variables de Entorno en Vercel:
```
PUBLIC_SUPABASE_URL=<tu URL de Supabase>
PUBLIC_SUPABASE_ANON_KEY=<tu anon key>
SUPABASE_SERVICE_ROLE_KEY=<tu service role key> (para API routes)
```

---

## 🗄️ Estructura de Base de Datos

### Tabla: `qr_codes`
```sql
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL, -- Código único de 32 caracteres
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scanned', 'expired', 'used')),
  expires_at TIMESTAMPTZ NOT NULL, -- Expira en 5 minutos
  metadata JSONB, -- Contiene: { phoneNumber: "+51987654321" }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  scanned_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ
);
```

### Tabla: `whatsapp_integrations`
```sql
CREATE TABLE whatsapp_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL, -- Número del usuario: +51987654321
  phone_number_id TEXT, -- ID de Meta: 723144527547373 (compartido o específico)
  access_token TEXT, -- Token de acceso (si está en BD)
  business_account_id TEXT, -- ID de cuenta: 754836650218132
  app_id TEXT, -- ID de app: 1697684594201061
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'disconnected', 'error')),
  verified_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id)
);
```

---

## 🔄 Cómo Funciona el Envío/Recepción de Mensajes

### Envío de Mensajes:
1. Usuario envía desde ChatWindow → Llama `sendTextMessage(chatId, text)`
2. Servicio busca chat → Obtiene `organization_id`
3. Busca integración de esa organización → Obtiene `phone_number_id`
4. Edge Function usa `phone_number_id` + `WHATSAPP_ACCESS_TOKEN` → Envía mensaje

### Recepción de Mensajes:
1. Meta envía webhook → `whatsapp-webhook` Edge Function
2. Extrae `phone_number_id` del evento
3. Busca integración por `phone_number_id` → Obtiene `organization_id`
4. Crea/actualiza chat en esa organización → Guarda mensaje

**IMPORTANTE**: Cada mensaje se asocia correctamente a la organización usando `phone_number_id` como clave.

---

## 🐛 Problemas Conocidos

1. **La página del QR se queda cargando indefinidamente**
   - **Ubicación**: `src/pages/connect/qr/[code].astro`
   - **Posible causa**: Error en la conexión que no se está mostrando
   - **Debug**: Revisar consola del navegador y logs de Vercel

2. **El QR abre una página web (no se puede evitar)**
   - WhatsApp Business API no soporta QR como WhatsApp Web personal
   - Cuando escaneas QR con URL, WhatsApp siempre abre la URL
   - **Solución**: Hacer que la página procese rápido y se cierre sola (ya implementado)

3. **Cada organización necesita su propio número**
   - Actualmente usa `phone_number_id` compartido del sistema
   - **Estado**: Cada organización guarda su `phone_number`, pero usan el mismo `phone_number_id` para enviar/recibir
   - **Para solución real**: Cada organización necesita su propio número registrado en Meta Business Manager

---

## 🔍 Cómo Debuggear

### 1. Revisar logs del navegador:
- Abre DevTools (F12) → Console
- Busca mensajes que empiecen con: 🚀, 📋, 🔗, ✅, ❌

### 2. Revisar logs de Vercel:
- Vercel Dashboard → Tu proyecto → Functions → Logs
- Buscar llamadas a `/api/qr/verify` y `/api/qr/connect`

### 3. Revisar logs de Supabase:
- Supabase Dashboard → Edge Functions → whatsapp-qr-generate → Logs
- Buscar errores al generar QR

### 4. Verificar BD:
```sql
-- Ver QR codes recientes
SELECT * FROM qr_codes ORDER BY created_at DESC LIMIT 5;

-- Ver integraciones
SELECT id, organization_id, phone_number, phone_number_id, status 
FROM whatsapp_integrations 
ORDER BY created_at DESC;
```

---

## 🚀 Próximos Pasos Sugeridos

### Prioridad Alta:
1. **Debuggear por qué la página se queda cargando**
   - Agregar más logging en `connect.ts`
   - Verificar que las API routes estén funcionando
   - Revisar errores de CORS o autenticación

2. **Verificar que las credenciales estén correctas**
   - Confirmar que `WHATSAPP_ACCESS_TOKEN` está configurado en Supabase
   - Verificar que `phone_number_id` es el correcto
   - Probar envío de mensaje manual para confirmar que funciona

3. **Optimizar experiencia de usuario**
   - La página debe procesar más rápido
   - Mostrar mejor feedback visual
   - Cerrar ventana automáticamente al completar

### Prioridad Media:
4. **Implementar registro individual de números**
   - Cada organización debería poder registrar su número en Meta
   - Obtener `phone_number_id` único por organización
   - Actualmente usa uno compartido como fallback

5. **Mejorar manejo de errores**
   - Mostrar mensajes más claros al usuario
   - Permitir reintentar conexión
   - Validar que el número esté registrado en Meta antes de conectar

### Prioridad Baja:
6. **Documentación de usuario**
   - Guía paso a paso de cómo usar el QR
   - Videos o screenshots
   - Troubleshooting común

---

## 📝 Notas Importantes

### Sobre WhatsApp Business API vs WhatsApp Web:
- **WhatsApp Web** (personal): Usa QR especial que WhatsApp reconoce directamente, no abre URL
- **WhatsApp Business API**: No tiene ese protocolo, cuando escaneas QR con URL, siempre abre la URL
- **Solución actual**: Hacer que la página procese todo en background y se cierre sola

### Sobre phone_number_id:
- Actualmente todas las organizaciones usan el mismo `phone_number_id` (723144527547373)
- Esto funciona para enviar/recibir mensajes porque usan las mismas credenciales
- Cada organización guarda su propio `phone_number` para identificación
- **Para producción real**: Cada organización debería tener su número registrado en Meta

### Sobre access_token:
- Se obtiene de `WHATSAPP_ACCESS_TOKEN` en variables de entorno (prioridad)
- Si no está, intenta usar el de BD (puede no funcionar)
- Debe ser un token permanente de Meta, no temporal (client_credentials)

---

## 🎯 Meta: Lo que el Usuario Quiere

El usuario quiere que:
1. ✅ Ingrese número en dashboard
2. ✅ Se genere QR
3. ❌ **AL ESCANEAR CON WHATSAPP, SE CONECTE DIRECTAMENTE SIN ABRIR PÁGINA WEB**
4. ✅ Cada organización tenga su número individual
5. ✅ Los mensajes aparezcan en el dashboard correcto

**Problema principal**: El paso 3 no es posible con WhatsApp Business API. WhatsApp siempre abrirá la URL del QR. Lo mejor que podemos hacer es hacer que la página procese todo automáticamente y se cierre sola.

---

## 📚 Archivos Clave para Revisar

Si otra IA necesita entender el código, revisar estos archivos en orden:

1. `src/components/WhatsAppIntegration.tsx` (línea 570-650) - Cómo se genera el QR
2. `src/components/QRConnectionDisplay.tsx` - Cómo se muestra el QR
3. `supabase/functions/whatsapp-qr-generate/index.ts` - Cómo se crea el QR en BD
4. `src/pages/connect/qr/[code].astro` - Qué pasa al escanear QR
5. `src/pages/api/qr/verify.ts` - Verifica QR
6. `src/pages/api/qr/connect.ts` - Conecta número
7. `supabase/functions/whatsapp-send-message/index.ts` (línea 318-320) - Cómo se usa phone_number_id
8. `supabase/functions/whatsapp-webhook/index.ts` (línea 45-94) - Cómo se identifica organización

---

## 🔗 URLs Importantes

- **Dashboard de configuración**: `/configuracion`
- **Generar QR**: Componente en `/configuracion` → Botón "Vincular con QR"
- **Página QR escaneada**: `/connect/qr/{code}`
- **API verificar QR**: `/api/qr/verify` (POST)
- **API conectar**: `/api/qr/connect` (POST)

---

**Última actualización**: $(date)
**Estado**: ⚠️ Implementado pero necesita debuggear por qué se queda cargando
**Siguiente paso**: Revisar logs de consola y Vercel para encontrar el error exacto
