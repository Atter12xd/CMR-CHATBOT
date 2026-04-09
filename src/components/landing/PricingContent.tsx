import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, MessageSquare, Brain, ShoppingBag, BarChart3, CreditCard, QrCode, Zap, Shield, Loader2, Clock } from 'lucide-react';
import MarketingHero from './MarketingHero';
import SectionLabel from './SectionLabel';



const WHATSAPP_SOPORTE = '51933484150';

const plans = [
  {
    name: 'Starter',
    description: 'Para negocios que quieren automatizar su atención',
    price: { monthly: 50, yearly: 40 },
    priceBefore: 70,
    trial: '14 días de prueba gratis',
    features: [
      'Conversaciones ilimitadas',
      '1 número de WhatsApp',
      'Entrenar bot con texto, URLs y PDFs',
      'Catálogo de hasta 300 productos',
      'Gestión de pedidos',
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
    description: 'Plan personalizado para vender más por WhatsApp',
    price: { monthly: 99, yearly: 79 },
    trial: null,
    features: [
      'Conversaciones ilimitadas',
      'Hasta 3 números WhatsApp',
      'Entrenar bot con texto, PDFs y URLs',
      'Catálogo ilimitado de productos',
      'Bot envía fotos y catálogos',
      'Métodos de pago configurables',
      'Dashboard de métricas en tiempo real',
      'Detección de intención de compra',
      'Soporte prioritario 24/7',
    ],
    cta: 'Contactar soporte',
    ctaLink: `https://wa.me/${WHATSAPP_SOPORTE}?text=${encodeURIComponent('Hola, me interesa el plan de 99 dólares.')}`,
    highlighted: false,
    whatsappMessage: 'Hola, me interesa el plan de 99 dólares.',
    checkoutPlan: false,
  },
  {
    name: 'Business',
    description: 'Plan personalizado para equipos con control total',
    price: { monthly: 150, yearly: 120 },
    trial: null,
    features: [
      'Todo lo de Pro',
      'Números WhatsApp ilimitados',
      'Múltiples agentes por cuenta',
      'Multi-organización',
      'API y webhooks',
      'Integraciones personalizadas',
      'Gestor de cuenta dedicado',
      'SLA 99.9%',
    ],
    cta: 'Contactar soporte',
    ctaLink: `https://wa.me/${WHATSAPP_SOPORTE}?text=${encodeURIComponent('Hola, me interesa el plan de 150 dólares.')}`,
    highlighted: false,
    whatsappMessage: 'Hola, me interesa el plan de 150 dólares.',
    checkoutPlan: false,
  },
];



const features = [
  {
    icon: QrCode,
    title: 'Conexión con QR',
    description: 'Escanea el código QR desde tu WhatsApp y listo. Sin eliminar tu número, sin configuraciones técnicas.',
    accent: 'brand' as const,
  },
  {
    icon: Brain,
    title: 'Bot que aprende tu negocio',
    description: 'Entrénalo con palabras, PDFs o la URL de tu web. En minutos sabe todo sobre tu empresa y productos.',
    accent: 'emerald' as const,
  },
  {
    icon: ShoppingBag,
    title: 'Catálogo y pedidos',
    description: 'Sube tus productos al sistema. El bot los muestra, detecta intención de compra y registra pedidos automáticamente.',
    accent: 'amber' as const,
  },
  {
    icon: MessageSquare,
    title: 'Chat en vivo',
    description: 'Ve todos los mensajes en tiempo real. Cambia entre modo bot y modo humano en cada conversación.',
    accent: 'brand' as const,
  },
  {
    icon: CreditCard,
    title: 'Métodos de pago',
    description: 'Configura tus métodos de pago y el bot los comparte con tus clientes cuando pregunten cómo pagar.',
    accent: 'emerald' as const,
  },
  {
    icon: Zap,
    title: 'Fotos y catálogos',
    description: 'El bot envía imágenes de productos, catálogos completos y toda la información que tus clientes necesitan.',
    accent: 'amber' as const,
  },
];


const accentMap = {
  brand: 'bg-brand-500/10 text-brand-600 group-hover:bg-brand-500/15 border border-brand-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500/15 border border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-600 group-hover:bg-amber-500/15 border border-amber-500/20',
};



const faqs = [
  {
    q: '¿Necesito otro número de WhatsApp?',
    a: 'No. Conectas tu mismo número de WhatsApp escaneando un código QR. Tu número sigue funcionando normal.',
  },
  {
    q: '¿Cómo entreno al bot?',
    a: 'Desde el dashboard puedes escribir información directamente, subir PDFs con tus datos, o pegar la URL de tu web. El bot procesa todo y aprende sobre tu negocio automáticamente.',
  },
  {
    q: '¿Puedo cambiar de plan en cualquier momento?',
    a: 'Sí. Sube o baja de plan cuando quieras. Los cambios se aplican de forma prorrateada en tu siguiente factura.',
  },
  {
    q: '¿Hay compromiso de permanencia?',
    a: 'No. Cancela cuando quieras, sin penalizaciones ni cargos ocultos.',
  },
  {
    q: '¿El bot puede enviar fotos de mis productos?',
    a: 'Sí. El bot envía fotos, catálogos y cualquier archivo que subas al sistema. Cuando un cliente pregunta por un producto, recibe la imagen automáticamente.',
  },
  {
    q: '¿Cómo sé si un cliente quiere comprar?',
    a: 'El sistema detecta intención de compra automáticamente. Cuando un cliente está a punto de comprar, recibes una alerta y el pedido se registra en tu dashboard.',
  },
];



function getOfertaEndTime() {
  if (typeof window === 'undefined') return null;
  const key = 'wazapp_oferta_end';
  let end = sessionStorage.getItem(key);
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
      const now = Date.now();
      const diff = Math.max(0, endMs - now);
      if (diff <= 0) {
        setLeft({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      const d = Math.floor(diff / (24 * 60 * 60 * 1000));
      const h = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const m = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      const s = Math.floor((diff % (60 * 1000)) / 1000);
      setLeft({ d, h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return left;
}

export default function PricingContent() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const countdown = useCountdown();

  const handleCheckout = async () => {
    setShowEmailModal(true);
  };

  const handleCheckoutWithEmail = async () => {
    const email = checkoutEmail.trim();
    if (!email) {
      alert('Introduce tu correo para continuar.');
      return;
    }
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      alert(data.error || 'Error al iniciar el pago');
    } catch (e) {
      alert('Error de conexión. Intenta de nuevo.');
    } finally {
      setCheckoutLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-app-shell text-app-ink font-professional antialiased">


      <MarketingHero maxWidth="md">
        <div className="inline-flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-full border border-app-line/90 dark:border-ref-border/90 bg-white/90 dark:bg-ref-card/90 backdrop-blur-md shadow-app-card mb-8 ring-1 ring-white/60 dark:ring-ref-border/50">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.45)]" />
          </span>
          <span className="text-[13px] text-app-muted font-medium tracking-tight">14 días de prueba gratis en el plan de $50</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-app-ink tracking-[-0.035em] leading-[1.08] mb-6 font-professional">
          Tu vendedor en WhatsApp,
          <span className="block mt-2 text-gradient-brand">activo 24/7</span>
        </h1>
        <p className="text-base sm:text-lg text-app-muted max-w-xl mx-auto leading-relaxed">
          Conecta tu WhatsApp con QR, entrena el bot con tu información y empieza a vender en automático.
        </p>
      </MarketingHero>



      <section className="pb-10 px-4 sm:px-6 lg:px-8 bg-app-shell relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-app-line-strong to-transparent opacity-60" aria-hidden />
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center p-[1px] rounded-2xl bg-gradient-to-br from-brand-400/30 via-app-line to-brand-600/20 shadow-app-card-premium">
            <div className="inline-flex items-center bg-white dark:bg-ref-card rounded-[15px] p-1 shadow-inner shadow-black/[0.02] border border-transparent dark:border-ref-border/60">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                billing === 'monthly'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'text-app-muted hover:text-app-ink'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
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
      </section>



      {/* Pricing Cards */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => {
              const price = billing === 'monthly' ? plan.price.monthly : plan.price.yearly;
              return (
                <div
                  key={plan.name}
                  className={`relative rounded-[26px] transition-all duration-300 ${
                    plan.highlighted
                      ? 'p-[1px] bg-gradient-to-br from-brand-400/45 via-app-line to-brand-600/35 shadow-app-card-premium lg:scale-[1.04]'
                      : 'bg-white dark:bg-ref-card border border-app-line dark:border-ref-border hover:border-brand-500/20 shadow-app-card-premium hover:shadow-app-card-premium-hover'
                  }`}
                >
                  <div
                    className={`relative h-full rounded-[25px] bg-white dark:bg-ref-card overflow-hidden ${
                      plan.highlighted ? '' : ''
                    }`}
                  >
                  {plan.highlighted && (
                    <div className="h-1 bg-gradient-to-r from-brand-800 via-brand-500 to-brand-400" />
                  )}

                  {/* Badge */}
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-500 text-white shadow-md shadow-brand-500/20 ring-1 ring-white/20">
                        Recomendado
                      </span>
                    </div>
                  )}

                  <div className="p-7 lg:p-8">
                    {/* Header */}
                    <h2 className="text-xl font-bold mb-1 text-app-ink">
                      {plan.name}
                    </h2>
                    <p className="text-sm mb-8 text-app-muted">
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="mb-8">
                      {(plan as { priceBefore?: number }).priceBefore != null && billing === 'monthly' && (
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="text-sm text-app-muted line-through">${(plan as { priceBefore: number }).priceBefore}/mes</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700">Por tiempo limitado</span>
                        </div>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold tracking-tight text-app-ink font-professional">
                          ${price}
                        </span>
                        <span className="text-base font-medium text-app-muted">
                          /mes
                        </span>
                      </div>
                      {billing === 'yearly' ? (
                        <p className="text-xs mt-1.5 text-app-muted">
                          <span className="line-through">${plan.price.monthly}/mes</span> facturado mensual
                        </p>
                      ) : (
                        <p className="text-xs mt-1.5 text-app-muted">
                          Facturación mensual
                        </p>
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
                      {plan.trial && (
                        <p className="text-sm font-medium text-emerald-600 mt-2">{plan.trial}</p>
                      )}
                    </div>

                    {/* CTA */}
                    {(plan as { checkoutPlan?: boolean }).checkoutPlan ? (
                      <button
                        type="button"
                        onClick={handleCheckout}
                        disabled={checkoutLoading}
                        className="group flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-full font-semibold text-sm transition-all duration-300 mb-8 bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {checkoutLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Redirigiendo a pago...
                          </>
                        ) : (
                          <>
                            {plan.cta}
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                          </>
                        )}
                      </button>
                    ) : (
                      <a
                        href={plan.ctaLink}
                        target={plan.ctaLink.startsWith('http') ? '_blank' : undefined}
                        rel={plan.ctaLink.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className={`group flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl font-semibold text-sm transition-all duration-300 mb-8 ${
                          plan.highlighted
                            ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20'
                            : 'bg-app-field/80 hover:bg-app-field text-app-ink border border-app-line'
                        }`}
                      >
                        {plan.cta}
                        {plan.whatsappMessage ? (
                          <MessageSquare className="w-4 h-4" />
                        ) : (
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        )}
                      </a>
                    )}

                    {/* Divider */}
                    <div className="border-t mb-6 border-app-line" />

                    {/* Features label */}
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-4 text-app-muted">
                      Incluye
                    </p>

                    {/* Features */}
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 bg-emerald-500/10 text-emerald-600">
                            <Check className="w-3 h-3" strokeWidth={3} />
                          </div>
                          <span className="text-sm leading-snug text-app-muted">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal correo antes de checkout */}
          {showEmailModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => !checkoutLoading && setShowEmailModal(false)}>
              <div className="rounded-[26px] p-[1px] bg-gradient-to-br from-brand-400/25 via-app-line to-brand-600/15 shadow-app-card-premium max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <div className="rounded-[25px] bg-white dark:bg-ref-card border border-app-line/80 dark:border-ref-border/80 p-6 sm:p-7 ring-1 ring-white/90 dark:ring-ref-border/50">
                <h3 className="text-lg font-semibold text-app-ink mb-2">Introduce tu correo</h3>
                <p className="text-sm text-app-muted mb-4">
                  Lo usamos para tu cuenta y facturación. Si ya cancelaste una suscripción antes, no tendrás de nuevo los 14 días gratis.
                </p>
                <input
                  type="email"
                  value={checkoutEmail}
                  onChange={(e) => setCheckoutEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full px-4 py-3 rounded-2xl bg-app-field border border-app-line text-app-ink placeholder-app-muted focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 outline-none mb-4"
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckoutWithEmail()}
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => !checkoutLoading && setShowEmailModal(false)}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-medium text-app-muted hover:text-app-ink border border-app-line hover:bg-app-field/80 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckoutWithEmail}
                    disabled={checkoutLoading}
                    className="flex-1 py-2.5 rounded-full text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-brand-500/20"
                  >
                    {checkoutLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirigiendo...</> : 'Continuar a pago'}
                  </button>
                </div>
                </div>
              </div>
            </div>
          )}

          {/* Trust + Aviso trial y cancelación */}
          <p className="mt-8 text-center text-sm text-app-muted max-w-lg mx-auto">
            14 días de prueba gratis. Después se cobrarán $50/mes de forma automática. Puedes cancelar en cualquier momento desde tu cuenta o contactando a soporte.
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



      <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-app-shell overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-hero-glow opacity-50 dark:opacity-[0.28]" aria-hidden />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16 lg:mb-20">
            <SectionLabel>Plataforma</SectionLabel>
            <h2 className="text-3xl lg:text-4xl xl:text-[2.75rem] font-bold text-app-ink tracking-[-0.03em] font-professional leading-tight">
              De QR a ventas automáticas
            </h2>
            <p className="mt-5 text-base sm:text-lg text-app-muted max-w-2xl mx-auto leading-relaxed">
              Conecta, entrena y vende. Sin código, sin complicaciones.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4 }}
                  className="group relative h-full"
                >
                  <div className="absolute -inset-px rounded-[24px] bg-gradient-to-br from-brand-500/15 via-transparent to-brand-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative h-full p-6 rounded-[23px] border border-app-line dark:border-ref-border bg-white dark:bg-ref-card shadow-app-card-premium transition-[box-shadow,border-color] duration-300 group-hover:border-brand-500/25 group-hover:shadow-app-card-premium-hover">
                    <div className={`w-12 h-12 rounded-2xl ${accentMap[feature.accent]} flex items-center justify-center mb-4 transition-colors shadow-inner shadow-black/[0.02]`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-app-ink mb-2 font-professional tracking-tight">{feature.title}</h3>
                    <p className="text-app-muted text-[13px] leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>



      <section className="relative py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-ref-bg border-y border-app-line dark:border-ref-border overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-site-grid bg-grid opacity-[0.2] dark:opacity-[0.06] [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)] dark:[mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]" aria-hidden />
        <div className="relative max-w-5xl mx-auto">
          <SectionLabel>Confianza</SectionLabel>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { value: '500+', label: 'Negocios activos' },
              { value: '2M+', label: 'Mensajes procesados' },
              { value: '99.9%', label: 'Uptime garantizado' },
              { value: '24/7', label: 'Soporte disponible' },
            ].map((stat, i) => (
              <div
                key={i}
                className="rounded-2xl border border-app-line/90 dark:border-ref-border/90 bg-gradient-to-b from-white to-app-field/20 dark:from-ref-card dark:to-ref-muted/35 px-4 py-6 text-center shadow-inner shadow-black/[0.02] transition-[border-color,box-shadow] duration-300 hover:border-brand-500/20 hover:shadow-app-card"
              >
                <p className="text-3xl sm:text-4xl font-bold text-app-ink tracking-tight font-professional tabular-nums">{stat.value}</p>
                <p className="mt-2 text-[11px] sm:text-xs text-app-muted font-semibold uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-app-shell">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>Ayuda</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-bold text-app-ink tracking-[-0.03em] font-professional leading-tight">
              Todo lo que necesitas saber
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-[22px] bg-white dark:bg-ref-card border border-app-line dark:border-ref-border shadow-app-card-premium transition-[border-color,box-shadow] overflow-hidden hover:border-brand-500/15 open:border-app-line-strong open:shadow-app-card-premium-hover"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-[15px] font-medium text-app-ink hover:text-app-muted transition-colors list-none [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span className="ml-4 flex-shrink-0 w-6 h-6 rounded-lg bg-app-field flex items-center justify-center text-app-muted group-open:rotate-45 transition-transform duration-200">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="6" y1="1" x2="6" y2="11" />
                      <line x1="1" y1="6" x2="11" y2="6" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-sm text-app-muted leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>



      <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden text-white border-t border-black/10">
        <div className="absolute inset-0 bg-[hsl(240_3%_13%)]" aria-hidden />
        <div
          className="absolute inset-0 opacity-[0.07] dark:opacity-[0.035] bg-site-grid bg-grid [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_70%)]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/18 via-transparent to-transparent pointer-events-none" aria-hidden />
        <div className="landing-noise opacity-[0.06]" aria-hidden />
        <div className="relative max-w-3xl mx-auto text-center z-[1]">
          <SectionLabel dark>Prueba</SectionLabel>
          <div className="w-12 h-12 mx-auto mb-6 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center ring-1 ring-white/10">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-[-0.03em] font-professional text-white">14 días gratis</h2>
          <p className="text-base sm:text-lg text-white/75 mb-10 leading-relaxed max-w-lg mx-auto">
            Prueba el plan completo. Cancela cuando quieras, sin compromisos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a
              href="/register"
              className="group relative inline-flex items-center gap-2 w-full sm:w-auto justify-center overflow-hidden px-8 py-4 rounded-ref text-base font-semibold text-app-ink bg-white shadow-app-card-premium transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-gradient-to-b from-white to-white/90" />
              <span className="relative">Empezar gratis</span>
              <ArrowRight className="relative w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="/contacto"
              className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-4 rounded-2xl text-base font-semibold text-white/90 border border-white/15 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/25 transition-all duration-200"
            >
              Contactar ventas
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}