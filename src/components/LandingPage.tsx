import { useEffect, type ComponentType } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { LucideProps } from 'lucide-react';
import {
  MessageSquare,
  Zap,
  ArrowRight,
  Star,
  Check,
  Users,
  TrendingUp,
  Shield,
  Headphones,
  BarChart3,
  ShoppingCart,
  Loader2,
} from 'lucide-react';
import Navbar from './landing/Navbar';
import Footer from './landing/Footer';

function StatCard({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  return (
    <div
      className="text-center animate-fade-in-up rounded-[22px] border border-app-line bg-white px-4 py-6 shadow-app-card font-professional"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-4xl lg:text-5xl font-bold text-app-ink tracking-tight font-display tabular-nums">{value}</p>
      <p className="mt-2 text-[13px] text-app-muted font-medium">{label}</p>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  accent = 'brand',
}: {
  icon: ComponentType<LucideProps>;
  title: string;
  description: string;
  accent?: 'brand' | 'emerald' | 'amber';
}) {
  const iconClass =
    accent === 'brand'
      ? 'text-brand-600'
      : accent === 'emerald'
        ? 'text-emerald-600'
        : 'text-amber-600';

  return (
    <div className="group p-6 rounded-[22px] border border-app-line bg-white shadow-app-card font-professional transition-[border-color,box-shadow] duration-200 hover:border-app-line-strong">
      <div className="w-12 h-12 rounded-2xl bg-app-field flex items-center justify-center mb-4">
        <Icon className={`w-6 h-6 ${iconClass}`} />
      </div>
      <h3 className="text-lg font-semibold text-app-ink mb-2">{title}</h3>
      <p className="text-app-muted text-sm leading-relaxed">{description}</p>
    </div>
  );
}

export default function LandingPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      window.location.href = '/chats';
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-shell font-professional">
        <div className="flex flex-col items-center gap-3">
          <div className="app-spinner">
            <Loader2 size={20} className="animate-spin text-brand-500" />
          </div>
          <p className="text-[14px] text-app-muted">Cargando…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-shell font-professional antialiased text-app-ink">
      <Navbar showAnnouncement />

      {/* Hero — mismo canvas suave que el producto */}
      <section className="relative pt-32 lg:pt-44 pb-20 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-app-canvas">
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-app-line bg-white shadow-app-card mb-8">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-sm text-app-muted font-medium">+500 negocios ya venden con Wazapp</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-app-ink tracking-tight leading-[1.1] font-display">
            Vende más por WhatsApp
            <span className="block mt-2 text-gradient-brand">sin perder ninguna conversación</span>
          </h1>

          <p className="mt-6 lg:mt-8 text-lg lg:text-xl text-app-muted max-w-3xl mx-auto leading-relaxed">
            Centraliza chats, pedidos y productos en un solo panel. Responde más rápido, vende más y mantén a tus
            clientes felices — todo desde WhatsApp.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/register"
              className="group inline-flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-4 bg-app-charcoal hover:bg-app-charcoal/90 text-white text-base font-semibold rounded-2xl transition-all duration-200 shadow-md shadow-black/15"
            >
              Empezar gratis
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-4 bg-white text-app-ink text-base font-semibold rounded-2xl border border-app-line hover:bg-app-field/80 transition-all duration-200"
            >
              Ver cómo funciona
            </a>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-app-muted">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Configuración en 5 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Soporte en español</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-app-line">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-[11px] font-semibold text-app-muted uppercase tracking-[0.14em] mb-10">
            Empresas que confían en Wazapp
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
            {['Retail', 'Restaurantes', 'E-commerce', 'Servicios', 'Salud', 'Educación'].map((name) => (
              <span
                key={name}
                className="text-lg font-semibold text-app-muted/80 hover:text-app-ink transition-colors cursor-default"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="caracteristicas" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-app-shell">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 lg:mb-20">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-app-muted mb-4">Características</p>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-app-ink tracking-tight font-display">
              Todo lo que necesitas para vender más
            </h2>
            <p className="mt-4 text-lg text-app-muted max-w-2xl mx-auto">
              Una plataforma completa para gestionar tu negocio desde WhatsApp
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={MessageSquare}
              title="Inbox unificado"
              description="Todas tus conversaciones de WhatsApp en un solo lugar. Nunca pierdas un mensaje importante."
              accent="brand"
            />
            <FeatureCard
              icon={ShoppingCart}
              title="Gestión de pedidos"
              description="Crea, edita y rastrea pedidos directamente desde el chat. Integrado con tu catálogo."
              accent="emerald"
            />
            <FeatureCard
              icon={BarChart3}
              title="Catálogo de productos"
              description="Muestra tus productos con precios y disponibilidad. Los clientes pueden pedir desde el chat."
              accent="amber"
            />
            <FeatureCard
              icon={Zap}
              title="Respuestas rápidas"
              description="Templates y respuestas automáticas para las preguntas más frecuentes."
              accent="brand"
            />
            <FeatureCard
              icon={Users}
              title="Trabajo en equipo"
              description="Asigna conversaciones a diferentes agentes. Todos ven el historial completo."
              accent="emerald"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Métricas y reportes"
              description="Mide tiempos de respuesta, conversiones y satisfacción de tus clientes."
              accent="amber"
            />
          </div>
        </div>
      </section>

      <section id="demo" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white border-y border-app-line">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-app-muted mb-4">Cómo funciona</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-app-ink tracking-tight mb-6 font-display">
                De la conversación al pedido en segundos
              </h2>
              <p className="text-lg text-app-muted mb-10 leading-relaxed">
                Wazapp conecta tu WhatsApp con un panel de control potente. Responde chats, gestiona pedidos y actualiza
                tu catálogo sin salir de la plataforma.
              </p>

              <div className="space-y-6">
                {[
                  { step: '01', title: 'Conecta tu WhatsApp', desc: 'Escanea un código QR y listo. Sin APIs complicadas.' },
                  { step: '02', title: 'Recibe y responde chats', desc: 'Todas las conversaciones llegan a tu panel unificado.' },
                  { step: '03', title: 'Convierte en ventas', desc: 'Crea pedidos y envía links de pago desde el chat.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-brand-600">{item.step}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-app-ink mb-1">{item.title}</h3>
                      <p className="text-sm text-app-muted">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-[22px] overflow-hidden border border-app-line shadow-app-card bg-white p-6">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-app-field flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 bg-app-field rounded-2xl rounded-tl-md px-4 py-3 border border-app-line/60">
                      <p className="text-sm text-app-ink">¡Hola! ¿Tienen disponibilidad para mañana?</p>
                      <p className="text-xs text-app-muted mt-1">10:23 AM</p>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <div className="flex-1 bg-app-charcoal rounded-2xl rounded-tr-md px-4 py-3 max-w-[85%]">
                      <p className="text-sm text-white">¡Hola! Sí, tenemos horarios a las 10am y 3pm. ¿Cuál prefieres? 😊</p>
                      <p className="text-xs text-white/70 mt-1">10:24 AM · Leído</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-app-field flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 bg-app-field rounded-2xl rounded-tl-md px-4 py-3 border border-app-line/60">
                      <p className="text-sm text-app-ink">Perfecto, a las 3pm. ¿Cuánto es el total?</p>
                      <p className="text-xs text-app-muted mt-1">10:25 AM</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-app-line">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-app-ink font-display">5,477</p>
                      <p className="text-xs text-app-muted mt-1">Mensajes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-app-ink font-display">94%</p>
                      <p className="text-xs text-app-muted mt-1">Tasa respuesta</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-600 font-display">62%</p>
                      <p className="text-xs text-app-muted mt-1">Conversión</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="por-que" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-app-shell">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-app-muted mb-4">¿Por qué Wazapp?</p>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-app-ink tracking-tight font-display">
              Simple, rápido y efectivo
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: 'En minutos', desc: 'Conecta tu WhatsApp en menos de 5 minutos. Sin instalaciones complejas.' },
              { icon: Shield, title: 'Seguro', desc: 'Tus datos y conversaciones protegidos con encriptación de nivel empresarial.' },
              { icon: Headphones, title: 'Soporte real', desc: 'Atención en español cuando lo necesites. Respondemos en menos de 24h.' },
              { icon: TrendingUp, title: 'Escalable', desc: 'Desde 1 hasta 100+ agentes. Crece sin cambiar de plataforma.' },
            ].map((item, i) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-[22px] border border-app-line bg-white shadow-app-card font-professional transition-[border-color] duration-200 hover:border-app-line-strong"
                >
                  <div className="w-12 h-12 rounded-2xl bg-app-field flex items-center justify-center mb-4">
                    <ItemIcon className="w-6 h-6 text-brand-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-app-ink mb-2">{item.title}</h3>
                  <p className="text-sm text-app-muted leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white border-y border-app-line">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-app-muted mb-4">Resultados</p>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-app-ink tracking-tight font-display">
              Números que hablan
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard value="60%" label="Ventas más rápido" delay={0} />
            <StatCard value="81%" label="Tasa de conversión" delay={100} />
            <StatCard value="3x" label="Más leads calificados" delay={200} />
            <StatCard value="<2min" label="Tiempo de respuesta" delay={300} />
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-app-shell">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-app-muted mb-4">Casos de éxito</p>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-app-ink tracking-tight font-display">
              Negocios que crecen con Wazapp
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: 'Tienda online aumenta pedidos un 50%',
                desc: 'Centralizó WhatsApp + catálogo de productos',
                metric: '+50% pedidos',
                industry: 'E-commerce',
              },
              {
                title: 'Restaurante reduce tiempo de respuesta 70%',
                desc: 'Gestión de reservas y pedidos en tiempo real',
                metric: '-70% tiempo',
                industry: 'Restaurante',
              },
              {
                title: 'Clínica recupera citas perdidas',
                desc: 'Recordatorios automáticos por WhatsApp',
                metric: '+35% asistencia',
                industry: 'Salud',
              },
              {
                title: 'Tienda física expande ventas por delivery',
                desc: 'WhatsApp como canal principal de ventas',
                metric: '+200% reach',
                industry: 'Retail',
              },
            ].map((card, i) => (
              <a
                key={i}
                href="/register"
                className="group block p-6 rounded-[22px] border border-app-line bg-white shadow-app-card font-professional transition-[border-color,box-shadow] duration-200 hover:border-app-line-strong"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-app-field border border-app-line text-xs font-medium text-app-muted">
                    {card.industry}
                  </span>
                  <span className="text-lg font-bold text-emerald-600">{card.metric}</span>
                </div>
                <h3 className="text-lg font-semibold text-app-ink mb-2 group-hover:text-brand-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-app-muted mb-4">{card.desc}</p>
                <span className="text-sm text-brand-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Leer más
                  <ArrowRight className="w-4 h-4" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-app-charcoal text-white">
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/[0.06] blur-2xl pointer-events-none" />
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-6 font-display relative z-[1]">
            ¿Listo para vender más?
          </h2>
          <p className="text-lg text-white/80 mb-10 relative z-[1]">
            Únete a cientos de negocios que ya aumentaron sus ventas con Wazapp. Empieza gratis hoy mismo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-[1]">
            <a
              href="/register"
              className="group inline-flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-4 bg-white text-app-charcoal hover:bg-white/95 text-base font-semibold rounded-2xl transition-all duration-200 shadow-lg"
            >
              Empezar gratis
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="/contacto"
              className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-4 text-white/90 hover:text-white text-base font-semibold transition-colors"
            >
              Hablar con ventas
            </a>
          </div>

          <div className="mt-12 flex items-center justify-center gap-1 relative z-[1]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
            ))}
            <span className="ml-3 text-sm text-white/70">4.9/5 basado en +200 reseñas</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
