# 🚀 Inicio Rápido - CMR Chatbot a Producción

## ✅ Lo que Ya Tienes

1. ✅ **OpenAI API Key**
2. ✅ **Supabase** (proyecto)
3. ✅ **Demo funcional completa**

## 📋 Pasos Inmediatos

### 1. Configurar Supabase (30 min)

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Abre el **SQL Editor**
3. Copia y ejecuta el contenido de `supabase/schema.sql`
4. Ve a **Settings > API** y copia:
   - Project URL
   - `anon` public key
   - `service_role` key (secreto)

### 2. Configurar Variables de Entorno (5 min)

Crea un archivo `.env` en la raíz del proyecto:

```env
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
OPENAI_API_KEY=sk-tu-openai-key
PUBLIC_APP_URL=http://localhost:4321
```

### 3. Instalar Dependencias Nuevas (2 min)

```bash
npm install @supabase/supabase-js @supabase/ssr zod
```

### 4. Configurar Storage en Supabase (10 min)

1. Ve a **Storage** en Supabase
2. Crea 3 buckets (públicos):
   - `product-images`
   - `payment-receipts`
   - `bot-training-files`

## 🎯 Próximos Pasos Críticos

### Semana 1: Base de Datos y Auth
- [ ] Ejecutar `schema.sql` en Supabase
- [ ] Crear cliente Supabase (`src/lib/supabase.ts`)
- [ ] Implementar autenticación (login/register)
- [ ] Migrar productos a Supabase

### Semana 2: Datos Persistentes
- [ ] Migrar chats y mensajes
- [ ] Migrar pedidos
- [ ] Migrar pagos
- [ ] Implementar Realtime para mensajes

### Semana 3: OpenAI Integration
- [ ] Crear Edge Function para OpenAI
- [ ] Reemplazar bot básico con GPT
- [ ] Implementar contexto del bot

### Semana 4: Funcionalidades Avanzadas
- [ ] Procesamiento real de PDFs
- [ ] Web scraping real
- [ ] OCR para comprobantes

### Semana 5-6: Integraciones
- [ ] Facebook Messenger
- [ ] WhatsApp Business API

## 📚 Documentación Completa

Ver `ROADMAP_PRODUCCION.md` para el roadmap detallado con todas las fases.

## 🔗 Links Útiles

- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Supabase SQL Editor](https://app.supabase.com/project/_/sql)

---

**¡Empieza con los pasos inmediatos y avanza según el roadmap!** 🎉

