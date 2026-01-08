import { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      setAuthState({
        user: session?.user ?? null,
        loading: false,
        error: error?.message ?? null,
      });
    });

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setAuthState({
        user: session?.user ?? null,
        loading: false,
        error: null,
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    setAuthState({
      user: data.user,
      loading: false,
      error: error?.message ?? null,
    });

    return { data, error };
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
      },
    });

    setAuthState({
      user: data.user,
      loading: false,
      error: error?.message ?? null,
    });

    return { data, error };
  };

  const signOut = async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    const { error } = await supabase.auth.signOut();
    
    setAuthState({
      user: null,
      loading: false,
      error: error?.message ?? null,
    });

    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated: !!authState.user,
  };
}

