import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  MessageSquare,
  Zap,
  ArrowRight,
  Star,
  Check,
  Users,
  TrendingUp,
  Clock,
  Shield,
  Headphones,
  BarChart3,
  ShoppingCart,
} from 'lucide-react';
import Navbar from './landing/Navbar';
import Footer from './landing/Footer';

// Componente de estadística animada
function StatCard({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  return (
    <div 
      className="text-center animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-4xl lg:text-5xl font-bold text-white tracking-tight">{value}</p>
      <p className="mt-2 text-sm text-slate-400 font-medium">{label}</p>
    </div>
  );
}

// Componente de feature card
function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  accent = 'brand' 
}: { 
  icon: any; 
  title: string; 
  description: string;
  accent?: 'brand' | 'emerald' | 'amber';
}) {
  const accentColors = {
    brand: 'bg-brand-500/10 text-brand-400 group-hover:bg-brand-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20',
  };

  return (
    <div className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/50">
      <div className={`w-12 h-12 rounded-xl ${accentColors[accent]} flex items-center justify-center mb-4 transition-colors`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

// Bento card con estilo glass y blur (estilos que compartiste)
function BentoCard({
  title,
  description,
  icon: Icon,
  delay = 0,
}: {
  title: string;
  description: string;
  icon: any;
  delay?: number;
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-white/20 flex flex-col justify-start items-start relative animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: 'rgba(231, 236, 235, 0.08)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />
      <div className="self-stretch p-6 flex flex-col justify-start items-start gap-2 relative z-10">
        <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-2">
          <Icon className="w-6 h-6 text-brand-400" />
        </div>
        <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
          <p className="self-stretch text-white text-lg font-normal leading-7">
            {title}
            <br />
            <span className="text-slate-400">{description}</span>
          </p>
        </div>
      </div>
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/30" />
          <div className="h-4 w-32 bg-slate-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-white">
      <Navbar showAnnouncement />

      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative pt-32 lg:pt-44 pb-20 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 mb-8">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm text-slate-300 font-medium">+500 negocios ya venden con Wazapp</span>
          </div>

          {/* Headline */}
          <h1 className="text-balance text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight leading-[1.1]">
            Vende más por WhatsApp
            <span className="block mt-2 text-gradient-brand">sin perder ninguna conversación</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 lg:mt-8 text-lg lg:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Centraliza chats, pedidos y productos en un solo panel. Responde más rápido, 
            vende más y mantén a tus clientes felices — todo desde WhatsApp.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/register"
              className="group inline-flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white text-base font-semibold rounded-xl transition-all duration-300 shadow-xl shadow-brand-600/25 hover:shadow-brand-500/30 hover:scale-[1.02]"
            >
              Empezar gratis
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white text-base font-semibold rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:scale-[1.02]"
            >
              Ver cómo funciona
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Configuración en 5 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Soporte en español</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SOCIAL PROOF - LOGOS
          ============================================ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/30 border-y border-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-sm font-medium text-slate-500 uppercase tracking-wider mb-10">
            Empresas que confían en Wazapp
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
            {['Retail', 'Restaurantes', 'E-commerce', 'Servicios', 'Salud', 'Educación'].map((name) => (
              <span
                key={name}
                className="text-lg font-semibold text-slate-600 hover:text-slate-400 transition-colors cursor-default"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          BENTO SECTION - Estilo glass/blur
          ============================================ */}
      <section className="w-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center overflow-visible bg-transparent py-16 md:py-24">
        <div className="w-full max-w-6xl relative flex flex-col gap-6">
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/10 blur-[130px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" style={{ background: 'rgba(42, 139, 255, 0.1)' }} />
          <div className="self-stretch py-8 md:py-14 flex flex-col justify-center items-center gap-2 z-10">
            <div className="flex flex-col justify-start items-center gap-4">
              <h2 className="text-balance w-full max-w-[655px] text-center text-white text-4xl md:text-6xl font-semibold leading-tight md:leading-[66px]">
                Empodera tu flujo de trabajo
              </h2>
              <p className="w-full max-w-[600px] text-center text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
                Inbox unificado, pedidos, catálogo y métricas en un solo panel. Responde más rápido y vende más desde WhatsApp.
              </p>
            </div>
          </div>
          <div className="self-stretch grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10">
            {[
              { title: 'Inbox unificado', description: 'Todas tus conversaciones en un solo lugar.', icon: MessageSquare, delay: 0 },
              { title: 'Gestión de pedidos', description: 'Crea y rastrea pedidos desde el chat.', icon: ShoppingCart, delay: 80 },
              { title: 'Catálogo de productos', description: 'Precios y disponibilidad al instante.', icon: BarChart3, delay: 160 },
              { title: 'Respuestas rápidas', description: 'Templates y respuestas automáticas.', icon: Zap, delay: 240 },
              { title: 'Trabajo en equipo', description: 'Asigna chats y comparte historial.', icon: Users, delay: 320 },
              { title: 'Métricas y reportes', description: 'Tiempos de respuesta y conversión.', icon: TrendingUp, delay: 400 },
            ].map((card) => (
              <BentoCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURES SECTION
          ============================================ */}
      <section id="caracteristicas" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 lg:mb-20">
            <p className="text-brand-400 font-semibold text-sm uppercase tracking-wider mb-4">Características</p>
            <h2 className="text-balance text-3xl lg:text-4xl xl:text-5xl font-bold text-white tracking-tight">
              Todo lo que necesitas para vender más
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              Una plataforma completa para gestionar tu negocio desde WhatsApp
            </p>
          </div>

          {/* Features Grid */}
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

      {/* ============================================
          DEMO / MOCKUP SECTION
          ============================================ */}
      <section id="demo" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text Content */}
            <div>
              <p className="text-brand-400 font-semibold text-sm uppercase tracking-wider mb-4">Cómo funciona</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-6">
                De la conversación al pedido en segundos
              </h2>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                Wazapp conecta tu WhatsApp con un panel de control potente. 
                Responde chats, gestiona pedidos y actualiza tu catálogo sin salir de la plataforma.
              </p>

              <div className="space-y-6">
                {[
                  { step: '01', title: 'Conecta tu WhatsApp', desc: 'Escanea un código QR y listo. Sin APIs complicadas.' },
                  { step: '02', title: 'Recibe y responde chats', desc: 'Todas las conversaciones llegan a tu panel unificado.' },
                  { step: '03', title: 'Convierte en ventas', desc: 'Crea pedidos y envía links de pago desde el chat.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-brand-400">{item.step}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mockup */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 to-emerald-500/20 rounded-3xl blur-2xl" />
              <div className="relative rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl bg-slate-900/90 p-6">
                {/* Chat Mockup */}
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1 bg-slate-800/50 rounded-2xl rounded-tl-md px-4 py-3">
                      <p className="text-sm text-slate-300">¡Hola! ¿Tienen disponibilidad para mañana?</p>
                      <p className="text-xs text-slate-500 mt-1">10:23 AM</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 justify-end">
                    <div className="flex-1 bg-brand-600/30 rounded-2xl rounded-tr-md px-4 py-3 max-w-[85%]">
                      <p className="text-sm text-white">¡Hola! Sí, tenemos horarios a las 10am y 3pm. ¿Cuál prefieres? 😊</p>
                      <p className="text-xs text-brand-300 mt-1">10:24 AM · Leído</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1 bg-slate-800/50 rounded-2xl rounded-tl-md px-4 py-3">
                      <p className="text-sm text-slate-300">Perfecto, a las 3pm. ¿Cuánto es el total?</p>
                      <p className="text-xs text-slate-500 mt-1">10:25 AM</p>
                    </div>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-white">5,477</p>
                      <p className="text-xs text-slate-500 mt-1">Mensajes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">94%</p>
                      <p className="text-xs text-slate-500 mt-1">Tasa respuesta</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-400">62%</p>
                      <p className="text-xs text-slate-500 mt-1">Conversión</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          WHY US SECTION
          ============================================ */}
      <section id="por-que" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand-400 font-semibold text-sm uppercase tracking-wider mb-4">¿Por qué Wazapp?</p>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white tracking-tight">
              Simple, rápido y efectivo
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: 'En minutos', desc: 'Conecta tu WhatsApp en menos de 5 minutos. Sin instalaciones complejas.' },
              { icon: Shield, title: 'Seguro', desc: 'Tus datos y conversaciones protegidos con encriptación de nivel empresarial.' },
              { icon: Headphones, title: 'Soporte real', desc: 'Atención en español cuando lo necesites. Respondemos en menos de 24h.' },
              { icon: TrendingUp, title: 'Escalable', desc: 'Desde 1 hasta 100+ agentes. Crece sin cambiar de plataforma.' },
            ].map((item, i) => (
              <div 
                key={i} 
                className="p-6 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-slate-800/50 hover:border-slate-700/50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          STATS / RESULTS SECTION
          ============================================ */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand-400 font-semibold text-sm uppercase tracking-wider mb-4">Resultados</p>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white tracking-tight">
              Números que hablan
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard value="60%" label="Ventas más rápido" delay={0} />
            <StatCard value="81%" label="Tasa de conversión" delay={100} />
            <StatCard value="3x" label="Más leads calificados" delay={200} />
            <StatCard value="<2min" label="Tiempo de respuesta" delay={300} />
          </div>
        </div>
      </section>

      {/* ============================================
          TESTIMONIALS / CASE STUDIES
          ============================================ */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand-400 font-semibold text-sm uppercase tracking-wider mb-4">Casos de éxito</p>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white tracking-tight">
              Negocios que crecen con Wazapp
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { 
                title: 'Tienda online aumenta pedidos un 50%', 
                desc: 'Centralizó WhatsApp + catálogo de productos',
                metric: '+50% pedidos',
                industry: 'E-commerce'
              },
              { 
                title: 'Restaurante reduce tiempo de respuesta 70%', 
                desc: 'Gestión de reservas y pedidos en tiempo real',
                metric: '-70% tiempo',
                industry: 'Restaurante'
              },
              { 
                title: 'Clínica recupera citas perdidas', 
                desc: 'Recordatorios automáticos por WhatsApp',
                metric: '+35% asistencia',
                industry: 'Salud'
              },
              { 
                title: 'Tienda física expande ventas por delivery', 
                desc: 'WhatsApp como canal principal de ventas',
                metric: '+200% reach',
                industry: 'Retail'
              },
            ].map((card, i) => (
              <a
                key={i}
                href="/register"
                className="group block p-6 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700/50 transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-xs font-medium text-slate-400">
                    {card.industry}
                  </span>
                  <span className="text-lg font-bold text-emerald-400">{card.metric}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-brand-400 transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-400 mb-4">{card.desc}</p>
                <span className="text-sm text-brand-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Leer más
                  <ArrowRight className="w-4 h-4" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FINAL CTA SECTION
          ============================================ */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-balance text-3xl lg:text-4xl xl:text-5xl font-bold text-white tracking-tight mb-6">
            ¿Listo para vender más?
          </h2>
          <p className="text-lg text-slate-400 mb-10">
            Únete a cientos de negocios que ya aumentaron sus ventas con Wazapp.
            Empieza gratis hoy mismo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/register"
              className="group inline-flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white text-base font-semibold rounded-xl transition-all duration-300 shadow-xl shadow-brand-600/25 hover:shadow-brand-500/30 hover:scale-[1.02]"
            >
              Empezar gratis
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="/contacto"
              className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-4 text-slate-300 hover:text-white text-base font-semibold transition-colors"
            >
              Hablar con ventas
            </a>
          </div>
          
          {/* Final trust */}
          <div className="mt-12 flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
            ))}
            <span className="ml-3 text-sm text-slate-400">4.9/5 basado en +200 reseñas</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}