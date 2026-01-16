-- Migración para cambiar sender_type a sender en la tabla messages
-- Ejecutar en Supabase SQL Editor

-- Paso 1: Renombrar la columna sender_type a sender
ALTER TABLE messages 
RENAME COLUMN sender_type TO sender;

-- Paso 2: Actualizar el trigger que usa sender_type
DROP TRIGGER IF EXISTS update_chat_on_new_message ON messages;

CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chats 
    SET last_message_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.chat_id;
    
    -- Si es mensaje de usuario, incrementar unread_count si no está resuelto
    IF NEW.sender = 'user' THEN
        UPDATE chats 
        SET unread_count = unread_count + 1
        WHERE id = NEW.chat_id AND status != 'resolved';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_on_new_message AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_chat_last_message();

-- Paso 3: Verificar que el cambio se aplicó correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name IN ('sender', 'sender_type')
ORDER BY column_name;
