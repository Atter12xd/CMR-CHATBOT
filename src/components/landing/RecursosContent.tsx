import { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  MessageSquare,
  ShoppingCart,
  Headphones,
  ChevronDown,
  ChevronUp,
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
    iconBg: 'bg-brand-500/10 group-hover:bg-brand-500/20',
    iconText: 'text-brand-400',
    bar: 'bg-brand-500',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
    iconText: 'text-emerald-400',
    bar: 'bg-emerald-500',
  },
  amber: {
    iconBg: 'bg-amber-500/10 group-hover:bg-amber-500/20',
    iconText: 'text-amber-400',
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
    <div className="min-h-screen bg-slate-950 text-white font-sans antialiased">

      {/* Hero */}
      <section className="relative pt-20 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-brand-500/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 mb-8">
            <BookOpen className="w-4 h-4 text-brand-400" />
            <span className="text-sm text-slate-300 font-medium">Centro de recursos</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6">
            Aprende a vender más
            <span className="block mt-2 text-gradient-brand">por WhatsApp</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            Guías, vídeos y preguntas frecuentes para sacar el máximo partido a wazapp.
          </p>
        </div>
      </section>


      {/* Guías */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-brand-400 font-semibold text-sm uppercase tracking-wider mb-4">Guías</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Empieza por aquí
            </h2>
            <p className="mt-3 text-slate-400 max-w-xl">
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
                  className="group relative block rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/50 overflow-hidden"
                >
                  <div className={`h-1 ${accent.bar} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${accent.iconBg} flex items-center justify-center mb-5 transition-colors`}>
                      <Icon className={`w-6 h-6 ${accent.iconText}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-slate-100 transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{guide.description}</p>
                    <span className="inline-flex items-center gap-1.5 mt-5 text-sm font-medium text-brand-400 group-hover:text-brand-300 transition-colors">
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
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/30 border-y border-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-brand-400 font-semibold text-sm uppercase tracking-wider mb-4">Vídeos</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Aprende en minutos
            </h2>
            <p className="mt-3 text-slate-400 max-w-xl">
              Tutoriales cortos para que configures todo sin complicaciones.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.title}
                className="group rounded-2xl overflow-hidden bg-slate-900/50 border border-slate-800/50 hover:border-slate-700/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/50 cursor-pointer"
              >
                <div className="relative aspect-video bg-slate-800/50">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-brand-600/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-500 transition-all duration-300 shadow-xl shadow-brand-600/30">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-sm text-xs text-slate-300 font-medium border border-slate-700/30">
                    {video.duration}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-white group-hover:text-slate-100 transition-colors">{video.title}</h3>
                </div>
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
              <div
                key={i}
                className={`rounded-2xl bg-slate-900/50 border transition-colors overflow-hidden ${
                  openFaq === i
                    ? 'border-slate-700/50'
                    : 'border-slate-800/50 hover:border-slate-700/50'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between cursor-pointer px-6 py-5 text-left transition-colors"
                >
                  <span className="text-[15px] font-medium text-white pr-4">{faq.q}</span>
                  <span className={`ml-4 flex-shrink-0 w-6 h-6 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-500 transition-transform duration-200 ${
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
                      <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Bottom CTA */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-12 h-12 mx-auto mb-6 rounded-xl bg-brand-500/10 flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-brand-400" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight">
            ¿No encuentras lo que buscas?
          </h2>
          <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-lg mx-auto">
            Nuestro equipo de soporte está listo para ayudarte con cualquier duda.
          </p>
          <a
            href="/contacto"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white text-base font-semibold rounded-xl transition-all duration-300 shadow-xl shadow-brand-600/25 hover:shadow-brand-500/30 hover:scale-[1.02]"
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