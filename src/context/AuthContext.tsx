import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createClient } from '../lib/supabase';
import { readPersistedAuthUser } from '../lib/supabase-session-hydrate';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<unknown>;
  signUp: (email: string, password: string, name?: string) => Promise<unknown>;
  signOut: () => Promise<{ error: unknown }>;
  resetPassword: (email: string) => Promise<{ error: unknown }>;
  sendOTPEmail: (email: string) => Promise<unknown>;
  sendOTPPhone: (phone: string) => Promise<unknown>;
  verifyOTP: (emailOrPhone: string, token: string, type: 'email' | 'phone') => Promise<unknown>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const supabase = useMemo(() => createClient(), []);

  useLayoutEffect(() => {
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
  }, [supabase]);

  const sendOTPEmail = useCallback(
    async (email: string) => {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error?.message ?? null,
      }));
      return { data, error };
    },
    [supabase]
  );

  const sendOTPPhone = useCallback(
    async (phone: string) => {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: { channel: 'sms' },
      });
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error?.message ?? null,
      }));
      return { data, error };
    },
    [supabase]
  );

  const verifyOTP = useCallback(
    async (emailOrPhone: string, token: string, type: 'email' | 'phone') => {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const formattedInput =
        type === 'phone' && !emailOrPhone.startsWith('+') ? `+${emailOrPhone}` : emailOrPhone;
      const { data, error } = await supabase.auth.verifyOtp({
        [type]: formattedInput,
        token,
        type: type === 'email' ? 'email' : 'sms',
      });
      if (error) {
        setAuthState({
          user: null,
          loading: false,
          error: error.message,
        });
      } else {
        setAuthState({
          user: data.user,
          loading: false,
          error: null,
        });
      }
      return { data, error };
    },
    [supabase]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthState({
          user: null,
          loading: false,
          error: error.message,
        });
      } else {
        setAuthState({
          user: data.user,
          loading: false,
          error: null,
        });
      }
      return { data, error };
    },
    [supabase]
  );

  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name || email.split('@')[0] },
        },
      });
      setAuthState({
        user: data.user,
        loading: false,
        error: error?.message ?? null,
      });
      return { data, error };
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    try {
      const { error } = await supabase.auth.signOut();
      setAuthState({
        user: null,
        loading: false,
        error: error?.message ?? null,
      });
      if (typeof window !== 'undefined') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('supabase') || key.includes('auth'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => {
          try {
            localStorage.removeItem(key);
          } catch {
            /* ignore */
          }
        });
        try {
          sessionStorage.clear();
        } catch {
          /* ignore */
        }
      }
      return { error };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al cerrar sesión';
      setAuthState({
        user: null,
        loading: false,
        error: message,
      });
      return { error };
    }
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

  const value = useMemo<AuthContextValue>(
    () => ({
      ...authState,
      signIn,
      signUp,
      signOut,
      resetPassword,
      sendOTPEmail,
      sendOTPPhone,
      verifyOTP,
      isAuthenticated: !!authState.user,
    }),
    [
      authState,
      signIn,
      signUp,
      signOut,
      resetPassword,
      sendOTPEmail,
      sendOTPPhone,
      verifyOTP,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}
