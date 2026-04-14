Wazapp — Theme app extension (chat en la tienda)
================================================

Qué hace
--------
- App embed que inserta: {tu Wazapp}/widget.js?shop={shop.permanent_domain}
- El merchant activa el embed en el editor de tema (App embeds).
- Mismo diseño que el widget web.

Requisitos
----------
1. En Shopify Partners, la app debe ser la MISMA que usa SHOPIFY_API_KEY en tu backend (OAuth Wazapp).
2. Instalar Shopify CLI: https://shopify.dev/docs/apps/tools/cli
3. En la raíz del proyecto (donde está shopify.app.toml), ejecutar:
 shopify app deploy
   O en desarrollo:
     shopify app dev

4. Tras publicar la extensión, el merchant instala/actualiza la app en la tienda y en
 Tienda online → Temas → Personalizar → icono de engranaje / App embeds
   activa "Wazapp chat".

Deep link (opcional)
--------------------
https://TU-TIENDA.myshopify.com/admin/themes/current/editor?context=apps&activateAppId=CLIENT_ID/wazapp-chat-embed

CLIENT_ID = API key de la app (mismo valor que SHOPIFY_API_KEY).

Archivos
--------
- blocks/wazapp-chat-embed.liquid  → handle del bloque = wazapp-chat-embed (para activateAppId)
