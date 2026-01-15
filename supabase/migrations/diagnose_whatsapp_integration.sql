-- Script de diagnóstico para verificar la integración de WhatsApp
-- Ejecuta esto en Supabase SQL Editor para ver el estado actual

-- 1. Ver todas las integraciones de WhatsApp
SELECT 
  id,
  organization_id,
  phone_number,
  phone_number_id,
  status,
  verified_at,
  created_at,
  updated_at
FROM whatsapp_integrations
ORDER BY created_at DESC;

-- 2. Verificar si existe la integración con el phone_number_id del log
-- (Reemplaza 723144527547373 con el phone_number_id que ves en los logs)
SELECT 
  id,
  organization_id,
  phone_number,
  phone_number_id,
  status,
  CASE 
    WHEN phone_number_id = '723144527547373' THEN '✅ Phone ID coincide'
    ELSE '❌ Phone ID NO coincide'
  END as phone_id_match,
  CASE 
    WHEN status = 'connected' THEN '✅ Status correcto'
    ELSE '❌ Status: ' || status || ' (debe ser "connected")'
  END as status_check
FROM whatsapp_integrations
WHERE phone_number_id = '723144527547373'
   OR phone_number_id IS NULL;

-- 3. Ver chats creados recientemente
SELECT 
  id,
  organization_id,
  customer_name,
  customer_phone,
  platform,
  status,
  unread_count,
  last_message_at,
  created_at
FROM chats
WHERE platform = 'whatsapp'
ORDER BY created_at DESC
LIMIT 10;

-- 4. Ver mensajes recientes
SELECT 
  m.id,
  m.chat_id,
  m.sender_type,
  m.text,
  m.platform_message_id,
  m.status,
  m.created_at,
  c.organization_id,
  c.customer_name,
  c.customer_phone
FROM messages m
JOIN chats c ON m.chat_id = c.id
WHERE c.platform = 'whatsapp'
ORDER BY m.created_at DESC
LIMIT 20;

-- 5. Verificar organizaciones
SELECT 
  o.id,
  o.name,
  o.owner_id,
  w.id as whatsapp_integration_id,
  w.phone_number_id,
  w.status as whatsapp_status
FROM organizations o
LEFT JOIN whatsapp_integrations w ON o.id = w.organization_id
ORDER BY o.created_at DESC;
