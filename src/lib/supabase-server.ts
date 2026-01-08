// Cliente Supabase para uso en el servidor (Astro)
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'astro/cookies';
import type { Database } from './database.types';

export function createClient() {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(key: string) {
        return cookies().get(key)?.value;
      },
      set(key: string, value: string, options) {
        cookies().set(key, value, options);
      },
      remove(key: string, options) {
        cookies().delete(key, options);
      },
    },
  });
}

// Cliente con service role para operaciones administrativas (solo servidor)
export function createServiceClient() {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase service role environment variables');
  }

  // Para operaciones con service role, usar el cliente simple
  // Nota: Solo usar en Edge Functions o server-side, nunca en el cliente
  return createServerClient<Database>(supabaseUrl, serviceRoleKey, {
    cookies: {
      get() { return undefined; },
      set() {},
      remove() {},
    },
  });
}

