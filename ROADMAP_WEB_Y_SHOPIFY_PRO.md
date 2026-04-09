# Roadmap pro: bot en sitios web + evolución Shopify

**Propósito:** planificar el canal **web** (widget en páginas de clientes) y la capa **pro** de **Shopify**, partiendo del estado real del CMR/Wazapp que ya tenéis en el repo.

**Última revisión:** abril 2026 (alineado con `ROADMAP_INTEGRACION_SHOPIFY.md`, `server/README.md`, `integracionwazapp.md`).

### Estado abril 2026 — canal web (Hito A MVP)

| Entrega | Estado |
|---------|--------|
| Clave pública por org + dominios permitidos + `chats` `platform: web` | **Hecho** (migración `add_web_widget_to_organizations.sql`, APIs `public/widget/*`, panel Configuración → Widget). |
| `widget.js` + burbuja + sesión + mensajes + polling + respuesta IA | **Hecho** (probado en sitio real; fix `STORAGE_V` desplegado). |
| Snippet `?siteKey=` en URL (CMS que trunca `data-site-key`) | **Hecho** |
| Embed iframe + `frame-ancestors` + bypass origen desde página wazapp | **Hecho** |
| Loader `wazapp-embed-loader.js` (hosts que borran `<iframe>` del HTML) | **Hecho** |
| Bridge consola padre + `postMessage` para soporte | **Hecho** |
| **Hito B Shopify** (Theme App Extension con mismo widget) | **Pendiente** (siguiente bloque grande). |
| **A.2** rate limit, branding CSP guías, handoff explícito | **Pendiente / afinar** |

---

## Visión resumida (experiencia del cliente)

| Dónde | Qué hace el comerciante | Qué obtiene |
|--------|-------------------------|-------------|
| **Cualquier web** | Copia y pega un **fragmento HTML** (en la práctica suele ser **una línea**: un `<script …>` que apunta a vuestro `widget.js`, más un `data-` con la clave de la org). Opcional: bloque “HTML personalizado” en WordPress, Webflow, etc. | Al publicar la página, aparece la **burbuja de chat** y el bot habla con el mismo backend que el panel CMR. |
| **Tienda Shopify** | Con la **app Wazapp** ya instalada (OAuth que ya tenéis), entra al **editor de tema** y **activa el bloque / embed de la app** (Theme App Extension o *App embed* en Online Store 2.0). Sin pegar código en Liquid a mano. | El widget queda **visible en toda la tienda** (o solo donde configure el tema). Misma UI y misma API que el snippet web. |

**Idea clave:** se construye **un solo widget** (JS + burbuja + conversación). La web lo carga con HTML/script; Shopify lo inyecta al **activar la extensión** en el tema. Así no mantenéis dos productos de chat distintos.

---

## 1. Estado actual del CMR (punto de partida)

| Área | Estado | Evidencia en el proyecto |
|------|--------|---------------------------|
| Panel (Astro + React) | **Sólido** | Chats, pedidos, dashboard, configuración, despliegue Vercel (`wazapp.ai`). |
| Auth / orgs | **Operativo** | OTP, organizaciones; ver `PROGRESO.md` (parte histórica; Shopify ya supera “solo mock”). |
| Datos core | **Supabase** | `products`, `messages`, `chats`, integraciones, etc. |
| WhatsApp | **Baileys en servidor (Contabo)** | API propia (`PUBLIC_BAILEYS_API_URL`); flujo documentado en `server/README.md` e `integracionwazapp.md`. |
| Shopify | **OAuth + sync + webhooks productos** | Hecho según `ROADMAP_INTEGRACION_SHOPIFY.md`; bot WhatsApp **usa catálogo en prompt** (parcial; sin RAG aún). |
| Canal **web** (widget embebible) | **MVP en producción** | `public/widget.js`, APIs `/api/public/widget/*`, iframe embed, loader; panel **Configuración → Widget**; conversaciones en `chats` con `platform: web`. |

**Conclusión:** el “cerebro” del bot y el CRM están encaminados; el siguiente salto **pro** es **exponer el mismo backend de conversaciones** a visitantes de **sitios web** y **profundizar Shopify** sin duplicar lógica.

---

## 2. Principios (manera pro)

1. **Un solo modelo de conversación:** `chats` / `messages` con `channel` (`whatsapp` | `web` | `shopify_inbox` | …) y mismas reglas de negocio donde sea posible.
2. **Aislamiento por organización:** claves públicas del widget por `organization_id` (o token firmado), rate limiting y CORS explícitos.
3. **Shopify como fuente de verdad comercial; Supabase como fuente operativa:** seguir sync/webhooks ya hechos; añadir solo lo que aporte checkout, temas o app embebida.
4. **Seguridad antes que features:** tokens Shopify cifrados, webhooks validados (ya HMAC), logs y panel de salud (pendientes parciales en roadmap Shopify).

---

## Plan por días — Web primero, Shopify después

**Nota:** cada “día” es una **jornada de trabajo** enfocada; podés estirar o fusionar según equipo y contexto. El orden es fijo: **cerrar web usable** antes de la **extensión Shopify** (reusa el mismo `widget.js`).

### Bloque 1 — Canal web (Hito A, MVP) — **cerrado (abril 2026)**

| Día | Enfoque | Resultado |
|-----|---------|-----------|
| **1** | **Diseño A.0** | **Hecho:** `visitorId` UUID + localStorage; dominios opcionales `web_widget_allowed_origins`; **polling** ~6s. |
| **2** | **Datos y clave pública** | **Hecho:** `web_widget_public_key`, `web_widget_allowed_origins`; chats `platform: 'web'`. |
| **3** | **API: sesión** | **Hecho:** `POST /api/public/widget/session` → `chatId`. |
| **4** | **API: mensaje + bot** | **Hecho:** `POST .../message` + pipeline IA (`generate-web-widget-sales-reply`). |
| **5** | **`widget.js` mínimo** | **Hecho** |
| **6** | **Widget: conversación** | **Hecho** |
| **7** | **Tiempo real o polling** | **Hecho** (polling) |
| **8** | **Panel CMR** | **Hecho:** WebWidgetIntegration + snippets (script / iframe / loader / bridge). |
| **9** | **CORS + prueba en sitio real** | **Hecho** (CORS en APIs públicas; probado en web de cliente). |
| **10** | **Cierre MVP web** | **Hecho** — DoD cumplido. **Siguiente:** afinar (A.2) + Hito B Shopify. |

### Bloque 2 — Shopify (Hito B, tras el MVP web)

| Día | Enfoque | Resultado al cerrar el día |
|-----|---------|-----------------------------|
| **11** | **Theme App Extension — esqueleto** | Proyecto CLI Shopify; extensión **app embed** o bloque que solo inyecta un `<script>` de prueba en storefront. |
| **12** | **Enlazar shop → org** | Al cargar storefront, el script conoce **shop** (`Shopify.shop` / liquid) y pide a vuestra API un **token o `site_key` efímero** mapeado a `shopify_integrations` (sin secretos en el navegador). |
| **13** | **Mismo `widget.js` en tema** | Sustituir script de prueba por **la misma URL** que el snippet web; `channel` puede ser `web` + metadata `source: shopify` o `shopify_storefront` según modelo único. |
| **14** | **Editor de tema + QA** | Flujo documentado: **Personalizar → App embeds → activar**; probado en tema estándar (p. ej. Dawn). |
| **15** | **Cierre extensión** | Empaquetado app coherente con OAuth existente; checklist de scopes; **DoD:** tienda de prueba con chat visible solo activando el embed. |

### Después del día 15

- **A.2** (rate limit, branding, CSP) y **B.1** (deuda Shopify: token cifrado, webhooks salud) en paralelo según prioridad.
- **B.4** RAG cuando el catálogo lo exija.

---

## 3. Hito A — Bot para web: “pego HTML y funciona”

### Qué ve el comerciante (UX objetivo)

1. En **Configuración** del panel: botón **“Copiar código para mi web”**.
2. Pega en su sitio el snippet (típicamente **solo el `<script …>`**; si hace falta, documentáis también un `<div id="wazapp-root">` mínimo — preferible evitarlo si el script crea el nodo solo).
3. Guarda/publica la página → **el bot ya está en vivo**.

Eso implica por debajo: `widget.js` alojado en dominio propio (p. ej. `wazapp.ai` o `cdn.wazapp.ai`), estable y versionado.

### A.0 Descubrimiento (0,5–1 semana)

- Definir **identidad del visitante** (anon `visitor_id` en cookie/localStorage vs email opcional).
- Definir **origen permitido** por org: lista de dominios en BD o verificación DNS simple.
- Decidir transporte: **HTTP + SSE** o **Supabase Realtime** para recibir mensajes (coherente con lo que ya uséis en panel).

### A.1 MVP widget (2–3 semanas)

| Entregable | Descripción |
|------------|-------------|
| **Snippet de instalación** | “Copiar código” en panel → pegar en la web. Ver ejemplo abajo (clave pública en `data-site-key` o `data-org`). Sin build en el sitio del cliente. |
| **API pública acotada** | `POST /api/public/chat/session`, `POST /api/public/chat/message` (o Edge Function) — sin sesión de usuario del panel; auth por **clave pública** + **origen** (Referer / signed token). |
| **UI flotante** | Burbuja + drawer, tema claro/oscuro, accesibilidad básica (focus trap, aria). |
| **Persistencia** | Misma tabla `messages` con `channel = 'web'` y metadata (`page_url`, `user_agent`). |
| **Guía rápida** | WordPress (widget HTML), sitios estáticos; en Shopify lo ideal es la extensión (Hito B), no Liquid manual. |

Ejemplo mínimo (el comerciante lo pega antes de `</body>`). Ver bloque **DoD MVP** arriba para variantes iframe / loader.

**DoD MVP:** un sitio de prueba **solo con pegar el snippet**; conversación aparece en el panel CMR como un chat más. **— Cumplido.**

**Snippet recomendado hoy (clave larga en URL; muchos CMS cortan `data-site-key`):**

```html
<script src="https://wazapp.ai/widget.js?siteKey=TU_CLAVE_64_HEX" defer></script>
```

**Si el hosting elimina iframes del HTML:** `wazapp-embed-loader.js?siteKey=…` (una sola etiqueta script). **Si bloquea scripts externos:** iframe `widget-embed-iframe.html?siteKey=…` + opcional `wazapp-embed-console-bridge.js` para logs en la consola del sitio padre.

### A.2 Producción (2–4 semanas)

- Rate limiting (IP + org + visitor), CAPTCHA opcional en abuso.
- **CORS** y **Content-Security-Policy** documentados para clientes.
- **Branding** por org (color, logo) desde configuración.
- **Handoff a humano** explícito (estado del chat + notificación al agente).
- Métricas: conversión, mensajes/sesión, abandono.

### A.3 Pro / enterprise

- SSO o identificación tras login en la web del cliente (postMessage seguro).
- **Knowledge** compartido con WhatsApp: mismo RAG/embeddings cuando lo implementéis (`ROADMAP_INTEGRACION_SHOPIFY.md` — fase bot).
- Widget multi-idioma y horario de atención.

---

## 4. Hito B — Shopify: extensión en la tienda (“activo y aparece”)

Partís de: OAuth, `shopify_integrations`, sync REST, webhooks `products/create|update|delete`, bot WhatsApp con productos en prompt.

### B.0 Experiencia objetivo en Shopify

1. El comerciante **instala** vuestra app (flujo OAuth actual).
2. En **Tienda online → Temas → Personalizar**, abre **App embeds** (o el bloque de app en el layout) y **activa “Chat Wazapp”**.
3. Opcional: arrastra el bloque si el tema lo permite; sin copiar/pegar script en Liquid.
4. Al guardar, el **mismo `widget.js`** que en la web carga en la storefront, ya vinculado a la org/tienda correcta (shop domain o token derivado del install).

Eso es una **Theme App Extension** (bloque o embed global). Es el camino estándar “pro” para Online Store 2.0.

### B.1 Cerrar deuda del roadmap Shopify actual (corto plazo)

Reutilizar checklist de `ROADMAP_INTEGRACION_SHOPIFY.md`:

- `inventory_levels/update` si el stock multi-ubicación importa.
- Multi-variante (modelo de datos + mapeo).
- Cifrado de `access_token` + panel de salud webhooks + auditoría.

### B.2 Extensión de tema + app (medio plazo)

| Entregable | Valor |
|------------|--------|
| **Empaquetar app Shopify** | El OAuth/sync actual vive dentro de una app instalable coherente (CLI Shopify, `shopify.app.toml`). |
| **Theme App Extension** | Punto de activación en el editor de tema; inyecta script del widget con **shop** y **org** resueltos en servidor (metafield o sesión de app) para no exponer secretos. |
| **App embed** (si aplica al tema) | Alternativa/complemento: un solo toggle “mostrar chat en toda la tienda”. |
| **Deep links a producto** | Respuestas del bot con URL canónica de variant; usar `products` + `shopify_product_id` ya sincronizados. |

### B.3 Checkout y post-compra (cuando encaje el producto)

- Webhooks `orders/create` (opcional) para contexto de pedido en el bot (estado, tracking) — solo si queréis soporte post-venta unificado.
- **Shopify Inbox / Shop** no sustituye vuestro CRM; valoráis integración solo si unificáis canales en una sola cola.

### B.4 Bot “inteligente” en catálogo grande

- Pipeline **embeddings / RAG** desde `products` (ya marcado pendiente en roadmap Shopify).
- Re-indexación disparada por webhooks de producto (o cola asíncrona).

**DoD Shopify pro:** comerciante **activa la extensión en el tema**; visitante chatea desde la tienda; conversación llega al mismo CMR que web/WhatsApp; catálogo grande sigue siendo usable vía RAG.

---

## 5. Hito C — Unificación y operación

- **Un inbox:** filtros por canal (web / WhatsApp / Shopify).
- **Políticas de retención** y RGPD (consentimiento en widget, export/borrado).
- **Observabilidad:** trazas por `organization_id`, alertas webhook Shopify fallidos, latencia OpenAI.
- **Documentación comercial:** “**Un snippet para la web**” + “**En Shopify, activar el embed en el tema**” + troubleshooting CORS.

---

## 6. Orden sugerido (cronograma orientativo)

Detalle día a día: sección **Plan por días** arriba (~10 días web + ~5 días Shopify).

| Fase | Duración orientativa | Prioridad |
|------|----------------------|-----------|
| A.0 + A.1 MVP web | 3–4 semanas | Alta (nuevo canal, alto valor comercial). |
| B.1 deuda Shopify (seguridad + variantes + stock) | en paralelo o justo después | Alta (estabilidad). |
| A.2 widget producción | 2–4 semanas | Alta |
| B.2 Theme App Extension (mismo widget) | 3–6 semanas | Media–alta |
| B.4 RAG + B.3 pedidos | según tamaño de catálogo y roadmap producto | Media |

---

## 7. Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Abuso del endpoint público del widget | Rate limits, clave por org, dominios permitidos, WAF. |
| Duplicar lógica OpenAI entre Baileys y web | Extraer servicio “responder mensaje” compartido (lib o Edge Function única). |
| Scope creep en Shopify | MVP: **extensión que solo monta el widget** + misma cola CMR; checkout/post-compra después. |

---

## 8. Documentos relacionados

- `ROADMAP_INTEGRACION_SHOPIFY.md` — detalle técnico Shopify actual.
- `ROADMAP_QR_CONEXION_WHATSAPP.md` — flujo QR / OAuth WhatsApp (referencia de estilo operativo).
- `server/README.md` / `integracionwazapp.md` — arquitectura Baileys + Contabo.

---

*Este roadmap asume: **(1)** en web, instalar = pegar snippet HTML/script; **(2)** en Shopify, instalar = app + **activar extensión en el tema**; **(3)** una sola base CMR y un solo widget detrás de ambos.*
