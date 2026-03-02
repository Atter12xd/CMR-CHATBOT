import { Check, ArrowRight, Sparkles, Building2, Rocket } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    icon: Sparkles,
    description: 'Para probar y validar tu canal de ventas',
    price: '0',
    period: 'Gratis para siempre',
    features: [
      'Hasta 500 conversaciones/mes',
      '1 número de WhatsApp',
      'Catálogo básico (50 productos)',
      'Gestión de pedidos',
      'Soporte por email',
    ],
    cta: 'Empezar gratis',
    ctaLink: '/register',
    highlighted: false,
  },
  {
    name: 'Pro',
    icon: Rocket,
    description: 'Para negocios que quieren escalar',
    price: '29',
    period: '/mes',
    features: [
      'Conversaciones ilimitadas',
      'Hasta 3 números WhatsApp',
      'Catálogo completo + variantes',
      'Múltiples métodos de pago',
      'Dashboard y métricas',
      'Bot de respuestas automáticas',
      'Soporte prioritario 24/7',
    ],
    cta: 'Probar 14 días gratis',
    ctaLink: '/register',
    highlighted: true,
  },
  {
    name: 'Business',
    icon: Building2,
    description: 'Para equipos y operaciones complejas',
    price: '79',
    period: '/mes',
    features: [
      'Todo lo de Pro incluido',
      'Usuarios ilimitados',
      'Múltiples organizaciones',
      'API y webhooks',
      'Integraciones custom',
      'Gestor de cuenta dedicado',
      'SLA 99.9% garantizado',
    ],
    cta: 'Contactar ventas',
    ctaLink: '/contacto',
    highlighted: false,
  },
];

const faqs = [
  {
    q: '¿Puedo cambiar de plan en cualquier momento?',
    a: 'Sí, puedes subir o bajar de plan cuando quieras. Los cambios se aplican de forma prorrateada en tu siguiente factura.',
  },
  {
    q: '¿Hay compromiso de permanencia?',
    a: 'No. Cancela cuando quieras, sin penalizaciones ni cargos ocultos. Tu cuenta se mantiene activa hasta el fin del período pagado.',
  },
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'Aceptamos todas las tarjetas de crédito/débito principales (Visa, Mastercard, Amex) y PayPal. Para planes Business también ofrecemos transferencia bancaria.',
  },
  {
    q: '¿Qué pasa si supero el límite del plan Starter?',
    a: 'Te notificaremos antes de llegar al límite. Podrás seguir usando la plataforma, pero te recomendaremos actualizar al plan Pro para continuar sin interrupciones.',
  },
];

export default function PricingContent() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300 font-medium">14 días de prueba gratis en Pro</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
            Precios simples,
            <span className="block text-blue-400">resultados claros</span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto">
            Empieza gratis hoy. Escala cuando tu negocio crezca. Sin sorpresas ni costos ocultos.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl p-8 transition-all duration-300 ${
                    plan.highlighted
                      ? 'bg-gradient-to-b from-blue-600/20 to-slate-900/80 border-2 border-blue-500/50 shadow-xl shadow-blue-500/10 scale-[1.02] lg:scale-105'
                      : 'bg-slate-900/50 border border-slate-800/60 hover:border-slate-700/60'
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-500 text-white shadow-lg shadow-blue-500/30">
                        <Sparkles className="w-4 h-4" />
                        Más popular
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      plan.highlighted ? 'bg-blue-500/20' : 'bg-slate-800/50'
                    }`}>
                      <Icon className={`w-6 h-6 ${plan.highlighted ? 'text-blue-400' : 'text-slate-400'}`} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">{plan.name}</h2>
                    <p className="text-slate-400 text-sm">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-white">${plan.price}</span>
                      {plan.price !== '0' && <span className="text-slate-400 text-lg">{plan.period}</span>}
                    </div>
                    {plan.price === '0' && (
                      <p className="text-slate-500 text-sm mt-1">{plan.period}</p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          plan.highlighted ? 'bg-blue-500/20' : 'bg-emerald-500/10'
                        }`}>
                          <Check className={`w-3 h-3 ${plan.highlighted ? 'text-blue-400' : 'text-emerald-400'}`} />
                        </div>
                        <span className="text-slate-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <a
                    href={plan.ctaLink}
                    className={`flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      plan.highlighted
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-500/30'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-white border border-slate-700/50 hover:border-slate-600'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/30 border-y border-slate-800/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-white mb-1">500+</p>
              <p className="text-slate-400 text-sm">Negocios activos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white mb-1">99.9%</p>
              <p className="text-slate-400 text-sm">Uptime garantizado</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white mb-1">24/7</p>
              <p className="text-slate-400 text-sm">Soporte disponible</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Preguntas frecuentes
            </h2>
            <p className="text-slate-400">
              Todo lo que necesitas saber sobre nuestros planes
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60 hover:border-slate-700/60 transition-colors"
              >
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center">
            <p className="text-slate-400 mb-4">¿Tienes más preguntas?</p>
            <a
              href="/contacto"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Contacta con nosotros
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}