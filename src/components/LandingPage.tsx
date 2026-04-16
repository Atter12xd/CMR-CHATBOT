import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Sparkles,
  TrendingUp,
  Wallet,
  CircleDollarSign,
  Headphones,
  Rocket,
  Play,
  Check,
  Loader2,
} from 'lucide-react';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import Navbar from './landing/Navbar';
import Footer from './landing/Footer';
import SectionLabel from './landing/SectionLabel';

const coins = [
  { name: 'Bitcoin', pair: 'BTC/USD', price: '$72,947.23' },
  { name: 'Ethereum', pair: 'ETH/USD', price: '$2,135.91' },
  { name: 'Solana', pair: 'SOL/USD', price: '$142.83' },
  { name: 'Polkadot', pair: 'DOT/USD', price: '$8.74' },
  { name: 'Litecoin', pair: 'LTC/USD', price: '$73.52' },
  { name: 'Dogecoin', pair: 'DOGE/USD', price: '$0.0968' },
];

const perks = [
  {
    title: '24/7 Support',
    text: 'Atencion continua para resolver dudas de ventas y operaciones.',
    icon: Headphones,
  },
  {
    title: 'Comunidad',
    text: 'Aprende con otros equipos que venden por WhatsApp todos los dias.',
    icon: Sparkles,
  },
  {
    title: 'Academia',
    text: 'Guias practicas para mejorar conversion, respuesta y cierre.',
    icon: Rocket,
  },
];

const faqs = [
  {
    q: 'What is Wazapp?',
    a: 'Wazapp is a conversational commerce platform to centralize chats, automate follow-ups and convert more leads.',
  },
  {
    q: 'Is this suitable for growing teams?',
    a: 'Yes. You can start small and scale with shared inboxes, role-based workflows and unified performance metrics.',
  },
  {
    q: 'Can I customize the sales flow?',
    a: 'Absolutely. You can adapt scripts, templates and conversion paths based on your vertical and team process.',
  },
  {
    q: 'Do you provide onboarding support?',
    a: 'Yes. We provide guided onboarding and best-practice setup to move from first chat to predictable revenue.',
  },
];

const MOTION_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function CoinTicker() {
  const row = [...coins, ...coins];
  return (
    <div className="overflow-hidden rounded-[24px] border border-app-line bg-white">
      <motion.div
        className="flex w-max"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 22, ease: 'linear', repeat: Infinity }}
      >
        {row.map((coin, idx) => (
          <div
            key={`${coin.name}-${idx}`}
            className="w-[220px] shrink-0 border-r border-app-line px-4 py-5 last:border-r-0"
          >
            <p className="text-[12px] font-semibold text-app-ink">{coin.name}</p>
            <p className="text-[11px] text-app-muted">{coin.pair}</p>
            <p className="mt-2 text-xl font-bold text-app-ink font-professional tabular-nums">{coin.price}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function LandingPageInner() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      window.location.href = '/chats';
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-professional relative overflow-hidden">
        <div className="relative flex flex-col items-center gap-4">
          <div className="app-spinner">
            <Loader2 size={20} className="animate-spin text-brand-600" />
          </div>
          <p className="text-[13px] text-app-muted font-medium tracking-wide">Cargando experiencia...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-professional antialiased text-app-ink">
      <Navbar showAnnouncement />

      <section className="relative pt-34 lg:pt-44 pb-24 lg:pb-28 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, ease: MOTION_EASE }}
          >
            <SectionLabel>Future of crypto trading style</SectionLabel>
            <h1 className="text-[2.9rem] sm:text-[4.2rem] lg:text-[5.15rem] font-bold tracking-[-0.04em] leading-[0.96]">
              Fast and Secure
              <span className="block text-gradient-brand mt-2">Cryptocurrency Exchange</span>
            </h1>
            <p className="mt-7 text-[1.08rem] text-app-muted max-w-xl leading-relaxed">
              Trade cryptocurrencies with ease, security and an advanced visual experience adapted to your growth flow.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <a
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors"
              >
                Explore More
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#services"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-app-line bg-white text-app-ink font-semibold hover:bg-app-field transition-colors"
              >
                Ver demo
                <Play className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.64, delay: 0.08, ease: MOTION_EASE }}
          >
            <div className="rounded-[30px] border border-app-line bg-white shadow-app-card-premium p-3.5">
              <img
                src="https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=1400&q=80"
                alt="Crypto 3D phone preview"
                className="w-full h-[440px] sm:h-[540px] object-cover rounded-[24px]"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-12 lg:py-14 px-4 sm:px-6 lg:px-8 bg-white border-y border-app-line">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-app-muted mb-4">Trusted by top platforms</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {['Logoipsum', 'sum', 'LOGOIPSUM', 'Logoipsum', 'sum', 'Logoipsum'].map((logo, idx) => (
              <div key={`${logo}-${idx}`} className="h-11 rounded-xl border border-app-line bg-white flex items-center justify-center">
                <span className="text-xs font-semibold text-app-muted tracking-wide">{logo}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-app-muted mb-6">Featured crypto coins</p>
          <h2 className="text-center text-[2.15rem] sm:text-5xl lg:text-[3.35rem] font-bold tracking-[-0.035em] mb-8">Top crypto coins updates</h2>
          <CoinTicker />
        </div>
      </section>

      <section id="benefits" className="py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.48, ease: MOTION_EASE }}
          >
            <SectionLabel>Why choose crypto</SectionLabel>
            <h2 className="text-[2.1rem] sm:text-5xl lg:text-[3.25rem] font-bold tracking-[-0.035em] leading-tight mb-6">
              Features of the crypto framer
              <span className="block">mobile application</span>
            </h2>
            <div className="space-y-4">
              {[
                'Disenado para equipos de ventas por chat',
                'Automatizacion + conversion en una sola vista',
                'Escalable desde startup hasta operacion enterprise',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-app-muted">
                  <span className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-brand-600" />
                  </span>
                  <p className="text-[15px]">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.52, delay: 0.06, ease: MOTION_EASE }}
          >
            <img
              src="https://images.unsplash.com/photo-1639322537504-6427a16b0a28?auto=format&fit=crop&w=1400&q=80"
              alt="Crypto dashboard cards"
              className="w-full h-[460px] object-cover rounded-[26px] border border-app-line"
              loading="lazy"
            />
          </motion.div>
        </div>
      </section>

      <section id="services" className="py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white border-y border-app-line">
        <div className="max-w-7xl mx-auto text-center">
          <SectionLabel>We deliver best solution</SectionLabel>
          <h2 className="text-[2.1rem] sm:text-5xl lg:text-[3.25rem] font-bold tracking-[-0.035em] mb-14 max-w-4xl mx-auto">
            One application with multiple options to give you freedom of buying and selling
          </h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.58, ease: MOTION_EASE }}
            className="rounded-[26px] border border-app-line bg-white p-6 md:p-8"
          >
            <img
              src="https://images.unsplash.com/photo-1642052502385-7f6f7c2e1f63?auto=format&fit=crop&w=1600&q=80"
              alt="Timeline visual"
              className="w-full h-[500px] md:h-[600px] object-cover rounded-[22px]"
              loading="lazy"
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 text-left">
              {[
                ['Planning', 'Mapea el flujo de conversaciones y ventas.'],
                ['Refinement', 'Optimiza respuestas, UX y conversion.'],
                ['Prototype', 'Prueba escenarios reales de atencion.'],
                ['Support', 'Despliega y escala con soporte continuo.'],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-2xl border border-app-line bg-app-field/30 p-4">
                  <h3 className="font-semibold text-app-ink mb-1">{title}</h3>
                  <p className="text-sm text-app-muted">{desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="why-crypgo" className="py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: MOTION_EASE }}
          >
            <img
              src="https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=1200&q=80"
              alt="Portfolio cards"
              className="w-full h-[440px] object-cover rounded-[24px] border border-app-line"
              loading="lazy"
            />
          </motion.div>
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.54, delay: 0.06, ease: MOTION_EASE }}
          >
            <SectionLabel>Crypto landing page style</SectionLabel>
            <h2 className="text-[2.1rem] sm:text-5xl lg:text-[3.2rem] font-bold tracking-[-0.035em] leading-tight mb-4">
              Create your cryptocurrency portfolio today
            </h2>
            <p className="text-lg text-app-muted mb-8">
              Un bloque visual premium para mostrar resultados, confianza y propuesta de valor con estilo moderno.
            </p>
            <div className="space-y-3">
              {[
                ['Manage your portfolio', Wallet],
                ['Vault protection', Shield],
                ['Mobile apps', CircleDollarSign],
              ].map(([label, Icon]) => (
                <div key={label as string} className="flex items-center justify-between border-b border-app-line py-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-brand-600" />
                    </span>
                    <span className="font-medium text-app-ink">{label as string}</span>
                  </div>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white border-y border-app-line">
        <div className="max-w-7xl mx-auto text-center">
          <SectionLabel>Always by your side</SectionLabel>
          <h2 className="text-[2.1rem] sm:text-5xl lg:text-[3.2rem] font-bold tracking-[-0.035em] mb-14">Be the first to use our Crypgo!</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {perks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.42, delay: idx * 0.06, ease: MOTION_EASE }}
                  className="rounded-[22px] border border-app-line bg-white p-7 shadow-app-card"
                >
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-brand-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-app-ink mb-2">{item.title}</h3>
                  <p className="text-app-muted text-sm leading-relaxed">{item.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="faqs" className="py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white border-b border-app-line">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>Popular questions</SectionLabel>
            <h2 className="text-[2.1rem] sm:text-5xl lg:text-[3.15rem] font-bold tracking-[-0.035em]">Learn more about Wazapp</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((item) => (
              <details key={item.q} className="group rounded-2xl border border-app-line bg-white p-5 open:shadow-app-card">
                <summary className="list-none cursor-pointer flex items-center justify-between gap-4">
                  <span className="font-semibold text-app-ink">{item.q}</span>
                  <span className="text-app-muted group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-app-muted leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <SectionLabel>Siguiente paso</SectionLabel>
          <h2 className="text-[2.1rem] sm:text-5xl lg:text-[3.15rem] font-bold tracking-[-0.035em] mb-5">Upgrade your crypto business</h2>
          <p className="text-lg text-app-muted mb-10">
            Diseno visual pro, secciones dinamicas y narrativa de conversion para escalar tu marca con estilo premium.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors"
            >
              Empezar gratis
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/contacto"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-app-line bg-white text-app-ink font-semibold hover:bg-app-field transition-colors"
            >
              Hablar con ventas
            </a>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-sm text-app-muted">
            {[1, 2, 3].map((x) => (
              <span key={x} className="inline-flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" />
                100% seguro
              </span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function LandingPage() {
  return (
    <AuthProvider>
      <LandingPageInner />
    </AuthProvider>
  );
}
