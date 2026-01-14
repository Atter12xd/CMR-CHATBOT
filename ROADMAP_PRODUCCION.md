# 🚀 CMR Chatbot - Roadmap a Producción

## 📊 Estado Actual (Demo → Producción)

### ✅ Lo que Ya Tenemos
- **Frontend completo** con Astro + React + TypeScript
- **UI/UX funcional** con todas las páginas y componentes
- **Sistema de bot básico** con respuestas por palabras clave
- **Gestión de productos, pedidos, chats, pagos** (interfaz completa)
- **Dashboard con métricas** (ventas diarias/semanales/mensuales)
- **Sistema de pagos** con detección de comprobantes
- **Entrenamiento del bot** (interfaz para web + PDFs)
- ✅ **Base de datos configurada** (Supabase con todas las tablas creadas)
- ✅ **Variables de entorno configuradas** (local y Vercel listas)

### 🔄 En Progreso
- Base de datos persistente (tablas creadas, falta migrar código)
- Instalación de dependencias (Supabase Client SDK)

### ❌ Lo que Falta (Funcionalidad Real)
- Autenticación de usuarios
- Backend API (Edge Functions)
- Integración con OpenAI (bot inteligente)
- WebSockets para tiempo real
- Integraciones con Facebook Messenger y WhatsApp
- **Integración con WhatsApp Business API vía 360dialog (Cloud API de Meta)** ⚡ PRIORITARIO
- Procesamiento real de PDFs y web scraping
- Almacenamiento de imágenes en Supabase Storage
- OCR para comprobantes de pago

---

## 🏗️ Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Astro)                        │
│  - React Components                                          │
│  - UI/UX Completa                                           │
│  - WebSocket Client                                         │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Supabase)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Edge Functions (Deno)                               │   │
│  │  - /api/chats                                        │   │
│  │  - /api/messages                                     │   │
│  │  - /api/openai                                       │   │
│  │  - /api/process-payment                              │   │
│  │  - /api/train-bot                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Database (PostgreSQL)                               │   │
│  │  - users, chats, messages, products, orders, etc.    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Storage (Supabase Storage)                          │   │
│  │  - product-images/                                   │   │
│  │  - payment-receipts/                                 │   │
│  │  - bot-training-files/                               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Realtime (PostgreSQL Changes)                       │   │
│  │  - Mensajes en tiempo real                           │   │
│  │  - Notificaciones                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    SERVICIOS EXTERNOS                        │
│  - OpenAI API (GPT-4/3.5)                                   │
│  - Facebook Messenger API                                    │
│  - WhatsApp Business API (Cloud API de Meta)                │
│  │  └─ 360dialog (BSP - Business Solution Provider)         │
│  │     - API Key de 360dialog                                │
│  │     - Webhook para recibir mensajes                       │
│  │     - Envío de mensajes vía API REST                      │
│  - Servicios OCR (opcional: Tesseract.js o Cloud Vision)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Stack Tecnológico Completo

### Frontend (Actual)
- ✅ Astro 4.0
- ✅ React 18.3
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Lucide React

### Backend (Nuevo - Agregar)
- ⬜ Supabase Client SDK
- ⬜ Supabase Edge Functions (Deno)
- ⬜ OpenAI SDK
- ⬜ WebSocket Client (Supabase Realtime)
- ⬜ Zod (validación de esquemas)
- ⬜ 360dialog SDK / WhatsApp Cloud API Client

### Utilidades
- ⬜ PDF parsing (pdf-parse o pdf.js)
- ⬜ Web scraping (Cheerio o Puppeteer)
- ⬜ OCR para comprobantes (Tesseract.js o Google Vision)
- ⬜ Image processing (sharp)

---

## 🗄️ Estructura de Base de Datos (Supabase)

### Tablas Principales

```sql
-- 1. Usuarios y Autenticación (usar auth.users de Supabase)

-- 2. Organizaciones/Tiendas
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  openai_api_key TEXT, -- Encriptado
  facebook_page_id TEXT,
  whatsapp_phone_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Productos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  stock INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Chats/Conversaciones
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'whatsapp', 'web')),
  platform_conversation_id TEXT, -- ID de la conversación en la plataforma
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'waiting', 'resolved')),
  bot_active BOOLEAN DEFAULT false,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Mensajes
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'agent', 'bot')),
  sender_id UUID REFERENCES auth.users(id), -- NULL si es user o bot
  text TEXT,
  image_url TEXT,
  is_payment_receipt BOOLEAN DEFAULT false,
  platform_message_id TEXT, -- ID del mensaje en la plataforma
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Pedidos
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  chat_id UUID REFERENCES chats(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL, -- Snapshot del nombre
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Pagos/Ventas
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  chat_id UUID REFERENCES chats(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('yape', 'plin', 'bcp', 'otro')),
  receipt_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  notes TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Métodos de Pago Configurados
CREATE TABLE payment_methods_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  method TEXT NOT NULL CHECK (method IN ('yape', 'plin', 'bcp')),
  enabled BOOLEAN DEFAULT false,
  account_name TEXT,
  account_number TEXT, -- Para BCP
  account_type TEXT, -- Para BCP
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, method)
);

-- 9. Entrenamiento del Bot
CREATE TABLE bot_training_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  type TEXT NOT NULL CHECK (type IN ('web', 'pdf')),
  source TEXT NOT NULL, -- URL o nombre del archivo
  content TEXT, -- Contenido extraído
  file_url TEXT, -- Para PDFs
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  error_message TEXT,
  extracted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Respuestas del Bot (Contexto)
CREATE TABLE bot_context (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  context_text TEXT NOT NULL, -- Contexto para OpenAI
  source_type TEXT CHECK (source_type IN ('training', 'manual', 'product')),
  source_id UUID, -- ID de training_data o product
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_chats_organization ON chats(organization_id);
CREATE INDEX idx_chats_status ON chats(status);
CREATE INDEX idx_messages_chat ON messages(chat_id);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_orders_organization ON orders(organization_id);
CREATE INDEX idx_payments_organization ON payments(organization_id);
CREATE INDEX idx_payments_created ON payments(created_at);
```

### Row Level Security (RLS) Policies

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_context ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar según necesidades)
-- Ejemplo: Los usuarios solo pueden ver datos de su organización
CREATE POLICY "Users can view own organization data"
  ON products FOR SELECT
  USING (organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
  ));

-- Similar para otras tablas...
```

---

## 🔧 Variables de Entorno Necesarias

Crear archivo `.env` y `.env.example`:

```env
# Supabase
PUBLIC_SUPABASE_URL=tu_proyecto_supabase_url
PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# OpenAI
OPENAI_API_KEY=tu_openai_api_key

# Facebook Messenger (opcional)
FACEBOOK_PAGE_ACCESS_TOKEN=tu_facebook_token
FACEBOOK_VERIFY_TOKEN=tu_verify_token

# WhatsApp Business API (opcional)
WHATSAPP_ACCESS_TOKEN=tu_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
WHATSAPP_VERIFY_TOKEN=tu_verify_token

# App Config
PUBLIC_APP_URL=http://localhost:4321
```

---

## 📋 Roadmap por Fases

### 🔵 FASE 1: Infraestructura Base (Semana 1)

#### 1.1 Configuración de Supabase
- [x] Crear proyecto en Supabase
- [x] Configurar base de datos (crear todas las tablas) - ✅ SQL ejecutado
- [x] Configurar Row Level Security (RLS) - ✅ Incluido en schema.sql
- [ ] Configurar Storage buckets (product-images, payment-receipts, bot-training-files)
- [x] Obtener keys y agregar a `.env` - ✅ Completado

#### 1.2 Instalación de Dependencias
```bash
npm install @supabase/supabase-js @supabase/ssr zod
npm install --save-dev @types/node
```
**Estado**: ⬜ Pendiente

#### 1.3 Crear Cliente Supabase
- [ ] Crear `src/lib/supabase.ts` (cliente del lado del cliente)
- [ ] Crear `src/lib/supabase-server.ts` (cliente del lado del servidor)
- [ ] Crear tipos TypeScript desde la BD con `supabase gen types typescript`

#### 1.4 Configuración de Variables de Entorno
- [x] Configurar `.env` local - ✅ Completado
- [x] Configurar variables en Vercel - ✅ Listo para agregar
- [ ] Documentar variables necesarias (ya está en roadmap)

**Resultado**: ✅ Base de datos configurada | ⏳ Variables configuradas | ⬜ Pendiente: Storage buckets y cliente Supabase

---

### 🟢 FASE 2: Autenticación (Semana 1-2)

#### 2.1 Sistema de Autenticación
- [ ] Crear página de login (`/login`)
- [ ] Crear página de registro (`/register`)
- [ ] Implementar autenticación con Supabase Auth
- [ ] Crear componente de protección de rutas
- [ ] Crear hook `useAuth()` para manejar estado de autenticación
- [ ] Crear página de recuperación de contraseña

#### 2.2 Gestión de Organizaciones
- [ ] Crear sistema de organizaciones (multi-tenant)
- [ ] Asociar usuarios a organizaciones
- [ ] Middleware para verificar pertenencia a organización

**Resultado**: Usuarios pueden autenticarse y crear/administrar su organización

---

### 🟡 FASE 3: Migración de Datos a Supabase (Semana 2)

#### 3.1 Productos
- [ ] Reemplazar `src/data/products.ts` con llamadas a Supabase
- [ ] Crear funciones CRUD usando Supabase Client
- [ ] Implementar subida de imágenes a Supabase Storage
- [ ] Mantener la misma interfaz en componentes

#### 3.2 Métodos de Pago
- [ ] Migrar `src/data/paymentMethods.ts` a Supabase
- [ ] Crear funciones CRUD
- [ ] Mantener compatibilidad con componentes existentes

#### 3.3 Chats y Mensajes
- [ ] Migrar estructura de chats a Supabase
- [ ] Implementar creación y lectura de chats
- [ ] Implementar envío y recepción de mensajes
- [ ] Configurar Supabase Realtime para mensajes en tiempo real

#### 3.4 Pedidos
- [ ] Migrar pedidos a Supabase
- [ ] Implementar CRUD completo
- [ ] Mantener funcionalidad de filtros

#### 3.5 Pagos/Ventas
- [ ] Migrar pagos a Supabase
- [ ] Implementar subida de comprobantes a Storage
- [ ] Mantener cálculos de ventas (diarias/semanales/mensuales)

**Resultado**: Todos los datos se persisten en Supabase

---

### 🔴 FASE 4: Integración con OpenAI (Semana 3)

#### 4.1 Configuración de OpenAI
- [ ] Crear Edge Function: `/api/openai-chat`
- [ ] Implementar función para generar respuestas con GPT
- [ ] Manejar contexto del bot (productos, métodos de pago, entrenamiento)

#### 4.2 Sistema de Contexto del Bot
- [ ] Crear función para construir contexto desde:
  - Productos de la organización
  - Métodos de pago configurados
  - Datos de entrenamiento (bot_training_data)
  - Mensajes previos de la conversación
- [ ] Implementar sistema de memoria corta (últimos N mensajes)

#### 4.3 Actualizar Lógica del Bot
- [ ] Reemplazar `src/data/botResponses.ts` con llamadas a OpenAI
- [ ] Mantener fallback a respuestas predefinidas si OpenAI falla
- [ ] Implementar límites de rate y manejo de errores

#### 4.4 Optimización
- [ ] Implementar cache de respuestas comunes
- [ ] Optimizar tokens enviados a OpenAI
- [ ] Agregar logging de interacciones

**Resultado**: Bot inteligente usando OpenAI GPT

---

### 🟣 FASE 5: Procesamiento Real de Entrenamiento (Semana 3-4)

#### 5.1 Extracción de Páginas Web
- [ ] Crear Edge Function: `/api/process-web`
- [ ] Implementar scraping con Cheerio o Puppeteer
- [ ] Extraer texto relevante y limpiarlo
- [ ] Guardar en `bot_training_data` y `bot_context`

#### 5.2 Procesamiento de PDFs
- [ ] Crear Edge Function: `/api/process-pdf`
- [ ] Implementar extracción de texto con pdf-parse
- [ ] Opcional: OCR para PDFs escaneados (Tesseract.js)
- [ ] Guardar contenido extraído

#### 5.3 Actualizar Componente BotTrainingPage
- [ ] Conectar con Edge Functions
- [ ] Mostrar progreso real
- [ ] Manejar errores

**Resultado**: Sistema de entrenamiento funcional con procesamiento real

---

### 🟠 FASE 6: Procesamiento de Comprobantes de Pago (Semana 4)

#### 6.1 OCR para Comprobantes
- [ ] Investigar opciones de OCR (Tesseract.js, Google Vision, AWS Textract)
- [ ] Crear Edge Function: `/api/process-receipt`
- [ ] Extraer monto, método de pago, fecha del comprobante
- [ ] Actualizar pago con datos extraídos

#### 6.2 Mejora de Detección
- [ ] Mejorar regex para detectar montos
- [ ] Validar formatos de comprobantes
- [ ] Permitir edición manual si OCR falla

**Resultado**: Sistema inteligente de procesamiento de comprobantes

---

### 🔵 FASE 7: WebSockets y Tiempo Real (Semana 4-5)

#### 7.1 Supabase Realtime
- [ ] Configurar Realtime para mensajes
- [ ] Implementar suscripciones en componentes React
- [ ] Actualizar lista de chats en tiempo real
- [ ] Actualizar mensajes en tiempo real

#### 7.2 Notificaciones
- [ ] Implementar notificaciones de nuevos mensajes
- [ ] Notificaciones de nuevos pedidos
- [ ] Notificaciones de pagos recibidos

**Resultado**: Aplicación completamente en tiempo real

---

### 🟢 FASE 8: Integraciones Externas (Semana 5-6)

#### 8.1 Facebook Messenger
- [ ] Crear Edge Function: `/api/webhooks/facebook`
- [ ] Configurar webhook en Facebook Developers
- [ ] Implementar recepción de mensajes
- [ ] Implementar envío de mensajes
- [ ] Sincronizar conversaciones con BD

#### 8.2 WhatsApp Business API
- [ ] Crear Edge Function: `/api/webhooks/whatsapp`
- [ ] Configurar webhook en Meta Business
- [ ] Implementar recepción y envío de mensajes
- [ ] Manejar multimedia (imágenes, documentos)

**Resultado**: Integraciones con Facebook y WhatsApp funcionando

---

### 🟡 FASE 9: Optimización y Mejoras (Semana 6-7)

#### 9.1 Performance
- [ ] Optimizar queries de base de datos
- [ ] Implementar paginación en listas largas
- [ ] Lazy loading de imágenes
- [ ] Optimizar bundle size

#### 9.2 UX/UI
- [ ] Mejorar feedback visual
- [ ] Agregar estados de carga
- [ ] Mejorar manejo de errores
- [ ] Agregar tooltips y ayuda contextual

#### 9.3 Seguridad
- [ ] Revisar y reforzar RLS policies
- [ ] Validar inputs en Edge Functions
- [ ] Implementar rate limiting
- [ ] Encriptar datos sensibles (API keys)

**Resultado**: Aplicación optimizada y segura

---

### 🔴 FASE 10: Testing y Deployment (Semana 7-8)

#### 10.1 Testing
- [ ] Escribir tests unitarios para funciones críticas
- [ ] Tests de integración para APIs
- [ ] Tests E2E para flujos principales

#### 10.2 Deployment
- [ ] Configurar dominio
- [ ] Deploy frontend (Vercel/Netlify)
- [ ] Configurar Edge Functions en Supabase
- [ ] Configurar variables de entorno en producción
- [ ] Configurar CI/CD

#### 10.3 Monitoreo
- [ ] Configurar logging (Supabase Logs)
- [ ] Configurar alertas de errores
- [ ] Dashboard de métricas

**Resultado**: Aplicación en producción y monitoreada

---

## 📁 Estructura de Archivos Propuesta

```
src/
├── lib/
│   ├── supabase.ts              # Cliente Supabase (cliente)
│   ├── supabase-server.ts       # Cliente Supabase (servidor)
│   └── types/                   # Tipos generados desde Supabase
├── hooks/
│   ├── useAuth.ts               # Hook de autenticación
│   ├── useRealtime.ts           # Hook para Realtime
│   └── useChat.ts               # Hook para manejo de chats
├── services/
│   ├── products.ts              # Servicio de productos
│   ├── chats.ts                 # Servicio de chats
│   ├── messages.ts              # Servicio de mensajes
│   ├── payments.ts              # Servicio de pagos
│   ├── orders.ts                # Servicio de pedidos
│   └── bot.ts                   # Servicio del bot (OpenAI)
├── utils/
│   ├── validators.ts            # Validaciones con Zod
│   └── formatters.ts            # Utilidades de formato
├── components/                  # (Mantener existentes)
├── pages/                       # (Mantener existentes)
└── supabase/
    └── functions/               # Edge Functions
        ├── openai-chat/
        ├── process-web/
        ├── process-pdf/
        ├── process-receipt/
        ├── webhooks/
        │   ├── facebook/
        │   └── whatsapp/
```

---

## 🔐 Consideraciones de Seguridad

1. **API Keys**: Nunca exponer API keys en el cliente. Usar Edge Functions.
2. **RLS**: Todas las tablas deben tener RLS habilitado.
3. **Validación**: Validar todos los inputs con Zod.
4. **Rate Limiting**: Implementar en Edge Functions para prevenir abuso.
5. **Encriptación**: Encriptar datos sensibles (tokens, API keys) en la BD.
6. **CORS**: Configurar correctamente para producción.

---

## 📊 Métricas y Monitoreo

### Métricas a Monitorear
- Número de mensajes procesados
- Tiempo de respuesta de OpenAI
- Uso de tokens de OpenAI
- Errores en Edge Functions
- Uso de Storage
- Conexiones Realtime activas

---

## 💰 Costos Estimados (Mensual)

### Supabase
- **Free Tier**: Hasta 500MB BD, 1GB Storage, 2GB ancho de banda
- **Pro Tier**: $25/mes - 8GB BD, 100GB Storage, 250GB ancho de banda

### OpenAI
- **GPT-4**: ~$0.03 por 1K tokens de entrada, ~$0.06 por 1K tokens de salida
- **GPT-3.5-turbo**: ~$0.0015 por 1K tokens entrada, ~$0.002 por 1K tokens salida
- Estimación: 1000 conversaciones/mes con 10 mensajes cada una = ~$5-50/mes (dependiendo del modelo)

### Hosting Frontend
- **Vercel/Netlify**: Gratis hasta cierto límite, luego ~$20/mes

**Total estimado inicial**: $50-100/mes (dependiendo del uso)

---

## ✅ Checklist Final Antes de Producción

- [ ] Todas las fases completadas
- [ ] Variables de entorno configuradas
- [ ] RLS policies probadas
- [ ] Edge Functions probadas
- [ ] Integraciones funcionando
- [ ] Testing completo
- [ ] Documentación actualizada
- [ ] Backup de base de datos configurado
- [ ] Monitoreo configurado
- [ ] Plan de rollback preparado

---

## 📚 Recursos Útiles

- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Facebook Messenger API](https://developers.facebook.com/docs/messenger-platform)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Astro Docs](https://docs.astro.build)

---

**Última actualización**: [Fecha]
**Versión del Roadmap**: 1.0


