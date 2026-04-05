import { motion } from 'framer-motion';
import { Target, Heart, Zap, Users, ArrowRight, Shield, Globe, TrendingUp } from 'lucide-react';
import MarketingHero from './MarketingHero';
import SectionLabel from './SectionLabel';

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
    <div className="min-h-screen bg-app-shell font-professional text-app-ink antialiased">
      <MarketingHero maxWidth="lg" className="pb-16 lg:pb-20">
        <SectionLabel>Equipo</SectionLabel>
        <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-app-ink tracking-[-0.035em] mb-6 font-display leading-[1.08]">
          Hacemos que vender por
          <span className="block text-gradient-brand mt-1">WhatsApp sea fácil</span>
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-app-muted leading-relaxed max-w-3xl mx-auto">
          Somos una plataforma de mensajería para negocios. Nuestra misión es que cualquier empresa pueda vender por WhatsApp de forma profesional, sin complicaciones técnicas ni costos ocultos.
        </p>
      </MarketingHero>

      <section className="relative py-14 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-app-line overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-site-grid bg-grid opacity-[0.18] [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]" aria-hidden />
        <div className="relative max-w-5xl mx-auto">
          <SectionLabel>Datos</SectionLabel>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="rounded-2xl border border-app-line/90 bg-gradient-to-b from-white to-app-field/25 px-3 py-6 text-center shadow-inner shadow-black/[0.02] transition-[border-color] duration-300 hover:border-brand-500/20"
              >
                <p className="text-3xl sm:text-4xl font-bold text-app-ink mb-1 font-display tabular-nums tracking-tight">{stat.value}</p>
                <p className="text-app-muted text-[11px] sm:text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-app-shell overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-hero-glow opacity-45" aria-hidden />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>Cultura</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-bold text-app-ink font-display tracking-[-0.03em] leading-tight">
              Lo que nos define
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -3 }}
                  className="group relative p-[1px] rounded-[26px] bg-gradient-to-br from-brand-400/18 via-app-line to-transparent shadow-app-card-premium transition-shadow duration-300 hover:shadow-app-card-premium-hover"
                >
                  <div className="rounded-[25px] bg-white p-7 sm:p-8 border border-app-line/80 ring-1 ring-white/90 h-full">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-50 to-white border border-brand-500/20 flex items-center justify-center mb-5 shadow-inner shadow-black/[0.02]">
                      <Icon className="w-7 h-7 text-brand-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-app-ink mb-3 font-display tracking-tight">{v.title}</h3>
                    <p className="text-app-muted text-[15px] leading-relaxed">{v.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-app-line overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-site-grid bg-grid opacity-[0.2] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" aria-hidden />
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>Historia</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-bold text-app-ink mb-6 font-display tracking-[-0.03em] leading-tight">
              ¿Por qué creamos Wazapp?
            </h2>
          </div>

          <div className="rounded-[24px] border border-app-line/90 bg-gradient-to-b from-app-field/20 to-white p-6 sm:p-10 shadow-app-card-premium ring-1 ring-white/80">
            <div className="space-y-6 text-app-muted leading-relaxed text-[15px] sm:text-base">
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

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-app-shell">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>Confianza</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-bold text-app-ink mb-4 font-display tracking-[-0.03em] leading-tight">
              ¿Por qué elegirnos?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                icon: Shield,
                title: 'Seguro y confiable',
                desc: 'Tus datos y los de tus clientes están protegidos con encriptación de nivel empresarial.',
                ring: 'ring-emerald-500/20',
                bg: 'from-emerald-50/80 to-white',
                ic: 'text-emerald-600',
              },
              {
                icon: Globe,
                title: 'Soporte en español',
                desc: 'Atención real en tu idioma. Sin chatbots ni traducciones automáticas.',
                ring: 'ring-brand-500/20',
                bg: 'from-brand-50/80 to-white',
                ic: 'text-brand-600',
              },
              {
                icon: TrendingUp,
                title: 'En constante mejora',
                desc: 'Nuevas funcionalidades cada mes basadas en el feedback de nuestros usuarios.',
                ring: 'ring-amber-500/20',
                bg: 'from-amber-50/80 to-white',
                ic: 'text-amber-600',
              },
            ].map((item) => {
              const Ico = item.icon;
              return (
                <div
                  key={item.title}
                  className={`p-6 rounded-[24px] bg-gradient-to-b ${item.bg} border border-app-line shadow-app-card-premium text-center ring-1 ${item.ring} transition-[border-color,box-shadow] duration-300 hover:border-brand-500/15 hover:shadow-app-card-premium-hover`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/90 border border-app-line flex items-center justify-center mx-auto mb-4 shadow-inner shadow-black/[0.02]">
                    <Ico className={`w-6 h-6 ${item.ic}`} />
                  </div>
                  <h3 className="font-semibold text-app-ink mb-2 font-display">{item.title}</h3>
                  <p className="text-app-muted text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden text-white border-t border-black/10">
        <div className="absolute inset-0 bg-app-charcoal" aria-hidden />
        <div className="absolute inset-0 opacity-[0.07] bg-site-grid bg-grid [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_70%)]" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/18 via-transparent to-transparent pointer-events-none" aria-hidden />
        <div className="landing-noise opacity-[0.06]" aria-hidden />
        <div className="relative max-w-3xl mx-auto text-center z-[1]">
          <SectionLabel dark>Siguiente paso</SectionLabel>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 font-display tracking-[-0.03em] text-white">
            ¿Listo para empezar?
          </h2>
          <p className="text-base sm:text-lg text-white/75 mb-8 max-w-xl mx-auto">
            Únete a cientos de negocios que ya venden más con Wazapp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a
              href="/register"
              className="group relative inline-flex items-center gap-2 overflow-hidden px-8 py-4 rounded-2xl text-base font-semibold text-app-charcoal bg-white shadow-app-card-premium transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-gradient-to-b from-white to-white/90" />
              <span className="relative">Crear cuenta gratis</span>
              <ArrowRight className="relative w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="/contacto"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white/90 border border-white/15 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/25 transition-all duration-200"
            >
              Contactar con ventas
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}