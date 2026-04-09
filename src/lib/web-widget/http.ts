import { isOriginAllowed } from './origins';

export function widgetCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin');
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

export function jsonResponse(
  request: Request,
  body: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...widgetCorsHeaders(request),
      'Content-Type': 'application/json',
    },
  });
}

export type WidgetOrgRow = {
  id: string;
  name: string;
  openai_api_key: string | null;
  web_widget_allowed_origins: string[] | null;
};

export function assertWidgetOriginAllowed(org: WidgetOrgRow, request: Request): boolean {
  return isOriginAllowed(org.web_widget_allowed_origins, request.headers.get('Origin'));
}

const VISITOR_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidVisitorId(id: unknown): id is string {
  return typeof id === 'string' && VISITOR_ID_RE.test(id);
}
