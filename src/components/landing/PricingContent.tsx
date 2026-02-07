import { Check, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Gratuito',
    description: 'Para probar y validar tu canal de ventas',
    price: '0',
    period: 'siempre gratis',
    features: [
      'Hasta 500 conversaciones/mes',
      '1 número de WhatsApp conectado',
      'Catálogo de productos básico',
      'Gestión de pedidos',
      'Soporte por email',
    ],
    cta: 'Empezar gratis',
    ctaLink: '/register',
    highlighted: false,
  },
  {
    name: 'Profesional',
    description: 'Para negocios que quieren escalar ventas',
    price: '29',
    period: '/mes',
    features: [
      'Conversaciones ilimitadas',
      'Hasta 3 números WhatsApp',
      'Catálogo completo + variantes',
      'Pedidos y métodos de pago',
      'Dashboard y métricas',
      'Bot de respuestas automáticas',
      'Soporte prioritario',
    ],
    cta: 'Probar 14 días gratis',
    ctaLink: '/register',
    highlighted: true,
  },
  {
    name: 'Empresa',
    description: 'Para equipos y operaciones complejas',
    price: '79',
    period: '/mes',
    features: [
      'Todo lo de Profesional',
      'Usuarios ilimitados',
      'Múltiples organizaciones',
      'API y integraciones',
      'Gestor de cuenta dedicado',
      'SLA 99.9%',
    ],
    cta: 'Contactar ventas',
    ctaLink: '/contacto',
    highlighted: false,
  },
];

export default function PricingContent() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Precios simples, resultados claros
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Empieza gratis. Escala cuando lo necesites. Sin sorpresas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border transition-all duration-300 hover:scale-[1.02] ${
                  plan.highlighted
                    ? 'bg-slate-900 border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                {plan.highlighted && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 mb-4">
                    Más popular
                  </span>
                )}
                <h2 className="text-2xl font-bold text-white mb-2">{plan.name}</h2>
                <p className="text-slate-400 text-sm mb-6">{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-bold text-white">{plan.price}€</span>
                  <span className="text-slate-500">{plan.period}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.ctaLink}
                  className={`block w-full text-center py-3 px-4 rounded-lg font-semibold transition-colors ${
                    plan.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-500'
                      : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </a>
              </div>
            ))}
          </div>

          {/* FAQ pricing */}
          <div id="faq-precios" className="mt-24 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              Preguntas frecuentes sobre precios
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: '¿Puedo cambiar de plan en cualquier momento?',
                  a: 'Sí. Puedes subir o bajar de plan cuando quieras. Los cambios se aplican de forma prorrateada.',
                },
                {
                  q: '¿Hay compromiso de permanencia?',
                  a: 'No. Puedes cancelar cuando quieras. No hay penalizaciones ni cargos ocultos.',
                },
                {
                  q: '¿Qué incluyen las "conversaciones"?',
                  a: 'Cada intercambio de mensajes con un cliente cuenta como conversación. Las plantillas y respuestas automáticas no consumen de tu cupo en el plan Gratuito.',
                },
              ].map((faq) => (
                <div
                  key={faq.q}
                  className="p-6 rounded-xl bg-slate-900/50 border border-slate-800"
                >
                  <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                  <p className="text-slate-400 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
