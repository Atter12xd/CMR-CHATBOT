/* Wazapp widget — recomendado (CMS no trunca la URL):
 *   <script src="https://wazapp.ai/widget.js?siteKey=TU_CLAVE_64_HEX" defer></script>
 * Muchos editores truncan data-site-key a ~16 caracteres; por eso la clave va en ?siteKey=.
 * Opcional: data-debug="true" en el <script> (más detalle en consola).
 * Siempre verás líneas [Wazapp] en consola (info/error) para diagnosticar embeds en webs de clientes.
 * No pongas dos veces widget.js en la misma página (ej. uno con TU_CLAVE_PUBLICA de prueba y otro real).
 */
(function () {
  var Z = 2147483000;

  /** Si el widget corre dentro de un iframe, avisa a la página padre (consola del cliente suele estar ahí). */
  function postToParent(extra) {
    try {
      if (typeof window === 'undefined' || !window.parent || window.parent === window) return;
      var msg = { type: 'wazapp-embed', v: 1, source: 'wazapp-widget' };
      if (extra && typeof extra === 'object') {
        for (var k in extra) {
          if (Object.prototype.hasOwnProperty.call(extra, k)) msg[k] = extra[k];
        }
      }
      window.parent.postMessage(msg, '*');
    } catch (e) {}
  }

  function normKey(s) {
    return String(s || '')
      .trim()
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .toLowerCase();
  }

  function isHex64(k) {
    return k.length === 64 && /^[0-9a-f]+$/.test(k);
  }

  function siteKeyFromScriptSrc(el) {
    if (!el || !el.src) return '';
    try {
      var u = new URL(el.src, window.location.href);
      return normKey(u.searchParams.get('siteKey') || u.searchParams.get('key') || '');
    } catch (e) {
      return '';
    }
  }

  /** Último <script widget.js> cuya URL tenga siteKey hex de 64; si no hay ninguno, el último tag (compat.). */
  function pickWinnerScriptEl() {
    var nodes = document.querySelectorAll('script[src*="widget.js"]');
    if (!nodes.length) return null;
    var lastWithValidKey = null;
    for (var i = 0; i < nodes.length; i++) {
      if (isHex64(siteKeyFromScriptSrc(nodes[i]))) {
        lastWithValidKey = nodes[i];
      }
    }
    if (lastWithValidKey) return lastWithValidKey;
    return nodes[nodes.length - 1];
  }

  var SCRIPT = pickWinnerScriptEl();
  if (!SCRIPT || SCRIPT.nodeType !== 1) {
    console.warn('[Wazapp] No se encontró el <script src="...widget.js">.');
    return;
  }

  /**
   * Cada <script src="widget.js?..."> descarga el mismo archivo y ejecuta este IIFE otra vez.
   * Si hay un embed con TU_CLAVE_PUBLICA y otro con la clave real, document.currentScript apuntaba al segundo
   * y se usaba la clave placeholder → 401. Solo el tag "ganador" (clave 64 hex) debe continuar; el resto sale.
   */
  var invoker = document.currentScript;
  var invokerIsWidget =
    invoker && invoker.src && invoker.src.indexOf('widget.js') !== -1;
  if (invokerIsWidget && invoker !== SCRIPT) {
    return;
  }

  var debug =
    SCRIPT.getAttribute('data-debug') === 'true' ||
    (typeof window !== 'undefined' && window.__WAZAPP_DEBUG__ === true);

  function log() {
    if (!debug || !console || !console.info) return;
    console.info.apply(console, ['[Wazapp]'].concat([].slice.call(arguments)));
  }

  /** Avisos siempre visibles en consola (no dependen de data-debug). */
  function say() {
    if (typeof console === 'undefined' || !console.info) return;
    console.info.apply(console, ['[Wazapp]'].concat([].slice.call(arguments)));
  }

  log('Script detectado', SCRIPT.src);
  if (debug) {
    var nScripts = document.querySelectorAll('script[src*="widget.js"]').length;
    if (nScripts > 1) {
      log(
        'Hay ' +
          nScripts +
          ' scripts widget.js; se usa el último con ?siteKey= de 64 hex (evita embeds viejos con clave corta o placeholder).',
      );
    }
  }

  var fromAttr = normKey(SCRIPT.getAttribute('data-site-key') || '');
  var fromUrl = '';
  try {
    var uParse = new URL(SCRIPT.src, window.location.href);
    fromUrl = normKey(uParse.searchParams.get('siteKey') || uParse.searchParams.get('key') || '');
  } catch (e) {}

  var siteKey = '';
  if (isHex64(fromUrl)) {
    siteKey = fromUrl;
  } else if (isHex64(fromAttr)) {
    siteKey = fromAttr;
  } else if (fromUrl.length > fromAttr.length) {
    siteKey = fromUrl;
  } else {
    siteKey = fromAttr;
  }

  if (!siteKey && typeof window !== 'undefined') {
    siteKey = normKey(window.__WAZAPP_SITE_KEY__ || window.WAZAPP_SITE_KEY || '');
  }
  if (!siteKey) {
    console.warn('[Wazapp] Falta la clave: ?siteKey= en la URL del script, data-site-key, o window.__WAZAPP_SITE_KEY__');
    return;
  }
  if (siteKey === 'tu_clave_publica') {
    console.warn(
      '[Wazapp] Estás usando el texto de documentación «TU_CLAVE_PUBLICA» (no es una clave real). Sustitúyelo por la clave de 64 hex en Configuración → Widget, o abre widget-embed-test.html?key=TU_CLAVE.',
    );
    return;
  }

  if (typeof window !== 'undefined' && window.__WAZAPP_WIDGET_V1__) {
    return;
  }
  if (typeof window !== 'undefined') {
    window.__WAZAPP_WIDGET_V1__ = true;
  }

  if (fromAttr.length > 0 && fromAttr.length < 64 && !isHex64(fromUrl)) {
    console.warn(
      '[Wazapp] Tu sitio parece haber cortado data-site-key (solo ' +
        fromAttr.length +
        ' caracteres). Usa el snippet con la clave en la URL: src=".../widget.js?siteKey=TU_CLAVE_COMPLETA"',
    );
  }

  log('Clave OK (longitud ' + siteKey.length + ')');

  var apiBase = (SCRIPT.getAttribute('data-api-base') || '').trim();
  if (!apiBase) {
    try {
      apiBase = new URL(SCRIPT.src).origin;
    } catch (e) {
      console.warn('[Wazapp] No se pudo resolver API base.');
      return;
    }
  }
  apiBase = apiBase.replace(/\/+$/, '');
  log('API base:', apiBase);
  try {
    var __apiHost = new URL(apiBase).hostname;
    if (__apiHost === 'localhost' || __apiHost === '127.0.0.1') {
      console.warn(
        '[Wazapp] El chat usa la API en ' +
          apiBase +
          ' (mismo host que el .js). Si la clave la generaste en producción pero el script carga desde localhost, verás 401. Solución: src="https://wazapp.ai/widget.js?siteKey=…" o data-api-base="https://wazapp.ai" en el <script>.',
      );
    }
  } catch (e) {}

  var pageHost = '';
  try {
    pageHost = location.hostname || '';
  } catch (e) {}
  say(
    'Script activo → API:',
    apiBase,
    '| clave:',
    siteKey.length,
    'chars (',
    siteKey.slice(0, 8) + '…)',
    '| esta página:',
    pageHost || '(desconocido)',
    debug ? '| modo debug=ON' : '| más detalle: data-debug="true"',
  );
  try {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      postToParent({
        phase: 'widget-active',
        apiBase: apiBase,
        siteKeyLength: siteKey.length,
        pageHost: pageHost || undefined,
      });
    }
  } catch (e) {}

  var STORAGE_V = 'wazapp_v1_';
  var memStore = {};
  function storageKey(k) {
    return STORAGE_V + k + '_' + siteKey.slice(0, 12);
  }
  function lsGet(k) {
    var key = storageKey(k);
    try {
      var v = localStorage.getItem(key);
      if (v != null) return v;
    } catch (e) {}
    return memStore[key] || null;
  }
  function lsSet(k, v) {
    var key = storageKey(k);
    try {
      localStorage.setItem(key, v);
    } catch (e) {}
    memStore[key] = v;
  }
  function lsRemove(k) {
    var key = storageKey(k);
    try {
      localStorage.removeItem(key);
    } catch (e) {}
    delete memStore[key];
  }

  function randomUuid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    var s = [];
    var hex = '0123456789abcdef';
    for (var i = 0; i < 36; i++) s[i] = hex.substr(Math.floor(Math.random() * 16), 1);
    s[14] = '4';
    s[19] = hex.substr((parseInt(s[19], 16) & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = '-';
    return s.join('');
  }

  var visitorId = lsGet('vid') || randomUuid();
  lsSet('vid', visitorId);
  var chatId = lsGet('cid') || null;

  function mountWidget() {
    if (!document.body) {
      log('Esperando document.body…');
      return;
    }

    try {
      if (document.querySelector('[data-wazapp-widget]')) {
        log('Widget ya montado, se omite duplicado.');
        return;
      }

      var root = document.createElement('div');
      root.setAttribute('data-wazapp-widget', '1');
      try {
        if (!document.querySelector('link[data-wazapp-font]')) {
          var pre = document.createElement('link');
          pre.rel = 'preconnect';
          pre.href = 'https://fonts.googleapis.com';
          document.head.appendChild(pre);
          var pre2 = document.createElement('link');
          pre2.rel = 'preconnect';
          pre2.href = 'https://fonts.gstatic.com';
          pre2.crossOrigin = '';
          document.head.appendChild(pre2);
          var fl = document.createElement('link');
          fl.rel = 'stylesheet';
          fl.href =
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
          fl.setAttribute('data-wazapp-font', '1');
          document.head.appendChild(fl);
        }
      } catch (eFont) {}

      var panelGrad =
        'linear-gradient(180deg,#dff0fb 0%,#eef6ff 32%,#ffffff 68%,#f4f7fb 100%)';
      var launcherRing =
        '0 0 0 1px rgba(129,140,248,.42),0 0 0 1px rgba(255,255,255,.9) inset,0 2px 8px rgba(99,102,241,.12),0 8px 24px rgba(15,23,42,.1)';
      var orbSmall =
        '<div aria-hidden="true" style="width:44px;height:44px;border-radius:50%;flex-shrink:0;background:radial-gradient(circle at 32% 28%,#ffffff,#dbeafe);box-shadow:0 0 0 2px #818cf8,0 0 20px rgba(99,102,241,.45),0 0 40px rgba(56,189,248,.15);position:relative">' +
        '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-42%);width:68%;height:30%;background:#0f172a;border-radius:6px;display:flex;align-items:center;justify-content:center;gap:5px">' +
        '<span style="width:5px;height:8px;background:#fff;border-radius:2px;box-shadow:0 0 6px rgba(255,255,255,.9)"></span>' +
        '<span style="width:5px;height:8px;background:#fff;border-radius:2px;box-shadow:0 0 6px rgba(255,255,255,.9)"></span>' +
        '</div></div>';
      var orbLarge =
        '<div aria-hidden="true" style="width:96px;height:96px;border-radius:50%;background:radial-gradient(circle at 32% 26%,#ffffff,#e0e7ff);box-shadow:0 0 0 3px #6366f1,0 0 28px rgba(99,102,241,.55),0 0 60px rgba(14,165,233,.2);position:relative">' +
        '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-42%);width:68%;height:30%;background:#0f172a;border-radius:8px;display:flex;align-items:center;justify-content:center;gap:6px">' +
        '<span style="width:6px;height:10px;background:#fff;border-radius:3px;box-shadow:0 0 8px rgba(255,255,255,.95)"></span>' +
        '<span style="width:6px;height:10px;background:#fff;border-radius:3px;box-shadow:0 0 8px rgba(255,255,255,.95)"></span>' +
        '</div></div>';
      var iconChat =
        '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.5 8.48 8.48 0 0 1 8.5 8.5z" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      var iconTrash =
        '<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2m2 0v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6h12zM10 11v5M14 11v5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      var iconSend =
        '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      var iconClose =
        '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

      root.innerHTML =
        '<button type="button" data-wazapp-launcher aria-label="Abrir chat" style="position:fixed;bottom:calc(20px + env(safe-area-inset-bottom,0px));right:calc(20px + env(safe-area-inset-right,0px));width:52px;height:52px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(160deg,#ffffff 0%,#f5f7ff 42%,#eef2ff 100%);color:#4f46e5;box-shadow:' +
        launcherRing +
        ';z-index:' +
        Z +
        ';display:flex;align-items:center;justify-content:center;transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s ease;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;-webkit-tap-highlight-color:transparent">' +
        iconChat +
        '</button>' +
        '<div data-wazapp-panel style="display:none;flex-direction:column;position:fixed;bottom:calc(84px + env(safe-area-inset-bottom,0px));right:calc(20px + env(safe-area-inset-right,0px));width:min(100vw - 40px,392px);height:min(520px,78vh);max-height:78vh;background:' +
        panelGrad +
        ';color:#0f172a;border-radius:28px;box-shadow:0 28px 64px rgba(15,23,42,.16),0 0 0 1px rgba(15,23,42,.07);z-index:' +
        (Z + 1) +
        ';overflow:hidden;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif">' +
        '<div data-wazapp-splash style="display:none;flex:1;flex-direction:column;align-items:center;justify-content:center;padding:28px 24px 32px;text-align:center;min-height:0">' +
        orbLarge +
        '<h2 style="margin:28px 0 0;font-size:22px;font-weight:600;color:#0d1b3e;letter-spacing:-.03em;line-height:1.25">Te damos la bienvenida</h2>' +
        '<p style="margin:10px 0 0;font-size:14px;color:#64748b;line-height:1.5;max-width:260px">Pulsa el botón para hablar con nuestro asistente.</p>' +
        '<button type="button" data-wazapp-splash-start style="margin-top:32px;padding:15px 40px;border-radius:999px;border:1px solid rgba(99,102,241,.55);background:#fff;color:#4f46e5;font-weight:600;font-size:15px;cursor:pointer;box-shadow:0 6px 24px rgba(99,102,241,.12);font-family:inherit;transition:transform .15s ease,box-shadow .15s ease">Comenzar</button>' +
        '</div>' +
        '<div data-wazapp-chrome style="display:none;flex-direction:column;flex:1;min-height:0">' +
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:14px 14px 8px 18px;flex-shrink:0">' +
        '<div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1">' +
        orbSmall +
        '<div style="flex:1;min-width:0">' +
        '<div data-wazapp-title style="font-weight:600;font-size:17px;color:#0d1b3e;letter-spacing:-.02em;line-height:1.2">Chat</div>' +
        '<div data-wazapp-subtitle style="font-size:12px;color:#64748b;margin-top:3px;line-height:1.35">Estamos para ayudarte</div>' +
        '</div></div>' +
        '<button type="button" data-wazapp-close aria-label="Cerrar chat" style="flex-shrink:0;width:40px;height:40px;margin-top:-4px;border:none;border-radius:50%;background:rgba(255,255,255,.65);color:#475569;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(15,23,42,.06);transition:background .15s ease">' +
        iconClose +
        '</button></div>' +
        '<div data-messages style="flex:1;overflow-y:auto;padding:6px 16px 12px;display:flex;flex-direction:column;gap:12px;font-size:14px;line-height:1.55;-webkit-overflow-scrolling:touch"></div>' +
        '<div style="padding:10px 16px 16px;flex-shrink:0">' +
        '<div style="display:flex;align-items:center;gap:8px;background:#fff;border-radius:999px;box-shadow:0 6px 24px rgba(15,23,42,.09),0 0 0 1px rgba(15,23,42,.06);padding:5px 6px 5px 18px">' +
        '<input data-wazapp-input type="text" placeholder="Escribe un mensaje…" style="flex:1;min-width:0;border:none;background:transparent;color:#0f172a;padding:11px 0;font-size:14px;outline:none;font-family:inherit" />' +
        '<button type="button" data-wazapp-send aria-label="Enviar" style="width:44px;height:44px;border-radius:50%;border:none;background:#94a3b8;color:#fff;font-weight:600;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(15,23,42,.12);transition:background .15s ease,transform .12s ease">' +
        iconSend +
        '</button></div>' +
        '<button type="button" data-wazapp-reset aria-label="Empezar de cero" style="margin-top:9px;width:100%;padding:10px 14px;border-radius:999px;border:1px solid rgba(15,23,42,.1);background:rgba(255,255,255,.72);color:#64748b;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;backdrop-filter:blur(8px)">' +
        iconTrash +
        '<span>Empezar de cero</span></button>' +
        '<button type="button" data-wazapp-minimize style="margin-top:8px;width:100%;padding:11px 16px;border-radius:999px;border:1px solid rgba(129,140,248,.55);background:rgba(255,255,255,.55);color:#5b21b6;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;backdrop-filter:blur(6px)">Cerrar ventana</button>' +
        '</div></div></div>';

      document.body.appendChild(root);
      var wzStyle = document.createElement('style');
      wzStyle.textContent =
        '[data-wazapp-widget],[data-wazapp-widget] *{box-sizing:border-box}' +
        '@keyframes wazapp-dot{0%,80%,100%{opacity:.35;transform:translateY(0)}40%{opacity:1;transform:translateY(-4px)}}' +
        '[data-wazapp-widget] [data-wazapp-typing]{align-self:flex-start;max-width:88%;padding:14px 20px;border-radius:20px;background:#fff;color:#0f172a;box-shadow:0 2px 14px rgba(15,23,42,.08);border:1px solid rgba(15,23,42,.06);display:flex;align-items:center;gap:5px}' +
        '[data-wazapp-widget] [data-wazapp-typing] i{width:7px;height:7px;border-radius:50%;background:#64748b;animation:wazapp-dot 1.25s ease-in-out infinite;font-style:normal;display:inline-block}' +
        '[data-wazapp-widget] [data-wazapp-typing] i:nth-child(2){animation-delay:.2s}' +
        '[data-wazapp-widget] [data-wazapp-typing] i:nth-child(3){animation-delay:.4s}' +
        '[data-wazapp-widget] button[data-wazapp-send]:hover{background:#64748b!important}' +
        '[data-wazapp-widget] button[data-wazapp-send]:active{transform:scale(.94)}' +
        '[data-wazapp-widget] button[data-wazapp-launcher]:hover{box-shadow:0 0 0 1px rgba(129,140,248,.5),0 0 0 1px rgba(255,255,255,.92) inset,0 4px 14px rgba(99,102,241,.2),0 10px 28px rgba(15,23,42,.12)!important;transform:scale(1.04)}' +
        '[data-wazapp-widget] button[data-wazapp-launcher]:active{transform:scale(.96)}' +
        '[data-wazapp-widget] button[data-wazapp-reset]:hover{background:rgba(254,242,242,.95)!important;border-color:rgba(239,68,68,.25)!important;color:#b91c1c!important}' +
        '[data-wazapp-widget] button[data-wazapp-close]:hover{background:rgba(255,255,255,.95)!important}' +
        '[data-wazapp-widget] button[data-wazapp-splash-start]:hover{transform:translateY(-1px);box-shadow:0 10px 28px rgba(99,102,241,.18)!important}' +
        '[data-wazapp-widget] button[data-wazapp-minimize]:hover{background:rgba(255,255,255,.85)!important}';
      root.insertBefore(wzStyle, root.firstChild);
      log('UI montada en body');
      say('Interfaz lista: botón de chat abajo a la derecha. Ábrelo para crear sesión en', apiBase);
      try {
        if (window.parent && window.parent !== window) {
          postToParent({ phase: 'ui-mounted' });
        }
      } catch (e) {}

      var btn = root.querySelector('[data-wazapp-launcher]');
      var panel = root.querySelector('[data-wazapp-panel]');
      var splashEl = root.querySelector('[data-wazapp-splash]');
      var chromeEl = root.querySelector('[data-wazapp-chrome]');
      var splashStart = root.querySelector('[data-wazapp-splash-start]');
      var btnClose = root.querySelector('[data-wazapp-close]');
      var btnMin = root.querySelector('[data-wazapp-minimize]');
      var btnReset = root.querySelector('[data-wazapp-reset]');
      var titleEl = root.querySelector('[data-wazapp-title]');
      var subtitleEl = root.querySelector('[data-wazapp-subtitle]');
      var msgBox = root.querySelector('[data-messages]');
      var input = root.querySelector('[data-wazapp-input]');
      var sendBtn = root.querySelector('[data-wazapp-send]');

      var open = false;
      var lastCreatedAt = '';
      var pollTimer = null;
      var typingRow = null;
      var seenMessageIds = Object.create(null);

      function applyBranding(d) {
        if (!d || typeof d !== 'object') return;
        if (d.widgetTitle && titleEl) titleEl.textContent = String(d.widgetTitle);
        if (d.widgetSubtitle && subtitleEl) subtitleEl.textContent = String(d.widgetSubtitle);
      }

      function showSplashLayout() {
        if (!splashEl || !chromeEl) return;
        splashEl.style.display = 'flex';
        splashEl.style.flexDirection = 'column';
        chromeEl.style.display = 'none';
      }

      function showChatLayout() {
        if (!splashEl || !chromeEl) return;
        splashEl.style.display = 'none';
        chromeEl.style.display = 'flex';
        chromeEl.style.flexDirection = 'column';
      }

      function welcomeDone() {
        return lsGet('welcome_done') === '1';
      }

      function setWelcomeDone() {
        lsSet('welcome_done', '1');
      }

      function setTyping(on) {
        if (!msgBox) return;
        if (on) {
          if (typingRow) return;
          typingRow = document.createElement('div');
          typingRow.setAttribute('data-wazapp-typing', '1');
          typingRow.setAttribute('aria-hidden', 'true');
          typingRow.innerHTML = '<i></i><i></i><i></i>';
          msgBox.appendChild(typingRow);
          msgBox.scrollTop = msgBox.scrollHeight;
          return;
        }
        if (typingRow && typingRow.parentNode) typingRow.parentNode.removeChild(typingRow);
        typingRow = null;
      }

      function appendGreetingBubbles(text) {
        var raw = String(text || '').trim();
        if (!raw) return;
        var blocks = raw
          .split(/\n{2,}|\r\n\r\n/)
          .map(function (s) {
            return s.trim();
          })
          .filter(Boolean);
        if (blocks.length > 1) {
          blocks.slice(0, 8).forEach(function (c) {
            appendBubble(c, 'bot');
          });
          return;
        }
        var one = blocks[0] || raw;
        var lines = one
          .split(/\n+/)
          .map(function (s) {
            return s.trim();
          })
          .filter(Boolean);
        if (lines.length > 1 && lines.length <= 8) {
          lines.forEach(function (ln) {
            appendBubble(ln, 'bot');
          });
          return;
        }
        appendBubble(one, 'bot');
      }

      function appendBubble(text, who) {
        if (!msgBox) return;
        var d = document.createElement('div');
        d.style.maxWidth = '88%';
        d.style.alignSelf = who === 'user' ? 'flex-end' : 'flex-start';
        d.style.padding = '11px 16px';
        d.style.borderRadius = '20px';
        d.style.fontSize = '14px';
        d.style.whiteSpace = 'pre-wrap';
        d.style.wordBreak = 'break-word';
        if (who === 'user') {
          d.style.background = '#0d1b3e';
          d.style.color = '#ffffff';
          d.style.boxShadow = '0 2px 12px rgba(13,27,62,.2)';
        } else {
          d.style.background = '#ffffff';
          d.style.color = '#0f172a';
          d.style.boxShadow = '0 2px 14px rgba(15,23,42,.07)';
          d.style.border = '1px solid rgba(15,23,42,.06)';
        }
        d.textContent = text;
        msgBox.appendChild(d);
        msgBox.scrollTop = msgBox.scrollHeight;
      }

      function trackLast(rows) {
        if (!rows || !rows.length) return;
        var last = rows[rows.length - 1];
        if (last.created_at) lastCreatedAt = last.created_at;
      }

      function api(path, opts) {
        var url = apiBase + path;
        log('fetch', url);
        return fetch(url, opts).then(function (r) {
          return r.json().then(function (j) {
            if (!r.ok) {
              var msg = j.error || r.statusText;
              if (j.hint) msg += ' — ' + j.hint;
              if (typeof console !== 'undefined' && console.error) {
                console.error('[Wazapp] API', r.status, path, '—', j.error || r.statusText, j.hint || '');
              }
              postToParent({
                phase: 'api-error',
                httpStatus: r.status,
                path: path,
                error: j.error || r.statusText,
              });
              throw new Error(msg);
            }
            return j;
          }, function (jsonErr) {
            if (typeof console !== 'undefined' && console.error) {
              console.error(
                '[Wazapp] Respuesta no es JSON en',
                path,
                '(¿HTML de error, proxy o CSP?). Status:',
                r.status,
              );
            }
            postToParent({ phase: 'api-not-json', path: path, httpStatus: r.status });
            throw jsonErr;
          });
        }, function (netErr) {
          if (typeof console !== 'undefined' && console.error) {
            console.error('[Wazapp] Red bloqueada o sin conexión al llamar', path, netErr);
          }
          postToParent({ phase: 'fetch-failed', path: path });
          throw netErr;
        });
      }

      function initSessionAndLoad() {
        api('/api/public/widget/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siteKey: siteKey, visitorId: visitorId }),
        })
          .then(function (data) {
            chatId = data.chatId;
            lsSet('cid', chatId);
            log('Sesión chatId=', chatId);
            applyBranding(data);
            return api(
              '/api/public/widget/messages?siteKey=' +
                encodeURIComponent(siteKey) +
                '&chatId=' +
                encodeURIComponent(chatId) +
                '&visitorId=' +
                encodeURIComponent(visitorId),
            ).then(function (msgData) {
              return { session: data, messagesPayload: msgData };
            });
          })
          .then(function (combined) {
            var data = combined.messagesPayload;
            var sess = combined.session;
            msgBox.innerHTML = '';
            typingRow = null;
            seenMessageIds = Object.create(null);
            (data.messages || []).forEach(function (m) {
              if (m.id) seenMessageIds[m.id] = true;
              appendBubble(m.text || '', m.sender === 'user' ? 'user' : 'bot');
            });
            trackLast(data.messages || []);
            var n = (data.messages || []).length;
            var g = sess && sess.greeting ? String(sess.greeting).trim() : '';
            if (n === 0 && g) {
              appendGreetingBubbles(g);
            }
            startPoll();
            say('Chat conectado (sesión OK).');
            postToParent({ phase: 'session-ok' });
            try {
              if (input && typeof input.focus === 'function') {
                setTimeout(function () {
                  input.focus();
                }, 100);
              }
            } catch (eFocus) {}
          })
          .catch(function (e) {
            log('Error sesión/mensajes', e);
            if (typeof console !== 'undefined' && console.error) {
              console.error('[Wazapp] Fallo al abrir sesión o cargar mensajes:', e.message || e);
            }
            postToParent({ phase: 'session-failed', message: String(e.message || e) });
            showChatLayout();
            appendBubble('No se pudo conectar: ' + (e.message || 'error'), 'bot');
          });
      }

      function startPoll() {
        if (pollTimer) clearInterval(pollTimer);
        pollTimer = setInterval(function () {
          if (!open || !chatId) return;
          var q =
            '/api/public/widget/messages?siteKey=' +
            encodeURIComponent(siteKey) +
            '&chatId=' +
            encodeURIComponent(chatId) +
            '&visitorId=' +
            encodeURIComponent(visitorId);
          if (lastCreatedAt) q += '&after=' + encodeURIComponent(lastCreatedAt);
          api(q)
            .then(function (data) {
              var rows = data.messages || [];
              rows.forEach(function (m) {
                if (m.id) {
                  if (seenMessageIds[m.id]) return;
                  seenMessageIds[m.id] = true;
                }
                appendBubble(m.text || '', m.sender === 'user' ? 'user' : 'bot');
              });
              trackLast(rows);
            })
            .catch(function () {});
        }, 6000);
      }

      function send() {
        var text = (input.value || '').trim();
        if (!text || !chatId) return;
        input.value = '';
        appendBubble(text, 'user');
        setTyping(true);
        var pageUrl = '';
        try {
          pageUrl = window.location.href.slice(0, 2000);
        } catch (e) {}
        api('/api/public/widget/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siteKey: siteKey,
            chatId: chatId,
            visitorId: visitorId,
            text: text,
            pageUrl: pageUrl,
          }),
        })
          .then(function (data) {
            setTyping(false);
            if (data.cursor) lastCreatedAt = data.cursor;
            if (data.reply) appendBubble(data.reply, 'bot');
            else if (data.botPaused) appendBubble('Un agente te responderá pronto.', 'bot');
          })
          .catch(function (e) {
            setTyping(false);
            if (typeof console !== 'undefined' && console.error) {
              console.error('[Wazapp] Error al enviar mensaje:', e.message || e);
            }
            postToParent({ phase: 'send-failed', message: String(e.message || '') });
            appendBubble('Error al enviar: ' + (e.message || ''), 'bot');
          });
      }

      function closePanel() {
        open = false;
        if (panel) panel.style.display = 'none';
        if (pollTimer) {
          clearInterval(pollTimer);
          pollTimer = null;
        }
        setTyping(false);
      }

      function startFreshConversation() {
        if (
          !confirm(
            '¿Empezar de cero? Se abre una conversación nueva en este dispositivo; la anterior seguirá en el panel de tu equipo.',
          )
        ) {
          return;
        }
        if (pollTimer) {
          clearInterval(pollTimer);
          pollTimer = null;
        }
        setTyping(false);
        visitorId = randomUuid();
        lsSet('vid', visitorId);
        lsRemove('cid');
        chatId = null;
        seenMessageIds = Object.create(null);
        lastCreatedAt = '';
        if (msgBox) msgBox.innerHTML = '';
        typingRow = null;
        if (input) input.value = '';
        showChatLayout();
        initSessionAndLoad();
        try {
          postToParent({ phase: 'conversation-reset' });
        } catch (e) {}
      }

      function openPanel() {
        open = true;
        if (panel) {
          panel.style.display = 'flex';
          panel.style.flexDirection = 'column';
        }
        if (!welcomeDone()) {
          showSplashLayout();
          return;
        }
        showChatLayout();
        initSessionAndLoad();
      }

      if (!btn || !panel) {
        console.error('[Wazapp] No se pudo enlazar el botón o el panel del widget.');
        return;
      }

      btn.addEventListener('click', function () {
        if (open) {
          closePanel();
          return;
        }
        openPanel();
      });

      if (splashStart) {
        splashStart.addEventListener('click', function () {
          setWelcomeDone();
          showChatLayout();
          initSessionAndLoad();
        });
      }

      if (btnClose) {
        btnClose.addEventListener('click', function () {
          closePanel();
        });
      }
      if (btnMin) {
        btnMin.addEventListener('click', function () {
          closePanel();
        });
      }
      if (btnReset) {
        btnReset.addEventListener('click', function () {
          startFreshConversation();
        });
      }

      if (sendBtn) {
        sendBtn.addEventListener('click', send);
      }
      if (input) {
        input.addEventListener('keydown', function (ev) {
          if (ev.key === 'Enter' && !ev.shiftKey) {
            ev.preventDefault();
            send();
          }
        });
      }
    } catch (err) {
      console.error('[Wazapp] Error montando el widget:', err);
    }
  }

  if (document.body) {
    mountWidget();
  } else {
    document.addEventListener('DOMContentLoaded', mountWidget);
  }
})();
