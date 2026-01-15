-- Script para corregir la integración de WhatsApp
-- Ejecuta esto en Supabase SQL Editor DESPUÉS de crear tu organización

-- PASO 1: Verificar tu organización (reemplaza 'TU_USER_ID' con tu user_id real)
-- Puedes obtener tu user_id desde: SELECT id FROM auth.users WHERE email = 'tu@email.com';
SELECT 
  o.id as organization_id,
  o.name,
  o.owner_id,
  u.email as owner_email
FROM organizations o
JOIN auth.users u ON o.owner_id = u.id
ORDER BY o.created_at DESC;

-- PASO 2: Verificar si existe integración de WhatsApp
-- (Reemplaza 'TU_ORGANIZATION_ID' con el ID de tu organización del paso 1)
SELECT 
  id,
  organization_id,
  phone_number,
  phone_number_id,
  status,
  verified_at
FROM whatsapp_integrations
WHERE organization_id = 'TU_ORGANIZATION_ID'; -- ⚠️ REEMPLAZA ESTO

-- PASO 3: Crear o actualizar la integración con el phone_number_id correcto
-- (Reemplaza 'TU_ORGANIZATION_ID' con el ID de tu organización)
-- El phone_number_id '723144527547373' es el que viene en los logs del webhook

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
  '+51933417588', -- Tu número de WhatsApp (del log: display_phone_number)
  '723144527547373', -- Phone Number ID del log
  '754836650218132', -- Business Account ID
  '1697684594201061', -- App ID
  'connected', -- Status: connected para que el webhook lo encuentre
  NOW()
)
ON CONFLICT (organization_id) 
DO UPDATE SET
  phone_number_id = '723144527547373',
  status = 'connected',
  verified_at = COALESCE(whatsapp_integrations.verified_at, NOW()),
  updated_at = NOW();

-- PASO 4: Verificar que se guardó correctamente
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
WHERE organization_id = 'TU_ORGANIZATION_ID'; -- ⚠️ REEMPLAZA ESTO
