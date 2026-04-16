/**
 * Evita pantallas de "Verificando suscripción" en cada navegación full-page (Astro).
 * Solo cachea acceso positivo; si la API dice inactivo, se borra la caché.
 */
const KEY = 'wazapp_sub_active_v1';
const TTL_MS = 20 * 60 * 1000;

type Entry = { uid: string; ts: number };

export function readSubscriptionAccessCache(userId: string): boolean {
  if (typeof window === 'undefined' || !userId) return false;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return false;
    const v = JSON.parse(raw) as Entry;
    if (v.uid !== userId) return false;
    if (Date.now() - v.ts > TTL_MS) {
      sessionStorage.removeItem(KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function writeSubscriptionAccessCache(userId: string, active: boolean): void {
  if (typeof window === 'undefined' || !userId) return;
  try {
    if (active) {
      sessionStorage.setItem(KEY, JSON.stringify({ uid: userId, ts: Date.now() } satisfies Entry));
    } else {
      sessionStorage.removeItem(KEY);
    }
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearSubscriptionAccessCache(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
