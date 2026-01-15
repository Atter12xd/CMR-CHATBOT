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

### ⚠️ Situación Actual: Número y Webhook Existentes

**Situación**: Ya tienes un número de WhatsApp configurado en otro sistema con:
- **Webhook existente**: `https://verifycodorders.com/api/whatsapp/webhook`
- **Token de verificación**: (configurado pero oculto)

**Decisión necesaria**: Tienes dos opciones:

#### Opción A: Reutilizar Webhook Existente (Desarrollo Rápido) ⚡
**Ventajas**:
- Más rápido para empezar
- No necesitas cambiar configuración en Meta
- Usas la infraestructura existente

**Desventajas**:
- Dependes del sistema anterior
- Menos control sobre el webhook
- Posibles conflictos si ambos sistemas reciben mensajes

**Recomendado para**: Desarrollo inicial y pruebas

#### Opción B: Crear Webhook Nuevo (Producción) 🎯
**Ventajas**:
- Control completo sobre el webhook
- Independiente del sistema anterior
- Más escalable para múltiples clientes
- Mejor arquitectura

**Desventajas**:
- Requiere crear Edge Function en Supabase
- Necesitas actualizar configuración en Meta
- Más tiempo de implementación

**Recomendado para**: Producción y sistema multi-tenant

### 📝 Plan Recomendado: Enfoque Híbrido

**Fase 1 (Día 1-3)**: Usar webhook existente temporalmente para desarrollo
**Fase 2 (Día 4-6)**: Migrar a nuestro propio webhook para producción

---

### Variables de Entorno Necesarias

#### Para Desarrollo Local (`.env`) - Usando Webhook Existente
```env
# WhatsApp Business API - Credenciales del sistema
WHATSAPP_PHONE_NUMBER_ID=723144527547373
WHATSAPP_BUSINESS_ACCOUNT_ID=754836650218132
WHATSAPP_APP_ID=1697684594201061
WHATSAPP_APP_SECRET=75ec6c1f9c00e3ee5ca3763e5c46a920

# WhatsApp Business API - Token de acceso (obtener de Meta)
WHATSAPP_ACCESS_TOKEN=tu_access_token_aqui

# Webhook Existente (temporal para desarrollo)
WHATSAPP_WEBHOOK_VERIFY_TOKEN=tu_token_existente_aqui
WHATSAPP_WEBHOOK_URL=https://verifycodorders.com/api/whatsapp/webhook

# Para producción (crear después)
# WHATSAPP_WEBHOOK_URL=https://cmr-chatbot-two.vercel.app/api/webhooks/whatsapp
```

#### Para Vercel (Variables de Entorno)
1. Ve a tu proyecto en Vercel Dashboard: `cmr-chatbot-two.vercel.app`
2. Settings → Environment Variables
3. Agrega las siguientes variables:
   - `WHATSAPP_PHONE_NUMBER_ID` = `723144527547373`
   - `WHATSAPP_BUSINESS_ACCOUNT_ID` = `754836650218132`
   - `WHATSAPP_APP_ID` = `1697684594201061`
   - `WHATSAPP_APP_SECRET` = `75ec6c1f9c00e3ee5ca3763e5c46a920`
   - `WHATSAPP_WEBHOOK_VERIFY_TOKEN` = (el token que ya tienes configurado en Meta)
   - `WHATSAPP_WEBHOOK_URL` = `https://verifycodorders.com/api/whatsapp/webhook` (temporal)
   - `WHATSAPP_ACCESS_TOKEN` = (obtener de Meta Graph API)

**⚠️ IMPORTANTE**: 
- Las credenciales por cliente se almacenarán en Supabase (tabla `whatsapp_integrations`)
- El webhook actual se usa temporalmente para desarrollo
- En producción, crearemos nuestro propio webhook en Supabase Edge Functions

---

## 📅 Plan de Trabajo - 6 Días

### 🟢 Día 1: Preparación y Limpieza ✅ COMPLETADO
**Objetivo**: Eliminar demo de WhatsApp y preparar estructura base

#### Tareas:
1. ✅ **Eliminar demo de WhatsApp**
   - ✅ Verificado: No hay chats de WhatsApp en `src/data/mockData.ts`
   - ✅ Solo referencias en tipos (necesarias para integración real)
   
2. ✅ **Corregir bug de visualización de chats**
   - ✅ Corregida lógica de display en `src/components/ChatsPage.tsx`
   - ✅ Cambiado de `block`/`hidden` a `flex`/`hidden` para mejor control
   - ✅ Chats se muestran correctamente en móvil y desktop
   
3. ✅ **Actualizar esquema de base de datos**
   - ✅ Creado: `supabase/migrations/create_whatsapp_integrations.sql`
   - ✅ Tabla `whatsapp_integrations` con todos los campos necesarios
   - ✅ RLS policies configuradas (SELECT, INSERT, UPDATE, DELETE)
   - ✅ Índices para optimización
   - ✅ Trigger para `updated_at` automático
   - ✅ Tipos TypeScript actualizados en `src/lib/database.types.ts`

4. ✅ **Instalar dependencias necesarias**
   - ✅ `axios` instalado
   - ✅ `qrcode` instalado
   - ⚠️ `@types/qrcode` (opcional, para TypeScript)

**Resultado**: ✅ Sistema limpio sin demo y estructura base preparada

---

### 🟡 Día 2: Sistema de Autenticación de Números (OAuth Flow) ✅ COMPLETADO
**Objetivo**: Implementar flujo para que clientes conecten su número de WhatsApp

#### Tareas:
1. ✅ **Crear página de configuración de WhatsApp**
   - ✅ Creado componente `WhatsAppIntegration.tsx`
   - ✅ UI tipo dashboard de Facebook Developers
   - ✅ Estados: No conectado, Conectando, Conectado, Error
   - ✅ Componente `ConfigPage.tsx` enfocado solo en WhatsApp
   
2. ✅ **Implementar flujo de verificación de número**
   - ✅ Paso 1: Usuario ingresa número de teléfono
   - ✅ Paso 2: Validación de formato internacional
   - ✅ Paso 3: Sistema genera código de verificación (simulado)
   - ✅ Paso 4: Usuario ingresa código de 6 dígitos
   - ✅ Paso 5: Sistema marca como conectado
   
3. ✅ **Crear servicio de integración**
   - ✅ `src/services/whatsapp-integration.ts`
   - ✅ Funciones:
     - ✅ `requestVerificationCode(phoneNumber: string)`
     - ✅ `verifyCode(phoneNumber: string, code: string)`
     - ✅ `disconnectWhatsApp()`
     - ✅ `getIntegrationStatus()`
   
4. ✅ **Edge Function: WhatsApp OAuth**
   - ✅ Creado `supabase/functions/whatsapp-oauth/index.ts`
   - ✅ Maneja flujo de autenticación (simulado)
   - ✅ Guarda estado en Supabase
   - ✅ CORS configurado correctamente
   - ⚠️ Pendiente: Integración real con Meta API (Día 3)

**Resultado**: ✅ Clientes pueden iniciar el proceso de conexión de su número (simulado)

---

### 🔵 Día 3: Integración con Meta Graph API ✅ COMPLETADO
**Objetivo**: Conectar con Meta Graph API para gestionar números de WhatsApp

#### Tareas:
1. ✅ **Edge Function: Meta Graph API Client**
   - ✅ Creado `supabase/functions/whatsapp-meta-api/index.ts`
   - ✅ Funciones para interactuar con Meta Graph API:
     - ✅ Registrar número de teléfono
     - ✅ Obtener número de teléfono ID
     - ✅ Solicitar código de verificación
     - ✅ Verificar código
     - ✅ Obtener tokens de acceso
   - ✅ Servicio `src/services/whatsapp-meta-api.ts` creado
   
2. ✅ **Implementar registro de número**
   - ✅ Integrado con Meta Graph API
   - ✅ Manejo de errores (número ya registrado, etc.)
   - ✅ Fallback a modo simulado si falla la API
   
3. ✅ **Sistema de códigos de verificación**
   - ✅ Solicitud de código vía Meta API
   - ✅ Verificación de código con Meta API
   - ✅ Validación de formato (6 dígitos)
   - ✅ Fallback a modo simulado
   - ⚠️ Pendiente: Timeout y límite de intentos (se puede agregar después)

4. ✅ **Almacenamiento seguro de credenciales**
   - ✅ Creado `src/lib/encryption.ts` (placeholder)
   - ✅ Estructura preparada para encriptación
   - ⚠️ Pendiente: Implementar encriptación real (usar Web Crypto API o crypto-js)

#### ⚠️ Problema de CORS Detectado y Solución

**Problema**:
```
Access to fetch at 'https://fsnolvozwcnbyuradiru.supabase.co/functions/v1/whatsapp-oauth' 
from origin 'https://cmr-chatbot-two.vercel.app' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
It does not have HTTP ok status.
```

**Causa**:
- La Edge Function no está respondiendo correctamente al preflight OPTIONS
- El código puede no estar desplegado correctamente
- O la función no existe con el nombre correcto

**Solución**:
1. ✅ **Verificar nombres de funciones en Supabase**:
   - ⚠️ **IMPORTANTE**: Las funciones en Supabase pueden tener nombres diferentes a sus URLs
   - Función `whatsapp-oauth` → URL real: `smart-endpoint`
   - Función `whatsapp-meta-api` → URL real: `super-worker`
   - ✅ **CORREGIDO**: El código ahora usa las URLs correctas (`smart-endpoint` y `super-worker`)

2. ✅ **Verificar código en cada función**:
   - Abrir función `whatsapp-oauth` (URL: `smart-endpoint`) → Pestaña "Code"
   - Verificar que tenga el código completo de `supabase/functions/whatsapp-oauth/index.ts`
   - Abrir función `whatsapp-meta-api` (URL: `super-worker`) → Pestaña "Code"
   - Verificar que tenga el código completo de `supabase/functions/whatsapp-meta-api/index.ts`

3. ✅ **Asegurar que el código tenga manejo correcto de CORS**:
   ```typescript
   // Al inicio de cada función, debe tener:
   if (req.method === 'OPTIONS') {
     return new Response('ok', { 
       status: 200,
       headers: corsHeaders
     });
   }
   ```

4. ✅ **Redesplegar las funciones**:
   - Click en "Deploy" o "Deploy updates" en cada función
   - Esperar a que termine el despliegue

5. ✅ **Verificar logs**:
   - Ir a pestaña "Logs" en cada función
   - Ver si hay errores al recibir peticiones

6. ✅ **Probar en modo incógnito**:
   - Limpiar caché del navegador
   - O probar en ventana incógnito

**Si el problema persiste**:
- ✅ Verificar que `supabase.functions.invoke()` esté usando la URL correcta (`smart-endpoint` y `super-worker`)
- Revisar que las funciones estén activas (no pausadas)
- Verificar variables de entorno en Supabase (Secrets)

**✅ Corrección Aplicada (14 Ene 2026)**:
- Actualizado `src/services/whatsapp-integration.ts` para usar `smart-endpoint` en lugar de `whatsapp-oauth`
- Actualizado `src/services/whatsapp-meta-api.ts` para usar `super-worker` en lugar de `whatsapp-meta-api`
- Actualizado `supabase/functions/whatsapp-oauth/index.ts` para usar `super-worker` en llamadas internas

**Resultado**: ✅ Sistema conectado con Meta Graph API para gestionar números (con fallback simulado)

#### ✅ Corrección de Nombres de Funciones
**Problema detectado**: Las funciones en Supabase tienen nombres diferentes a sus URLs:
- `whatsapp-oauth` → URL real: `smart-endpoint`
- `whatsapp-meta-api` → URL real: `super-worker`

**Solución aplicada**:
- ✅ Actualizado `src/services/whatsapp-integration.ts` para usar `smart-endpoint`
- ✅ Actualizado `src/services/whatsapp-meta-api.ts` para usar `super-worker`
- ✅ Actualizado `supabase/functions/whatsapp-oauth/index.ts` para usar `super-worker` en llamadas internas

---

### 🟣 Día 4: Webhook y Recepción de Mensajes ✅ COMPLETADO
**Objetivo**: Configurar webhook para recibir mensajes de WhatsApp

#### ✅ Decisión Implementada: Webhook Propio en Servidor
**Estrategia elegida**: Opción B - Webhook propio desplegado en servidor Contabo

**Implementación**:
- ✅ Webhook desplegado en `https://wazapp.ai/webhook`
- ✅ Servidor Node.js/Express en puerto 3001
- ✅ Proxy reverso con Nginx y SSL/HTTPS
- ✅ Reenvío a Supabase Edge Function

#### Tareas Completadas:
1. ✅ **Edge Function: Webhook Handler**
   - ✅ Creado `supabase/functions/whatsapp-webhook/index.ts`
   - ✅ Implementada verificación de webhook (GET) - Meta verifica con token
   - ✅ Implementada recepción de mensajes (POST)
   - ✅ Validación de firma de webhook de Meta (X-Hub-Signature-256)
   - ✅ Guardado de mensajes en Supabase
   
2. ✅ **Procesamiento de mensajes entrantes**
   - ✅ Extracción de datos del mensaje (texto, multimedia, metadata)
   - ✅ Creación/actualización automática de chat en Supabase
   - ✅ Guardado de mensaje en base de datos
   - ✅ Extracción y uso de nombres reales de contactos
   - ⚠️ Activar bot si está configurado (pendiente para Día 5)
   
3. ✅ **Configurar webhook en Meta**
   - ✅ URL configurada: `https://wazapp.ai/webhook`
   - ✅ Token de verificación configurado
   - ✅ Campos suscritos: `messages`, `message_status`
   - ✅ Webhook verificado exitosamente en Meta
   
4. ✅ **Infraestructura**
   - ✅ Servidor webhook en Node.js/Express
   - ✅ SSL/HTTPS con Let's Encrypt
   - ✅ Nginx como proxy reverso
   - ✅ Variables de entorno configuradas (.env)
   - ✅ Integración con Supabase Edge Function
   
5. ⬜ **Sincronización de conversaciones (Opcional)**
   - ⬜ Sincronizar conversaciones existentes al conectar
   - ✅ Actualización de estado de mensajes (parcialmente implementado)

**Resultado**: ✅ Sistema recibe mensajes de WhatsApp en tiempo real y los guarda correctamente en Supabase

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

### Día 1 ✅ COMPLETADO
- [x] Demo de WhatsApp eliminada
- [x] Bug de chat corregido
- [x] Tabla `whatsapp_integrations` creada
- [x] Dependencias instaladas

### Día 2 ✅ COMPLETADO
- [x] Página de configuración creada
- [x] Flujo de verificación implementado (simulado)
- [x] Servicio de integración creado
- [x] Edge Function OAuth creada
- [x] CORS configurado
- [x] Hook useOrganization creado

### Día 3 ✅ COMPLETADO
- [x] Cliente Meta Graph API implementado
- [x] Registro de números funcionando (con fallback simulado)
- [x] Sistema de códigos funcionando (con fallback simulado)
- [x] Estructura de encriptación preparada (pendiente implementación real)

### Día 4 ✅ COMPLETADO
- [x] Webhook handler creado
- [x] Recepción de mensajes funcionando
- [x] Webhook configurado en Meta
- [x] Procesamiento de mensajes implementado (texto, imágenes, documentos)
- [x] Creación/actualización automática de chats
- [x] Extracción de nombres de contactos
- [x] Webhook desplegado en servidor propio (wazapp.ai)
- [x] SSL/HTTPS configurado
- [x] Integración con Supabase Edge Function funcionando
- [ ] Sincronización de conversaciones existentes (opcional, puede hacerse después)

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

**Última actualización**: Día 4 - ✅ COMPLETADO
**Estado**: ✅ Día 1, 2, 3 y 4 completados | 🟠 Listo para Día 5: Envío de Mensajes y Funcionalidades Core

