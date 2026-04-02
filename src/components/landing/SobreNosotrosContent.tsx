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
    <div className="min-h-screen bg-app-shell font-professional text-app-ink">
      {/* Hero Section */}
      <section className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8 bg-app-canvas">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-app-ink tracking-tight mb-6 font-display">
            Hacemos que vender por
            <span className="block text-brand-600">WhatsApp sea fácil</span>
          </h1>
          <p className="text-lg lg:text-xl text-app-muted leading-relaxed max-w-3xl mx-auto">
            Somos una plataforma de mensajería para negocios. Nuestra misión es que cualquier empresa pueda vender por WhatsApp de forma profesional, sin complicaciones técnicas ni costos ocultos.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-app-line">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl lg:text-5xl font-bold text-app-ink mb-2 font-display">{stat.value}</p>
                <p className="text-app-muted text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-app-shell">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-app-muted mb-4">Nuestros valores</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-app-ink font-display">
              Lo que nos define
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="group p-8 rounded-[22px] bg-white border border-app-line shadow-app-card transition-[border-color] duration-200 hover:border-app-line-strong"
                >
                  <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-5 transition-colors">
                    <Icon className="w-7 h-7 text-brand-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-app-ink mb-3">{v.title}</h3>
                  <p className="text-app-muted leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-app-line">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-app-muted mb-4">Nuestra historia</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-app-ink mb-6 font-display">
              ¿Por qué creamos Wazapp?
            </h2>
          </div>

          <div className="prose prose-lg mx-auto max-w-none">
            <div className="space-y-6 text-app-muted leading-relaxed">
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-app-shell">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-app-ink mb-4 font-display">
              ¿Por qué elegirnos?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-[22px] bg-white border border-app-line shadow-app-card text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-app-ink mb-2">Seguro y confiable</h3>
              <p className="text-app-muted text-sm">
                Tus datos y los de tus clientes están protegidos con encriptación de nivel empresarial.
              </p>
            </div>

            <div className="p-6 rounded-[22px] bg-white border border-app-line shadow-app-card text-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="font-semibold text-app-ink mb-2">Soporte en español</h3>
              <p className="text-app-muted text-sm">
                Atención real en tu idioma. Sin chatbots ni traducciones automáticas.
              </p>
            </div>

            <div className="p-6 rounded-[22px] bg-white border border-app-line shadow-app-card text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-app-ink mb-2">En constante mejora</h3>
              <p className="text-app-muted text-sm">
                Nuevas funcionalidades cada mes basadas en el feedback de nuestros usuarios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-app-charcoal text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 font-display">
            ¿Listo para empezar?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Únete a cientos de negocios que ya venden más con Wazapp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-app-charcoal hover:bg-white/95 font-semibold rounded-2xl transition-all duration-200 shadow-lg"
            >
              Crear cuenta gratis
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/contacto"
              className="inline-flex items-center gap-2 px-8 py-4 text-white/90 hover:text-white font-semibold transition-colors"
            >
              Contactar con ventas
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}