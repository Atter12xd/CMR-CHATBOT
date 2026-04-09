/* Opcional: pega ANTES del iframe del widget en la web del cliente.
 * Escribe en la consola de ESA página (no dentro del iframe) los eventos del embed.
 */
(function () {
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || d.type !== 'wazapp-embed') return;
    if (typeof console !== 'undefined' && console.info) {
      console.info('[Wazapp en tu web]', d.phase || '(evento)', d);
    }
  });
})();
