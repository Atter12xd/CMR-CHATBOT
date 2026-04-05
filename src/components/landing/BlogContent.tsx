import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import MarketingHero from './MarketingHero';
import SectionLabel from './SectionLabel';

const posts = [
  {
    title: 'Cómo vender más por WhatsApp en 5 pasos',
    excerpt: 'Consejos prácticos para convertir conversaciones en ventas.',
    date: 'Próximamente',
    slug: '#',
  },
  {
    title: 'WhatsApp Business API: guía para principiantes',
    excerpt: 'Todo lo que necesitas saber para conectar tu negocio.',
    date: 'Próximamente',
    slug: '#',
  },
  {
    title: 'Catálogo de productos: optimiza para más pedidos',
    excerpt: 'Buenas prácticas para presentar tus productos en chat.',
    date: 'Próximamente',
    slug: '#',
  },
];

export default function BlogContent() {
  return (
    <div className="min-h-screen bg-app-shell font-professional text-app-ink antialiased">
      <MarketingHero maxWidth="lg" className="pb-16">
        <SectionLabel>Editorial</SectionLabel>
        <h1 className="text-4xl md:text-5xl lg:text-[3.1rem] font-bold text-app-ink mb-4 font-display tracking-[-0.035em] leading-[1.08]">
          Blog
        </h1>
        <p className="text-base sm:text-lg text-app-muted max-w-2xl mx-auto leading-relaxed">
          Consejos, guías y novedades para vender más por WhatsApp — con el mismo criterio de producto que ves en el panel.
        </p>
      </MarketingHero>

      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-app-shell overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-hero-glow opacity-40" aria-hidden />
        <div className="relative max-w-4xl mx-auto space-y-5 sm:space-y-6">
          {posts.map((post, i) => (
            <motion.a
              key={post.title}
              href={post.slug}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3 }}
              className="group block overflow-hidden rounded-[26px] p-[1px] bg-gradient-to-br from-brand-400/22 via-app-line to-transparent shadow-app-card-premium transition-shadow duration-300 hover:shadow-app-card-premium-hover"
            >
              <div className="rounded-[25px] bg-white border border-app-line/80 p-7 sm:p-8 ring-1 ring-white/90">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-app-muted">{post.date}</span>
                <h2 className="text-xl sm:text-2xl font-bold text-app-ink mt-2 mb-3 font-display tracking-tight group-hover:text-brand-700 transition-colors">
                  {post.title}
                </h2>
                <p className="text-app-muted text-[15px] leading-relaxed mb-5">{post.excerpt}</p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 group-hover:gap-2.5 transition-all">
                  Leer más
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </section>
    </div>
  );
}
