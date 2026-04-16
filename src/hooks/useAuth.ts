import { useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import { AuthContext, AuthProvider, type AuthContextValue } from '../context/AuthContext';
import { createClient } from '../lib/supabase';
import { readPersistedAuthUser } from '../lib/supabase-session-hydrate';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

function initialAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return { user: null, loading: true, error: null };
  }
  const user = readPersistedAuthUser();
  if (user) {
    return { user, loading: false, error: null };
  }
  return { user: null, loading: true, error: null };
}

function useStandaloneAuth(enabled: boolean): AuthContextValue {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const supabase = useMemo(() => createClient(), []);

  useLayoutEffect(() => {
    if (!enabled) return;
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      setAuthState({
        user: session?.user ?? null,
        loading: false,
        error: error?.message ?? null,
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setAuthState({
          user: null,
          loading: false,
          error: null,
        });
        return;
      }

      if (session?.user) {
        setAuthState({
          user: session.user,
          loading: false,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [enabled, supabase]);

  const sendOTPEmail = useCallback(
    async (email: string) => {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      return { data, error };
    },
    [supabase]
  );

  const sendOTPPhone = useCallback(
    async (phone: string) => {
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: { channel: 'sms' },
      });
      return { data, error };
    },
    [supabase]
  );

  const verifyOTP = useCallback(
    async (emailOrPhone: string, token: string, type: 'email' | 'phone') => {
      const formattedInput =
        type === 'phone' && !emailOrPhone.startsWith('+') ? `+${emailOrPhone}` : emailOrPhone;
      const { data, error } = await supabase.auth.verifyOtp({
        [type]: formattedInput,
        token,
        type: type === 'email' ? 'email' : 'sms',
      });
      return { data, error };
    },
    [supabase]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return { data, error };
    },
    [supabase]
  );

  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name || email.split('@')[0] } },
      });
      return { data, error };
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.clear();
      } catch {
        /* ignore */
      }
    }
    return { error };
  }, [supabase]);

  const resetPassword = useCallback(
    async (email: string) => {
      const base =
        (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_SITE_URL?.trim()) || window.location.origin;
      const origin = String(base).replace(/\/+$/, '');
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset-password`,
      });
      return { error };
    },
    [supabase]
  );

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    sendOTPEmail,
    sendOTPPhone,
    verifyOTP,
    isAuthenticated: !!authState.user,
  };
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  const standalone = useStandaloneAuth(!ctx);
  return ctx ?? standalone;
}

export { AuthProvider, type AuthContextValue };
