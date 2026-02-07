import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  MessageSquare,
  Zap,
  ArrowRight,
  Star,
} from 'lucide-react';
import Navbar from './landing/Navbar';
import Footer from './landing/Footer';

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
      <Navbar showAnnouncement />

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
              className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-4 bg-blue-600 text-white text-base font-semibold rounded-lg hover:bg-blue-500 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Empezar gratis
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/login"
              className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-4 bg-slate-800 text-white text-base font-semibold rounded-lg border border-slate-600 hover:bg-slate-700 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
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
            className="inline-block mt-8 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
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
                <div className="group">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    <span className="text-blue-400">Capture:</span> Unifica puntos de contacto
                  </h3>
                  <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                    Los leads llegan por WhatsApp, redes o visitas. Wazapp los unifica en un panel para que no pierdas oportunidades.
                  </p>
                </div>
                <div className="group">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    <span className="text-blue-400">Convierte:</span> Vende más con pedidos y catálogo
                  </h3>
                  <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                    Gestiona pedidos, productos y métodos de pago. Respuestas rápidas que cierran ventas.
                  </p>
                </div>
                <div className="group">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    <span className="text-blue-400">Retén:</span> Ingresos recurrentes, no solo ventas puntuales
                  </h3>
                  <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                    Recordatorios, seguimiento y contexto completo para fidelizar a tus clientes.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-2xl shadow-blue-500/10 bg-gradient-to-br from-slate-800 to-slate-900 p-6 transition-all duration-300 hover:shadow-blue-500/20 hover:border-slate-600">
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
                <a
                  key={card.title}
                  href="/register"
                  className="block bg-slate-900/80 rounded-xl p-5 border border-slate-800 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50"
                >
                  <h3 className="font-semibold text-white text-sm mb-2">{card.title}</h3>
                  <p className="text-xs text-slate-500">{card.desc}</p>
                  <span className="text-xs text-blue-400 hover:text-blue-300 mt-3 inline-block font-medium">
                    Saber más →
                  </span>
                </a>
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
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white border border-white rounded-lg hover:bg-white hover:text-black transition-all duration-300 font-semibold hover:scale-[1.02] active:scale-[0.98]"
            >
              Ya tengo cuenta
            </a>
            <a
              href="/register"
              className="inline-flex items-center gap-2 justify-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all duration-300 font-semibold hover:scale-[1.02] active:scale-[0.98]"
            >
              Empezar gratis
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
