import { Target, Heart, Zap, Users, ArrowRight, Shield, Globe, TrendingUp } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: 'Enfocados en resultados',
    desc: 'Cada funcionalidad está diseñada para que vendas más, respondas más rápido y no pierdas ninguna oportunidad de negocio.',
  },
  {
    icon: Heart,
    title: 'Atención al detalle',
    desc: 'Creamos una herramienta que nosotros mismos usaríamos. Simple, clara y efectiva. Sin funciones innecesarias.',
  },
  {
    icon: Zap,
    title: 'Rápido de implementar',
    desc: 'En minutos puedes conectar WhatsApp, subir tu catálogo y empezar a recibir pedidos. Sin equipos técnicos.',
  },
  {
    icon: Users,
    title: 'Para negocios que crecen',
    desc: 'Desde el emprendedor que empieza hasta el equipo que escala. Wazapp crece contigo sin complicaciones.',
  },
];

const stats = [
  { value: '500+', label: 'Negocios activos' },
  { value: '1M+', label: 'Mensajes procesados' },
  { value: '15+', label: 'Países' },
  { value: '99.9%', label: 'Uptime' },
];

export default function SobreNosotrosContent() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Hero Section */}
      <section className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
            Hacemos que vender por
            <span className="block text-blue-400">WhatsApp sea fácil</span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto">
            Somos una plataforma de mensajería para negocios. Nuestra misión es que cualquier empresa pueda vender por WhatsApp de forma profesional, sin complicaciones técnicas ni costos ocultos.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#0d1220] border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-400 font-bold text-[11px] uppercase tracking-[0.14em] mb-4">Nuestros valores</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Lo que nos define
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="group p-8 rounded-2xl bg-[#111827]/80 border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5 group-hover:bg-blue-500/15 transition-colors">
                    <Icon className="w-7 h-7 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{v.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0d1220] border-y border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-400 font-bold text-[11px] uppercase tracking-[0.14em] mb-4">Nuestra historia</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              ¿Por qué creamos Wazapp?
            </h2>
          </div>

          <div className="prose prose-lg prose-invert mx-auto">
            <div className="space-y-6 text-slate-400 leading-relaxed">
              <p>
                Todo empezó cuando vimos cómo pequeños negocios perdían ventas porque no podían responder a tiempo los mensajes de WhatsApp. Tenían clientes interesados, pero no las herramientas para gestionarlos eficientemente.
              </p>
              <p>
                Las soluciones existentes eran demasiado complejas, caras o requerían conocimientos técnicos que la mayoría de emprendedores no tienen. Sabíamos que tenía que haber una mejor manera.
              </p>
              <p>
                Así nació Wazapp: una plataforma simple pero potente que permite a cualquier negocio profesionalizar su atención por WhatsApp, gestionar pedidos y vender más — todo desde un solo lugar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Trust Us */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              ¿Por qué elegirnos?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#111827]/80 border border-white/[0.06] text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Seguro y confiable</h3>
              <p className="text-slate-400 text-sm">
                Tus datos y los de tus clientes están protegidos con encriptación de nivel empresarial.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111827]/80 border border-white/[0.06] text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Soporte en español</h3>
              <p className="text-slate-400 text-sm">
                Atención real en tu idioma. Sin chatbots ni traducciones automáticas.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111827]/80 border border-white/[0.06] text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">En constante mejora</h3>
              <p className="text-slate-400 text-sm">
                Nuevas funcionalidades cada mes basadas en el feedback de nuestros usuarios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0d1220] to-[#0a0f1a] border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            ¿Listo para empezar?
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            Únete a cientos de negocios que ya venden más con Wazapp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25"
            >
              Crear cuenta gratis
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/contacto"
              className="inline-flex items-center gap-2 px-8 py-4 text-slate-300 hover:text-white font-semibold transition-colors"
            >
              Contactar con ventas
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}