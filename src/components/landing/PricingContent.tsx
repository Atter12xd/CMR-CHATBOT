import { useState } from 'react';
import { Check, ArrowRight, X, MessageSquare, Brain, ShoppingBag, BarChart3, CreditCard, QrCode, Zap, Shield } from 'lucide-react';


const plans = [
  {
    name: 'Starter',
    description: 'Para negocios que quieren automatizar su atención',
    price: { monthly: 50, yearly: 40 },
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
    highlighted: false,
  },
  {
    name: 'Pro',
    description: 'Para negocios que quieren vender más por WhatsApp',
    price: { monthly: 99, yearly: 79 },
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
    cta: 'Probar 14 días gratis',
    ctaLink: '/register',
    highlighted: true,
  },
  {
    name: 'Business',
    description: 'Para equipos que necesitan control total',
    price: { monthly: 150, yearly: 120 },
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
    cta: 'Contactar ventas',
    ctaLink: '/contacto',
    highlighted: false,
  },
];


const features = [
  {
    icon: QrCode,
    title: 'Conexión con QR',
    description: 'Escanea el código QR desde tu WhatsApp y listo. Sin eliminar tu número, sin configuraciones técnicas.',
  },
  {
    icon: Brain,
    title: 'Bot que aprende tu negocio',
    description: 'Entrénalo con palabras, PDFs o la URL de tu web. En minutos sabe todo sobre tu empresa y productos.',
  },
  {
    icon: ShoppingBag,
    title: 'Catálogo y pedidos',
    description: 'Sube tus productos al sistema. El bot los muestra, detecta intención de compra y registra pedidos automáticamente.',
  },
  {
    icon: MessageSquare,
    title: 'Chat en vivo',
    description: 'Ve todos los mensajes en tiempo real. Cambia entre modo bot y modo humano en cada conversación.',
  },
  {
    icon: CreditCard,
    title: 'Métodos de pago',
    description: 'Configura tus métodos de pago y el bot los comparte con tus clientes cuando pregunten cómo pagar.',
  },
  {
    icon: Zap,
    title: 'Fotos y catálogos',
    description: 'El bot envía imágenes de productos, catálogos completos y toda la información que tus clientes necesitan.',
  },
];


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

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white antialiased">

      {/* Hero */}
      <section className="pt-16 pb-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[13px] font-medium text-slate-500 uppercase tracking-widest mb-5">Precios</p>
          <h1 className="text-[2.5rem] sm:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-5">
            Tu vendedor en WhatsApp,<br className="hidden sm:block" /> activo 24/7
          </h1>
          <p className="text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Conecta tu WhatsApp con QR, entrena el bot con tu información y empieza a vender en automático.
          </p>
        </div>
      </section>


      {/* Billing Toggle */}
      <section className="pb-10 px-4 sm:px-6">
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center bg-[#111118] border border-slate-800/60 rounded-lg p-0.5">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-4 py-2 text-[13px] font-medium rounded-md transition-all duration-200 ${
                billing === 'monthly'
                  ? 'bg-white text-slate-900'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-4 py-2 text-[13px] font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${
                billing === 'yearly'
                  ? 'bg-white text-slate-900'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Anual
              <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${
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
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-5">
            {plans.map((plan) => {
              const price = billing === 'monthly' ? plan.price.monthly : plan.price.yearly;
              return (
                <div
                  key={plan.name}
                  className={`relative rounded-xl overflow-hidden transition-all duration-200 ${
                    plan.highlighted
                      ? 'bg-white text-slate-900 shadow-2xl shadow-blue-500/5 ring-1 ring-white/20'
                      : 'bg-[#111118] border border-slate-800/50 hover:border-slate-700/50'
                  }`}
                >
                  {/* Top accent bar for highlighted */}
                  {plan.highlighted && (
                    <div className="h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-blue-500" />
                  )}

                  <div className="p-7">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                      <h2 className={`text-lg font-semibold ${plan.highlighted ? 'text-slate-900' : 'text-white'}`}>
                        {plan.name}
                      </h2>
                      {plan.highlighted && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded bg-blue-50 text-blue-600">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className={`text-[13px] mb-6 ${plan.highlighted ? 'text-slate-500' : 'text-slate-500'}`}>
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-0.5">
                        <span className={`text-4xl font-bold tracking-tight ${plan.highlighted ? 'text-slate-900' : 'text-white'}`}>
                          ${price}
                        </span>
                        <span className={`text-sm ${plan.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>/mes</span>
                      </div>
                      {billing === 'yearly' && (
                        <p className={`text-[12px] mt-1 ${plan.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>
                          <span className="line-through">${plan.price.monthly}</span>/mes facturado mensual
                        </p>
                      )}
                    </div>

                    {/* CTA */}
                    <a
                      href={plan.ctaLink}
                      className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg font-medium text-[13px] transition-all duration-200 mb-7 ${
                        plan.highlighted
                          ? 'bg-slate-900 hover:bg-slate-800 text-white'
                          : 'bg-white/[0.06] hover:bg-white/[0.1] text-white border border-slate-700/50'
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>

                    {/* Divider */}
                    <div className={`border-t mb-6 ${plan.highlighted ? 'border-slate-200' : 'border-slate-800/60'}`} />

                    {/* Features */}
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            plan.highlighted ? 'text-slate-900' : 'text-slate-500'
                          }`} strokeWidth={2.5} />
                          <span className={`text-[13px] leading-snug ${plan.highlighted ? 'text-slate-600' : 'text-slate-400'}`}>
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

          <p className="text-center text-[12px] text-slate-600 mt-6">
            Precios en USD. Todos los planes incluyen 14 días de prueba gratis.
          </p>
        </div>
      </section>


      {/* How it works — Features */}
      <section className="py-20 px-4 sm:px-6 border-t border-slate-800/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[12px] font-medium text-slate-500 uppercase tracking-widest mb-3">Cómo funciona</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              De QR a ventas automáticas en minutos
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-5 rounded-xl bg-[#111118] border border-slate-800/40 hover:border-slate-700/40 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-slate-800/50 flex items-center justify-center mb-4">
                    <Icon className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[14px] font-semibold text-white mb-1.5">{feature.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Social Proof */}
      <section className="py-14 px-4 sm:px-6 border-t border-slate-800/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">500+</p>
              <p className="text-[12px] text-slate-500 mt-0.5">Negocios activos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">2M+</p>
              <p className="text-[12px] text-slate-500 mt-0.5">Mensajes procesados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">99.9%</p>
              <p className="text-[12px] text-slate-500 mt-0.5">Uptime garantizado</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">24/7</p>
              <p className="text-[12px] text-slate-500 mt-0.5">Soporte disponible</p>
            </div>
          </div>
        </div>
      </section>


      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 border-t border-slate-800/30">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[12px] font-medium text-slate-500 uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="space-y-px rounded-xl overflow-hidden border border-slate-800/40">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-[#111118] border-b border-slate-800/30 last:border-b-0"
              >
                <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-[14px] font-medium text-white hover:text-slate-200 transition-colors list-none [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span className="ml-4 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-slate-500 group-open:rotate-45 transition-transform duration-200">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="6" y1="1" x2="6" y2="11" />
                      <line x1="1" y1="6" x2="11" y2="6" />
                    </svg>
                  </span>
                </summary>
                <div className="px-5 pb-4">
                  <p className="text-[13px] text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>


      {/* Bottom CTA */}
      <section className="py-20 px-4 sm:px-6 border-t border-slate-800/30">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-10 h-10 mx-auto mb-5 rounded-lg bg-white/[0.04] border border-slate-800/50 flex items-center justify-center">
            <Shield className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">14 días gratis, sin tarjeta</h2>
          <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">
            Prueba el plan Pro completo. Cancela en cualquier momento.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 rounded-lg text-[13px] font-medium hover:bg-slate-100 transition-colors"
            >
              Empezar gratis
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="/contacto"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-slate-400 hover:text-slate-300 text-[13px] font-medium transition-colors"
            >
              Contactar ventas
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}