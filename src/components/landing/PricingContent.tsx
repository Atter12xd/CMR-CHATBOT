import { useState, useEffect } from 'react';
import { Check, ArrowRight, MessageSquare, Brain, ShoppingBag, BarChart3, CreditCard, QrCode, Zap, Shield, Loader2, Clock } from 'lucide-react';



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
  brand: 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 border border-blue-500/15',
  emerald: 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 border border-emerald-500/15',
  amber: 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 border border-amber-500/15',
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
    <div className="min-h-screen bg-[#0a0f1a] text-white font-sans antialiased">


      {/* Hero */}
      <section className="relative pt-20 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1220] via-[#0a0f1a] to-[#0a0f1a]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111827]/80 border border-white/[0.06] mb-8">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-sm text-slate-300 font-medium">14 días de prueba gratis en el plan de $50</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6">
            Tu vendedor en WhatsApp,
            <span className="block mt-2 text-gradient-brand">activo 24/7</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            Conecta tu WhatsApp con QR, entrena el bot con tu información y empieza a vender en automático.
          </p>
        </div>
      </section>



      {/* Billing Toggle */}
      <section className="pb-10 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center bg-[#111827]/80 border border-white/[0.06] rounded-xl p-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                billing === 'monthly'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
                billing === 'yearly'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Anual
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                billing === 'yearly'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-emerald-500/10 text-emerald-400'
              }`}>
                -20%
              </span>
            </button>
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
                  className={`relative rounded-2xl transition-all duration-300 ${
                    plan.highlighted
                      ? 'bg-[#111827]/90 border-2 border-blue-500/40 shadow-2xl shadow-blue-500/10 lg:scale-105'
                      : 'bg-[#111827]/80 border border-white/[0.06] hover:border-white/[0.1]'
                  }`}
                >
                  {/* Accent bar */}
                  {plan.highlighted && (
                    <div className="h-1 rounded-t-2xl bg-gradient-to-r from-blue-500 via-blue-400 to-emerald-400" />
                  )}

                  {/* Badge */}
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-500 text-white shadow-lg shadow-blue-500/30">
                        Recomendado
                      </span>
                    </div>
                  )}

                  <div className="p-7 lg:p-8">
                    {/* Header */}
                    <h2 className={`text-xl font-bold mb-1 ${plan.highlighted ? 'text-white' : 'text-white'}`}>
                      {plan.name}
                    </h2>
                    <p className={`text-sm mb-8 ${plan.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="mb-8">
                      {(plan as { priceBefore?: number }).priceBefore != null && billing === 'monthly' && (
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="text-sm text-slate-500 line-through">${(plan as { priceBefore: number }).priceBefore}/mes</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400">Por tiempo limitado</span>
                        </div>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className={`text-5xl font-bold tracking-tight ${plan.highlighted ? 'text-white' : 'text-white'}`}>
                          ${price}
                        </span>
                        <span className={`text-base font-medium ${plan.highlighted ? 'text-slate-500' : 'text-slate-500'}`}>
                          /mes
                        </span>
                      </div>
                      {billing === 'yearly' ? (
                        <p className={`text-xs mt-1.5 ${plan.highlighted ? 'text-slate-500' : 'text-slate-500'}`}>
                          <span className="line-through">${plan.price.monthly}/mes</span> facturado mensual
                        </p>
                      ) : (
                        <p className={`text-xs mt-1.5 ${plan.highlighted ? 'text-slate-500' : 'text-slate-500'}`}>
                          Facturación mensual
                        </p>
                      )}
                      {plan.highlighted && countdown && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Oferta termina en:</span>
                          <span className="font-mono font-semibold text-amber-400 tabular-nums">
                            {countdown.d}d {countdown.h}h {countdown.m}m {countdown.s}s
                          </span>
                        </div>
                      )}
                      {plan.trial && (
                        <p className="text-sm font-medium text-emerald-400 mt-2">{plan.trial}</p>
                      )}
                    </div>

                    {/* CTA */}
                    {(plan as { checkoutPlan?: boolean }).checkoutPlan ? (
                      <button
                        type="button"
                        onClick={handleCheckout}
                        disabled={checkoutLoading}
                        className="group flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-300 mb-8 bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
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
                        className={`group flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-300 mb-8 ${
                          plan.highlighted
                            ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/30'
                            : 'bg-white/[0.04] hover:bg-white/[0.06] text-white border border-white/[0.06] hover:border-white/[0.1]'
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
                    <div className={`border-t mb-6 border-white/[0.06]`} />

                    {/* Features label */}
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-4 ${plan.highlighted ? 'text-slate-500' : 'text-slate-600'}`}>
                      Incluye
                    </p>

                    {/* Features */}
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                            plan.highlighted
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            <Check className="w-3 h-3" strokeWidth={3} />
                          </div>
                          <span className={`text-sm leading-snug ${plan.highlighted ? 'text-slate-400' : 'text-slate-400'}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal correo antes de checkout */}
          {showEmailModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !checkoutLoading && setShowEmailModal(false)}>
              <div className="bg-[#111827] border border-white/[0.06] rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-white mb-2">Introduce tu correo</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Lo usamos para tu cuenta y facturación. Si ya cancelaste una suscripción antes, no tendrás de nuevo los 14 días gratis.
                </p>
                <input
                  type="email"
                  value={checkoutEmail}
                  onChange={(e) => setCheckoutEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500/40 outline-none mb-4"
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckoutWithEmail()}
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => !checkoutLoading && setShowEmailModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white border border-white/[0.06] hover:bg-white/[0.04] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckoutWithEmail}
                    disabled={checkoutLoading}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-blue-500 hover:bg-blue-400 text-white disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    {checkoutLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirigiendo...</> : 'Continuar a pago'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Trust + Aviso trial y cancelación */}
          <p className="mt-8 text-center text-sm text-slate-400 max-w-lg mx-auto">
            14 días de prueba gratis. Después se cobrarán $50/mes de forma automática. Puedes cancelar en cualquier momento desde tu cuenta o contactando a soporte.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>14 días gratis</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Cancela cuando quieras</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Soporte en español</span>
            </div>
          </div>
        </div>
      </section>



      {/* How it works — Features */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 lg:mb-20">
            <p className="text-blue-400 font-bold text-[11px] uppercase tracking-[0.14em] mb-4">Incluido en todos los planes</p>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white tracking-tight">
              De QR a ventas automáticas
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              Conecta, entrena y vende. Sin código, sin complicaciones.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group p-6 rounded-2xl bg-[#111827]/80 border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300 hover:shadow-lg hover:shadow-black/20"
                >
                  <div className={`w-12 h-12 rounded-xl ${accentMap[feature.accent]} flex items-center justify-center mb-4 transition-colors`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>



      {/* Social Proof */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#0d1220] border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Negocios activos' },
              { value: '2M+', label: 'Mensajes procesados' },
              { value: '99.9%', label: 'Uptime garantizado' },
              { value: '24/7', label: 'Soporte disponible' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-4xl lg:text-5xl font-bold text-white tracking-tight">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* FAQ */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-400 font-bold text-[11px] uppercase tracking-[0.14em] mb-4">Preguntas frecuentes</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Todo lo que necesitas saber
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-2xl bg-[#111827]/80 border border-white/[0.06] hover:border-white/[0.1] transition-colors overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-[15px] font-medium text-white hover:text-slate-200 transition-colors list-none [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span className="ml-4 flex-shrink-0 w-6 h-6 rounded-lg bg-white/[0.06] flex items-center justify-center text-slate-500 group-open:rotate-45 transition-transform duration-200">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="6" y1="1" x2="6" y2="11" />
                      <line x1="1" y1="6" x2="11" y2="6" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>



      {/* Bottom CTA */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0d1220] to-[#0a0f1a] border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-12 h-12 mx-auto mb-6 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight">14 días gratis</h2>
          <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-lg mx-auto">
            Prueba el plan completo. Cancela cuando quieras, sin compromisos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/register"
              className="group inline-flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white text-base font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/30 hover:scale-[1.02]"
            >
              Empezar gratis
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="/contacto"
              className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-4 text-slate-400 hover:text-white text-base font-semibold transition-colors"
            >
              Contactar ventas
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}