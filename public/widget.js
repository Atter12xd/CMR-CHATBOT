/* Wazapp widget — recomendado (CMS no trunca la URL):
 *   <script src="https://wazapp.ai/widget.js?siteKey=TU_CLAVE_64_HEX" defer></script>
 * Muchos editores truncan data-site-key a ~16 caracteres; por eso la clave va en ?siteKey=.
 * Opcional: data-debug="true" en el <script>.
 */
(function () {
  var Z = 2147483000;

  function resolveScriptEl() {
    var cur = document.currentScript;
    if (cur && cur.src && cur.src.indexOf('widget.js') !== -1) {
      return cur;
    }
    var nodes = document.querySelectorAll('script[src*="widget.js"]');
    if (nodes.length) {
      return nodes[nodes.length - 1];
    }
    return null;
  }

  var SCRIPT = resolveScriptEl();
  if (!SCRIPT || SCRIPT.nodeType !== 1) {
    console.warn('[Wazapp] No se encontró el <script src="...widget.js">.');
    return;
  }

  var debug =
    SCRIPT.getAttribute('data-debug') === 'true' ||
    (typeof window !== 'undefined' && window.__WAZAPP_DEBUG__ === true);

  function log() {
    if (!debug || !console || !console.info) return;
    console.info.apply(console, ['[Wazapp]'].concat([].slice.call(arguments)));
  }

  log('Script detectado', SCRIPT.src);

  function normKey(s) {
    return String(s || '')
      .trim()
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .toLowerCase();
  }

  var fromAttr = normKey(SCRIPT.getAttribute('data-site-key') || '');
  var fromUrl = '';
  try {
    var uParse = new URL(SCRIPT.src, window.location.href);
    fromUrl = normKey(uParse.searchParams.get('siteKey') || uParse.searchParams.get('key') || '');
  } catch (e) {}

  var siteKey = '';
  var isHex64 = function (k) {
    return k.length === 64 && /^[0-9a-f]+$/.test(k);
  };
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
      root.innerHTML =
        '<button type="button" aria-label="Abrir chat" style="position:fixed;bottom:20px;right:20px;width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;background:#0ea5e9;color:#fff;font-size:22px;box-shadow:0 4px 14px rgba(14,165,233,.45);z-index:' +
        Z +
        ';">💬</button>' +
        '<div style="display:none;flex-direction:column;position:fixed;bottom:88px;right:20px;width:min(100vw - 40px,360px);height:420px;max-height:70vh;background:#0f172a;color:#e2e8f0;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.35);z-index:' +
        (Z + 1) +
        ';overflow:hidden;border:1px solid #334155;">' +
        '<div style="padding:12px 14px;background:#1e293b;font-weight:600;font-size:15px;border-bottom:1px solid #334155;">Chat</div>' +
        '<div data-messages style="flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;font-size:14px;line-height:1.45;"></div>' +
        '<div style="padding:10px;border-top:1px solid #334155;display:flex;gap:8px;">' +
        '<input type="text" placeholder="Escribe un mensaje…" style="flex:1;border-radius:10px;border:1px solid #475569;background:#1e293b;color:#f8fafc;padding:10px 12px;font-size:14px;" />' +
        '<button type="button" style="border:none;border-radius:10px;background:#0ea5e9;color:#fff;font-weight:600;padding:0 14px;cursor:pointer;">Enviar</button>' +
        '</div></div>';

      document.body.appendChild(root);
      log('UI montada en body');

      var btn = root.querySelector('button[aria-label="Abrir chat"]');
      var panel = root.children[1];
      var msgBox = root.querySelector('[data-messages]');
      var input = root.querySelector('input');
      var sendBtn = panel.querySelector('div:last-child button');

      var open = false;
      var lastCreatedAt = '';
      var pollTimer = null;

      function appendBubble(text, who) {
        var d = document.createElement('div');
        d.style.maxWidth = '92%';
        d.style.alignSelf = who === 'user' ? 'flex-end' : 'flex-start';
        d.style.padding = '8px 12px';
        d.style.borderRadius = '12px';
        d.style.fontSize = '14px';
        d.style.whiteSpace = 'pre-wrap';
        d.style.wordBreak = 'break-word';
        if (who === 'user') {
          d.style.background = '#0ea5e9';
          d.style.color = '#fff';
        } else {
          d.style.background = '#334155';
          d.style.color = '#f1f5f9';
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
              throw new Error(msg);
            }
            return j;
          });
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
            return api(
              '/api/public/widget/messages?siteKey=' +
                encodeURIComponent(siteKey) +
                '&chatId=' +
                encodeURIComponent(chatId) +
                '&visitorId=' +
                encodeURIComponent(visitorId),
            );
          })
          .then(function (data) {
            msgBox.innerHTML = '';
            (data.messages || []).forEach(function (m) {
              appendBubble(m.text || '', m.sender === 'user' ? 'user' : 'bot');
            });
            trackLast(data.messages || []);
            startPoll();
          })
          .catch(function (e) {
            log('Error sesión/mensajes', e);
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
            if (data.cursor) lastCreatedAt = data.cursor;
            if (data.reply) appendBubble(data.reply, 'bot');
            else if (data.botPaused) appendBubble('Un agente te responderá pronto.', 'bot');
          })
          .catch(function (e) {
            appendBubble('Error al enviar: ' + (e.message || ''), 'bot');
          });
      }

      btn.addEventListener('click', function () {
        open = !open;
        panel.style.display = open ? 'flex' : 'none';
        if (open) initSessionAndLoad();
        else if (pollTimer) {
          clearInterval(pollTimer);
          pollTimer = null;
        }
      });

      sendBtn.addEventListener('click', send);
      input.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' && !ev.shiftKey) {
          ev.preventDefault();
          send();
        }
      });
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
