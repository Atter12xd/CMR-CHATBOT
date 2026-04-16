/** Evita consultar `organizations` en cada navegación full-page. */
const KEY = 'wazapp_org_id_v1';
const TTL_MS = 25 * 60 * 1000;

type Entry = { uid: string; orgId: string | null; ts: number };

export function readOrganizationCache(userId: string): string | null | undefined {
  if (typeof window === 'undefined' || !userId) return undefined;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return undefined;
    const v = JSON.parse(raw) as Entry;
    if (v.uid !== userId) return undefined;
    if (Date.now() - v.ts > TTL_MS) {
      sessionStorage.removeItem(KEY);
      return undefined;
    }
    return v.orgId;
  } catch {
    return undefined;
  }
}

export function writeOrganizationCache(userId: string, orgId: string | null): void {
  if (typeof window === 'undefined' || !userId) return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ uid: userId, orgId, ts: Date.now() } satisfies Entry));
  } catch {
    /* ignore */
  }
}
