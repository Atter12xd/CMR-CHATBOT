/**
 * Valida el header Origin del navegador frente a una lista de hostnames
 * guardados sin esquema (ej. "tienda.com", "www.tienda.com").
 * Lista null o vacía = permitir cualquier origen (útil en desarrollo; en producción conviene restringir).
 */
export function parseOriginHostname(originHeader: string | null): string | null {
  if (!originHeader?.trim()) return null;
  try {
    return new URL(originHeader).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function normalizeAllowedEntry(entry: string): string {
  return entry
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .split(':')[0];
}

export function isOriginAllowed(
  allowedHostnames: string[] | null | undefined,
  originHeader: string | null,
): boolean {
  const list = (allowedHostnames ?? []).map(normalizeAllowedEntry).filter(Boolean);
  if (list.length === 0) return true;

  const host = parseOriginHostname(originHeader);
  if (!host) return false;

  return list.some((allowed) => {
    if (host === allowed) return true;
    if (host.endsWith(`.${allowed}`)) return true;
    return false;
  });
}
