import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  MessageSquare,
  Zap,
  BarChart3,
  ArrowRight,
  ChevronDown,
  Globe,
  Star,
} from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      window.location.href = '/chats';
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/30" />
          <div className="h-4 w-32 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 font-sans antialiased text-white">
      {/* Announcement bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded bg-black text-white text-xs font-medium">Nuevo</span>
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-slate-300">
            WhatsApp Business API integrado. Empieza a vender por chat hoy.
          </span>
          <a href="#caracteristicas" className="text-sm text-blue-400 hover:text-blue-300 font-medium">
            Más info →
          </a>
        </div>
      </div>

      {/* Navbar - tema oscuro respond.io */}
      <nav className="fixed top-[42px] left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            <a href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white tracking-tight">wazapp.ai</span>
            </a>

            <div className="hidden md:flex items-center gap-8">
              <a href="#caracteristicas" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1">
                Producto
                <ChevronDown className="w-4 h-4" />
              </a>
              <a href="#caracteristicas" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1">
                Recursos
                <ChevronDown className="w-4 h-4" />
              </a>
              <a href="#resultados" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#resultados" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Por qué nosotros
              </a>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 text-slate-400 hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </button>
              <a
                href="/login"
                className="text-sm font-medium text-white hover:text-slate-200 px-4 py-2 transition-colors"
              >
                Iniciar sesión
              </a>
              <a
                href="/register"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 transition-colors"
              >
                Empezar gratis
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - tema oscuro */}
      <section className="pt-40 pb-20 md:pt-48 md:pb-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-950 via-slate-900/50 to-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.1]">
            Tus clientes escriben por chat. ¿Llamas para detalles? ¿Confirmas por email? ¿Puedes seguir el ritmo?
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            La mayoría de plataformas no pueden. Wazapp unifica conversaciones, pedidos y productos
            en un solo panel para que tus ventas nunca se detengan — incluso cuando los clientes cambian de canal.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/register"
              className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-4 bg-blue-600 text-white text-base font-semibold rounded-lg hover:bg-blue-500 transition-colors"
            >
              Empezar gratis
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/login"
              className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-4 bg-slate-800 text-white text-base font-semibold rounded-lg border border-slate-600 hover:bg-slate-700 transition-colors"
            >
              Ya tengo cuenta
            </a>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-sm">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="ml-2">Plataforma de mensajería para negocios que crecen</span>
          </div>
        </div>
      </section>

      {/* Trust section - marcas */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/80">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-lg font-medium text-slate-400 mb-10">
            Negocios que centralizan sus ventas con wazapp.ai
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-70">
            {['Retail', 'Restaurantes', 'Servicios', 'E-commerce', 'Salud', 'Educación'].map((name) => (
              <span
                key={name}
                className="text-sm font-semibold text-slate-500 uppercase tracking-wider"
              >
                {name}
              </span>
            ))}
          </div>
          <a
            href="#resultados"
            className="inline-block mt-8 text-sm text-blue-400 hover:text-blue-300 font-medium"
          >
            Ver casos de éxito →
          </a>
        </div>
      </section>

      {/* Scale section - Capture, Convert, Retain + mockup */}
      <section id="caracteristicas" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Escala tu negocio con cada conversación
              </h2>
              <p className="text-lg text-slate-400 mb-12 leading-relaxed">
                A medida que chats y pedidos se multiplican, los sistemas antiguos colapsan. Wazapp te ayuda a gestionar
                todo el recorrido del cliente en un solo lugar, incluso a gran volumen.
              </p>
              <div className="space-y-10">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    <span className="text-blue-400">Capture:</span> Unifica puntos de contacto
                  </h3>
                  <p className="text-slate-400">
                    Los leads llegan por WhatsApp, redes o visitas. Wazapp los unifica en un panel para que no pierdas oportunidades.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    <span className="text-blue-400">Convierte:</span> Vende más con pedidos y catálogo
                  </h3>
                  <p className="text-slate-400">
                    Gestiona pedidos, productos y métodos de pago. Respuestas rápidas que cierran ventas.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    <span className="text-blue-400">Retén:</span> Ingresos recurrentes, no solo ventas puntuales
                  </h3>
                  <p className="text-slate-400">
                    Recordatorios, seguimiento y contexto completo para fidelizar a tus clientes.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-2xl shadow-blue-500/10 bg-gradient-to-br from-slate-800 to-slate-900 p-6">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1 bg-slate-700/50 rounded-lg px-4 py-3">
                      <p className="text-sm text-slate-300">¿Tienen disponibilidad para mañana?</p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="flex-1 bg-blue-600/30 rounded-lg px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-white">¡Sí! Tenemos horarios a las 10am y 3pm. ¿Cuál prefieres?</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1 bg-slate-700/50 rounded-lg px-4 py-3">
                      <p className="text-sm text-slate-300">A las 3pm, por favor. ¿Cuánto es?</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Dashboard</p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                    <div><span className="text-lg font-bold text-white">5,477</span><p className="text-xs text-slate-500">Enviados</p></div>
                    <div><span className="text-lg font-bold text-white">3,411</span><p className="text-xs text-slate-500">Leídos</p></div>
                    <div><span className="text-lg font-bold text-white">62%</span><p className="text-xs text-slate-500">Conversión</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resultados - métricas y casos */}
      <section id="resultados" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            Resultados reales de negocios como el tuyo
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="bg-slate-900/80 rounded-2xl p-8 border border-slate-800">
              <div className="space-y-8">
                <div>
                  <p className="text-4xl font-bold text-white">60%</p>
                  <p className="text-slate-400 mt-1">ciclo de ventas más rápido</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-white">81%</p>
                  <p className="text-slate-400 mt-1">tasa de conversión con chat</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-white">3x</p>
                  <p className="text-slate-400 mt-1">más leads calificados</p>
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: 'Tienda online aumenta pedidos un 50%', desc: 'Centralizó WhatsApp + catálogo' },
                { title: 'Restaurante reduce tiempo de respuesta 70%', desc: 'Pedidos en tiempo real' },
                { title: 'Servicio médico recupera citas perdidas', desc: 'Recordatorios automáticos' },
                { title: 'Tienda física vende más por envíos', desc: 'WhatsApp como canal de ventas' },
              ].map((card) => (
                <div
                  key={card.title}
                  className="bg-slate-900/80 rounded-xl p-5 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <h3 className="font-semibold text-white text-sm mb-2">{card.title}</h3>
                  <p className="text-xs text-slate-500">{card.desc}</p>
                  <a href="/register" className="text-xs text-blue-400 hover:text-blue-300 mt-3 inline-block font-medium">
                    Saber más →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA final - footer superior */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            3x tus resultados con wazapp.ai
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white border border-white rounded-lg hover:bg-white hover:text-black transition-colors font-semibold"
            >
              Ya tengo cuenta
            </a>
            <a
              href="/register"
              className="inline-flex items-center gap-2 justify-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-semibold"
            >
              Empezar gratis
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer multi-columna */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-6 h-6 text-blue-500" />
                <span className="font-semibold text-white">wazapp.ai</span>
              </div>
              <div className="flex gap-3 text-slate-400">
                {['fb', 'ig', 'in', 'tw'].map((s) => (
                  <a key={s} href="#" className="hover:text-white transition-colors w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold">
                    {s}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">Sobre nosotros</a></li>
                <li><a href="#" className="hover:text-white">Contacto</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Recursos</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">WhatsApp Business API</a></li>
                <li><a href="#" className="hover:text-white">Guías de uso</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">Privacidad</a></li>
                <li><a href="#" className="hover:text-white">Términos</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} wazapp.ai</p>
            <div className="flex gap-6 text-sm text-slate-500">
              <a href="/login" className="hover:text-white">Iniciar sesión</a>
              <a href="/register" className="hover:text-white">Registrarse</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
