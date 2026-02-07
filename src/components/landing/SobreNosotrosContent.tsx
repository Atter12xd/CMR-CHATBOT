import { Target, Heart, Zap, Users } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: 'Enfocados en resultados',
    desc: 'Cada funcionalidad está pensada para que vendas más, respondas más rápido y pierdas menos oportunidades.',
  },
  {
    icon: Heart,
    title: 'Atención al detalle',
    desc: 'Creamos una herramienta que nos gustaría usar nosotros mismos. Simple, clara y efectiva.',
  },
  {
    icon: Zap,
    title: 'Rápido de implementar',
    desc: 'En minutos puedes conectar WhatsApp, subir tu catálogo y empezar a recibir pedidos.',
  },
  {
    icon: Users,
    title: 'Para negocios que crecen',
    desc: 'Desde el emprendedor que empieza hasta el equipo que escala. wazapp crece contigo.',
  },
];

export default function SobreNosotrosContent() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Sobre wazapp.ai
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed">
            Somos una plataforma de mensajería para negocios. Nuestra misión es que cualquier negocio pueda vender por WhatsApp de forma profesional, sin complicaciones técnicas ni costes ocultos.
          </p>
        </div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">{v.title}</h2>
                <p className="text-slate-400">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
