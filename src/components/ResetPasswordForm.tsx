import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase';
import { Lock, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import LogoBrand from './landing/LogoBrand';

/**
 * Destino del enlace del correo (useAuth → resetPasswordForEmail redirectTo /reset-password).
 */
export default function ResetPasswordForm() {
  const [ready, setReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const check = () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (cancelled) return;
        if (session?.user) setReady(true);
      });
    };

    check();
    const t1 = window.setTimeout(check, 400);
    const t2 = window.setTimeout(check, 1200);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
        return;
      }
      if (session?.user && event === 'SIGNED_IN') {
        setReady(true);
      }
    });

    const tOut = window.setTimeout(() => {
      if (cancelled) return;
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (cancelled) return;
        if (!session?.user) setTimedOut(true);
      });
    }, 4500);

    return () => {
      cancelled = true;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(tOut);
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message || 'No se pudo actualizar la contraseña');
        return;
      }
      setDone(true);
      window.setTimeout(() => {
        window.location.href = '/chats';
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const showForm = ready && !done;
  const showSpinner = !ready && !done && !timedOut;

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 font-professional relative bg-app-canvas">
      <div className="relative max-w-md w-full">
        <div className="rounded-ref border border-app-line bg-ref-card shadow-sm p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <LogoBrand size="lg" href="/" />
            </div>
            <h1 className="text-2xl font-bold text-app-ink tracking-tight font-professional">
              Nueva contraseña
            </h1>
            <p className="mt-2 text-sm text-app-muted">
              Elige una contraseña nueva para tu cuenta.
            </p>
          </div>

          {showSpinner && (
            <div className="flex flex-col items-center gap-4 py-6">
              <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
              <p className="text-sm text-app-muted text-center">Comprobando el enlace…</p>
            </div>
          )}

          {timedOut && !ready && !done && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-900 px-4 py-3 rounded-2xl text-sm">
                No pudimos validar el enlace (puede haber caducado o ya se usó). Solicita un correo nuevo.
              </div>
              <a
                href="/forgot-password"
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-full text-sm font-semibold transition-all"
              >
                Volver a solicitar enlace
              </a>
              <a href="/login" className="block text-center text-sm text-brand-600 hover:text-brand-500">
                Ir a iniciar sesión
              </a>
            </div>
          )}

          {showForm && (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-700 px-4 py-3 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-app-ink">
                  Nueva contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-app-muted group-focus-within:text-brand-600 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    className="block w-full pl-12 pr-12 py-3.5 bg-app-field border border-app-line rounded-2xl text-app-ink placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all duration-200"
                    placeholder="Mínimo 6 caracteres"
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

              <div className="space-y-2">
                <label htmlFor="confirm" className="block text-sm font-medium text-app-ink">
                  Confirmar contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-app-muted group-focus-within:text-brand-600 transition-colors" />
                  </div>
                  <input
                    id="confirm"
                    name="confirm"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={(e) => {
                      setConfirm(e.target.value);
                      setError(null);
                    }}
                    className="block w-full pl-12 pr-4 py-3.5 bg-app-field border border-app-line rounded-2xl text-app-ink placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all duration-200"
                    placeholder="Repite la contraseña"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !password || !confirm}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-full text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/35 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-brand-500/25 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Guardando…
                  </>
                ) : (
                  'Guardar contraseña'
                )}
              </button>
            </form>
          )}

          {done && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 px-4 py-3 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">Contraseña actualizada. Redirigiendo…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
