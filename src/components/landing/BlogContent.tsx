import { ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-app-shell font-professional text-app-ink">
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-app-canvas">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-app-ink mb-4 font-display">
              Blog
            </h1>
            <p className="text-xl text-app-muted">
              Consejos, guías y novedades para vender más por WhatsApp.
            </p>
          </div>

          <div className="space-y-8">
            {posts.map((post) => (
              <a
                key={post.title}
                href={post.slug}
                className="block p-8 rounded-[22px] border border-app-line bg-white shadow-app-card transition-all duration-200 hover:border-app-line-strong"
              >
                <span className="text-sm text-app-muted">{post.date}</span>
                <h2 className="text-2xl font-bold text-app-ink mt-2 mb-3 font-display">{post.title}</h2>
                <p className="text-app-muted mb-4">{post.excerpt}</p>
                <span className="inline-flex items-center gap-2 text-brand-600 font-medium">
                  Leer más
                  <ArrowRight className="w-4 h-4" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
