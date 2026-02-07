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
    href: '#',
  },
  {
    title: 'Cómo vender por WhatsApp',
    description: 'Guía paso a paso para configurar tu catálogo, pedidos y métodos de pago.',
    icon: ShoppingCart,
    href: '#',
  },
  {
    title: 'Buenas prácticas de atención al cliente',
    description: 'Consejos para responder rápido, cerrar ventas y fidelizar clientes.',
    icon: Headphones,
    href: '#',
  },
];

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
    a: 'En el plan Gratuito hay un límite. En Profesional y Empresa el catálogo es ilimitado.',
  },
  {
    q: '¿Ofrecen soporte técnico?',
    a: 'Sí. Todos los planes incluyen soporte por email. Profesional y Empresa tienen soporte prioritario.',
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
    <div className="min-h-screen bg-gray-950 text-white">
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Recursos para vender más por WhatsApp
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Guías, vídeos y preguntas frecuentes para sacar el máximo partido a wazapp.
            </p>
          </div>

          {/* Guías */}
          <div id="guias" className="mb-24">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-500" />
              Guías
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {guides.map((guide) => {
                const Icon = guide.icon;
                return (
                  <a
                    key={guide.title}
                    href={guide.href}
                    className="block p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-600 transition-all duration-300 hover:bg-slate-900"
                  >
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">{guide.title}</h3>
                    <p className="text-slate-400 text-sm">{guide.description}</p>
                  </a>
                );
              })}
            </div>
          </div>

          {/* FAQ */}
          <div id="faq" className="mb-24">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-blue-500" />
              Preguntas frecuentes
            </h2>
            <div className="space-y-4 max-w-3xl">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-slate-900/50 border border-slate-800 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-800/30 transition-colors"
                  >
                    <span className="font-semibold text-white pr-4">{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-6">
                      <p className="text-slate-400 text-sm">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Vídeos */}
          <div id="videos">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
              <Play className="w-6 h-6 text-blue-500" />
              Vídeos
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div
                  key={video.title}
                  className="rounded-xl overflow-hidden bg-slate-900/50 border border-slate-800 hover:border-slate-600 transition-all duration-300 group"
                >
                  <div className="relative aspect-video bg-slate-800">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-gray-900 fill-gray-900 ml-1" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-xs text-white">
                      {video.duration}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white">{video.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
