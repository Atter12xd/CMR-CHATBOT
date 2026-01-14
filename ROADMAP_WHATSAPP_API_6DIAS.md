# 📱 Roadmap: Integración WhatsApp Business API - 6 Días

## 🎯 Objetivo
Implementar la integración de WhatsApp Business API (Cloud API de Meta) permitiendo que cada cliente pueda conectar su propio número de WhatsApp de forma autónoma, siguiendo un flujo similar al dashboard de Facebook Developers.

---

## 📋 Información de Acceso Proporcionada

### Credenciales de WhatsApp Business API
- **Identificador de número de teléfono**: `723144527547373`
- **Identificador de la cuenta de WhatsApp Business**: `754836650218132`
- **Identificador de la app**: `1697684594201061`
- **Clave secreta de la app**: `75ec6c1f9c00e3ee5ca3763e5c46a920`

### Variables de Entorno Necesarias

#### Para Desarrollo Local (`.env`)
```env
# WhatsApp Business API - Credenciales del sistema (para desarrollo inicial)
WHATSAPP_PHONE_NUMBER_ID=723144527547373
WHATSAPP_BUSINESS_ACCOUNT_ID=754836650218132
WHATSAPP_APP_ID=1697684594201061
WHATSAPP_APP_SECRET=75ec6c1f9c00e3ee5ca3763e5c46a920

# WhatsApp Business API - Token de acceso (se genera por cliente)
WHATSAPP_ACCESS_TOKEN=

# Webhook
WHATSAPP_WEBHOOK_VERIFY_TOKEN=tu_verify_token_secreto_aqui
WHATSAPP_WEBHOOK_URL=https://tu-dominio.com/api/webhooks/whatsapp
```

#### Para Vercel (Variables de Entorno)
1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega las siguientes variables:
   - `WHATSAPP_PHONE_NUMBER_ID` = `723144527547373`
   - `WHATSAPP_BUSINESS_ACCOUNT_ID` = `754836650218132`
   - `WHATSAPP_APP_ID` = `1697684594201061`
   - `WHATSAPP_APP_SECRET` = `75ec6c1f9c00e3ee5ca3763e5c46a920`
   - `WHATSAPP_WEBHOOK_VERIFY_TOKEN` = (genera un token secreto aleatorio)
   - `WHATSAPP_WEBHOOK_URL` = `https://tu-dominio.vercel.app/api/webhooks/whatsapp`

**⚠️ IMPORTANTE**: Las credenciales por cliente se almacenarán en Supabase (tabla `whatsapp_integrations`) y no en variables de entorno, ya que cada organización tendrá su propio número.

---

## 📅 Plan de Trabajo - 6 Días

### 🟢 Día 1: Preparación y Limpieza
**Objetivo**: Eliminar demo de WhatsApp y preparar estructura base

#### Tareas:
1. ✅ **Eliminar demo de WhatsApp**
   - Quitar chat de WhatsApp de `src/data/mockData.ts`
   - Limpiar referencias a datos mock de WhatsApp
   
2. ✅ **Corregir bug de visualización de chats**
   - Identificar y corregir problema de click en chats
   - Verificar que los chats se muestren correctamente
   
3. ⬜ **Actualizar esquema de base de datos**
   - Agregar tabla `whatsapp_integrations` en Supabase:
     ```sql
     CREATE TABLE whatsapp_integrations (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
       phone_number TEXT NOT NULL,
       phone_number_id TEXT,
       access_token TEXT, -- Encriptado
       business_account_id TEXT,
       app_id TEXT,
       app_secret TEXT, -- Encriptado
       webhook_verify_token TEXT,
       status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'disconnected', 'error')),
       verified_at TIMESTAMPTZ,
       last_sync_at TIMESTAMPTZ,
       error_message TEXT,
       created_at TIMESTAMPTZ DEFAULT NOW(),
       updated_at TIMESTAMPTZ DEFAULT NOW(),
       UNIQUE(organization_id)
     );
     
     ALTER TABLE whatsapp_integrations ENABLE ROW LEVEL SECURITY;
     
     CREATE POLICY "Users can view own whatsapp integration"
       ON whatsapp_integrations FOR SELECT
       USING (organization_id IN (
         SELECT id FROM organizations WHERE owner_id = auth.uid()
       ));
     ```

4. ⬜ **Instalar dependencias necesarias**
   ```bash
   npm install axios qrcode
   npm install --save-dev @types/qrcode
   ```

**Resultado**: Sistema limpio sin demo y estructura base preparada

---

### 🟡 Día 2: Sistema de Autenticación de Números (OAuth Flow)
**Objetivo**: Implementar flujo para que clientes conecten su número de WhatsApp

#### Tareas:
1. ⬜ **Crear página de configuración de WhatsApp**
   - Crear componente `WhatsAppIntegration.tsx`
   - UI tipo dashboard de Facebook Developers
   - Estados: No conectado, Conectando, Conectado, Error
   
2. ⬜ **Implementar flujo de verificación de número**
   - Paso 1: Usuario ingresa número de teléfono
   - Paso 2: Sistema verifica si el número está disponible
   - Paso 3: Usuario recibe código de verificación (vía SMS/WhatsApp)
   - Paso 4: Usuario ingresa código
   - Paso 5: Sistema vincula número con la cuenta de Meta
   
3. ⬜ **Crear servicio de integración**
   - `src/services/whatsapp-integration.ts`
   - Funciones:
     - `requestVerificationCode(phoneNumber: string)`
     - `verifyCode(phoneNumber: string, code: string)`
     - `disconnectWhatsApp()`
     - `getIntegrationStatus()`
   
4. ⬜ **Edge Function: WhatsApp OAuth**
   - Crear `supabase/functions/whatsapp-oauth/index.ts`
   - Manejar flujo de autenticación con Meta
   - Guardar tokens en Supabase (encriptados)

**Resultado**: Clientes pueden iniciar el proceso de conexión de su número

---

### 🔵 Día 3: Integración con Meta Graph API
**Objetivo**: Conectar con Meta Graph API para gestionar números de WhatsApp

#### Tareas:
1. ⬜ **Edge Function: Meta Graph API Client**
   - Crear `supabase/functions/whatsapp-meta-api/index.ts`
   - Funciones para interactuar con Meta Graph API:
     - Registrar número de teléfono
     - Obtener número de teléfono ID
     - Generar código de verificación
     - Verificar código
     - Obtener tokens de acceso
   
2. ⬜ **Implementar registro de número**
   - Usar Meta Graph API para registrar número
   - Manejar errores comunes (número ya registrado, etc.)
   
3. ⬜ **Sistema de códigos de verificación**
   - Generar códigos de 6 dígitos
   - Enviar códigos (SMS o WhatsApp)
   - Validar códigos con timeout (10 minutos)
   - Límite de intentos (3 intentos)

4. ⬜ **Almacenamiento seguro de credenciales**
   - Encriptar tokens y secretos antes de guardar
   - Usar variables de entorno para claves de encriptación

**Resultado**: Sistema conectado con Meta Graph API para gestionar números

---

### 🟣 Día 4: Webhook y Recepción de Mensajes
**Objetivo**: Configurar webhook para recibir mensajes de WhatsApp

#### Tareas:
1. ⬜ **Edge Function: Webhook Handler**
   - Crear `supabase/functions/whatsapp-webhook/index.ts`
   - Implementar verificación de webhook (GET)
   - Implementar recepción de mensajes (POST)
   - Validar firma de webhook de Meta
   
2. ⬜ **Procesamiento de mensajes entrantes**
   - Extraer datos del mensaje (texto, multimedia, metadata)
   - Crear/actualizar chat en Supabase
   - Guardar mensaje en base de datos
   - Activar bot si está configurado
   
3. ⬜ **Configurar webhook en Meta**
   - Obtener URL de webhook de Supabase Edge Function
   - Configurar webhook en Meta Business Manager
   - Configurar campos a suscribir (messages, status)
   - Verificar webhook
   
4. ⬜ **Sincronización de conversaciones**
   - Sincronizar conversaciones existentes al conectar
   - Actualizar estado de mensajes (enviado, entregado, leído)

**Resultado**: Sistema recibe mensajes de WhatsApp en tiempo real

---

### 🟠 Día 5: Envío de Mensajes y Funcionalidades Core
**Objetivo**: Implementar envío de mensajes y funcionalidades básicas

#### Tareas:
1. ⬜ **Edge Function: Envío de Mensajes**
   - Crear `supabase/functions/whatsapp-send-message/index.ts`
   - Función para enviar mensajes de texto
   - Función para enviar mensajes multimedia (imágenes, documentos)
   - Manejar límites de rate (1000 mensajes/segundo)
   
2. ⬜ **Servicio de mensajería**
   - `src/services/whatsapp-messages.ts`
   - Funciones:
     - `sendTextMessage(chatId, text)`
     - `sendImageMessage(chatId, imageUrl, caption)`
     - `sendDocumentMessage(chatId, documentUrl, filename)`
   
3. ⬜ **Integración con ChatWindow**
   - Conectar componente de chat con WhatsApp
   - Enviar mensajes desde la UI
   - Mostrar estado de mensajes (enviando, enviado, entregado, leído)
   
4. ⬜ **Actualizar ChatList para WhatsApp**
   - Filtrar chats por plataforma
   - Mostrar indicadores específicos de WhatsApp
   - Sincronización en tiempo real

5. ⬜ **Manejo de estados de mensajes**
   - Implementar tracking de estados (sent, delivered, read)
   - Actualizar UI según estado
   - Mostrar errores de envío

**Resultado**: Sistema completo de envío y recepción de mensajes

---

### 🔴 Día 6: Dashboard de Conexión, Testing y Documentación
**Objetivo**: Completar UI del dashboard, pruebas y documentación

#### Tareas:
1. ⬜ **Completar Dashboard de Conexión**
   - UI tipo Facebook Developers
   - Mostrar estado de conexión
   - Botón para desconectar/reconectar
   - Mostrar información del número (número, nombre de negocio, estado)
   - Indicadores visuales (verificado, pendiente, error)
   
2. ⬜ **Página de configuración mejorada**
   - Actualizar `/configuracion` con integración de WhatsApp
   - Paso a paso visual para conectar
   - Instrucciones claras
   - Troubleshooting common issues
   
3. ⬜ **Testing completo**
   - Probar flujo completo de conexión
   - Probar envío/recepción de mensajes
   - Probar manejo de errores
   - Probar con múltiples organizaciones
   
4. ⬜ **Documentación**
   - Documentar proceso de conexión para clientes
   - Documentar variables de entorno
   - Documentar API interna
   - Crear guía de troubleshooting
   
5. ⬜ **Deployment y configuración final**
   - Configurar webhook en producción
   - Configurar variables de entorno en Vercel
   - Verificar que todo funcione en producción
   - Configurar monitoreo y logs

**Resultado**: Sistema completo, probado y documentado

---

## 🏗️ Arquitectura de la Solución

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Astro + React)                  │
│  - WhatsAppIntegration.tsx (Dashboard de conexión)          │
│  - ChatWindow.tsx (Integrado con WhatsApp)                  │
│  - ChatList.tsx (Filtrado por plataforma)                   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTIONS (Deno)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  /whatsapp-oauth                                      │   │
│  │  - Iniciar flujo OAuth                                │   │
│  │  - Generar códigos de verificación                    │   │
│  │  - Verificar códigos                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  /whatsapp-meta-api                                   │   │
│  │  - Interactuar con Meta Graph API                     │   │
│  │  - Registrar números                                  │   │
│  │  - Obtener tokens                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  /whatsapp-webhook                                    │   │
│  │  - Verificar webhook (GET)                            │   │
│  │  - Recibir mensajes (POST)                            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  /whatsapp-send-message                               │   │
│  │  - Enviar mensajes de texto                           │   │
│  │  - Enviar mensajes multimedia                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                         │
│  - whatsapp_integrations (credenciales por organización)    │
│  - chats (con platform = 'whatsapp')                        │
│  - messages (sincronizados con WhatsApp)                    │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                  META WHATSAPP CLOUD API                     │
│  - Graph API (registro de números)                          │
│  - WhatsApp Business API (mensajería)                       │
│  - Webhooks (notificaciones)                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Estructura de Base de Datos

### Tabla: `whatsapp_integrations`
Almacena las integraciones de WhatsApp por organización.

```sql
CREATE TABLE whatsapp_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL, -- Número formateado: +51987654321
  phone_number_id TEXT, -- ID del número en Meta (723144527547373)
  access_token TEXT, -- Token de acceso (encriptado)
  business_account_id TEXT, -- ID de cuenta de negocio
  app_id TEXT, -- ID de la app
  app_secret TEXT, -- Secret de la app (encriptado)
  webhook_verify_token TEXT, -- Token para verificar webhook
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'disconnected', 'error')),
  verified_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id)
);

-- RLS Policies
ALTER TABLE whatsapp_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own whatsapp integration"
  ON whatsapp_integrations FOR SELECT
  USING (organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can insert own whatsapp integration"
  ON whatsapp_integrations FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can update own whatsapp integration"
  ON whatsapp_integrations FOR UPDATE
  USING (organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
  ));
```

---

## 🔐 Seguridad y Mejores Prácticas

### Encriptación de Credenciales
- **Access Tokens**: Encriptar antes de guardar en BD
- **App Secret**: Nunca almacenar en texto plano
- **Variables de entorno**: Usar solo para credenciales del sistema, no por cliente

### Validación
- Validar formato de números de teléfono
- Validar códigos de verificación
- Rate limiting en webhooks
- Validar firmas de webhook de Meta

### Errores Comunes
1. **Número ya registrado**: Guiar al usuario a desconectar primero
2. **Código expirado**: Permitir reenvío después de timeout
3. **Webhook no verificado**: Revisar configuración en Meta
4. **Token expirado**: Implementar refresh token automático

---

## 📝 Checklist Final

### Día 1 ✅
- [ ] Demo de WhatsApp eliminada
- [ ] Bug de chat corregido
- [ ] Tabla `whatsapp_integrations` creada
- [ ] Dependencias instaladas

### Día 2 ✅
- [ ] Página de configuración creada
- [ ] Flujo de verificación implementado
- [ ] Servicio de integración creado
- [ ] Edge Function OAuth creada

### Día 3 ✅
- [ ] Cliente Meta Graph API implementado
- [ ] Registro de números funcionando
- [ ] Sistema de códigos funcionando
- [ ] Encriptación de credenciales implementada

### Día 4 ✅
- [ ] Webhook handler creado
- [ ] Recepción de mensajes funcionando
- [ ] Webhook configurado en Meta
- [ ] Sincronización implementada

### Día 5 ✅
- [ ] Envío de mensajes implementado
- [ ] Servicio de mensajería creado
- [ ] ChatWindow integrado
- [ ] Estados de mensajes funcionando

### Día 6 ✅
- [ ] Dashboard completo
- [ ] Testing realizado
- [ ] Documentación creada
- [ ] Deployment en producción

---

## 🔗 Recursos y Referencias

- [Meta WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Meta Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [WhatsApp Cloud API Setup Guide](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)

---

**Última actualización**: Día 1 - Roadmap creado
**Estado**: ⏳ Listo para comenzar implementación

