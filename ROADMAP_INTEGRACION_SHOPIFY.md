# Roadmap: Integracion Shopify

**Ultima actualizacion:** estado real del codigo en repo (OAuth + sync inicial de productos).

---

## Estado resumido

| Fase | Estado | Notas |
|------|--------|--------|
| 1 Conexion OAuth | **Hecho** | Flujo completo con validacion HMAC, state firmado, persistencia en `shopify_integrations` |
| 2 Sync catalogo (MVP) | **Hecho** | REST Admin API, paginacion, upsert en `products` con `shopify_product_id` |
| 3 Webhooks / sync automatico | Pendiente | |
| 4 Entrenamiento del bot con catalogo | Pendiente | |
| 5 Produccion (seguridad, metricas) | Parcial | Logs listos; falta endurecer secretos y monitoreo |

---

## Ya implementado (detalle)

### Frontend

- Seccion **Integracion Shopify (Nuevo)** en Configuracion (`ConfigPage` + `ShopifyIntegration.tsx`).
- Flujo: dominio `*.myshopify.com` → conectar → redirect OAuth → vuelta con query params.
- Boton **Sincronizar productos** llamando a API real.
- Logs en consola del navegador con prefijo `[ShopifyIntegration]`.

### Backend (Astro API routes)

- `POST /api/shopify/connect` — inicia OAuth; `redirect_uri` = `{publicBase}/api/shopify/callback`.
- `GET /api/shopify/callback` — HMAC, state, intercambio de token, upsert en BD, redirect a `/configuracion`.
- `GET /api/shopify/status` — estado de integracion (sin exponer token).
- `POST /api/shopify/disconnect` — marca integracion como desconectada.
- `POST /api/shopify/sync-products` — lista productos Shopify (paginado), guarda/actualiza en `products`.

### URL publica y Shopify Partners

- Helper `src/lib/shopify-public-url.ts`: prioridad `SHOPIFY_OAUTH_REDIRECT_BASE` → `PUBLIC_SITE_URL` → `Origin` → host del request.
- En Shopify hay que whitelistear **exactamente** el `redirect_uri` que usa el servidor (ej. `https://wazapp.ai/api/shopify/callback`).

### Base de datos (migraciones)

- `create_shopify_integrations.sql` — tabla `shopify_integrations` por organizacion.
- `add_products_shopify_product_id.sql` — columna `shopify_product_id` + indice unico `(organization_id, shopify_product_id)` para upsert.

### Variables de entorno usadas

- `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_SCOPES`
- `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `PUBLIC_SITE_URL` o `SHOPIFY_OAUTH_REDIRECT_BASE` (recomendado en produccion)
- Opcional: `SHOPIFY_ADMIN_API_VERSION` (default `2024-10` en sync)

### Logging (servidor)

- `requestId` en respuestas JSON y en logs de connect / callback / status / disconnect / sync.
- Callback loguea `publicBase` y resultado de conexion.

### Limitaciones actuales del sync

- Una sola **variante** por producto (la primera): precio e inventario.
- No se eliminan en CRM productos borrados en Shopify (solo upsert de los que vienen en la API).
- Token de Shopify guardado en claro en BD; pendiente cifrado o vault para produccion dura.

---

## Pendiente (siguientes pasos)

### Corto plazo

- [ ] Webhooks `products/*` (y opcional `inventory_levels/update`) para mantener catalogo sin boton manual.
- [ ] Soporte multi-variante (tabla `product_variants` o JSON en producto).
- [ ] Version de API Shopify configurable y prueba con tiendas que exijan version mas nueva.
- [ ] Warning Astro + adapter Vercel (`app.render` deprecado) — actualizar cuando suban a Astro 5.

### Medio plazo (bot)

- [ ] Pipeline de conocimiento: texto + metadatos de productos → chunks / embeddings para el bot.
- [ ] Re-indexacion incremental al cambiar producto (webhook).
- [ ] Respuestas con precio, stock e imagen alineados a datos sincronizados.

### Produccion

- [ ] Cifrado de `access_token` en reposo o uso de secret manager.
- [ ] Panel de salud: ultima sync, conteo, errores recientes.
- [ ] Rotacion de credenciales y auditoria por organizacion.

---

## Definition of Done (objetivo final del proyecto)

- [x] Conectar tienda desde UI en un flujo OAuth.
- [x] Guardar integracion por organizacion en Supabase.
- [x] Sincronizar productos (titulo, descripcion, precio, stock, imagen, categoria basica) en `products`.
- [ ] Webhooks mantienen catalogo actualizado.
- [ ] Bot responde usando catalogo sincronizado de forma fiable.
- [ ] Tokens y errores gestionados para operacion estable.

---

## Archivos clave (referencia rapida)

| Area | Archivos |
|------|-----------|
| UI | `src/components/ShopifyIntegration.tsx`, `src/components/ConfigPage.tsx` |
| OAuth / sync API | `src/pages/api/shopify/connect.ts`, `callback.ts`, `status.ts`, `disconnect.ts`, `sync-products.ts` |
| URL publica | `src/lib/shopify-public-url.ts` |
| SQL | `supabase/migrations/create_shopify_integrations.sql`, `add_products_shopify_product_id.sql` |
