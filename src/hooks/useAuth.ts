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
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      // Manejar evento de SIGNED_OUT
      if (event === 'SIGNED_OUT') {
        setAuthState({
          user: null,
          loading: false,
          error: null,
        });
        return;
      }

      // Solo actualizar si hay una sesión válida
      if (session?.user) {
        setAuthState({
          user: session.user,
          loading: false,
          error: null,
        });
      } else {
        // Si no hay sesión, limpiar estado
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
  }, []);

  // Enviar OTP por email
  const sendOTPEmail = async (email: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    
    setAuthState((prev) => ({ 
      ...prev, 
      loading: false, 
      error: error?.message ?? null 
    }));

    return { data, error };
  };

  // Enviar OTP por SMS (teléfono)
  const sendOTPPhone = async (phone: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    
    // Asegurar formato internacional (agregar + si no tiene)
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
      options: {
        channel: 'sms',
      },
    });
    
    setAuthState((prev) => ({ 
      ...prev, 
      loading: false, 
      error: error?.message ?? null 
    }));

    return { data, error };
  };

  // Verificar OTP
  const verifyOTP = async (emailOrPhone: string, token: string, type: 'email' | 'phone') => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    
    const formattedInput = type === 'phone' && !emailOrPhone.startsWith('+') 
      ? `+${emailOrPhone}` 
      : emailOrPhone;

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
  };

  // Autenticación tradicional con email y contraseña (mantener para compatibilidad)
  const signIn = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
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
    
    try {
      // Cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut();
      
      // Limpiar estado inmediatamente
      setAuthState({
        user: null,
        loading: false,
        error: error?.message ?? null,
      });

      // Limpiar cualquier dato local almacenado relacionado con Supabase
      if (typeof window !== 'undefined') {
        // Limpiar localStorage relacionado con auth
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('supabase') || key.includes('auth'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            // Ignorar errores al limpiar
          }
        });

        // También limpiar sessionStorage
        try {
          sessionStorage.clear();
        } catch (e) {
          // Ignorar errores
        }
      }

      return { error };
    } catch (error: any) {
      // Asegurarse de limpiar el estado incluso si hay error
      setAuthState({
        user: null,
        loading: false,
        error: error?.message ?? 'Error al cerrar sesión',
      });
      return { error };
    }
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
    sendOTPEmail,
    sendOTPPhone,
    verifyOTP,
    isAuthenticated: !!authState.user,
  };
}
