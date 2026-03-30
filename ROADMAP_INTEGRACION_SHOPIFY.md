# Roadmap: Integracion Shopify

**Ultima actualizacion:** OAuth + sync manual + webhooks de productos (create/update/delete).

---

## Estado resumido

| Fase | Estado | Notas |
|------|--------|--------|
| 1 Conexion OAuth | **Hecho** | HMAC, state firmado, `shopify_integrations` |
| 2 Sync catalogo (MVP) | **Hecho** | REST Admin, paginacion, upsert `products` + `shopify_product_id` |
| 3 Webhooks / sync automatico | **Hecho** | `products/create`, `update`, `delete` → upsert o borrar en CRM; registro al conectar + boton manual |
| 4 Bot usa catalogo (WhatsApp) | **Parcial** | El worker Baileys ya arma el prompt con `products` (hasta 100, stock, orden por `updated_at`). Falta embeddings/RAG si el catalogo crece mucho más. |
| 5 Produccion (seguridad, metricas) | Parcial | Logs listos; token en claro; falta panel de salud |

---

## Ya implementado (detalle)

### Frontend

- Seccion **Integracion Shopify (Nuevo)** en Configuracion (`ConfigPage` + `ShopifyIntegration.tsx`).
- Conectar OAuth, **Sincronizar productos**, **Actualizacion automatica** (registrar webhooks si hizo falta).
- Resumen de sincronizacion en pantalla.

### Backend (Astro API routes)

- `POST /api/shopify/connect` — OAuth; `redirect_uri` = `{publicBase}/api/shopify/callback`.
- `GET /api/shopify/callback` — token, upsert integracion, **registro de webhooks** en Shopify.
- `GET /api/shopify/status` — estado (sin token).
- `POST /api/shopify/disconnect` — desconectar.
- `POST /api/shopify/sync-products` — sync masivo paginado.
- `POST /api/shopify/register-webhooks` — registra webhooks (sesion usuario; tiendas ya conectadas antes del deploy).
- `POST /api/webhooks/shopify` — recibe eventos Shopify (HMAC `X-Shopify-Hmac-Sha256`), actualiza o borra `products`.
- `GET /api/webhooks/shopify` — health check JSON.

### Librerias

- `src/lib/shopify-public-url.ts` — base publica para OAuth y URL de webhooks.
- `src/lib/shopify-admin.ts` — version API Admin (`SHOPIFY_ADMIN_API_VERSION`).
- `src/lib/shopify-product-map.ts` — mapeo producto Shopify → fila `products` (compartido sync + webhook).
- `src/lib/shopify-webhook-hmac.ts` — validacion HMAC webhook.
- `src/lib/shopify-register-webhooks.ts` — alta idempotente de `products/create|update|delete`.

### URL publica

- Misma base (`PUBLIC_SITE_URL` / `SHOPIFY_OAUTH_REDIRECT_BASE`) para OAuth y para la URL que se registra en Shopify: `{publicBase}/api/webhooks/shopify` (HTTPS obligatorio en produccion).

### Base de datos

- `create_shopify_integrations.sql`, `add_products_shopify_product_id.sql`.

### Variables de entorno

- `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET` (secreto compartido OAuth + **webhooks**), `SHOPIFY_SCOPES`
- Supabase URL + anon + service role
- `PUBLIC_SITE_URL` o `SHOPIFY_OAUTH_REDIRECT_BASE`
- Opcional: `SHOPIFY_ADMIN_API_VERSION`

### Limitaciones actuales

- Una sola **variante** por producto (primera) en mapeo.
- Sync masivo no borra productos locales que ya no existan en Shopify (los webhooks si borran al eliminar en Shopify).
- Token en claro en BD.

---

## Pendiente (siguientes pasos)

### Corto plazo

- [ ] Webhook `inventory_levels/update` si hace falta stock multi-ubicacion.
- [ ] Multi-variante (tabla o JSON).
- [ ] Adapter Astro/Vercel (`app.render` deprecado).

### Medio plazo (bot)

- [ ] Pipeline conocimiento / embeddings desde `products`.
- [ ] Re-indexacion al webhook (o cola).
- [ ] Respuestas con datos de catalogo.

### Produccion

- [ ] Cifrado de `access_token`.
- [ ] Panel salud / errores webhook.
- [ ] Auditoria.

---

## Definition of Done (objetivo final)

- [x] Conectar tienda (OAuth).
- [x] Integracion por organizacion.
- [x] Sync productos a `products`.
- [x] Webhooks mantienen catalogo alineado (alta/baja/edita en Shopify).
- [x] Bot WhatsApp usa filas de `products` en el system prompt (incl. Shopify sync).
- [ ] RAG / embeddings si el catalogo supera cómodamente el contexto del modelo.
- [ ] Tokens y errores gestionados para operacion estable.

---

## Archivos clave

| Area | Archivos |
|------|-----------|
| UI | `ShopifyIntegration.tsx`, `ConfigPage.tsx` |
| OAuth / sync | `api/shopify/connect.ts`, `callback.ts`, `status.ts`, `disconnect.ts`, `sync-products.ts`, `register-webhooks.ts` |
| Webhooks | `api/webhooks/shopify.ts` |
| Lib | `shopify-public-url.ts`, `shopify-admin.ts`, `shopify-product-map.ts`, `shopify-webhook-hmac.ts`, `shopify-register-webhooks.ts` |
| SQL | `create_shopify_integrations.sql`, `add_products_shopify_product_id.sql` |
