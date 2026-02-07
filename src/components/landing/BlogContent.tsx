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
    <div className="min-h-screen bg-gray-950 text-white">
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Blog
            </h1>
            <p className="text-xl text-slate-400">
              Consejos, guías y novedades para vender más por WhatsApp.
            </p>
          </div>

          <div className="space-y-8">
            {posts.map((post) => (
              <a
                key={post.title}
                href={post.slug}
                className="block p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-600 transition-all duration-300 hover:bg-slate-900"
              >
                <span className="text-sm text-slate-500">{post.date}</span>
                <h2 className="text-2xl font-bold text-white mt-2 mb-3">{post.title}</h2>
                <p className="text-slate-400 mb-4">{post.excerpt}</p>
                <span className="inline-flex items-center gap-2 text-blue-400 font-medium">
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
