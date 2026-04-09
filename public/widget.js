/* Wazapp widget — snippet: <script src="https://tu-dominio/widget.js" data-site-key="..." async></script> */
(function () {
  var SCRIPT = document.currentScript;
  if (!SCRIPT || !SCRIPT.getAttribute) return;

  var siteKey = (SCRIPT.getAttribute('data-site-key') || '').trim();
  if (!siteKey) {
    console.warn('[Wazapp] Falta data-site-key en el script del widget.');
    return;
  }

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

  var STORAGE_V = 'wazapp_v1_';
  function lsGet(k) {
    try {
      return localStorage.getItem(STORAGE_V + k + '_' + siteKey.slice(0, 12));
    } catch (e) {
      return null;
    }
  }
  function lsSet(k, v) {
    try {
      localStorage.setItem(STORAGE_V + k + '_' + siteKey.slice(0, 12), v);
    } catch (e) {}
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

  var root = document.createElement('div');
  root.setAttribute('data-wazapp-widget', '1');
  root.innerHTML =
    '<button type="button" aria-label="Abrir chat" style="position:fixed;bottom:20px;right:20px;width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;background:#0ea5e9;color:#fff;font-size:22px;box-shadow:0 4px 14px rgba(14,165,233,.45);z-index:99998;">💬</button>' +
    '<div style="display:none;flex-direction:column;position:fixed;bottom:88px;right:20px;width:min(100vw - 40px,360px);height:420px;max-height:70vh;background:#0f172a;color:#e2e8f0;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.35);z-index:99999;overflow:hidden;border:1px solid #334155;">' +
    '<div style="padding:12px 14px;background:#1e293b;font-weight:600;font-size:15px;border-bottom:1px solid #334155;">Chat</div>' +
    '<div data-messages style="flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;font-size:14px;line-height:1.45;"></div>' +
    '<div style="padding:10px;border-top:1px solid #334155;display:flex;gap:8px;">' +
    '<input type="text" placeholder="Escribe un mensaje…" style="flex:1;border-radius:10px;border:1px solid #475569;background:#1e293b;color:#f8fafc;padding:10px 12px;font-size:14px;" />' +
    '<button type="button" style="border:none;border-radius:10px;background:#0ea5e9;color:#fff;font-weight:600;padding:0 14px;cursor:pointer;">Enviar</button>' +
    '</div></div>';

  document.body.appendChild(root);

  var btn = root.querySelector('button[aria-label="Abrir chat"]');
  var panel = root.children[1];
  var msgBox = root.querySelector('[data-messages]');
  var input = root.querySelector('input');
  var sendBtn = panel.querySelector('div:last-child button');

  var open = false;
  btn.addEventListener('click', function () {
    open = !open;
    panel.style.display = open ? 'flex' : 'none';
    if (open) initSessionAndLoad();
    else if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  });

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
    return fetch(url, opts).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.error || r.statusText);
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

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      send();
    }
  });
})();
