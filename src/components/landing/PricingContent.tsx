import { useState } from 'react';
import { Check, ArrowRight, MessageSquare, Brain, ShoppingBag, BarChart3, CreditCard, QrCode, Zap, Shield, Loader2 } from 'lucide-react';



const WHATSAPP_SOPORTE = '51933484150';

const plans = [
  {
    name: 'Starter',
    description: 'Para negocios que quieren automatizar su atención',
    price: { monthly: 50, yearly: 40 },
    trial: '14 días de prueba gratis',
    features: [
      'Hasta 1,000 conversaciones/mes',
      '1 número de WhatsApp',
      'Entrenar bot con texto y URLs',
      'Catálogo de hasta 100 productos',
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
  brand: 'bg-brand-500/10 text-brand-400 group-hover:bg-brand-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20',
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



export default function PricingContent() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
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
    <div className="min-h-screen bg-slate-950 text-white font-sans antialiased">


      {/* Hero */}
      <section className="relative pt-20 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-brand-500/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 mb-8">
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
          <div className="inline-flex items-center bg-slate-900/50 border border-slate-800/50 rounded-xl p-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                billing === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
                billing === 'yearly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Anual
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                billing === 'yearly'
                  ? 'bg-emerald-100 text-emerald-700'
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
                      ? 'bg-slate-800/80 border-2 border-brand-500/50 shadow-2xl shadow-brand-500/10 lg:scale-105'
                      : 'bg-slate-900/50 border border-slate-800/50 hover:border-slate-700/50'
                  }`}
                >
                  {/* Accent bar */}
                  {plan.highlighted && (
                    <div className="h-1 rounded-t-2xl bg-gradient-to-r from-brand-500 via-brand-400 to-emerald-400" />
                  )}

                  {/* Badge */}
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-600 text-white shadow-lg shadow-brand-600/30">
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
                        className="group flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-300 mb-8 bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/25 hover:shadow-brand-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
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
                            ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/25 hover:shadow-brand-500/30'
                            : 'bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700/50 hover:border-slate-600'
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
                    <div className={`border-t mb-6 ${plan.highlighted ? 'border-slate-700/40' : 'border-slate-800/40'}`} />

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
            <p className="text-brand-400 font-semibold text-sm uppercase tracking-wider mb-4">Incluido en todos los planes</p>
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
                  className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/50"
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
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/30 border-y border-slate-800/30">
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
            <p className="text-brand-400 font-semibold text-sm uppercase tracking-wider mb-4">Preguntas frecuentes</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Todo lo que necesitas saber
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700/50 transition-colors overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-[15px] font-medium text-white hover:text-slate-200 transition-colors list-none [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span className="ml-4 flex-shrink-0 w-6 h-6 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-500 group-open:rotate-45 transition-transform duration-200">
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
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-12 h-12 mx-auto mb-6 rounded-xl bg-brand-500/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-brand-400" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight">14 días gratis, sin tarjeta</h2>
          <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-lg mx-auto">
            Prueba el plan Pro completo. Sin compromisos. Cancela en cualquier momento.
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
              Contactar ventas
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}