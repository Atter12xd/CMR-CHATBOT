import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Mail, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import LogoBrand from './landing/LogoBrand';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const validateEmail = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Ingresa tu correo electrónico');
      return;
    }
    if (!validateEmail(email.trim())) {
      setError('Correo electrónico no válido');
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await resetPassword(email.trim().toLowerCase());
      if (resetError) {
        const msg = resetError.message || '';
        if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('too many')) {
          setError('Demasiados intentos. Espera unos minutos y vuelve a intentar.');
        } else {
          setError(msg || 'No se pudo enviar el correo. Intenta de nuevo.');
        }
        return;
      }
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 font-professional relative bg-app-canvas">
      <div className="relative max-w-md w-full">
        <div className="rounded-ref border border-app-line bg-ref-card shadow-sm p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <LogoBrand size="lg" href="/" />
            </div>
            <h1 className="text-2xl font-bold text-app-ink tracking-tight font-professional">
              Recuperar contraseña
            </h1>
            <p className="mt-2 text-sm text-app-muted">
              Te enviaremos un enlace para elegir una contraseña nueva.
            </p>
          </div>

          {sent ? (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 px-4 py-3 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm space-y-2">
                  <p>
                    Si hay una cuenta con <strong>{email.trim()}</strong>, recibirás un correo con un enlace. Revisa también
                    spam.
                  </p>
                  <p className="text-app-muted">
                    El enlace caduca en poco tiempo. Ábrelo en el mismo navegador donde usas Wazapp.
                  </p>
                </div>
              </div>
              <a
                href="/login"
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-full text-sm font-semibold transition-all"
              >
                Volver a iniciar sesión
              </a>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-700 px-4 py-3 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

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

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-full text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/35 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-brand-500/25 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Enviando…
                  </>
                ) : (
                  'Enviar enlace'
                )}
              </button>
            </form>
          )}

          <a
            href="/login"
            className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-app-muted hover:text-app-ink transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </a>
        </div>
      </div>
    </div>
  );
}
