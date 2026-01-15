# 🔧 Instrucciones para Corregir la Integración de WhatsApp

## Problema
Los mensajes llegan al webhook pero no aparecen en el dashboard porque no se encuentra la integración en la base de datos.

## Solución Rápida

### Paso 1: Obtener tu Organization ID

1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta esta consulta (reemplaza con tu email):

```sql
SELECT 
  o.id as organization_id,
  o.name,
  o.owner_id,
  u.email as owner_email
FROM organizations o
JOIN auth.users u ON o.owner_id = u.id
WHERE u.email = 'tu@email.com'; -- ⚠️ REEMPLAZA CON TU EMAIL
```

3. Copia el `organization_id` que aparece

### Paso 2: Crear/Actualizar la Integración

1. En SQL Editor, ejecuta este script (reemplaza `TU_ORGANIZATION_ID` con el ID del paso 1):

```sql
INSERT INTO whatsapp_integrations (
  organization_id,
  phone_number,
  phone_number_id,
  business_account_id,
  app_id,
  status,
  verified_at
) VALUES (
  'TU_ORGANIZATION_ID', -- ⚠️ REEMPLAZA CON TU ORGANIZATION_ID
  '+51933417588', -- Tu número de WhatsApp
  '723144527547373', -- Phone Number ID (del log del webhook)
  '754836650218132', -- Business Account ID
  '1697684594201061', -- App ID
  'connected', -- IMPORTANTE: debe ser 'connected'
  NOW()
)
ON CONFLICT (organization_id) 
DO UPDATE SET
  phone_number_id = '723144527547373',
  status = 'connected',
  verified_at = COALESCE(whatsapp_integrations.verified_at, NOW()),
  updated_at = NOW();
```

### Paso 3: Verificar

Ejecuta esta consulta para verificar que se guardó correctamente:

```sql
SELECT 
  id,
  organization_id,
  phone_number,
  phone_number_id,
  status,
  verified_at,
  CASE 
    WHEN phone_number_id = '723144527547373' AND status = 'connected' 
    THEN '✅ Configuración correcta'
    ELSE '❌ Revisa la configuración'
  END as check_result
FROM whatsapp_integrations
WHERE organization_id = 'TU_ORGANIZATION_ID'; -- ⚠️ REEMPLAZA
```

Deberías ver `✅ Configuración correcta`

### Paso 4: Probar

1. Envía un mensaje desde WhatsApp al número `+51933417588`
2. Ve a tu dashboard de CMR → Chats
3. Deberías ver el mensaje aparecer

## Si Aún No Funciona

### Verificar Logs del Webhook

1. Ve a Supabase Dashboard → Edge Functions → whatsapp-webhook → Logs
2. Busca mensajes que digan:
   - `Buscando integración para phone_number_id: 723144527547373`
   - `✅ Integración encontrada` o `❌ No se encontró integración`

### Verificar Chats en Base de Datos

```sql
SELECT 
  c.id,
  c.organization_id,
  c.customer_name,
  c.customer_phone,
  c.platform,
  c.unread_count,
  c.last_message_at
FROM chats c
WHERE c.platform = 'whatsapp'
ORDER BY c.created_at DESC
LIMIT 10;
```

### Verificar Mensajes en Base de Datos

```sql
SELECT 
  m.id,
  m.chat_id,
  m.sender_type,
  m.text,
  m.platform_message_id,
  m.created_at,
  c.customer_name,
  c.organization_id
FROM messages m
JOIN chats c ON m.chat_id = c.id
WHERE c.platform = 'whatsapp'
ORDER BY m.created_at DESC
LIMIT 20;
```

## Notas Importantes

- El `phone_number_id` debe ser exactamente `723144527547373` (sin espacios)
- El `status` debe ser exactamente `'connected'` (en minúsculas)
- Si ya existe una integración, el `ON CONFLICT` la actualizará
- Después de corregir, los nuevos mensajes deberían aparecer automáticamente
