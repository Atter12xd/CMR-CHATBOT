import { MessageSquare, Globe, ArrowRight } from 'lucide-react';

interface NavbarProps {
  showAnnouncement?: boolean;
}

export default function Navbar({ showAnnouncement = false }: NavbarProps) {
  return (
    <>
      {showAnnouncement && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-slate-900/95 backdrop-blur border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-black text-white text-xs font-medium">Nuevo</span>
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-slate-300">
              WhatsApp Business API integrado. Empieza a vender por chat hoy.
            </span>
            <a href="/#caracteristicas" className="text-sm text-blue-400 hover:text-blue-300 font-medium">
              Más info →
            </a>
          </div>
        </div>
      )}
      <nav
        className={`fixed left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-slate-800 ${
          showAnnouncement ? 'top-[42px]' : 'top-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center">
              <img src="/logo.png" alt="wazapp.ai" className="h-9 w-auto" />
            </a>

            <div className="hidden md:flex items-center gap-1">
              <a
                href="/#caracteristicas"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
              >
                Producto
              </a>
              <a
                href="/recursos"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
              >
                Recursos
              </a>
              <a
                href="/precios"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
              >
                Pricing
              </a>
              <a
                href="/#por-que"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
              >
                Por qué nosotros
              </a>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 text-slate-400 hover:text-white transition-colors hidden md:block">
                <Globe className="w-5 h-5" />
              </button>
              <a href="/login" className="text-sm font-medium text-white hover:text-slate-200 px-4 py-2 transition-colors">
                Iniciar sesión
              </a>
              <a
                href="/register"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 transition-colors"
              >
                Empezar gratis
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
