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
  QrCode,
  Brain,
  ShoppingBag,
  Star,
  Zap,
} from 'lucide-react';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import Navbar from './landing/Navbar';
import Footer from './landing/Footer';
import SectionLabel from './landing/SectionLabel';

const WHATSAPP_SOPORTE = '51933484150';

const plans = [
  {
    name: 'Starter',
    description: 'CRM completo para vender por chat: inbox, pedidos, catálogo y bot',
    price: { monthly: 50, yearly: 40 },
    priceBefore: 70,
    trial: '14 días de prueba gratis',
    features: [
      'Inbox multicanal (WhatsApp + web + Shopify)',
      'Dashboard con chats y pedidos',
      'Pedidos con estados y seguimiento',
      'Hasta 300 productos en catálogo',
      'Entrenar bot con texto, URLs y PDFs',
      'Métodos de pago configurables',
      '1 número WhatsApp (conexión QR)',
      'Modo bot y modo humano por conversación',
      'Widget web desde Configuración',
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
    description: 'Más volumen: varios números y catálogo sin tope en todos los canales',
    price: { monthly: 99, yearly: 79 },
    priceBefore: null as number | null,
    trial: null as string | null,
    features: [
      'Todo lo del plan Starter, ampliado',
      'Hasta 3 números de WhatsApp',
      'Catálogo ilimitado (Shopify, web y CMR sin tope de productos)',
      'Bot envía fotos y catálogos en el chat',
      'Detección de intención de compra y alertas',
      'Dashboard y embudo con más carga operativa',
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
    description: 'Equipos y marcas que necesitan escala, API y varias organizaciones',
    price: { monthly: 150, yearly: 120 },
    priceBefore: null as number | null,
    trial: null as string | null,
    features: [
      'Todo lo del plan Pro',
      'Números WhatsApp ilimitados',
      'Múltiples agentes por cuenta',
      'Multi-organización',
      'API y webhooks',
      'Integraciones personalizadas (CRM, ERP, data)',
      'Gestor de cuenta dedicado',
      'SLA 99.9 %',
    ],
    cta: 'Contactar soporte',
    ctaLink: `https://wa.me/${WHATSAPP_SOPORTE}?text=${encodeURIComponent('Hola, me interesa el plan de 150 dolares.')}`,
    highlighted: false,
    whatsappMessage: 'Hola, me interesa el plan de 150 dolares.',
    checkoutPlan: false,
  },
];

const steps = [
  {
    num: '01',
    icon: QrCode,
    title: 'Conecta tu WhatsApp',
    desc: 'Escanea un código QR desde tu celular. Sin APIs complicadas, sin otro número. Listo en 30 segundos.',
  },
  {
    num: '02',
    icon: Brain,
    title: 'Entrena tu bot',
    desc: 'Sube PDFs, pega URLs o escribe información. El bot aprende todo sobre tu negocio y productos.',
  },
  {
    num: '03',
    icon: ShoppingBag,
    title: 'Vende en automático',
    desc: 'Desde el CMR ves pedidos y el bot responde en el inbox: fotos, catálogo y registro de pedidos cuando el cliente confirma.',
  },
];

const perks = [
  { title: 'Soporte 24/7', text: 'Atención continua para resolver dudas de ventas y operaciones.', icon: Headphones },
  { title: 'Comunidad', text: 'Aprende con otros equipos que venden por WhatsApp todos los días.', icon: Sparkles },
  { title: 'Academia', text: 'Guías prácticas para mejorar conversión, respuesta y cierre.', icon: Rocket },
  { title: 'Integración rápida', text: 'En Configuración: widget web, Shopify y métodos de pago enlazados al mismo CMR.', icon: Zap },
];

const faqs = [
  { q: 'Que es Wazapp.ai?', a: 'Wazapp.ai es una plataforma de comercio conversacional para centralizar chats, automatizar seguimientos y convertir mas leads.' },
  { q: 'Necesito otro numero de WhatsApp?', a: 'No. Conectas tu mismo numero escaneando un codigo QR. Tu numero sigue funcionando normal.' },
  { q: 'Como entreno al bot?', a: 'Desde el dashboard puedes escribir informacion, subir PDFs o pegar la URL de tu web. El bot procesa todo y aprende sobre tu negocio.' },
  { q: 'El bot puede enviar fotos de mis productos?', a: 'Si. El bot envia fotos, catalogos y cualquier archivo que subas al sistema de forma automatica.' },
  { q: 'Puedo personalizar el flujo de ventas?', a: 'Claro. Puedes adaptar guiones, respuestas y rutas de conversion segun tu rubro y operacion.' },
  { q: 'Hay compromiso de permanencia?', a: 'No. Cancela cuando quieras, sin penalizaciones ni cargos ocultos.' },
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

const OFF_WHITE = 'bg-[#f9fafb]';

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
      <div className="min-h-screen flex items-center justify-center bg-white font-professional">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={20} className="animate-spin text-brand-600" />
          <p className="text-[13px] text-app-muted font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-professional antialiased text-app-ink">
      <Navbar showAnnouncement />

      {/* ??????????? HERO ??????????? */}
      <section className="relative pt-36 lg:pt-48 pb-24 lg:pb-32 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-brand-500/[0.04] blur-[120px]" aria-hidden />
        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, ease: MOTION_EASE }}
          >
            <div className="inline-flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-full border border-app-line bg-white/90 backdrop-blur-md shadow-sm mb-8">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[13px] text-app-muted font-medium">14 días de prueba gratis</span>
            </div>

            <h1 className="text-[2.5rem] sm:text-[3.5rem] lg:text-[4.25rem] font-bold tracking-[-0.04em] leading-[1.02]">
              Tu vendedor en WhatsApp,
              <span className="block text-gradient-brand mt-1">activo 24/7</span>
            </h1>
            <p className="mt-7 text-lg text-app-muted max-w-lg leading-relaxed">
              Conecta tu WhatsApp con QR, entrena el bot con tu información y empieza a vender en automático desde el día uno.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3.5">
              <a
                href="/register"
                className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
              >
                Empezar gratis
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl border border-app-line bg-white text-app-ink font-semibold hover:bg-app-field/60 transition-colors"
              >
                Ver precios
              </a>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {[
                  'bg-brand-200 text-brand-700',
                  'bg-emerald-200 text-emerald-700',
                  'bg-amber-200 text-amber-700',
                  'bg-violet-200 text-violet-700',
                  'bg-rose-200 text-rose-700',
                ].map((cls, i) => (
                  <div key={i} className={`w-9 h-9 rounded-full ${cls} flex items-center justify-center text-xs font-bold ring-2 ring-white`}>
                    {['JC', 'ML', 'KR', 'AS', 'PD'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-semibold text-app-ink ml-1">4.9</span>
                </div>
                <p className="text-xs text-app-muted mt-0.5">+500 negocios activos</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.12, ease: MOTION_EASE }}
          >
            <div className="relative rounded-[28px] border border-app-line bg-white shadow-2xl shadow-black/[0.06] p-3">
              <img
                src="https://images.unsplash.com/photo-1611746872915-64382b5c76da?auto=format&fit=crop&w=1400&q=80"
                alt="WhatsApp en telefono movil"
                className="w-full h-[380px] sm:h-[480px] object-cover rounded-[20px]"
                loading="eager"
              />
              <div className="absolute -bottom-5 -left-5 sm:-left-8 rounded-2xl border border-app-line bg-white shadow-xl shadow-black/[0.06] p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-app-muted">Ventas hoy</p>
                  <p className="text-lg font-bold text-app-ink tabular-nums">+S/ 4,280</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ??????????? STATS STRIP ??????????? */}
      <section className={`py-14 lg:py-16 px-4 sm:px-6 lg:px-8 ${OFF_WHITE} border-y border-app-line`}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { value: '500+', label: 'Negocios activos' },
              { value: '2M+', label: 'Mensajes procesados' },
              { value: '99.9%', label: 'Uptime garantizado' },
              { value: '< 2s', label: 'Respuesta promedio' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-app-ink tracking-tight font-professional tabular-nums">{stat.value}</p>
                <p className="mt-1.5 text-xs text-app-muted font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ??????????? COMO FUNCIONA (3 pasos) ??????????? */}
      <section id="how-it-works" className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 lg:mb-20">
            <SectionLabel>Como funciona</SectionLabel>
            <h2 className="text-[2rem] sm:text-4xl lg:text-[3rem] font-bold tracking-[-0.035em] mb-5">
              De cero a ventas automaticas en 3 pasos
            </h2>
            <p className="text-base text-app-muted max-w-xl mx-auto leading-relaxed">
              Sin codigo, sin configuraciones largas. Conecta y empieza a vender hoy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: idx * 0.08, ease: MOTION_EASE }}
                  className="group relative"
                >
                  <div className="absolute -inset-px rounded-[24px] bg-gradient-to-br from-brand-500/10 via-transparent to-brand-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative rounded-[23px] border border-app-line bg-white p-8 lg:p-9 shadow-sm hover:shadow-lg hover:border-brand-500/20 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-[2.5rem] font-bold text-brand-500/20 font-professional leading-none">{step.num}</span>
                      <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-brand-600" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-app-ink mb-2.5 tracking-tight">{step.title}</h3>
                    <p className="text-sm text-app-muted leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ??????????? PRECIOS ??????????? */}
      <section id="pricing" className={`py-28 lg:py-36 px-4 sm:px-6 lg:px-8 ${OFF_WHITE}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <SectionLabel>Precios</SectionLabel>
            <h2 className="text-[2rem] sm:text-4xl lg:text-[3rem] font-bold tracking-[-0.035em] mb-5">
              Planes para cada etapa de tu negocio
            </h2>
            <p className="text-base text-app-muted max-w-xl mx-auto leading-relaxed">
              Los mismos módulos que ves dentro del producto: inbox, pedidos, productos, bot y pagos — con límites claros por plan.
            </p>
          </div>

          <div className="flex items-center justify-center mt-10 mb-14">
            <div className="inline-flex items-center p-[1px] rounded-2xl bg-gradient-to-br from-brand-400/30 via-app-line to-brand-600/20 shadow-sm">
              <div className="inline-flex items-center bg-white rounded-[15px] p-1">
                <button
                  onClick={() => setBilling('monthly')}
                  className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    billing === 'monthly' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20' : 'text-app-muted hover:text-app-ink'
                  }`}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setBilling('yearly')}
                  className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
                    billing === 'yearly' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20' : 'text-app-muted hover:text-app-ink'
                  }`}
                >
                  Anual
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                    billing === 'yearly' ? 'bg-emerald-500/15 text-emerald-700' : 'bg-emerald-500/10 text-emerald-600'
                  }`}>-20%</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-7 items-start lg:py-3">
            {plans.map((plan, idx) => {
              const price = billing === 'monthly' ? plan.price.monthly : plan.price.yearly;
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.06, ease: MOTION_EASE }}
                  className={`relative rounded-[26px] transition-all duration-300 ${
                    plan.highlighted
                      ? 'p-[1px] bg-gradient-to-br from-brand-400/50 via-brand-300/20 to-brand-600/40 shadow-xl shadow-brand-500/10 lg:scale-[1.03]'
                      : 'bg-white border border-app-line hover:border-brand-500/20 shadow-sm hover:shadow-lg'
                  }`}
                >
                  <div
                    className={`relative h-full rounded-[25px] bg-white ${
                      plan.highlighted ? 'overflow-visible' : 'overflow-hidden'
                    }`}
                  >
                    {plan.highlighted && <div className="h-1 bg-gradient-to-r from-brand-700 via-brand-500 to-brand-300" />}

                    <div className="p-8 lg:p-9">
                      {plan.highlighted && (
                        <div className="flex justify-center mb-5 -mt-2">
                          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-500 text-white shadow-md shadow-brand-500/25 ring-1 ring-white/30">
                            Recomendado
                          </span>
                        </div>
                      )}
                      <h3 className="text-xl font-bold mb-1.5 text-app-ink">{plan.name}</h3>
                      <p className="text-sm mb-7 text-app-muted leading-relaxed">{plan.description}</p>

                      <div className="mb-7">
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
                          <p className="text-xs mt-2 text-app-muted"><span className="line-through">${plan.price.monthly}/mes</span> facturado anual</p>
                        ) : (
                          <p className="text-xs mt-2 text-app-muted">Facturación mensual</p>
                        )}
                        {plan.highlighted && countdown && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-app-muted">
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
                          className="group flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-full font-semibold text-sm mb-7 bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
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
                          className="group flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl font-semibold text-sm mb-7 bg-app-field/60 hover:bg-app-field text-app-ink border border-app-line transition-colors"
                        >
                          {plan.cta}
                          {plan.whatsappMessage ? <MessageSquare className="w-4 h-4" /> : <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />}
                        </a>
                      )}

                      <div className="border-t mb-5 border-app-line" />
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-4 text-app-muted">Incluye</p>
                      <ul className="space-y-2.5">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 bg-emerald-500/10 text-emerald-600">
                              <Check className="w-3 h-3" strokeWidth={3} />
                            </div>
                            <span className="text-sm leading-snug text-app-muted">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <p className="mt-10 text-center text-sm text-app-muted max-w-lg mx-auto">
            14 días de prueba gratis en Starter. Después $50/mes con Stripe. Cancela cuando quieras.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-[13px] text-app-muted">
            {['14 días gratis', 'Cancela cuando quieras', 'Soporte en español'].map((t) => (
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

      {/* ??????????? BENEFICIOS ??????????? */}
      <section id="benefits" className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <motion.div
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
                [
                  'Inbox multicanal y bot',
                  'Misma bandeja para WhatsApp, web y Shopify: el bot responde y tú tomas el control en un clic.',
                ],
                [
                  'CRM de pedidos y catálogo',
                  'Productos, estados de pedido y seguimiento alineados con lo que negocias en el chat.',
                ],
                [
                  'Dashboard y configuración',
                  'Métricas resumidas, métodos de pago, entrenamiento del bot y widget web desde un solo panel.',
                ],
              ].map(([title, desc]) => (
                <div key={title} className="flex items-start gap-4">
                  <span className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-brand-600" />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-app-ink">{title}</p>
                    <p className="text-sm text-app-muted mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.52, delay: 0.06, ease: MOTION_EASE }}
          >
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80"
              alt="Equipo de ventas trabajando"
              className="w-full h-[380px] sm:h-[460px] object-cover rounded-[24px] border border-app-line shadow-sm"
              loading="lazy"
            />
          </motion.div>
        </div>
      </section>

      {/* ??????????? POR QUE WAZAPP ??????????? */}
      <section id="why-wazapp" className={`py-28 lg:py-36 px-4 sm:px-6 lg:px-8 ${OFF_WHITE} border-y border-app-line`}>
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
              alt="Reunion de negocios"
              className="w-full h-[360px] sm:h-[420px] object-cover rounded-[24px] border border-app-line shadow-sm"
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
              Crea tu sistema de ventas omnicanal hoy
            </h2>
            <p className="text-lg text-app-muted mb-10 leading-relaxed">
              Diseñado para equipos que viven en el chat: el CMR refleja pedidos, productos y conversaciones en vivo.
            </p>
            <div className="space-y-1">
              {[
                ['Inbox, pedidos y productos conectados', MessageSquare],
                ['Entrenar bot y métodos de pago en el mismo flujo', Globe],
                ['Dashboard con visión de embudo y operación', BarChart3],
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

      {/* ??????????? PERKS ??????????? */}
      <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <SectionLabel>Siempre a tu lado</SectionLabel>
          <h2 className="text-[2rem] sm:text-4xl lg:text-[3rem] font-bold tracking-[-0.035em] mb-16">
            Potencia tu equipo con Wazapp.ai
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05, ease: MOTION_EASE }}
                  className="rounded-[22px] border border-app-line bg-white p-7 shadow-sm hover:shadow-lg hover:border-brand-500/15 transition-all duration-300 text-left"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <h3 className="text-base font-semibold text-app-ink mb-2">{item.title}</h3>
                  <p className="text-app-muted text-[13px] leading-relaxed">{item.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ??????????? FAQS ??????????? */}
      <section id="faqs" className={`py-28 lg:py-36 px-4 sm:px-6 lg:px-8 ${OFF_WHITE} border-t border-app-line`}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>Preguntas frecuentes</SectionLabel>
            <h2 className="text-[2rem] sm:text-4xl lg:text-[3rem] font-bold tracking-[-0.035em]">
              Todo lo que necesitas saber
            </h2>
          </div>
          <div className="space-y-3.5">
            {faqs.map((item) => (
              <details key={item.q} className="group rounded-[20px] border border-app-line bg-white shadow-sm transition-[border-color,box-shadow] overflow-hidden hover:border-brand-500/15 open:shadow-md">
                <summary className="flex items-center justify-between cursor-pointer px-7 py-5 text-[15px] font-medium text-app-ink list-none [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="ml-4 flex-shrink-0 w-7 h-7 rounded-lg bg-app-field flex items-center justify-center text-app-muted group-open:rotate-45 transition-transform duration-200">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="6" y1="1" x2="6" y2="11" /><line x1="1" y1="6" x2="11" y2="6" /></svg>
                  </span>
                </summary>
                <div className="px-7 pb-5">
                  <p className="text-sm text-app-muted leading-relaxed">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ??????????? CTA FINAL ??????????? */}
      <section className="relative py-28 lg:py-36 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-500/[0.03] via-transparent to-transparent" aria-hidden />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 mx-auto mb-7 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center shadow-sm">
            <Shield className="w-7 h-7 text-brand-600" />
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
              className="group inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
            >
              Empezar gratis
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="/contacto"
              className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 rounded-2xl border border-app-line bg-white text-app-ink font-semibold hover:bg-app-field/60 transition-colors"
            >
              Hablar con ventas
            </a>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-5 sm:gap-6 text-sm text-app-muted">
            {['14 días gratis', 'Sin compromisos', '100% seguro'].map((t) => (
              <span key={t} className="inline-flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ??????????? EMAIL MODAL ??????????? */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => !checkoutLoading && setShowEmailModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="rounded-[26px] p-[1px] bg-gradient-to-br from-brand-400/25 via-app-line to-brand-600/15 shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-[25px] bg-white p-7 sm:p-8">
              <h3 className="text-lg font-semibold text-app-ink mb-2">Introduce tu correo</h3>
              <p className="text-sm text-app-muted mb-5 leading-relaxed">
                Lo usamos para tu cuenta y facturación. Si ya cancelaste antes, no tendrás 14 días gratis de nuevo.
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
                <button type="button" onClick={() => !checkoutLoading && setShowEmailModal(false)} className="flex-1 py-3 rounded-2xl text-sm font-medium text-app-muted hover:text-app-ink border border-app-line hover:bg-app-field/80 transition-colors">
                  Cancelar
                </button>
                <button type="button" onClick={handleCheckoutWithEmail} disabled={checkoutLoading} className="flex-1 py-3 rounded-full text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 transition-colors">
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
