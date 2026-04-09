/** Normaliza la clave pública del widget (trim, quita zero-width, minúsculas). */
export function normalizeWidgetSiteKey(raw: string): string {
  return raw
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .toLowerCase();
}
