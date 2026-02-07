import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { MessageSquare, Zap, BarChart3, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      window.location.href = '/chats';
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* Navbar - estilo respond.io */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            <a href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900 tracking-tight">wazapp.ai</span>
            </a>

            <div className="hidden md:flex items-center gap-8">
              <a href="#producto" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Producto
              </a>
              <a href="#caracteristicas" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Características
              </a>
              <a href="#por-que" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Por qué nosotros
              </a>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-2 transition-colors"
              >
                Iniciar sesión
              </a>
              <a
                href="/register"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/25"
              >
                Empezar gratis
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-20 md:pt-36 md:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1]">
            Tus clientes escriben por{' '}
            <span className="text-emerald-600">WhatsApp</span>. ¿Puedes seguir el ritmo?
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            La mayoría de plataformas no pueden. Wazapp unifica conversaciones, pedidos y productos 
            en un solo lugar para que tus ventas nunca se detengan.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/register"
              className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-4 bg-emerald-500 text-white text-base font-semibold rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30"
            >
              Empezar gratis
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/login"
              className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-4 bg-gray-100 text-gray-900 text-base font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Ya tengo cuenta
            </a>
          </div>
        </div>

        {/* Hero visual - mockup / imagen */}
        <div className="mt-16 md:mt-24 max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-2xl shadow-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100 aspect-video flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=1200&q=80"
              alt="WhatsApp Business - Conversaciones"
              className="absolute inset-0 w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* Trust badges / logotipos (placeholder) */}
      <section className="py-12 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm font-medium text-gray-500 mb-8">
            Plataforma de mensajería para negocios que crecen
          </p>
        </div>
      </section>

      {/* Features - Capture, Convert, Retain style */}
      <section id="caracteristicas" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16">
            Escala tu negocio con cada conversación
          </h2>
          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            <div className="group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-colors">
                <MessageSquare className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Centraliza conversaciones</h3>
              <p className="text-gray-600 leading-relaxed">
                Recibe mensajes de WhatsApp en un único panel. No más teléfonos dispersos ni oportunidades perdidas.
              </p>
            </div>
            <div className="group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-colors">
                <Zap className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Convierte más ventas</h3>
              <p className="text-gray-600 leading-relaxed">
                Gestiona pedidos, catálogo y pagos desde el mismo lugar. Respuestas rápidas que cierran tratos.
              </p>
            </div>
            <div className="group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-colors">
                <BarChart3 className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Analiza y mejora</h3>
              <p className="text-gray-600 leading-relaxed">
                Dashboard con métricas clave. Entiende qué funciona y optimiza tu estrategia de ventas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            ¿Listo para vender más por WhatsApp?
          </h2>
          <p className="text-lg text-gray-600 mb-10">
            Únete a negocios que ya centralizan sus conversaciones y aumentan sus ventas.
          </p>
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white text-base font-semibold rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25"
          >
            Crear cuenta gratis
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-500" />
            <span className="font-semibold text-gray-900">wazapp.ai</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="/login" className="hover:text-gray-900">Iniciar sesión</a>
            <a href="/register" className="hover:text-gray-900">Registrarse</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
