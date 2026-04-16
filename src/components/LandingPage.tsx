import { useEffect, type ComponentType } from 'react';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import type { LucideProps } from 'lucide-react';
import {
  MessageSquare,
  Zap,
  ArrowRight,
  Star,
  Check,
  Users,
  TrendingUp,
  Shield,
  Headphones,
  BarChart3,
  ShoppingCart,
  Loader2,
} from 'lucide-react';
import Navbar from './landing/Navbar';
import Footer from './landing/Footer';
import SectionLabel from './landing/SectionLabel';

function StatCard({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      className="group relative text-center font-professional"
    >
      <div className="absolute -inset-[1px] rounded-[24px] bg-gradient-to-br from-brand-400/25 via-white to-brand-600/15 dark:via-ref-card opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative rounded-[23px] border border-app-line dark:border-ref-border bg-white/90 dark:bg-ref-card/95 backdrop-blur-sm px-4 py-7 shadow-app-card-premium group-hover:shadow-app-card-premium-hover transition-shadow duration-300 ring-1 ring-white/50 dark:ring-ref-border/40">
        <p className="text-4xl lg:text-[2.75rem] font-bold text-app-ink tracking-tighter font-professional tabular-nums leading-none">
          {value}
        </p>
        <p className="mt-3 text-[11px] sm:text-[12px] text-app-muted font-medium tracking-wide uppercase">{label}</p>
      </div>
    </motion.div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  accent = 'brand',
}: {
  icon: ComponentType<LucideProps>;
  title: string;
  description: string;
  accent?: 'brand' | 'emerald' | 'amber';
}) {
  const iconClass =
    accent === 'brand'
      ? 'text-brand-600'
      : accent === 'emerald'
        ? 'text-emerald-600'
        : 'text-amber-600';

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className="group relative font-professional h-full"
    >
      <div className="absolute -inset-px rounded-[24px] bg-gradient-to-br from-brand-500/20 via-transparent to-brand-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative h-full p-6 rounded-[23px] border border-app-line dark:border-ref-border bg-white dark:bg-ref-card shadow-app-card-premium transition-[box-shadow,border-color] duration-300 group-hover:border-brand-500/25 group-hover:shadow-app-card-premium-hover">
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-app-field to-white dark:from-ref-muted dark:to-ref-card ring-1 ring-app-line dark:ring-ref-border flex items-center justify-center mb-5 shadow-inner shadow-black/[0.03]">
          <Icon className={`w-6 h-6 ${iconClass}`} />
        </div>
        <h3 className="text-lg font-semibold text-app-ink mb-2 font-professional tracking-tight">{title}</h3>
        <p className="text-app-muted text-[13px] leading-relaxed">{description}</p>
      </div>
    </motion.div>
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
      <div className="min-h-screen flex items-center justify-center bg-app-canvas font-professional relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-site-grid bg-grid opacity-40 dark:opacity-[0.12] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)] dark:[mask-image:radial-gradient(ellipse_at_center,black_12%,transparent_82%)]" aria-hidden />
        <div className="relative flex flex-col items-center gap-4">
          <div className="app-spinner">
            <Loader2 size={20} className="animate-spin text-brand-600" />
          </div>
          <p className="text-[13px] text-app-muted font-medium tracking-wide">Cargando experiencia…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-shell font-professional antialiased text-app-ink">
      <Navbar showAnnouncement />

      {/* Hero — rejilla, velado y composición asimétrica */}
      <section className="relative pt-32 lg:pt-40 pb-16 lg:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-app-canvas">
        <div
          className="pointer-events-none absolute inset-0 bg-site-grid bg-grid opacity-[0.55] dark:opacity-[0.14] [mask-image:linear-gradient(to_bottom,black_25%,transparent_88%)] dark:[mask-image:linear-gradient(to_bottom,black_18%,transparent_92%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-hero-glow opacity-100 dark:opacity-[0.42]"
          aria-hidden
        />
        <div className="landing-noise dark:opacity-[0.018]" aria-hidden />

        <div className="relative max-w-6xl mx-auto lg:grid lg:grid-cols-12 lg:gap-x-10 lg:gap-y-12 lg:items-center">
          <div className="lg:col-span-7 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-full border border-app-line/90 dark:border-ref-border/90 bg-white/85 dark:bg-ref-card/90 backdrop-blur-md shadow-app-card mb-8 ring-1 ring-white/60 dark:ring-ref-border/50"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400/90 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.45)]" />
              </span>
              <span className="text-[13px] text-app-muted font-medium tracking-tight">+500 negocios ya venden con Wazapp</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="text-[2.35rem] sm:text-5xl lg:text-[3.25rem] xl:text-[3.65rem] font-bold text-app-ink tracking-[-0.035em] leading-[1.06] font-professional"
            >
              Vende más por WhatsApp
              <span className="block mt-2 sm:mt-3 text-gradient-brand">sin perder ninguna conversación</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 lg:mt-7 text-base sm:text-lg text-app-muted max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Centraliza chats, pedidos y productos en un solo panel. Responde más rápido, vende más y mantén a tus
              clientes felices — con una experiencia pensada para equipos que viven del chat.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="mt-9 flex flex-col sm:flex-row items-center lg:items-stretch justify-center lg:justify-start gap-3 sm:gap-4"
            >
              <a
                href="/register"
                className="group relative inline-flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-4 overflow-hidden rounded-2xl text-base font-semibold text-white shadow-app-card-premium transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="absolute inset-0 bg-gradient-to-b from-white/[0.12] to-transparent" />
                <span className="absolute inset-0 bg-brand-500" />
                <span className="relative">Empezar gratis</span>
                <ArrowRight className="relative w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-4 rounded-2xl text-base font-semibold text-app-ink border border-app-line dark:border-ref-border bg-white/90 dark:bg-ref-card/90 backdrop-blur-sm shadow-inner shadow-black/[0.02] hover:border-brand-500/30 hover:bg-white dark:hover:bg-ref-muted transition-all duration-200 ring-1 ring-white/50 dark:ring-ref-border/45"
              >
                Ver cómo funciona
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              className="mt-10 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 sm:gap-8 text-[13px] text-app-muted"
            >
              {['Sin tarjeta de crédito', 'Configuración en 5 minutos', 'Soporte en español'].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/12 ring-1 ring-emerald-500/20">
                    <Check className="w-3 h-3 text-emerald-600" strokeWidth={2.5} />
                  </span>
                  <span>{t}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 mt-16 lg:mt-0 relative max-w-md mx-auto lg:max-w-none"
          >
            <div className="absolute -inset-8 rounded-[40px] bg-gradient-to-br from-brand-400/15 via-transparent to-brand-700/10 blur-3xl" aria-hidden />
            <div className="relative rounded-[28px] p-[1px] bg-gradient-to-br from-brand-400/45 via-app-line to-brand-700/25 shadow-app-card-premium">
              <div className="rounded-[27px] bg-white/95 dark:bg-ref-card/98 backdrop-blur-sm overflow-hidden ring-1 ring-white/80 dark:ring-ref-border/50">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-app-line dark:border-ref-border bg-app-field/40 dark:bg-ref-muted/35">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                  <span className="text-[11px] font-medium text-app-muted tracking-wide uppercase ml-2">Vista previa</span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-app-field to-white dark:from-ref-muted dark:to-ref-card ring-1 ring-app-line dark:ring-ref-border flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 rounded-2xl rounded-tl-sm px-3.5 py-2.5 bg-app-field border border-app-line/70">
                      <p className="text-[13px] text-app-ink leading-snug">¿Tienen disponible para mañana a las 3pm?</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-[88%] rounded-ref rounded-tr-sm px-3.5 py-2.5 bg-gradient-to-b from-brand-600 to-brand-800 text-white shadow-lg shadow-brand-900/20">
                      <p className="text-[13px] leading-snug">Sí, confirmado. Te envío el link de pago por aquí.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {[
                      ['5.4k', 'Msgs'],
                      ['94%', 'Resp.'],
                      ['62%', 'Conv.'],
                    ].map(([v, l]) => (
                      <div
                        key={l}
                        className="rounded-xl border border-app-line/80 dark:border-ref-border/80 bg-gradient-to-b from-white to-app-field/30 dark:from-ref-card dark:to-ref-muted/40 px-2 py-3 text-center"
                      >
                        <p className="text-lg font-bold font-professional text-app-ink tabular-nums">{v}</p>
                        <p className="text-[10px] text-app-muted font-medium uppercase tracking-wider mt-0.5">{l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-14 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-ref-bg border-y border-app-line dark:border-ref-border overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-site-grid bg-grid opacity-[0.2] dark:opacity-[0.06] [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)] dark:[mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]" aria-hidden />
        <div className="relative max-w-6xl mx-auto">
          <SectionLabel>Confianza sectorial</SectionLabel>
          <p className="text-center text-sm text-app-muted mb-10 max-w-lg mx-auto">
            Equipos de ventas y operaciones en los sectores que más conversan por chat.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {['Retail', 'Restaurantes', 'E-commerce', 'Servicios', 'Salud', 'Educación'].map((name) => (
              <div
                key={name}
                className="group flex items-center justify-center min-h-[4.5rem] rounded-2xl border border-app-line/90 dark:border-ref-border/90 bg-gradient-to-b from-white to-app-field/25 dark:from-ref-card dark:to-ref-muted/35 px-3 py-4 text-center shadow-inner shadow-black/[0.02] transition-[border-color,box-shadow] duration-300 hover:border-brand-500/25 hover:shadow-app-card"
              >
                <span className="text-[13px] sm:text-sm font-semibold text-app-muted group-hover:text-app-ink font-professional tracking-tight transition-colors">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="caracteristicas" className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-app-shell overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-hero-glow opacity-60 dark:opacity-[0.32]" aria-hidden />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16 lg:mb-20">
            <SectionLabel>Producto</SectionLabel>
            <h2 className="text-3xl lg:text-4xl xl:text-[2.75rem] font-bold text-app-ink tracking-[-0.03em] font-professional leading-[1.12]">
              Todo lo que necesitas para vender más
            </h2>
            <p className="mt-5 text-base sm:text-lg text-app-muted max-w-2xl mx-auto leading-relaxed">
              Una plataforma completa para gestionar tu negocio desde WhatsApp — con la misma claridad que tu panel
              interno.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={MessageSquare}
              title="Inbox unificado"
              description="Todas tus conversaciones de WhatsApp en un solo lugar. Nunca pierdas un mensaje importante."
              accent="brand"
            />
            <FeatureCard
              icon={ShoppingCart}
              title="Gestión de pedidos"
              description="Crea, edita y rastrea pedidos directamente desde el chat. Integrado con tu catálogo."
              accent="emerald"
            />
            <FeatureCard
              icon={BarChart3}
              title="Catálogo de productos"
              description="Muestra tus productos con precios y disponibilidad. Los clientes pueden pedir desde el chat."
              accent="amber"
            />
            <FeatureCard
              icon={Zap}
              title="Respuestas rápidas"
              description="Templates y respuestas automáticas para las preguntas más frecuentes."
              accent="brand"
            />
            <FeatureCard
              icon={Users}
              title="Trabajo en equipo"
              description="Asigna conversaciones a diferentes agentes. Todos ven el historial completo."
              accent="emerald"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Métricas y reportes"
              description="Mide tiempos de respuesta, conversiones y satisfacción de tus clientes."
              accent="amber"
            />
          </div>
        </div>
      </section>

      <section id="demo" className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-ref-bg border-y border-app-line dark:border-ref-border overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-site-grid bg-grid opacity-[0.35] dark:opacity-[0.11] [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)] dark:[mask-image:linear-gradient(to_bottom,transparent,black_22%,black_78%,transparent)]" aria-hidden />
        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <SectionLabel>Flujo</SectionLabel>
              <h2 className="text-3xl lg:text-4xl font-bold text-app-ink tracking-[-0.03em] mb-6 font-professional leading-tight">
                De la conversación al pedido en segundos
              </h2>
              <p className="text-base sm:text-lg text-app-muted mb-10 leading-relaxed">
                Wazapp conecta tu WhatsApp con un panel de control potente. Responde chats, gestiona pedidos y actualiza
                tu catálogo sin salir de la plataforma.
              </p>

              <div className="relative space-y-0 pl-2">
                <div className="absolute left-[21px] top-3 bottom-3 w-px bg-gradient-to-b from-brand-400/50 via-app-line to-brand-400/30" aria-hidden />
                {[
                  { step: '01', title: 'Conecta tu WhatsApp', desc: 'Escanea un código QR y listo. Sin APIs complicadas.' },
                  { step: '02', title: 'Recibe y responde chats', desc: 'Todas las conversaciones llegan a tu panel unificado.' },
                  { step: '03', title: 'Convierte en ventas', desc: 'Crea pedidos y envía links de pago desde el chat.' },
                ].map((item, i) => (
                  <div key={i} className="relative flex gap-5 pb-10 last:pb-0">
                    <div className="relative z-[1] w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-50 to-white dark:from-brand-950/40 dark:to-ref-card border border-brand-500/25 shadow-sm flex items-center justify-center shrink-0 ring-4 ring-white dark:ring-ref-bg">
                      <span className="text-xs font-bold text-brand-700 font-professional tracking-tight">{item.step}</span>
                    </div>
                    <div className="pt-0.5">
                      <h3 className="font-semibold text-app-ink mb-1 font-professional">{item.title}</h3>
                      <p className="text-sm text-app-muted leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-br from-brand-400/12 to-transparent blur-2xl" aria-hidden />
              <div className="relative rounded-[26px] p-[1px] bg-gradient-to-br from-brand-400/35 via-app-line to-brand-700/20 shadow-app-card-premium">
                <div className="relative rounded-[25px] overflow-hidden bg-white dark:bg-ref-card ring-1 ring-white/90 dark:ring-ref-border/50 p-6 sm:p-7">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-app-field flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 bg-app-field rounded-2xl rounded-tl-md px-4 py-3 border border-app-line/60">
                      <p className="text-sm text-app-ink">¡Hola! ¿Tienen disponibilidad para mañana?</p>
                      <p className="text-xs text-app-muted mt-1">10:23 AM</p>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <div className="flex-1 bg-brand-600 rounded-ref rounded-tr-md px-4 py-3 max-w-[85%]">
                      <p className="text-sm text-white">¡Hola! Sí, tenemos horarios a las 10am y 3pm. ¿Cuál prefieres? 😊</p>
                      <p className="text-xs text-white/70 mt-1">10:24 AM · Leído</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-app-field flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 bg-app-field rounded-2xl rounded-tl-md px-4 py-3 border border-app-line/60">
                      <p className="text-sm text-app-ink">Perfecto, a las 3pm. ¿Cuánto es el total?</p>
                      <p className="text-xs text-app-muted mt-1">10:25 AM</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-app-line bg-gradient-to-b from-transparent to-app-field/20 -mx-6 sm:-mx-7 px-6 sm:px-7 pb-1">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl py-3 border border-app-line/60 dark:border-ref-border/60 bg-white/80 dark:bg-ref-muted/50">
                      <p className="text-xl sm:text-2xl font-bold text-app-ink font-professional tabular-nums">5,477</p>
                      <p className="text-[10px] sm:text-xs text-app-muted mt-1 font-medium uppercase tracking-wider">Mensajes</p>
                    </div>
                    <div className="rounded-xl py-3 border border-app-line/60 dark:border-ref-border/60 bg-white/80 dark:bg-ref-muted/50">
                      <p className="text-xl sm:text-2xl font-bold text-app-ink font-professional tabular-nums">94%</p>
                      <p className="text-[10px] sm:text-xs text-app-muted mt-1 font-medium uppercase tracking-wider">Respuesta</p>
                    </div>
                    <div className="rounded-xl py-3 border border-brand-500/20 bg-brand-50/40">
                      <p className="text-xl sm:text-2xl font-bold text-brand-700 font-professional tabular-nums">62%</p>
                      <p className="text-[10px] sm:text-xs text-app-muted mt-1 font-medium uppercase tracking-wider">Conversión</p>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="por-que" className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-app-shell overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-site-grid bg-grid opacity-[0.25] dark:opacity-[0.08] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)] dark:[mask-image:radial-gradient(ellipse_at_center,black_12%,transparent_82%)]" aria-hidden />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>Valor</SectionLabel>
            <h2 className="text-3xl lg:text-4xl xl:text-[2.75rem] font-bold text-app-ink tracking-[-0.03em] font-professional leading-tight">
              Simple, rápido y efectivo
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {[
              { icon: Zap, title: 'En minutos', desc: 'Conecta tu WhatsApp en menos de 5 minutos. Sin instalaciones complejas.' },
              { icon: Shield, title: 'Seguro', desc: 'Tus datos y conversaciones protegidos con encriptación de nivel empresarial.' },
              { icon: Headphones, title: 'Soporte real', desc: 'Atención en español cuando lo necesites. Respondemos en menos de 24h.' },
              { icon: TrendingUp, title: 'Escalable', desc: 'Desde 1 hasta 100+ agentes. Crece sin cambiar de plataforma.' },
            ].map((item, i) => {
              const ItemIcon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -3 }}
                  className="group p-6 rounded-[24px] border border-app-line dark:border-ref-border bg-gradient-to-b from-white to-app-field/15 dark:from-ref-card dark:to-ref-muted/30 shadow-app-card-premium font-professional transition-[box-shadow,border-color] duration-300 hover:border-brand-500/20 hover:shadow-app-card-premium-hover"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-50/80 to-white dark:from-brand-950/35 dark:to-ref-card ring-1 ring-brand-500/15 flex items-center justify-center mb-4 shadow-sm">
                    <ItemIcon className="w-6 h-6 text-brand-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-app-ink mb-2 font-professional tracking-tight">{item.title}</h3>
                  <p className="text-[13px] text-app-muted leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-ref-bg border-y border-app-line dark:border-ref-border overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-hero-glow opacity-40 dark:opacity-[0.22]" aria-hidden />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>Impacto</SectionLabel>
            <h2 className="text-3xl lg:text-4xl xl:text-[2.75rem] font-bold text-app-ink tracking-[-0.03em] font-professional leading-tight">
              Números que hablan
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard value="60%" label="Ventas más rápido" delay={0} />
            <StatCard value="81%" label="Tasa de conversión" delay={100} />
            <StatCard value="3x" label="Más leads calificados" delay={200} />
            <StatCard value="<2min" label="Tiempo de respuesta" delay={300} />
          </div>
        </div>
      </section>

      <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-app-shell overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 dark:from-ref-fg/[0.06] via-transparent to-transparent" aria-hidden />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>Casos</SectionLabel>
            <h2 className="text-3xl lg:text-4xl xl:text-[2.75rem] font-bold text-app-ink tracking-[-0.03em] font-professional leading-tight">
              Negocios que crecen con Wazapp
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
            {[
              {
                title: 'Tienda online aumenta pedidos un 50%',
                desc: 'Centralizó WhatsApp + catálogo de productos',
                metric: '+50% pedidos',
                industry: 'E-commerce',
              },
              {
                title: 'Restaurante reduce tiempo de respuesta 70%',
                desc: 'Gestión de reservas y pedidos en tiempo real',
                metric: '-70% tiempo',
                industry: 'Restaurante',
              },
              {
                title: 'Clínica recupera citas perdidas',
                desc: 'Recordatorios automáticos por WhatsApp',
                metric: '+35% asistencia',
                industry: 'Salud',
              },
              {
                title: 'Tienda física expande ventas por delivery',
                desc: 'WhatsApp como canal principal de ventas',
                metric: '+200% reach',
                industry: 'Retail',
              },
            ].map((card, i) => (
              <motion.a
                key={i}
                href="/register"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.45, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className="group relative block overflow-hidden rounded-[26px] p-[1px] bg-gradient-to-br from-brand-400/25 via-app-line to-transparent font-professional shadow-app-card-premium transition-shadow duration-300 hover:shadow-app-card-premium-hover"
              >
                <div className="h-full rounded-[25px] bg-white dark:bg-ref-card p-6 sm:p-7 ring-1 ring-white/80 dark:ring-ref-border/50">
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <span className="px-3 py-1.5 rounded-full bg-app-field/80 border border-app-line text-[11px] font-semibold text-app-muted uppercase tracking-wider">
                      {card.industry}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-emerald-600 font-professional tabular-nums shrink-0">
                      {card.metric}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-app-ink mb-2 font-professional tracking-tight group-hover:text-brand-700 transition-colors pr-2">
                    {card.title}
                  </h3>
                  <p className="text-[13px] text-app-muted mb-5 leading-relaxed">{card.desc}</p>
                  <span className="text-sm font-semibold text-brand-600 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                    Ver historia
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden text-app-ink">
        <div className="absolute inset-0 bg-white" aria-hidden />
        <div
          className="absolute inset-0 opacity-[0.07] dark:opacity-[0.035] bg-site-grid bg-grid [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_70%)]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-transparent to-transparent pointer-events-none" aria-hidden />
        <div className="landing-noise opacity-[0.06]" aria-hidden />
        <div className="relative max-w-3xl mx-auto text-center z-[1]">
          <SectionLabel>Siguiente paso</SectionLabel>
          <h2 className="text-3xl lg:text-4xl xl:text-[2.85rem] font-bold tracking-[-0.03em] mb-6 font-professional text-app-ink">
            ¿Listo para vender más?
          </h2>
          <p className="text-base sm:text-lg text-app-muted mb-10 max-w-xl mx-auto leading-relaxed">
            Únete a equipos que ya convirtieron el chat en su canal de ingresos más rentable. Onboarding guiado y soporte
            en español.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a
              href="/register"
              className="group relative inline-flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-4 overflow-hidden rounded-ref text-base font-semibold text-app-ink bg-white shadow-app-card-premium transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-gradient-to-b from-white to-white/90" />
              <span className="relative">Empezar gratis</span>
              <ArrowRight className="relative w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="/contacto"
              className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-4 rounded-2xl text-base font-semibold text-app-ink border border-app-line bg-white hover:bg-app-field transition-all duration-200"
            >
              Hablar con ventas
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-amber-400/95 fill-amber-400/95 drop-shadow-sm" />
            ))}
            <span className="ml-2 sm:ml-3 text-sm text-white/60">4.9/5 · +200 reseñas verificadas</span>
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
