import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Mail, Loader2, CheckCircle } from 'lucide-react';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const { error } = await resetPassword(email);
    
    if (error) {
      setError(error);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Recuperar contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            O{' '}
            <a
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              vuelve al login
            </a>
          </p>
        </div>
        
        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <div className="flex items-center space-x-2">
              <CheckCircle size={20} />
              <div>
                <p className="font-semibold">Email enviado</p>
                <p className="text-sm mt-1">
                  Hemos enviado un enlace de recuperación a <strong>{email}</strong>. 
                  Revisa tu bandeja de entrada.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Ingresa tu email"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Te enviaremos un enlace para restablecer tu contraseña
              </p>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Enviar enlace de recuperación
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

