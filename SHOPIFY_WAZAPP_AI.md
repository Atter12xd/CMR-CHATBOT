# Shopify: app **wazapp ai** + extensión de tema (producción inicial)

**Contexto (abril 2026):** la integración OAuth / sync / webhooks del panel (`wazapp.ai`) vive en el repo Astro. La **Theme App Extension** del chat (`extensions/wazapp-chat`) se publica con **Shopify CLI** ligada a una app de Partners.

Para no mezclar con otras extensiones (p. ej. botón WhatsApp en la app histórica **cod apps**), se creó una **app dedicada en Partners** llamada **wazapp ai**. El CRM y el widget siguen siendo los mismos; solo cambia el **Client ID / secret** y la app que instala el comerciante.

---

## Archivos de configuración CLI en el repo

| Archivo | Uso |
|---------|-----|
| `shopify.app.wazapp-ai.toml` | App **wazapp ai** (actual). `shopify app deploy --config shopify.app.wazapp-ai.toml`. |
| `shopify.app.toml.example` | Plantilla de referencia. |
| `shopify.app.cod-apps.toml` | Enlace previo a **cod apps** (solo si aún existe en tu clon; no hace falta para Wazapp). |

Config local relevante en `shopify.app.wazapp-ai.toml`:

- `application_url` → `https://wazapp.ai/app/shopify` (pantalla para comerciantes; la landing de marketing sigue en `/`)
- `[auth] redirect_urls` → `https://wazapp.ai/api/shopify/callback`
- Extensión publicada: **`wazapp-chat`** (nombre visible en el editor de tema: **Wazapp chat**)

Detalle del embed: `extensions/wazapp-chat/README.txt`.

---

## Variables en Vercel (alinear con esta app)

Deben corresponder a la app **wazapp ai** en Partners (no a otra app):

- `SHOPIFY_API_KEY` — ID de cliente de **wazapp ai**
- `SHOPIFY_API_SECRET` — Secreto de **wazapp ai** (Partners → Credenciales)
- `SHOPIFY_SCOPES` — Misma cadena que en Partners / `[access_scopes]` del TOML
- `SHOPIFY_OAUTH_REDIRECT_BASE` — `https://wazapp.ai` (recomendado)
- `SHOPIFY_ADMIN_API_VERSION` — Alineado con la API de la app (p. ej. `2026-07` si así está en Partners)
- `PUBLIC_APP_URL` — `https://wazapp.ai`

Tras cambiar variables: **redeploy** en Vercel.

---

## Flujo del comerciante

1. **Panel Wazapp** → **Configuración** → **Integración Shopify** → conectar tienda (`*.myshopify.com`), OAuth con la app **wazapp ai**, sincronizar productos (y webhooks si aplica).
2. **Shopify** → tienda donde está instalada **wazapp ai** → **Tienda online → Temas → Personalizar → App embeds** → activar **Wazapp chat** y guardar.

La tienda conectada en el panel debe ser la misma que la de la storefront donde se activa el embed (mismo dominio `myshopify`).

---

## Comandos útiles (desde la raíz del repo)

```powershell
shopify auth login
shopify app deploy --config shopify.app.wazapp-ai.toml
```

Primera vinculación de app nueva (si hiciera falta en otro clon):

```powershell
shopify app config link
```

(Elegir organización → crear o conectar app → nombre de config sin espacios, p. ej. `wazapp-ai`.)

---

## Próximo foco sugerido (producto / IA)

**Mejorar los prompts de respuesta del bot** (tono, límites de longitud, cuándo citar catálogo, escalación a humano, coherencia entre **WhatsApp** —p. ej. Baileys— y **widget web / Shopify**). Hoy el catálogo ya entra en contexto en parte del flujo; el salto de calidad percibida suele venir de **afinar system prompts y reglas** antes o en paralelo a RAG/embeddings.

Referencias útiles en el repo: `ROADMAP_INTEGRACION_SHOPIFY.md` (fase bot), `ROADMAP_WEB_Y_SHOPIFY_PRO.md` (Hito B cerrado; A.2 y B.4 siguen), y en backend Baileys `PROYECTO_BAILEYS_Y_PROXIMOS_PASOS.md` / `events.ts` (prompt WhatsApp).

---

## Documentos relacionados

- `ROADMAP_INTEGRACION_SHOPIFY.md` — detalle técnico OAuth, sync, webhooks, widget.
- `ROADMAP_WEB_Y_SHOPIFY_PRO.md` — roadmap web + Shopify pro.
- `CONFIG_DOMINIO_WAZAPP.md` — dominio `wazapp.ai` y redirects.
