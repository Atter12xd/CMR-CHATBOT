import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  HelpCircle,
  MessageSquare,
  ShoppingCart,
  Headphones,
  ChevronDown,
  Play,
} from 'lucide-react';
import MarketingHero from './MarketingHero';
import SectionLabel from './SectionLabel';


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

      <MarketingHero maxWidth="md">
        <div className="inline-flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-full border border-app-line/90 dark:border-ref-border/90 bg-white/90 dark:bg-ref-card/90 backdrop-blur-md shadow-app-card mb-8 ring-1 ring-white/60 dark:ring-ref-border/50 mx-auto">
          <BookOpen className="w-4 h-4 text-brand-600" />
          <span className="text-[13px] text-app-muted font-medium tracking-tight">Centro de recursos</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-app-ink tracking-[-0.035em] leading-[1.08] mb-6 font-professional">
          Aprende a vender más
          <span className="block mt-2 text-gradient-brand">por WhatsApp</span>
        </h1>
        <p className="text-base sm:text-lg text-app-muted max-w-xl mx-auto leading-relaxed">
          Guías, vídeos y preguntas frecuentes para sacar el máximo partido a wazapp.
        </p>
      </MarketingHero>


      <section className="relative py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-app-shell overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-hero-glow opacity-45 dark:opacity-[0.25]" aria-hidden />
        <div className="relative max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <SectionLabel>Aprendizaje</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-bold text-app-ink tracking-[-0.03em] font-professional leading-tight">
              Empieza por aquí
            </h2>
            <p className="mt-3 text-app-muted max-w-xl text-sm sm:text-base">
              Todo lo que necesitas para configurar tu negocio en wazapp desde cero.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
            {guides.map((guide, i) => {
              const Icon = guide.icon;
              const accent = guideAccentMap[guide.accent];
              return (
                <motion.a
                  key={guide.title}
                  href="#"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4 }}
                  className="group relative block overflow-hidden rounded-[26px] p-[1px] bg-gradient-to-br from-brand-400/20 via-app-line to-transparent shadow-app-card-premium transition-shadow duration-300 hover:shadow-app-card-premium-hover"
                >
                  <div className={`h-1 ${accent.bar} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="rounded-[25px] bg-white dark:bg-ref-card p-6 ring-1 ring-white/80 dark:ring-ref-border/50 h-full">
                    <div className={`w-12 h-12 rounded-2xl ${accent.iconBg} flex items-center justify-center mb-5 transition-colors shadow-inner shadow-black/[0.02]`}>
                      <Icon className={`w-6 h-6 ${accent.iconText}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-app-ink mb-2 font-professional tracking-tight">{guide.title}</h3>
                    <p className="text-app-muted text-[13px] leading-relaxed">{guide.description}</p>
                    <span className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-brand-600 group-hover:text-brand-700 transition-colors">
                      Leer guía
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>
      </section>


      <section className="relative py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-ref-bg border-y border-app-line dark:border-ref-border overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-site-grid bg-grid opacity-[0.25] dark:opacity-[0.08] [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] dark:[mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]" aria-hidden />
        <div className="relative max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <SectionLabel>Multimedia</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-bold text-app-ink tracking-[-0.03em] font-professional leading-tight">
              Aprende en minutos
            </h2>
            <p className="mt-3 text-app-muted max-w-xl mx-auto text-sm sm:text-base">
              Tutoriales cortos para que configures todo sin complicaciones.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
            {videos.map((video) => (
              <div
                key={video.title}
                className="group rounded-[24px] overflow-hidden bg-white dark:bg-ref-card border border-app-line dark:border-ref-border shadow-app-card-premium transition-[border-color,box-shadow] duration-300 hover:border-brand-500/25 hover:shadow-app-card-premium-hover cursor-pointer ring-1 ring-white/60 dark:ring-ref-border/45"
              >
                <div className="relative aspect-video bg-app-field">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-brand-500 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg shadow-brand-500/25">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-white/95 dark:bg-ref-card/95 backdrop-blur-sm text-xs text-app-ink font-medium border border-app-line dark:border-ref-border">
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


      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-app-shell">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-bold text-app-ink tracking-[-0.03em] font-professional leading-tight">
              Todo lo que necesitas saber
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`rounded-[22px] bg-white dark:bg-ref-card border border-app-line dark:border-ref-border shadow-app-card-premium transition-[border-color,box-shadow] overflow-hidden ${
                  openFaq === i ? 'border-app-line-strong shadow-app-card-premium-hover' : 'hover:border-brand-500/20'
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


      <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden text-white border-t border-black/10">
        <div className="absolute inset-0 bg-[hsl(240_3%_13%)]" aria-hidden />
        <div className="absolute inset-0 opacity-[0.07] dark:opacity-[0.035] bg-site-grid bg-grid [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_70%)]" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/18 via-transparent to-transparent pointer-events-none" aria-hidden />
        <div className="landing-noise opacity-[0.06]" aria-hidden />
        <div className="relative max-w-3xl mx-auto text-center z-[1]">
          <SectionLabel dark>Soporte</SectionLabel>
          <div className="w-12 h-12 mx-auto mb-6 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center ring-1 ring-white/10">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-[-0.03em] font-professional text-white">
            ¿No encuentras lo que buscas?
          </h2>
          <p className="text-base sm:text-lg text-white/75 mb-10 leading-relaxed max-w-lg mx-auto">
            Nuestro equipo de soporte está listo para ayudarte con cualquier duda.
          </p>
          <a
            href="/contacto"
            className="group relative inline-flex items-center gap-2 overflow-hidden px-8 py-4 rounded-ref text-base font-semibold text-app-ink bg-white shadow-app-card-premium transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="absolute inset-0 bg-gradient-to-b from-white to-white/90" />
            <span className="relative">Contactar soporte</span>
            <svg className="relative w-5 h-5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}