import { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  MessageSquare,
  ShoppingCart,
  Headphones,
  ChevronDown,
  Play,
} from 'lucide-react';


const guides = [
  {
    title: 'Qué es WhatsApp Business API',
    description: 'Aprende qué es la API de WhatsApp, requisitos y cómo conectarla a wazapp.',
    icon: MessageSquare,
    accent: 'brand' as const,
  },
  {
    title: 'Cómo vender por WhatsApp',
    description: 'Guía paso a paso para configurar tu catálogo, pedidos y métodos de pago.',
    icon: ShoppingCart,
    accent: 'emerald' as const,
  },
  {
    title: 'Buenas prácticas de atención al cliente',
    description: 'Consejos para responder rápido, cerrar ventas y fidelizar clientes.',
    icon: Headphones,
    accent: 'amber' as const,
  },
];

const guideAccentMap = {
  brand: {
    iconBg: 'bg-brand-500/10 border border-brand-500/20 group-hover:bg-brand-500/15',
    iconText: 'text-brand-600',
    bar: 'bg-brand-500',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/15',
    iconText: 'text-emerald-600',
    bar: 'bg-emerald-500',
  },
  amber: {
    iconBg: 'bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-500/15',
    iconText: 'text-amber-600',
    bar: 'bg-amber-500',
  },
};


const faqs = [
  {
    q: '¿Necesito una cuenta de WhatsApp Business?',
    a: 'Sí. Debes tener una cuenta de WhatsApp Business verificada. Te guiamos en el proceso de conexión paso a paso.',
  },
  {
    q: '¿Puedo usar mi número personal?',
    a: 'No recomendamos usar el número personal para ventas. Lo ideal es un número dedicado para tu negocio.',
  },
  {
    q: '¿Cómo se conecta mi WhatsApp a wazapp?',
    a: 'Puedes conectar vía QR o mediante la integración oficial de Meta. El proceso toma unos minutos.',
  },
  {
    q: '¿Hay límite de productos en el catálogo?',
    a: 'En el plan Starter puedes tener hasta 300 productos. En Pro y Business el catálogo es ilimitado.',
  },
  {
    q: '¿Ofrecen soporte técnico?',
    a: 'Sí. Todos los planes incluyen soporte por email. Pro y Business tienen soporte prioritario 24/7.',
  },
];


const videos = [
  {
    title: 'Conectar WhatsApp en 2 minutos',
    duration: '2:15',
    thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&q=80',
  },
  {
    title: 'Crear tu primer pedido',
    duration: '3:40',
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80',
  },
  {
    title: 'Configurar catálogo de productos',
    duration: '4:20',
    thumbnail: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=400&q=80',
  },
];


export default function RecursosContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-app-shell text-app-ink font-professional antialiased">

      {/* Hero */}
      <section className="relative pt-20 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden bg-app-canvas">
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-app-line bg-white shadow-app-card mb-8">
            <BookOpen className="w-4 h-4 text-brand-600" />
            <span className="text-sm text-app-muted font-medium">Centro de recursos</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-app-ink tracking-tight leading-[1.1] mb-6 font-display">
            Aprende a vender más
            <span className="block mt-2 text-gradient-brand">por WhatsApp</span>
          </h1>
          <p className="text-lg text-app-muted max-w-xl mx-auto leading-relaxed">
            Guías, vídeos y preguntas frecuentes para sacar el máximo partido a wazapp.
          </p>
        </div>
      </section>


      {/* Guías */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-app-shell">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-app-muted mb-4">Guías</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-app-ink tracking-tight font-display">
              Empieza por aquí
            </h2>
            <p className="mt-3 text-app-muted max-w-xl">
              Todo lo que necesitas para configurar tu negocio en wazapp desde cero.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {guides.map((guide) => {
              const Icon = guide.icon;
              const accent = guideAccentMap[guide.accent];
              return (
                <a
                  key={guide.title}
                  href="#"
                  className="group relative block rounded-[22px] bg-white border border-app-line shadow-app-card transition-[border-color,box-shadow] duration-200 hover:border-app-line-strong overflow-hidden"
                >
                  <div className={`h-1 ${accent.bar} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="p-6">
                    <div className={`w-12 h-12 rounded-2xl ${accent.iconBg} flex items-center justify-center mb-5 transition-colors`}>
                      <Icon className={`w-6 h-6 ${accent.iconText}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-app-ink mb-2 transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-app-muted text-sm leading-relaxed">{guide.description}</p>
                    <span className="inline-flex items-center gap-1.5 mt-5 text-sm font-medium text-brand-600 group-hover:text-brand-500 transition-colors">
                      Leer guía
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>


      {/* Vídeos */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-app-line">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-app-muted mb-4">Vídeos</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-app-ink tracking-tight font-display">
              Aprende en minutos
            </h2>
            <p className="mt-3 text-app-muted max-w-xl">
              Tutoriales cortos para que configures todo sin complicaciones.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.title}
                className="group rounded-[22px] overflow-hidden bg-white border border-app-line shadow-app-card transition-[border-color] duration-200 hover:border-app-line-strong cursor-pointer"
              >
                <div className="relative aspect-video bg-app-field">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-app-charcoal flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-sm text-xs text-app-ink font-medium border border-app-line">
                    {video.duration}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-app-ink transition-colors">{video.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* FAQ */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-app-shell">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-app-muted mb-4">Preguntas frecuentes</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-app-ink tracking-tight font-display">
              Todo lo que necesitas saber
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`rounded-[22px] bg-white border border-app-line shadow-app-card transition-colors overflow-hidden ${
                  openFaq === i ? 'border-app-line-strong' : 'hover:border-app-line-strong'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between cursor-pointer px-6 py-5 text-left transition-colors"
                >
                  <span className="text-[15px] font-medium text-app-ink pr-4">{faq.q}</span>
                  <span className={`ml-4 flex-shrink-0 w-6 h-6 rounded-lg bg-app-field flex items-center justify-center text-app-muted transition-transform duration-200 ${
                    openFaq === i ? 'rotate-180' : ''
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-200 ease-in-out ${
                    openFaq === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-5">
                      <p className="text-sm text-app-muted leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Bottom CTA */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-app-charcoal text-white border-t border-black/10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-12 h-12 mx-auto mb-6 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight font-display">
            ¿No encuentras lo que buscas?
          </h2>
          <p className="text-lg text-white/80 mb-10 leading-relaxed max-w-lg mx-auto">
            Nuestro equipo de soporte está listo para ayudarte con cualquier duda.
          </p>
          <a
            href="/contacto"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-app-charcoal hover:bg-white/95 text-base font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:scale-[1.02]"
          >
            Contactar soporte
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}