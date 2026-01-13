-- CMR Chatbot - Esquema de Base de Datos
-- Ejecutar este script en el SQL Editor de Supabase

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ORGANIZACIONES/TIENDAS
-- =====================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  openai_api_key TEXT, -- Encriptar en producción
  facebook_page_id TEXT,
  whatsapp_phone_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. PRODUCTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL,
  image_url TEXT,
  stock INTEGER CHECK (stock >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. CHATS/CONVERSACIONES
-- =====================================================
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_avatar TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'whatsapp', 'web')),
  platform_conversation_id TEXT, -- ID de la conversación en la plataforma externa
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'waiting', 'resolved')),
  bot_active BOOLEAN DEFAULT false,
  last_message_at TIMESTAMPTZ,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. MENSAJES
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'agent', 'bot')),
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL si es user o bot
  text TEXT,
  image_url TEXT,
  is_payment_receipt BOOLEAN DEFAULT false,
  platform_message_id TEXT, -- ID del mensaje en la plataforma externa
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. PEDIDOS
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  chat_id UUID REFERENCES chats(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL, -- Snapshot del nombre por si se elimina el producto
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. PAGOS/VENTAS
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  chat_id UUID REFERENCES chats(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  method TEXT NOT NULL CHECK (method IN ('yape', 'plin', 'bcp', 'otro')),
  receipt_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  notes TEXT,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. MÉTODOS DE PAGO CONFIGURADOS
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_methods_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('yape', 'plin', 'bcp')),
  enabled BOOLEAN DEFAULT false,
  account_name TEXT,
  account_number TEXT, -- Para BCP
  account_type TEXT, -- Para BCP (ahorro/corriente)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, method)
);

-- =====================================================
-- 8. ENTRENAMIENTO DEL BOT
-- =====================================================
CREATE TABLE IF NOT EXISTS bot_training_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('web', 'pdf')),
  source TEXT NOT NULL, -- URL o nombre del archivo
  content TEXT, -- Contenido extraído
  file_url TEXT, -- Para PDFs en Storage
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  error_message TEXT,
  extracted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. CONTEXTO DEL BOT (PARA OPENAI)
-- =====================================================
CREATE TABLE IF NOT EXISTS bot_context (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  context_text TEXT NOT NULL, -- Contexto para OpenAI
  source_type TEXT CHECK (source_type IN ('training', 'manual', 'product')),
  source_id UUID, -- ID de training_data o product
  priority INTEGER DEFAULT 0, -- Para ordenar contexto
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Organizaciones
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_id);

-- Productos
CREATE INDEX IF NOT EXISTS idx_products_organization ON products(organization_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Chats
CREATE INDEX IF NOT EXISTS idx_chats_organization ON chats(organization_id);
CREATE INDEX IF NOT EXISTS idx_chats_status ON chats(status);
CREATE INDEX IF NOT EXISTS idx_chats_platform ON chats(platform);
CREATE INDEX IF NOT EXISTS idx_chats_last_message ON chats(last_message_at DESC);

-- Mensajes
CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON messages(chat_id, created_at DESC);

-- Pedidos
CREATE INDEX IF NOT EXISTS idx_orders_organization ON orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_chat ON orders(chat_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Pagos
CREATE INDEX IF NOT EXISTS idx_payments_organization ON payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_chat ON payments(chat_id);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Métodos de pago
CREATE INDEX IF NOT EXISTS idx_payment_methods_organization ON payment_methods_config(organization_id);

-- Entrenamiento
CREATE INDEX IF NOT EXISTS idx_bot_training_organization ON bot_training_data(organization_id);
CREATE INDEX IF NOT EXISTS idx_bot_training_status ON bot_training_data(status);

-- Contexto del bot
CREATE INDEX IF NOT EXISTS idx_bot_context_organization ON bot_context(organization_id);
CREATE INDEX IF NOT EXISTS idx_bot_context_priority ON bot_context(priority DESC);

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar last_message_at en chats
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chats 
    SET last_message_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.chat_id;
    
    -- Si es mensaje de usuario, incrementar unread_count si no está resuelto
    IF NEW.sender_type = 'user' THEN
        UPDATE chats 
        SET unread_count = unread_count + 1
        WHERE id = NEW.chat_id AND status != 'resolved';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_on_new_message AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_chat_last_message();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_context ENABLE ROW LEVEL SECURITY;

-- Políticas básicas: Usuarios solo pueden ver/modificar datos de sus organizaciones

-- Organizaciones
CREATE POLICY "Users can view own organizations"
    ON organizations FOR SELECT
    USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own organizations"
    ON organizations FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own organizations"
    ON organizations FOR UPDATE
    USING (owner_id = auth.uid());

-- Productos
CREATE POLICY "Users can manage products in own organization"
    ON products FOR ALL
    USING (
        organization_id IN (
            SELECT id FROM organizations WHERE owner_id = auth.uid()
        )
    );

-- Chats
CREATE POLICY "Users can manage chats in own organization"
    ON chats FOR ALL
    USING (
        organization_id IN (
            SELECT id FROM organizations WHERE owner_id = auth.uid()
        )
    );

-- Mensajes
CREATE POLICY "Users can manage messages in own organization"
    ON messages FOR ALL
    USING (
        chat_id IN (
            SELECT id FROM chats WHERE organization_id IN (
                SELECT id FROM organizations WHERE owner_id = auth.uid()
            )
        )
    );

-- Pedidos
CREATE POLICY "Users can manage orders in own organization"
    ON orders FOR ALL
    USING (
        organization_id IN (
            SELECT id FROM organizations WHERE owner_id = auth.uid()
        )
    );

-- Order Items
CREATE POLICY "Users can manage order items in own organization"
    ON order_items FOR ALL
    USING (
        order_id IN (
            SELECT id FROM orders WHERE organization_id IN (
                SELECT id FROM organizations WHERE owner_id = auth.uid()
            )
        )
    );

-- Pagos
CREATE POLICY "Users can manage payments in own organization"
    ON payments FOR ALL
    USING (
        organization_id IN (
            SELECT id FROM organizations WHERE owner_id = auth.uid()
        )
    );

-- Métodos de pago
CREATE POLICY "Users can manage payment methods in own organization"
    ON payment_methods_config FOR ALL
    USING (
        organization_id IN (
            SELECT id FROM organizations WHERE owner_id = auth.uid()
        )
    );

-- Entrenamiento del bot
CREATE POLICY "Users can manage bot training in own organization"
    ON bot_training_data FOR ALL
    USING (
        organization_id IN (
            SELECT id FROM organizations WHERE owner_id = auth.uid()
        )
    );

-- Contexto del bot
CREATE POLICY "Users can manage bot context in own organization"
    ON bot_context FOR ALL
    USING (
        organization_id IN (
            SELECT id FROM organizations WHERE owner_id = auth.uid()
        )
    );

-- =====================================================
-- COMENTARIOS
-- =====================================================
COMMENT ON TABLE organizations IS 'Organizaciones/tiendas que usan el sistema';
COMMENT ON TABLE products IS 'Productos de cada organización';
COMMENT ON TABLE chats IS 'Conversaciones con clientes';
COMMENT ON TABLE messages IS 'Mensajes dentro de las conversaciones';
COMMENT ON TABLE orders IS 'Pedidos realizados por clientes';
COMMENT ON TABLE payments IS 'Pagos/ventas registradas con comprobantes';
COMMENT ON TABLE payment_methods_config IS 'Configuración de métodos de pago por organización';
COMMENT ON TABLE bot_training_data IS 'Datos de entrenamiento del bot (web/PDFs)';
COMMENT ON TABLE bot_context IS 'Contexto del bot para OpenAI';





