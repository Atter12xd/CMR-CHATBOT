import type { MiddlewareHandler } from 'astro';

/**
 * Añade CORS a todas las respuestas para evitar bloqueos cuando
 * www.wazapp.ai redirige a wazapp.ai y los scripts se cargan cross-origin.
 */
export const onRequest: MiddlewareHandler = async ({ next }) => {
  const response = await next();
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  headers.set('Access-Control-Allow-Headers', '*');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
