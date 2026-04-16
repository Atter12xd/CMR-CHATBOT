import type { User } from '@supabase/supabase-js';

function candidateStorageKeys(): string[] {
  const keys: string[] = [];
  const url = typeof import.meta !== 'undefined' ? import.meta.env.PUBLIC_SUPABASE_URL : '';
  if (typeof url === 'string' && url.trim()) {
    try {
      const host = new URL(url.trim()).hostname.split('.')[0];
      if (host) keys.push(`sb-${host}-auth-token`);
    } catch {
      /* ignore */
    }
  }
  if (typeof window !== 'undefined') {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('sb-') && k.endsWith('-auth-token') && !keys.includes(k)) {
          keys.push(k);
        }
      }
    } catch {
      /* ignore */
    }
  }
  return keys;
}

/** Lee la sesión persistida por Supabase (localStorage) sin esperar a getSession — mismo tick que el primer render. */
export function readPersistedAuthUser(): User | null {
  if (typeof window === 'undefined') return null;
  for (const storageKey of candidateStorageKeys()) {
    const raw = localStorage.getItem(storageKey);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      let user: User | undefined;
      let expiresAt: number | undefined;
      if (parsed.user && typeof parsed.expires_at === 'number') {
        user = parsed.user as User;
        expiresAt = parsed.expires_at as number;
      }
      const cur = parsed.currentSession as Record<string, unknown> | undefined;
      if (!user && cur?.user && typeof cur.expires_at === 'number') {
        user = cur.user as User;
        expiresAt = cur.expires_at as number;
      }
      if (!user || expiresAt == null) continue;
      if (expiresAt * 1000 < Date.now() + 30_000) continue;
      return user;
    } catch {
      continue;
    }
  }
  return null;
}
