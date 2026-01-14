# 🚀 Guía de Despliegue de Edge Functions

## Opción 1: Desde Supabase Dashboard (Recomendado)

### Paso 1: Crear función `whatsapp-oauth`
1. Ve a tu proyecto en Supabase Dashboard
2. Edge Functions → **Create Function**
3. Nombre: `whatsapp-oauth`
4. Copia TODO el código de `supabase/functions/whatsapp-oauth/index.ts`
5. Pega en el editor
6. Click **Deploy**

### Paso 2: Crear función `whatsapp-meta-api`
1. Edge Functions → **Create Function**
2. Nombre: `whatsapp-meta-api`
3. Copia TODO el código de `supabase/functions/whatsapp-meta-api/index.ts`
4. Pega en el editor
5. Click **Deploy**

### Paso 3: Configurar Secrets (Opcional pero recomendado)
1. Edge Functions → **Secrets**
2. Agrega:
   - `WHATSAPP_APP_ID` = `1697684594201061`
   - `WHATSAPP_APP_SECRET` = `75ec6c1f9c00e3ee5ca3763e5c46a920`
   - `WHATSAPP_BUSINESS_ACCOUNT_ID` = `754836650218132`

---

## Opción 2: Desde PowerShell (Si tienes Supabase CLI)

### Requisitos previos:
```powershell
# Instalar Supabase CLI (si no lo tienes)
npm install -g supabase
```

### Comandos para desplegar:

```powershell
# 1. Login en Supabase (si no estás logueado)
supabase login

# 2. Link tu proyecto (si no está linkeado)
supabase link --project-ref fsnolvozwcnbyuradiru

# 3. Desplegar whatsapp-oauth
supabase functions deploy whatsapp-oauth

# 4. Desplegar whatsapp-meta-api
supabase functions deploy whatsapp-meta-api

# 5. Configurar secrets (opcional)
supabase secrets set WHATSAPP_APP_ID=1697684594201061
supabase secrets set WHATSAPP_APP_SECRET=75ec6c1f9c00e3ee5ca3763e5c46a920
supabase secrets set WHATSAPP_BUSINESS_ACCOUNT_ID=754836650218132
```

---

## ⚠️ IMPORTANTE

- **NO uses `smart-endpoint`** - Esa es otra función que ya existe
- Debes crear **DOS funciones NUEVAS** con los nombres exactos:
  - `whatsapp-oauth`
  - `whatsapp-meta-api`
- Cada función debe tener su propio archivo `index.ts` con el código correspondiente

