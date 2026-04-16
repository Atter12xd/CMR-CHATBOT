import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Globe,
  BarChart3,
  Headphones,
  Rocket,
  Play,
  Check,
  Loader2,
} from 'lucide-react';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import Navbar from './landing/Navbar';
import Footer from './landing/Footer';
import SectionLabel from './landing/SectionLabel';

const tickerItems = [
  { name: 'Conversaciones', pair: 'ATENDIDAS', price: '+2.4M' },
  { name: 'Leads', pair: 'CALIFICADOS', price: '+185K' },
  { name: 'Ventas', pair: 'ASISTIDAS', price: '+38K' },
  { name: 'Tiempo de respuesta', pair: 'PROMEDIO', price: '-62%' },
  { name: 'Recuperacion', pair: 'CARRITOS', price: '+41%' },
  { name: 'Satisfaccion', pair: 'CLIENTES', price: '4.9/5' },
];

const perks = [
  {
    title: 'Soporte 24/7',
    text: 'Atencion continua para resolver dudas de ventas y operaciones.',
    icon: Headphones,
  },
  {
    title: 'Comunidad',
    text: 'Aprende con otros equipos que venden por WhatsApp todos los dias.',
    icon: Sparkles,
  },
  {
    title: 'Academia',
    text: 'Guias practicas para mejorar conversion, respuesta y cierre.',
    icon: Rocket,
  },
];

const faqs = [
  {
    q: 'Que es Wazapp.ai?',
    a: 'Wazapp.ai es una plataforma de comercio conversacional para centralizar chats, automatizar seguimientos y convertir mas leads.',
  },
  {
    q: 'Es ideal para equipos en crecimiento?',
    a: 'Si. Puedes empezar con un equipo pequeno y escalar con bandeja compartida, flujos por roles y metricas unificadas.',
  },
  {
    q: 'Puedo personalizar el flujo de ventas?',
    a: 'Claro. Puedes adaptar guiones, respuestas y rutas de conversion segun tu rubro y operacion.',
  },
  {
    q: 'Incluye soporte de onboarding?',
    a: 'Si. Te guiamos en la implementacion inicial para pasar del primer chat a una operacion predecible.',
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '$50',
    period: '/mes',
    desc: 'Ideal para negocios que quieren automatizar su atencion.',
    points: ['Conversaciones ilimitadas', '1 numero de WhatsApp', 'Entrenamiento basico del bot'],
  },
  {
    name: 'Pro',
    price: '$99',
    period: '/mes',
    desc: 'Para equipos que necesitan velocidad, control y mas conversiones.',
    points: ['Hasta 3 numeros de WhatsApp', 'Catalogo ilimitado', 'Metricas en tiempo real'],
  },
  {
    name: 'Business',
    price: '$150',
    period: '/mes',
    desc: 'Operacion avanzada con soporte prioritario y escala.',
    points: ['Numeros ilimitados', 'Integraciones personalizadas', 'SLA y soporte dedicado'],
  },
];

const MOTION_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function CoinTicker() {
  const row = [...tickerItems, ...tickerItems];
  return (
    <div className="overflow-hidden rounded-[24px] border border-app-line bg-white">
      <motion.div
        className="flex w-max"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 22, ease: 'linear', repeat: Infinity }}
      >
        {row.map((item, idx) => (
          <div
            key={`${item.name}-${idx}`}
            className="w-[220px] shrink-0 border-r border-app-line px-4 py-5 last:border-r-0"
          >
            <p className="text-[12px] font-semibold text-app-ink">{item.name}</p>
            <p className="text-[11px] text-app-muted">{item.pair}</p>
            <p className="mt-2 text-xl font-bold text-app-ink font-professional tabular-nums">{item.price}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function LandingPageInner() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      window.location.href = '/chats';
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-professional relative overflow-hidden">
        <div className="relative flex flex-col items-center gap-4">
          <div className="app-spinner">
            <Loader2 size={20} className="animate-spin text-brand-600" />
          </div>
          <p className="text-[13px] text-app-muted font-medium tracking-wide">Cargando experiencia...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-professional antialiased text-app-ink">
      <Navbar showAnnouncement />

      <section className="relative pt-34 lg:pt-44 pb-24 lg:pb-28 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, ease: MOTION_EASE }}
          >
            <SectionLabel>Automatizacion para ventas por chat</SectionLabel>
            <h1 className="text-[2.9rem] sm:text-[4.2rem] lg:text-[5.15rem] font-bold tracking-[-0.04em] leading-[0.96]">
              Bot web + bot WhatsApp
              <span className="block text-gradient-brand mt-2">para vender mas todos los dias</span>
            </h1>
            <p className="mt-7 text-[1.08rem] text-app-muted max-w-xl leading-relaxed">
              Wazapp.ai centraliza chats, responde con IA y acelera cierres en un solo CRM conversacional.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <a
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors"
              >
                Explorar ahora
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-app-line bg-white text-app-ink font-semibold hover:bg-app-field transition-colors"
              >
                Ver precios
                <Play className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.64, delay: 0.08, ease: MOTION_EASE }}
          >
            <div className="rounded-[30px] border border-app-line bg-white shadow-app-card-premium p-3.5">
              <img
                src="https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=1400&q=80"
                alt="Vista 3D de Wazapp.ai"
                className="w-full h-[440px] sm:h-[540px] object-cover rounded-[24px]"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-12 lg:py-14 px-4 sm:px-6 lg:px-8 bg-white border-y border-app-line">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-app-muted mb-4">Confiado por equipos de alto rendimiento</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {['Logoipsum', 'sum', 'LOGOIPSUM', 'Logoipsum', 'sum', 'Logoipsum'].map((logo, idx) => (
              <div key={`${logo}-${idx}`} className="h-11 rounded-xl border border-app-line bg-white flex items-center justify-center">
                <span className="text-xs font-semibold text-app-muted tracking-wide">{logo}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-app-muted mb-6">Indicadores en tiempo real</p>
          <h2 className="text-center text-[2.15rem] sm:text-5xl lg:text-[3.35rem] font-bold tracking-[-0.035em] mb-8">Rendimiento de tu operacion comercial</h2>
          <CoinTicker />
        </div>
      </section>

      <section id="pricing" className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-app-line">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>Precios</SectionLabel>
            <h2 className="text-[2.1rem] sm:text-5xl lg:text-[3.15rem] font-bold tracking-[-0.035em]">Planes para cada etapa de tu negocio</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className="rounded-[22px] border border-app-line bg-white p-6 shadow-app-card">
                <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider">{plan.name}</p>
                <p className="mt-2 text-4xl font-bold text-app-ink font-professional tabular-nums">
                  {plan.price}
                  <span className="text-base text-app-muted font-medium">{plan.period}</span>
                </p>
                <p className="mt-3 text-sm text-app-muted">{plan.desc}</p>
                <ul className="mt-5 space-y-2">
                  {plan.points.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-sm text-app-ink">
                      <Check className="w-4 h-4 text-emerald-600" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="benefits" className="py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.48, ease: MOTION_EASE }}
          >
            <SectionLabel>Beneficios clave</SectionLabel>
            <h2 className="text-[2.1rem] sm:text-5xl lg:text-[3.25rem] font-bold tracking-[-0.035em] leading-tight mb-6">
              Lo que hace unico a
              <span className="block">Wazapp.ai</span>
            </h2>
            <div className="space-y-4">
              {[
                'Bot de WhatsApp para responder, vender y recuperar clientes',
                'Bot web para captar leads desde tu sitio en segundos',
                'CRM con pedidos, pagos y seguimiento comercial en una sola vista',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-app-muted">
                  <span className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-brand-600" />
                  </span>
                  <p className="text-[15px]">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.52, delay: 0.06, ease: MOTION_EASE }}
          >
            <img
              src="https://images.unsplash.com/photo-1639322537504-6427a16b0a28?auto=format&fit=crop&w=1400&q=80"
              alt="Tarjetas del panel comercial"
              className="w-full h-[460px] object-cover rounded-[26px] border border-app-line"
              loading="lazy"
            />
          </motion.div>
        </div>
      </section>

      <section id="services" className="py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white border-y border-app-line">
        <div className="max-w-7xl mx-auto text-center">
          <SectionLabel>Flujo de trabajo</SectionLabel>
          <h2 className="text-[2.1rem] sm:text-5xl lg:text-[3.25rem] font-bold tracking-[-0.035em] mb-14 max-w-4xl mx-auto">
            Un flujo completo para atraer, responder y cerrar ventas por WhatsApp y web
          </h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.58, ease: MOTION_EASE }}
            className="rounded-[26px] border border-app-line bg-white p-6 md:p-8"
          >
            <img
              src="https://images.unsplash.com/photo-1618005198919-d3d4b5a92eee?auto=format&fit=crop&w=1600&q=80"
              alt="Flujo visual de Wazapp.ai"
              className="w-full h-[500px] md:h-[600px] object-cover rounded-[22px]"
              loading="lazy"
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 text-left">
              {[
                ['Planificacion', 'Mapea el flujo de conversaciones y ventas.'],
                ['Optimizacion', 'Mejora respuestas, UX y conversion.'],
                ['Pruebas', 'Valida escenarios reales de atencion.'],
                ['Soporte', 'Despliega y escala con soporte continuo.'],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-2xl border border-app-line bg-app-field/30 p-4">
                  <h3 className="font-semibold text-app-ink mb-1">{title}</h3>
                  <p className="text-sm text-app-muted">{desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="why-wazapp" className="py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: MOTION_EASE }}
          >
            <img
              src="https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=1200&q=80"
              alt="Panel comercial de Wazapp.ai"
              className="w-full h-[440px] object-cover rounded-[24px] border border-app-line"
              loading="lazy"
            />
          </motion.div>
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.54, delay: 0.06, ease: MOTION_EASE }}
          >
            <SectionLabel>Contexto Wazapp.ai</SectionLabel>
            <h2 className="text-[2.1rem] sm:text-5xl lg:text-[3.2rem] font-bold tracking-[-0.035em] leading-tight mb-4">
              Crea tu sistema comercial omnicanal hoy
            </h2>
            <p className="text-lg text-app-muted mb-8">
              Disenado para marcas que venden por chat y necesitan automatizacion, control y crecimiento continuo.
            </p>
            <div className="space-y-3">
              {[
                ['Bot de WhatsApp con IA', MessageSquare],
                ['Bot web para captacion 24/7', Globe],
                ['Metricas y conversion en tiempo real', BarChart3],
              ].map(([label, Icon]) => (
                <div key={label as string} className="flex items-center justify-between border-b border-app-line py-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-brand-600" />
                    </span>
                    <span className="font-medium text-app-ink">{label as string}</span>
                  </div>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white border-y border-app-line">
        <div className="max-w-7xl mx-auto text-center">
          <SectionLabel>Siempre a tu lado</SectionLabel>
          <h2 className="text-[2.1rem] sm:text-5xl lg:text-[3.2rem] font-bold tracking-[-0.035em] mb-14">Potencia tu equipo con Wazapp.ai</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {perks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.42, delay: idx * 0.06, ease: MOTION_EASE }}
                  className="rounded-[22px] border border-app-line bg-white p-7 shadow-app-card"
                >
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-brand-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-app-ink mb-2">{item.title}</h3>
                  <p className="text-app-muted text-sm leading-relaxed">{item.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="faqs" className="py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white border-b border-app-line">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
          <SectionLabel>Preguntas frecuentes</SectionLabel>
            <h2 className="text-[2.1rem] sm:text-5xl lg:text-[3.15rem] font-bold tracking-[-0.035em]">Aprende mas sobre Wazapp.ai</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((item) => (
              <details key={item.q} className="group rounded-2xl border border-app-line bg-white p-5 open:shadow-app-card">
                <summary className="list-none cursor-pointer flex items-center justify-between gap-4">
                  <span className="font-semibold text-app-ink">{item.q}</span>
                  <span className="text-app-muted group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-app-muted leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <SectionLabel>Siguiente paso</SectionLabel>
          <h2 className="text-[2.1rem] sm:text-5xl lg:text-[3.15rem] font-bold tracking-[-0.035em] mb-5">Escala tu negocio con Wazapp.ai</h2>
          <p className="text-lg text-app-muted mb-10">
            Activa tu bot web y tu bot WhatsApp para responder mas rapido, vender mejor y escalar sin perder control.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors"
            >
              Empezar gratis
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/contacto"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-app-line bg-white text-app-ink font-semibold hover:bg-app-field transition-colors"
            >
              Hablar con ventas
            </a>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-sm text-app-muted">
            {[1, 2, 3].map((x) => (
              <span key={x} className="inline-flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" />
                100% seguro
              </span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function LandingPage() {
  return (
    <AuthProvider>
      <LandingPageInner />
    </AuthProvider>
  );
}
