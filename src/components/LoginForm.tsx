import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Mail, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import OTPVerification from './OTPVerification';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const { sendOTPEmail, verifyOTP, loading: authLoading, isAuthenticated } = useAuth();

  // Si ya está autenticado, redirigir
  if (isAuthenticated && typeof window !== 'undefined') {
    window.location.href = '/';
    return null;
  }

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    setLoading(true);
    try {
      const result = await sendOTPEmail(email);

      if (result.error) {
        setError(result.error.message || 'Error al enviar código. Intenta nuevamente.');
      } else {
        setShowOTP(true);
      }
    } catch (err: any) {
      setError(err.message || 'Error al enviar código. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (token: string) => {
    setError(null);
    const result = await verifyOTP(email, token, 'email');
    
    if (result.error) {
      throw new Error(result.error.message || 'Código inválido');
    } else if (result.data?.user) {
      // Redirigir después de verificación exitosa
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
  };

  const handleResendOTP = async () => {
    setError(null);
    await sendOTPEmail(email);
  };

  const handleBack = () => {
    setShowOTP(false);
    setError(null);
  };

  // Mostrar componente de verificación OTP
  if (showOTP) {
    return (
      <OTPVerification
        emailOrPhone={email}
        type="email"
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
        onBack={handleBack}
        loading={authLoading}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-md w-full relative z-10">
        {/* Card Container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 sm:p-10 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/25 mb-4">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Iniciar sesión
            </h2>
            <p className="text-sm text-gray-500">
              Recibirás un código de 6 dígitos en tu correo para verificar tu identidad
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSendOTP}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg flex items-start space-x-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
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
                  className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || authLoading || !email.trim()}
              className="w-full flex items-center justify-center px-4 py-3.5 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transform hover:-translate-y-0.5"
            >
              {loading || authLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Enviando código...
                </>
              ) : (
                <>
                  Enviar código
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <a
                href="/register"
                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center group"
              >
                Crear cuenta
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </a>
            </p>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
      </div>
    </div>
  );
}

