import { useState, useEffect } from 'react';
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
  Check,
  Loader2,
  Clock,
} from 'lucide-react';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import Navbar from './landing/Navbar';
import Footer from './landing/Footer';
import SectionLabel from './landing/SectionLabel';

const WHATSAPP_SOPORTE = '51933484150';

const tickerItems = [
  { name: 'Conversaciones', pair: 'ATENDIDAS', price: '+2.4M' },
  { name: 'Leads', pair: 'CALIFICADOS', price: '+185K' },
  { name: 'Ventas', pair: 'ASISTIDAS', price: '+38K' },
  { name: 'Tiempo de respuesta', pair: 'PROMEDIO', price: '-62%' },
  { name: 'Recuperacion', pair: 'CARRITOS', price: '+41%' },
  { name: 'Satisfaccion', pair: 'CLIENTES', price: '4.9/5' },
];

const plans = [
  {
    name: 'Starter',
    description: 'Para negocios que quieren automatizar su atencion',
    price: { monthly: 50, yearly: 40 },
    priceBefore: 70,
    trial: '14 dias de prueba gratis',
    features: [
      'Conversaciones ilimitadas',
      '1 numero de WhatsApp',
      'Entrenar bot con texto, URLs y PDFs',
      'Catalogo de hasta 300 productos',
      'Gestion de pedidos',
      'Modo bot y modo humano',
      'Soporte por email',
    ],
    cta: 'Empezar ahora',
    ctaLink: '/register',
    highlighted: true,
    whatsappMessage: null as string | null,
    checkoutPlan: true,
  },
  {
    name: 'Pro',
    description: 'Plan personalizado para vender mas por WhatsApp',
    price: { monthly: 99, yearly: 79 },
    priceBefore: null as number | null,
    trial: null as string | null,
    features: [
      'Conversaciones ilimitadas',
      'Hasta 3 numeros WhatsApp',
      'Entrenar bot con texto, PDFs y URLs',
      'Catalogo ilimitado de productos',
      'Bot envia fotos y catalogos',
      'Metodos de pago configurables',
      'Dashboard de metricas en tiempo real',
      'Deteccion de intencion de compra',
      'Soporte prioritario 24/7',
    ],
    cta: 'Contactar soporte',
    ctaLink: `https://wa.me/${WHATSAPP_SOPORTE}?text=${encodeURIComponent('Hola, me interesa el plan de 99 dolares.')}`,
    highlighted: false,
    whatsappMessage: 'Hola, me interesa el plan de 99 dolares.',
    checkoutPlan: false,
  },
  {
    name: 'Business',
    description: 'Plan personalizado para equipos con control total',
    price: { monthly: 150, yearly: 120 },
    priceBefore: null as number | null,
    trial: null as string | null,
    features: [
      'Todo lo de Pro',
      'Numeros WhatsApp ilimitados',
      'Multiples agentes por cuenta',
      'Multi-organizacion',
      'API y webhooks',
      'Integraciones personalizadas',
      'Gestor de cuenta dedicado',
      'SLA 99.9%',
    ],
    cta: 'Contactar soporte',
    ctaLink: `https://wa.me/${WHATSAPP_SOPORTE}?text=${encodeURIComponent('Hola, me interesa el plan de 150 dolares.')}`,
    highlighted: false,
    whatsappMessage: 'Hola, me interesa el plan de 150 dolares.',
    checkoutPlan: false,
  },
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
    q: 'Necesito otro numero de WhatsApp?',
    a: 'No. Conectas tu mismo numero escaneando un codigo QR. Tu numero sigue funcionando normal.',
  },
  {
    q: 'Como entreno al bot?',
    a: 'Desde el dashboard puedes escribir informacion, subir PDFs o pegar la URL de tu web. El bot procesa todo y aprende sobre tu negocio.',
  },
  {
    q: 'El bot puede enviar fotos de mis productos?',
    a: 'Si. El bot envia fotos, catalogos y cualquier archivo que subas al sistema de forma automatica.',
  },
  {
    q: 'Puedo personalizar el flujo de ventas?',
    a: 'Claro. Puedes adaptar guiones, respuestas y rutas de conversion segun tu rubro y operacion.',
  },
  {
    q: 'Hay compromiso de permanencia?',
    a: 'No. Cancela cuando quieras, sin penalizaciones ni cargos ocultos.',
  },
];

const MOTION_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function getOfertaEndTime() {
  if (typeof window === 'undefined') return null;
  const key = 'wazapp_oferta_end';
  const end = sessionStorage.getItem(key);
  if (!end) {
    const t = new Date();
    t.setDate(t.getDate() + 2);
    sessionStorage.setItem(key, t.getTime().toString());
    return t.getTime();
  }
  return parseInt(end, 10);
}

function useCountdown() {
  const [left, setLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  useEffect(() => {
    const endMs = getOfertaEndTime();
    if (!endMs) return;
    const tick = () => {
      const diff = Math.max(0, endMs - Date.now());
      if (diff <= 0) { setLeft({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return left;
}

function ActivityTicker() {
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
            className="w-[220px] shrink-0 border-r border-app-line px-5 py-6 last:border-r-0"
          >
            <p className="text-[12px] font-semibold text-app-ink">{item.name}</p>
            <p className="text-[11px] text-app-muted">{item.pair}</p>
            <p className="mt-2.5 text-xl font-bold text-app-ink font-professional tabular-nums">{item.price}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function LandingPageInner() {
  const { user, loading } = useAuth();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const countdown = useCountdown();

  useEffect(() => {
    if (!loading && user) { window.location.href = '/chats'; }
  }, [user, loading]);

  const handleCheckout = () => setShowEmailModal(true);

  const handleCheckoutWithEmail = async () => {
    const email = checkoutEmail.trim();
    if (!email) { alert('Introduce tu correo para continuar.'); return; }
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) { window.location.href = data.url; return; }
      alert(data.error || 'Error al iniciar el pago');
    } catch {
      alert('Error de conexion. Intenta de nuevo.');
    } finally {
      setCheckoutLoading(false);
    }
  };

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

      {/* ?? HERO ?? */}
      <section className="relative pt-36 lg:pt-48 pb-28 lg:pb-36 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, ease: MOTION_EASE }}
          >
            <SectionLabel>Automatizacion para ventas por chat</SectionLabel>
            <h1 className="text-[2.6rem] sm:text-[3.8rem] lg:text-[4.8rem] font-bold tracking-[-0.04em] leading-[0.96]">
              Bot web + bot WhatsApp
              <span className="block text-gradient-brand mt-2">para vender mas todos los dias</span>
            </h1>
            <p className="mt-8 text-[1.08rem] text-app-muted max-w-xl leading-relaxed">
              Wazapp.ai centraliza chats, responde con IA y acelera cierres en un solo CRM conversacional.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3.5">
              <a
                href="/register"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors shadow-md shadow-brand-500/20"
              >
                Empezar gratis
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl border border-app-line bg-white text-app-ink font-semibold hover:bg-app-field transition-colors"
              >
                Ver precios
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
                src="https://images.unsplash.com/photo-1611746872915-64382b5c76da?auto=format&fit=crop&w=1400&q=80"
                alt="WhatsApp en telefono movil"
                className="w-full h-[400px] sm:h-[500px] object-cover rounded-[24px]"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ?? TICKER ?? */}
      <section id="features" className="py-14 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-app-line">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-app-muted mb-8">Indicadores en tiempo real</p>
          <h2 className="text-center text-[2rem] sm:text-4xl lg:text-[3rem] font-bold tracking-[-0.035em] mb-10">
            Rendimiento de tu operacion comercial
          </h2>
          <ActivityTicker />
        </div>
      </section>

      {/* ?? PRECIOS (COMPLETO) ?? */}
      <section id="pricing" className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <SectionLabel>Precios</SectionLabel>
            <h2 className="text-[2rem] sm:text-4xl lg:text-[3rem] font-bold tracking-[-0.035em] mb-5">
              Planes para cada etapa de tu negocio
            </h2>
            <p className="text-base text-app-muted max-w-xl mx-auto leading-relaxed">
              Conecta tu WhatsApp con QR, entrena el bot con tu informacion y empieza a vender en automatico.
            </p>
          </div>

          {/* Toggle mensual/anual */}
          <div className="flex items-center justify-center mt-10 mb-14">
            <div className="inline-flex items-center p-[1px] rounded-2xl bg-gradient-to-br from-brand-400/30 via-app-line to-brand-600/20 shadow-app-card-premium">
              <div className="inline-flex items-center bg-white rounded-[15px] p-1 shadow-inner shadow-black/[0.02]">
                <button
                  onClick={() => setBilling('monthly')}
                  className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    billing === 'monthly'
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                      : 'text-app-muted hover:text-app-ink'
                  }`}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setBilling('yearly')}
                  className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
                    billing === 'yearly'
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                      : 'text-app-muted hover:text-app-ink'
                  }`}
                >
                  Anual
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                    billing === 'yearly'
                      ? 'bg-emerald-500/15 text-emerald-700'
                      : 'bg-emerald-500/10 text-emerald-600'
                  }`}>
                    -20%
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {plans.map((plan) => {
              const price = billing === 'monthly' ? plan.price.monthly : plan.price.yearly;
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, ease: MOTION_EASE }}
                  className={`relative rounded-[26px] transition-all duration-300 ${
                    plan.highlighted
                      ? 'p-[1px] bg-gradient-to-br from-brand-400/45 via-app-line to-brand-600/35 shadow-app-card-premium lg:scale-[1.04]'
                      : 'bg-white border border-app-line hover:border-brand-500/20 shadow-app-card-premium hover:shadow-app-card-premium-hover'
                  }`}
                >
                  <div className="relative h-full rounded-[25px] bg-white overflow-hidden">
                    {plan.highlighted && <div className="h-1 bg-gradient-to-r from-brand-800 via-brand-500 to-brand-400" />}

                    {plan.highlighted && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-500 text-white shadow-md shadow-brand-500/20 ring-1 ring-white/20">
                          Recomendado
                        </span>
                      </div>
                    )}

                    <div className="p-8 lg:p-9">
                      <h3 className="text-xl font-bold mb-1.5 text-app-ink">{plan.name}</h3>
                      <p className="text-sm mb-8 text-app-muted leading-relaxed">{plan.description}</p>

                      <div className="mb-8">
                        {plan.priceBefore != null && billing === 'monthly' && (
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="text-sm text-app-muted line-through">${plan.priceBefore}/mes</span>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700">Por tiempo limitado</span>
                          </div>
                        )}
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-bold tracking-tight text-app-ink font-professional">${price}</span>
                          <span className="text-base font-medium text-app-muted">/mes</span>
                        </div>
                        {billing === 'yearly' ? (
                          <p className="text-xs mt-2 text-app-muted">
                            <span className="line-through">${plan.price.monthly}/mes</span> facturado anual
                          </p>
                        ) : (
                          <p className="text-xs mt-2 text-app-muted">Facturacion mensual</p>
                        )}
                        {plan.highlighted && countdown && (
                          <div className="mt-3.5 flex items-center gap-2 text-xs text-app-muted">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Oferta termina en:</span>
                            <span className="font-mono font-semibold text-amber-700 tabular-nums">
                              {countdown.d}d {countdown.h}h {countdown.m}m {countdown.s}s
                            </span>
                          </div>
                        )}
                        {plan.trial && <p className="text-sm font-medium text-emerald-600 mt-2.5">{plan.trial}</p>}
                      </div>

                      {plan.checkoutPlan ? (
                        <button
                          type="button"
                          onClick={handleCheckout}
                          disabled={checkoutLoading}
                          className="group flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-full font-semibold text-sm transition-all duration-300 mb-8 bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {checkoutLoading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Redirigiendo a pago...</>
                          ) : (
                            <>{plan.cta} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" /></>
                          )}
                        </button>
                      ) : (
                        <a
                          href={plan.ctaLink}
                          target={plan.ctaLink.startsWith('http') ? '_blank' : undefined}
                          rel={plan.ctaLink.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="group flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl font-semibold text-sm transition-all duration-300 mb-8 bg-app-field/80 hover:bg-app-field text-app-ink border border-app-line"
                        >
                          {plan.cta}
                          {plan.whatsappMessage ? (
                            <MessageSquare className="w-4 h-4" />
                          ) : (
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                          )}
                        </a>
                      )}

                      <div className="border-t mb-6 border-app-line" />
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-4 text-app-muted">Incluye</p>
                      <ul className="space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 bg-emerald-500/10 text-emerald-600">
                              <Check className="w-3 h-3" strokeWidth={3} />
                            </div>
                            <span className="text-sm leading-snug text-app-muted">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Trust badges */}
          <p className="mt-10 text-center text-sm text-app-muted max-w-lg mx-auto">
            14 dias de prueba gratis. Despues se cobran $50/mes de forma automatica. Puedes cancelar en cualquier momento.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-[13px] text-app-muted">
            {['14 dias gratis', 'Cancela cuando quieras', 'Soporte en espanol'].map((t) => (
              <div key={t} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/12 ring-1 ring-emerald-500/20">
                  <Check className="w-3 h-3 text-emerald-600" strokeWidth={2.5} />
                </span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ?? BENEFICIOS ?? */}
      <section id="benefits" className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8 bg-white border-t border-app-line">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-14 lg:gap-20 items-center">
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.48, ease: MOTION_EASE }}
          >
            <SectionLabel>Beneficios clave</SectionLabel>
            <h2 className="text-[2rem] sm:text-4xl lg:text-[3rem] font-bold tracking-[-0.035em] leading-tight mb-8">
              Lo que hace unico a
              <span className="block">Wazapp.ai</span>
            </h2>
            <div className="space-y-5">
              {[
                'Bot de WhatsApp para responder, vender y recuperar clientes',
                'Bot web para captar leads desde tu sitio en segundos',
                'CRM con pedidos, pagos y seguimiento comercial en una sola vista',
              ].map((item) => (
                <div key={item} className="flex items-start gap-4 text-app-muted">
                  <span className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-brand-600" />
                  </span>
                  <p className="text-[15px] leading-relaxed">{item}</p>
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
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80"
              alt="Equipo de ventas trabajando"
              className="w-full h-[420px] sm:h-[480px] object-cover rounded-[26px] border border-app-line"
              loading="lazy"
            />
          </motion.div>
        </div>
      </section>

      {/* ?? FLUJO DE TRABAJO ?? */}
      <section id="services" className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8 bg-white border-y border-app-line">
        <div className="max-w-7xl mx-auto text-center">
          <SectionLabel>Flujo de trabajo</SectionLabel>
          <h2 className="text-[2rem] sm:text-4xl lg:text-[3rem] font-bold tracking-[-0.035em] mb-6 max-w-4xl mx-auto">
            Un flujo completo para atraer, responder y cerrar ventas
          </h2>
          <p className="text-base text-app-muted max-w-2xl mx-auto mb-16 leading-relaxed">
            Desde el primer mensaje del cliente hasta el cierre del pedido, todo en un solo panel.
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.58, ease: MOTION_EASE }}
            className="rounded-[26px] border border-app-line bg-white p-5 sm:p-6 md:p-8"
          >
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80"
              alt="Dashboard de analiticas y ventas"
              className="w-full h-[320px] sm:h-[420px] md:h-[520px] object-cover rounded-[22px]"
              loading="lazy"
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mt-8 text-left">
              {[
                ['Planificacion', 'Mapea el flujo de conversaciones y ventas.'],
                ['Optimizacion', 'Mejora respuestas, UX y conversion.'],
                ['Pruebas', 'Valida escenarios reales de atencion.'],
                ['Soporte', 'Despliega y escala con soporte continuo.'],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-2xl border border-app-line bg-app-field/30 p-5">
                  <h3 className="font-semibold text-app-ink mb-1.5">{title}</h3>
                  <p className="text-sm text-app-muted leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ?? POR QUE WAZAPP ?? */}
      <section id="why-wazapp" className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-14 lg:gap-20 items-center">
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: MOTION_EASE }}
          >
            <img
              src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80"
              alt="Reunion de negocios y estrategia"
              className="w-full h-[380px] sm:h-[440px] object-cover rounded-[24px] border border-app-line"
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
            <SectionLabel>Por que Wazapp.ai</SectionLabel>
            <h2 className="text-[2rem] sm:text-4xl lg:text-[3rem] font-bold tracking-[-0.035em] leading-tight mb-5">
              Crea tu sistema comercial omnicanal hoy
            </h2>
            <p className="text-lg text-app-muted mb-10 leading-relaxed">
              Disenado para marcas que venden por chat y necesitan automatizacion, control y crecimiento continuo.
            </p>
            <div className="space-y-4">
              {[
                ['Bot de WhatsApp con IA', MessageSquare],
                ['Bot web para captacion 24/7', Globe],
                ['Metricas y conversion en tiempo real', BarChart3],
              ].map(([label, Icon]) => (
                <div key={label as string} className="flex items-center justify-between border-b border-app-line py-5">
                  <div className="flex items-center gap-4">
                    <span className="w-11 h-11 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-brand-600" />
                    </span>
                    <span className="font-medium text-app-ink text-[15px]">{label as string}</span>
                  </div>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ?? PERKS ?? */}
      <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8 bg-white border-y border-app-line">
        <div className="max-w-7xl mx-auto text-center">
          <SectionLabel>Siempre a tu lado</SectionLabel>
          <h2 className="text-[2rem] sm:text-4xl lg:text-[3rem] font-bold tracking-[-0.035em] mb-16">
            Potencia tu equipo con Wazapp.ai
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {perks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.42, delay: idx * 0.06, ease: MOTION_EASE }}
                  className="rounded-[22px] border border-app-line bg-white p-8 shadow-app-card hover:shadow-app-card-premium transition-shadow duration-300"
                >
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-brand-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-app-ink mb-2.5">{item.title}</h3>
                  <p className="text-app-muted text-sm leading-relaxed">{item.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ?? FAQS ?? */}
      <section id="faqs" className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>Preguntas frecuentes</SectionLabel>
            <h2 className="text-[2rem] sm:text-4xl lg:text-[3rem] font-bold tracking-[-0.035em]">
              Todo lo que necesitas saber
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((item) => (
              <details key={item.q} className="group rounded-[22px] border border-app-line bg-white shadow-app-card-premium transition-[border-color,box-shadow] overflow-hidden hover:border-brand-500/15 open:border-app-line-strong open:shadow-app-card-premium-hover">
                <summary className="flex items-center justify-between cursor-pointer px-7 py-6 text-[15px] font-medium text-app-ink hover:text-app-muted transition-colors list-none [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="ml-4 flex-shrink-0 w-7 h-7 rounded-lg bg-app-field flex items-center justify-center text-app-muted group-open:rotate-45 transition-transform duration-200">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="6" y1="1" x2="6" y2="11" />
                      <line x1="1" y1="6" x2="11" y2="6" />
                    </svg>
                  </span>
                </summary>
                <div className="px-7 pb-6">
                  <p className="text-sm text-app-muted leading-relaxed">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ?? CTA FINAL ?? */}
      <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8 bg-white border-t border-app-line">
        <div className="max-w-3xl mx-auto text-center">
          <SectionLabel>Siguiente paso</SectionLabel>
          <div className="w-14 h-14 mx-auto mb-7 rounded-2xl bg-white border border-app-line flex items-center justify-center ring-1 ring-app-line shadow-app-card">
            <Shield className="w-7 h-7 text-app-ink" />
          </div>
          <h2 className="text-[2rem] sm:text-4xl lg:text-[3rem] font-bold tracking-[-0.035em] mb-5">
            Escala tu negocio con Wazapp.ai
          </h2>
          <p className="text-lg text-app-muted mb-12 leading-relaxed max-w-xl mx-auto">
            Activa tu bot web y tu bot WhatsApp para responder mas rapido, vender mejor y escalar sin perder control.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/register"
              className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors shadow-md shadow-brand-500/20"
            >
              Empezar gratis
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/contacto"
              className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 rounded-2xl border border-app-line bg-white text-app-ink font-semibold hover:bg-app-field transition-colors"
            >
              Hablar con ventas
            </a>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-app-muted">
            {['14 dias gratis', 'Sin compromisos', '100% seguro'].map((t) => (
              <span key={t} className="inline-flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ?? EMAIL MODAL (checkout) ?? */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => !checkoutLoading && setShowEmailModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="rounded-[26px] p-[1px] bg-gradient-to-br from-brand-400/25 via-app-line to-brand-600/15 shadow-app-card-premium max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-[25px] bg-white p-7 sm:p-8">
              <h3 className="text-lg font-semibold text-app-ink mb-2">Introduce tu correo</h3>
              <p className="text-sm text-app-muted mb-5 leading-relaxed">
                Lo usamos para tu cuenta y facturacion. Si ya cancelaste una suscripcion antes, no tendras de nuevo los 14 dias gratis.
              </p>
              <input
                type="email"
                value={checkoutEmail}
                onChange={(e) => setCheckoutEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full px-4 py-3.5 rounded-2xl bg-app-field border border-app-line text-app-ink placeholder-app-muted focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 outline-none mb-5"
                onKeyDown={(e) => e.key === 'Enter' && handleCheckoutWithEmail()}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => !checkoutLoading && setShowEmailModal(false)}
                  className="flex-1 py-3 rounded-2xl text-sm font-medium text-app-muted hover:text-app-ink border border-app-line hover:bg-app-field/80 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCheckoutWithEmail}
                  disabled={checkoutLoading}
                  className="flex-1 py-3 rounded-full text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-brand-500/20"
                >
                  {checkoutLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirigiendo...</> : 'Continuar a pago'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

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
