import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { createClient } from '../lib/supabase';
import { Mail, Lock, Loader2, AlertCircle, ArrowRight, User, CheckCircle2, Eye, EyeOff, Check, X, ShoppingCart } from 'lucide-react';
import LogoBrand from './landing/LogoBrand';

// Password strength checker
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Débil', color: 'bg-red-500' };
  if (score <= 2) return { score, label: 'Regular', color: 'bg-amber-500' };
  if (score <= 3) return { score, label: 'Buena', color: 'bg-emerald-500' };
  return { score, label: 'Fuerte', color: 'bg-emerald-400' };
}

function getSessionIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('session_id');
}

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [authorizedMode, setAuthorizedMode] = useState(false);
  const { signUp, loading: authLoading, isAuthenticated } = useAuth();

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const autorizado = params.get('autorizado') === '1' || params.get('invite') === '1';
    setAuthorizedMode(autorizado);

    const sid = getSessionIdFromUrl();
    setSessionId(sid);
    if (autorizado) {
      setSessionValid(true);
      return;
    }
    if (!sid) {
      setSessionValid(false);
      return;
    }
    fetch(`/api/verify-session?session_id=${encodeURIComponent(sid)}`)
      .then((r) => r.json())
      .then((data) => {
        setSessionValid(data.valid === true);
        if (data.email) setEmail(data.email);
      })
      .catch(() => setSessionValid(false));
  }, []);

  if (isAuthenticated && !success && typeof window !== 'undefined') {
    window.location.href = '/chats';
    return null;
  }

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Ingresa tu nombre');
      return;
    }
    if (!email.trim()) {
      setError('Ingresa tu correo electrónico');
      return;
    }
    if (!validateEmail(email)) {
      setError('Correo electrónico no válido');
      return;
    }
    if (!password) {
      setError('Crea una contraseña');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const isAuthorizedSignup = authorizedMode && !sessionId;
    if (isAuthorizedSignup) {
      const checkRes = await fetch(`/api/check-authorized-email?email=${encodeURIComponent(email.trim())}`);
      const checkData = await checkRes.json().catch(() => ({ authorized: false }));
      if (!checkData.authorized) {
        setError('Este correo no está en la lista de autorizados. Usa el enlace de precios para registrarte con un plan.');
        return;
      }
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await signUp(email.trim(), password, name.trim());

      if (signUpError) {
        const msg = signUpError.message || 'Error al crear la cuenta';
        if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
          setError('Ya existe una cuenta con este correo');
        } else {
          setError(msg);
        }
        return;
      }

      if (!data?.user) {
        setError('No se pudo crear la cuenta. Intenta de nuevo.');
        return;
      }

      const supabase = createClient();
      const orgName = name.trim() || data.user.email?.split('@')[0] || 'Mi Tienda';
      const { error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName,
          owner_id: data.user.id,
        });

      if (orgError) {
        console.error('Error creando organización:', orgError);
      }

      if (sessionId && !isAuthorizedSignup) {
        const { data: { session } } = await createClient().auth.getSession();
        if (session?.access_token) {
          await fetch('/api/link-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ session_id: sessionId }),
          });
        }
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/chats';
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  // Debes elegir un plan primero (sin session_id o sesión inválida)
  if (sessionValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1220] via-[#0a0f1a] to-[#0d1220] pointer-events-none" />
        <div className="relative max-w-md w-full">
          <div className="rounded-2xl border border-white/[0.06] bg-[#111827]/80 backdrop-blur-xl shadow-2xl shadow-black/30 p-8 sm:p-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
              <ShoppingCart className="h-10 w-10 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Elige un plan para registrarte</h2>
            <p className="text-slate-400 mb-6">
              Para crear tu cuenta primero debes elegir el plan Starter y completar el pago. Incluye 14 días de prueba gratis y puedes cancelar cuando quieras.
            </p>
            <a
              href="/precios"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-sm font-semibold transition-all"
            >
              Ver planes y precios
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Cargando: verificando sesión de pago o modo autorizado
  if (sessionValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
          <p className="text-slate-400">{sessionId ? 'Verificando tu pago...' : 'Comprobando...'}</p>
        </div>
      </div>
    );
  }

  // Success State
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1220] via-[#0a0f1a] to-[#0d1220] pointer-events-none" />
        <div className="relative max-w-md w-full">
          <div className="rounded-2xl border border-white/[0.06] bg-[#111827]/80 backdrop-blur-xl shadow-2xl shadow-black/30 p-8 sm:p-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">¡Cuenta creada!</h2>
            <p className="text-slate-400">Redirigiendo al panel...</p>
            <div className="mt-6">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d1220] via-[#0a0f1a] to-[#0d1220] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative max-w-md w-full">
        {/* Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#111827]/80 backdrop-blur-xl shadow-2xl shadow-black/30 p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <LogoBrand size="lg" href="/" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Crea tu cuenta
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {authorizedMode ? 'Acceso autorizado (gerente/admin). Usa tu correo autorizado.' : 'Empieza a vender por WhatsApp en minutos'}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Error Alert */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-start gap-3 animate-fade-in">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                Nombre
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(null); }}
                  className="block w-full pl-12 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all duration-200"
                  placeholder="Tu nombre"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Correo electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  className="block w-full pl-12 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all duration-200"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  className="block w-full pl-12 pr-12 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all duration-200"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= passwordStrength.score ? passwordStrength.color : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${
                    passwordStrength.score <= 1 ? 'text-red-400' : 
                    passwordStrength.score <= 2 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    Contraseña {passwordStrength.label.toLowerCase()}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300">
                Confirmar contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                  className="block w-full pl-12 pr-12 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all duration-200"
                  placeholder="Repite tu contraseña"
                />
                {/* Match indicator */}
                {confirmPassword && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    {passwordsMatch ? (
                      <Check className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <X className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || authLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-[#0a0f1a] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/25 mt-6"
            >
              {loading || authLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear cuenta
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#111827]/80 text-slate-500">¿Ya tienes cuenta?</span>
            </div>
          </div>

          {/* Login Link */}
          <a
            href="/login"
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-white/[0.04] hover:bg-white/[0.06] text-white rounded-xl text-sm font-semibold border border-white/[0.06] hover:border-white/[0.1] transition-all duration-200"
          >
            Iniciar sesión
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* Footer Text */}
        <p className="mt-8 text-center text-xs text-slate-500">
          Al crear tu cuenta, aceptas nuestros{' '}
          <a href="/terminos" className="text-slate-400 hover:text-white transition-colors">Términos</a>
          {' '}y{' '}
          <a href="/privacidad" className="text-slate-400 hover:text-white transition-colors">Privacidad</a>
        </p>
      </div>
    </div>
  );
}