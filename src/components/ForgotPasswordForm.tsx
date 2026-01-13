import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordForm() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError(error.message);
      } else {
        setSent(true);
      }
    } catch (err: any) {
      setError(err.message || 'Error al enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
        <div className="max-w-md w-full bg-white rounded-lg border border-[#E2E8F0] p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Correo enviado</h1>
          <p className="text-[#64748B] mb-6">
            Hemos enviado un enlace de recuperación a <strong>{email}</strong>
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark"
          >
            <ArrowLeft size={16} />
            Volver al login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="max-w-md w-full bg-white rounded-lg border border-[#E2E8F0] p-8">
        <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Recuperar contraseña</h1>
        <p className="text-[#64748B] mb-6">
          Ingresa tu email y te enviaremos un enlace para recuperar tu contraseña
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>

          <a
            href="/login"
            className="block text-center text-primary hover:text-primary-dark text-sm"
          >
            Volver al login
          </a>
        </form>
      </div>
    </div>
  );
}
