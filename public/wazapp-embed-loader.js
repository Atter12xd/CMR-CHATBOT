/**
 * Un solo <script src="https://wazapp.ai/wazapp-embed-loader.js?siteKey=TU_CLAVE_64_HEX" defer></script>
 * Inserta el iframe del chat + escucha postMessage en la consola de la página padre.
 * Útil si tu hosting borra los <iframe> del HTML pero sí deja scripts externos.
 */
(function () {
  var curScript = document.currentScript;

  function listen() {
    window.addEventListener('message', function (e) {
      var d = e.data;
      if (!d || d.type !== 'wazapp-embed') return;
      if (typeof console !== 'undefined' && console.info) {
        console.info('[Wazapp en tu web]', d.phase || '(evento)', d);
      }
    });
  }

  function normKey(s) {
    return String(s || '')
      .trim()
      .toLowerCase()
      .replace(/[\u200B-\u200D\uFEFF]/g, '');
  }

  var key = '';
  try {
    if (curScript && curScript.src) {
      key = normKey(new URL(curScript.src, location.href).searchParams.get('siteKey') || '');
    }
  } catch (e) {}
  if (!key || key.length !== 64 || !/^[0-9a-f]+$/.test(key)) {
    if (typeof console !== 'undefined' && console.error) {
      console.error(
        '[Wazapp loader] Falta siteKey válido en la URL del script: .../wazapp-embed-loader.js?siteKey=64_hex',
      );
    }
    return;
  }

  listen();

  if (document.getElementById('wazapp-embed')) {
    if (typeof console !== 'undefined' && console.info) {
      console.info('[Wazapp loader] Ya existe #wazapp-embed, no duplico.');
    }
    return;
  }

  var base = 'https://wazapp.ai';
  try {
    if (curScript && curScript.src) {
      base = new URL(curScript.src).origin;
    }
  } catch (e2) {}

  var f = document.createElement('iframe');
  f.id = 'wazapp-embed';
  f.title = 'Chat Wazapp';
  f.setAttribute(
    'src',
    base + '/widget-embed-iframe.html?siteKey=' + encodeURIComponent(key),
  );
  f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  f.setAttribute('allow', 'clipboard-write');
  f.style.cssText =
    'position:fixed;right:0;bottom:0;width:min(100vw,400px);height:min(100dvh,720px);max-height:720px;border:0;z-index:2147483647;background:transparent;visibility:visible;pointer-events:auto';

  function mount() {
    document.body.appendChild(f);
    if (typeof console !== 'undefined' && console.info) {
      console.info('[Wazapp loader] Iframe insertado por JS. Si no lo ves, revisa CSP frame-src para', base);
    }
  }

  if (document.body) {
    mount();
  } else {
    document.addEventListener('DOMContentLoaded', mount);
  }
})();
