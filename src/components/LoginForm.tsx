import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, Loader2, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import LogoBrand from './landing/LogoBrand';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, loading: authLoading, isAuthenticated } = useAuth();

  if (isAuthenticated && typeof window !== 'undefined') {
    window.location.href = '/chats';
    return null;
  }

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Ingresa tu correo electrónico');
      return;
    }
    if (!validateEmail(email)) {
      setError('Correo electrónico no válido');
      return;
    }
    if (!password) {
      setError('Ingresa tu contraseña');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signInError } = await signIn(email.trim(), password);

      if (signInError) {
        const msg = signInError.message || 'Error al iniciar sesión';
        if (msg.toLowerCase().includes('invalid login')) {
          setError('Correo o contraseña incorrectos');
        } else {
          setError(msg);
        }
        return;
      }
      if (data?.user) {
        window.location.href = '/chats';
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 font-professional relative bg-app-canvas">
      <div className="absolute inset-0 bg-app-canvas pointer-events-none" />

      <div className="relative max-w-md w-full">
        <div className="rounded-[22px] border border-app-line bg-white shadow-app-card p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <LogoBrand size="lg" href="/" />
            </div>
            <h1 className="text-2xl font-bold text-app-ink tracking-tight font-display">
              Bienvenido de vuelta
            </h1>
            <p className="mt-2 text-sm text-app-muted">
              Ingresa tus credenciales para acceder
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Error Alert */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-700 px-4 py-3 rounded-2xl flex items-start gap-3 animate-fade-in">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-app-ink">
                Correo electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-app-muted group-focus-within:text-brand-600 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  className="block w-full pl-12 pr-4 py-3.5 bg-app-field border border-app-line rounded-2xl text-app-ink placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all duration-200"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-app-ink">
                  Contraseña
                </label>
                <a
                  href="/forgot-password"
                  className="text-sm text-brand-600 hover:text-brand-500 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-app-muted group-focus-within:text-brand-600 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  className="block w-full pl-12 pr-12 py-3.5 bg-app-field border border-app-line rounded-2xl text-app-ink placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-app-muted hover:text-app-ink transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || authLoading || !email.trim() || !password}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-app-charcoal hover:bg-app-charcoal/90 text-white rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-black/15 mt-6"
            >
              {loading || authLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-app-line"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-app-muted">¿Nuevo en Wazapp?</span>
            </div>
          </div>

          {/* Register Link */}
          <a
            href="/register"
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-app-field/50 hover:bg-app-field text-app-ink rounded-2xl text-sm font-semibold border border-app-line transition-all duration-200"
          >
            Crear cuenta gratis
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* Footer Text */}
        <p className="mt-8 text-center text-xs text-app-muted">
          Al continuar, aceptas nuestros{' '}
          <a href="/terminos" className="text-app-ink hover:text-brand-600 transition-colors">Términos</a>
          {' '}y{' '}
          <a href="/privacidad" className="text-app-ink hover:text-brand-600 transition-colors">Privacidad</a>
        </p>
      </div>
    </div>
  );
}