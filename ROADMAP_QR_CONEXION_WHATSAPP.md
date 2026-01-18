# 📱 Roadmap: Conexión WhatsApp vía QR - 6 Horas de Trabajo

## 🎯 Objetivo
Implementar flujo de conexión de WhatsApp mediante QR (similar a WhatsApp Web), donde el cliente escanea un código QR con su teléfono y automáticamente se vincula su número y se activa el chat.

---

## ⏱️ Plan de Trabajo - 6 Horas

### 🟢 Hora 1: Base de Datos y Estructura (60 min)
**Objetivo**: Crear tablas necesarias para códigos QR temporales

#### Tareas:
1. **Migración SQL: Tabla `qr_codes`**
   ```sql
   CREATE TABLE qr_codes (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     code TEXT UNIQUE NOT NULL, -- Código único de 32 caracteres
     organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
     status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scanned', 'expired', 'used')),
     expires_at TIMESTAMPTZ NOT NULL, -- Expira en 5 minutos
     metadata JSONB, -- Datos adicionales (phone_number, etc)
     created_at TIMESTAMPTZ DEFAULT NOW(),
     scanned_at TIMESTAMPTZ,
     used_at TIMESTAMPTZ
   );
   ```

2. **Índices y RLS**
   - Índice en `code` para búsqueda rápida
   - Índice en `organization_id`
   - Índice en `expires_at` para limpiar expirados
   - RLS policies para seguridad

3. **Función para limpiar códigos expirados** (opcional)

**Resultado**: ✅ Base de datos lista para códigos QR

---

### 🟡 Hora 2: Edge Function - Generar QR (60 min)
**Objetivo**: Crear función que genere código QR único y lo devuelva

#### Tareas:
1. **Edge Function: `whatsapp-qr-generate`**
   - Generar código único (32 caracteres alfanuméricos)
   - Guardar en BD con `expires_at` (5 minutos)
   - Generar URL del QR: `https://wazapp.ai/connect/qr/{code}`
   - Usar librería `qrcode` para generar imagen QR
   - Devolver: `{ code, qrImage, qrUrl, expiresAt }`

2. **Servicio Frontend: `whatsapp-qr.ts`**
   - Función `generateQR(organizationId)`
   - Función `checkQRStatus(code)`
   - Función `pollQRStatus(code, callback)`

**Resultado**: ✅ Sistema genera QR únicos con expiración

---

### 🔵 Hora 3: Componente UI - Mostrar QR (60 min)
**Objetivo**: Crear componente que muestre QR y verifique estado

#### Tareas:
1. **Componente: `QRConnectionDisplay.tsx`**
   - Mostrar imagen del QR generado
   - Mostrar código alfanumérico (opcional, para móvil)
   - Polling cada 3 segundos para verificar estado
   - Estados visuales:
     - ⏳ Generando QR
     - 📱 QR mostrado (esperando escaneo)
     - ✅ QR escaneado (procesando)
     - ⚠️ QR expirado (regenerar)
     - ❌ Error

2. **Integrar en `WhatsAppIntegration.tsx`**
   - Agregar botón "Vincular con QR"
   - Mostrar `QRConnectionDisplay` cuando se selecciona
   - Ocultar cuando se escanea exitosamente

**Resultado**: ✅ UI muestra QR y verifica estado automáticamente

---

### 🟣 Hora 4: Endpoint Servidor - Verificar QR Escaneado (60 min)
**Objetivo**: Crear endpoint en tu servidor para recibir cuando se escanea el QR

#### Tareas:
1. **Endpoint: `POST /api/qr/verify`**
   - Recibir: `{ code: string, phoneNumber?: string }`
   - Verificar código existe y no expirado
   - Marcar como `scanned`
   - Generar URL de OAuth de Facebook con `state=code`
   - Devolver: `{ success: true, oauthUrl: string }`

2. **Alternativa: WebSocket/SSE** (opcional)
   - Si prefieres tiempo real sin polling
   - Conectar frontend con servidor
   - Notificar cuando QR es escaneado

**Resultado**: ✅ Servidor verifica QR escaneado y genera OAuth URL

---

### 🟠 Hora 5: Página Móvil - Escanear QR y Autorizar (60 min)
**Objetivo**: Página web móvil que detecta QR y redirige a OAuth

#### Tareas:
1. **Página: `/connect/qr/[code].astro` o `/connect/qr.html`**
   - Detectar código desde URL: `/connect/qr/{code}`
   - Opción 1: Mostrar botón "Conectar WhatsApp" que redirige a OAuth
   - Opción 2: Detectar automáticamente y redirigir a OAuth
   - Opción 3: Mostrar instrucciones + botón

2. **Flujo de autorización**
   - Llamar a `POST /api/qr/verify` con el código
   - Redirigir a URL de OAuth de Facebook
   - Facebook OAuth ya configurado (`whatsapp-oauth-callback`)
   - El callback guarda la integración y marca QR como `used`

**Resultado**: ✅ Cliente escanea QR en móvil → autoriza → conexión activa

---

### 🔴 Hora 6: Integración Completa y Pruebas (60 min)
**Objetivo**: Conectar todo el flujo y probar

#### Tareas:
1. **Flujo completo**
   - Usuario en desktop: Click "Vincular con QR"
   - Se genera QR y se muestra
   - Usuario en móvil: Abre QR con cámara
   - Página `/connect/qr/{code}` se abre
   - Click "Conectar WhatsApp" → OAuth Facebook
   - Autoriza → Callback guarda integración
   - Desktop detecta cambio (polling) → Muestra "Conectado"
   - Chat se activa automáticamente

2. **Limpieza automática**
   - Códigos QR expirados se limpian (cron job o al verificar)
   - Limitar códigos por organización (max 1 activo a la vez)

3. **Pruebas**
   - Generar QR
   - Escanear desde móvil
   - Verificar que OAuth funciona
   - Verificar que chat se activa

**Resultado**: ✅ Flujo completo funcionando

---

## 📋 Instalaciones Necesarias en Servidor

### Node.js/Express (si usas Node)
```bash
npm install qrcode express cors dotenv
npm install --save-dev @types/qrcode @types/express
```

### Python/Flask (si usas Python)
```bash
pip install qrcode[pil] flask flask-cors python-dotenv
```

### PostgreSQL (si no lo tienes)
- Ya usas Supabase, así que la BD está lista

---

## 🔧 Estructura de Archivos a Crear

```
supabase/
  migrations/
    create_qr_codes_table.sql          ← Hora 1
  functions/
    whatsapp-qr-generate/
      index.ts                         ← Hora 2

src/
  components/
    QRConnectionDisplay.tsx            ← Hora 3
  services/
    whatsapp-qr.ts                     ← Hora 2
  pages/
    connect/
      qr/[code].astro                  ← Hora 5

server/ (tu servidor)
  routes/
    qr/
      verify.js                        ← Hora 4
```

---

## 🔄 Flujo Completo del QR

```
1. Usuario Desktop: Click "Vincular con QR"
   ↓
2. Frontend llama: generateQR(organizationId)
   ↓
3. Edge Function genera código único
   ↓
4. Guarda en BD: qr_codes (expira en 5 min)
   ↓
5. Genera QR con URL: https://wazapp.ai/connect/qr/{code}
   ↓
6. Devuelve imagen QR a frontend
   ↓
7. Frontend muestra QR y hace polling cada 3s
   ↓
8. Usuario móvil: Escanea QR con cámara
   ↓
9. Se abre: https://wazapp.ai/connect/qr/{code}
   ↓
10. Página llama: POST /api/qr/verify?code={code}
   ↓
11. Servidor marca QR como "scanned"
   ↓
12. Devuelve: { oauthUrl: "https://facebook.com/oauth?...&state={code}" }
   ↓
13. Móvil redirige a OAuth de Facebook
   ↓
14. Usuario autoriza permisos
   ↓
15. Facebook redirige a: whatsapp-oauth-callback?code=...&state={qr_code}
   ↓
16. Callback:
    - Intercambia código OAuth por token
    - Obtiene WhatsApp Business Accounts
    - Guarda en whatsapp_integrations
    - Marca QR como "used"
   ↓
17. Redirige a: https://wazapp.ai/configuracion?success=true
   ↓
18. Desktop (polling): Detecta QR marcado como "used"
   ↓
19. Frontend recarga integración → Muestra "Conectado"
   ↓
20. Chat se activa automáticamente ✅
```

---

## 🎨 UI/UX Sugerencias

### Desktop (Mostrar QR)
- Card grande con QR centrado
- Texto: "Escanea este código con la cámara de tu teléfono"
- Código alfanumérico debajo (por si no puede escanear)
- Contador regresivo: "Expira en 4:23"
- Botón "Regenerar QR" si expira

### Móvil (Página de conexión)
- Logo/header de la app
- Texto: "¿Deseas conectar WhatsApp con tu cuenta?"
- Botón grande azul: "Conectar con WhatsApp"
- Al hacer clic → Redirige a OAuth Facebook
- Loading mientras procesa

---

## 🔐 Seguridad

1. **Códigos únicos**: 32 caracteres aleatorios
2. **Expiración**: 5 minutos máximo
3. **Una sola vez**: QR marcado como "used" no puede reutilizarse
4. **Validación**: Verificar `organization_id` en cada paso
5. **HTTPS**: Obligatorio para OAuth y webhooks

---

## ⚡ Optimizaciones

1. **Polling inteligente**: 
   - Primero cada 3s, luego cada 1s cuando está "scanned"
   - Detener polling cuando está "used"

2. **Limpieza automática**:
   - Cron job cada hora para eliminar QR expirados (más de 1 hora)
   - Limitar a 1 QR activo por organización

3. **WebSocket** (futuro):
   - Reemplazar polling con WebSocket para tiempo real

---

## ✅ Checklist Final

### Hora 1
- [ ] Migración SQL creada y ejecutada
- [ ] RLS policies configuradas
- [ ] Índices creados

### Hora 2
- [ ] Edge Function `whatsapp-qr-generate` creada
- [ ] Servicio `whatsapp-qr.ts` creado
- [ ] Generación de QR funcionando

### Hora 3
- [ ] Componente `QRConnectionDisplay.tsx` creado
- [ ] Integrado en `WhatsAppIntegration.tsx`
- [ ] Polling funcionando

### Hora 4
- [ ] Endpoint `/api/qr/verify` en servidor
- [ ] Verificación de código funcionando
- [ ] Generación de OAuth URL funcionando

### Hora 5
- [ ] Página `/connect/qr/[code]` creada
- [ ] Redirección a OAuth funcionando
- [ ] Diseño móvil responsive

### Hora 6
- [ ] Flujo completo probado
- [ ] Limpieza automática configurada
- [ ] Errores manejados correctamente

---

**Tiempo estimado**: 6 horas
**Dificultad**: Media
**Prerrequisitos**: 
- OAuth de Facebook ya funcionando
- Servidor con Node.js/Python
- HTTPS configurado

**Estado**: 📋 Listo para implementar
