// Cliente Supabase para uso en el cliente (browser)
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

let supabaseClient: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export function createClient() {
  // Si ya existe, retornarlo
  if (supabaseClient) {
    return supabaseClient;
  }

  // Verificar que estamos en el cliente (no durante SSR/prerender)
  if (typeof window === 'undefined') {
    // Durante SSR, crear un cliente básico que no falle
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';
    
    // Si no hay variables de entorno, retornar un cliente dummy que no fallará
    if (!supabaseUrl || !supabaseAnonKey) {
      // Crear un cliente con valores dummy para evitar errores durante prerender
      // Este cliente no funcionará, pero evitará que el build falle
      supabaseClient = createSupabaseClient<Database>('https://placeholder.supabase.co', 'placeholder-key', {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      });
      return supabaseClient;
    }
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  supabaseClient = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseClient;
}

