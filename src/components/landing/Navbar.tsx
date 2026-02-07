import { useState } from 'react';
import { MessageSquare, Globe, ArrowRight, Menu, X } from 'lucide-react';

interface NavbarProps {
  showAnnouncement?: boolean;
}

const navLinks = [
  { href: '/#caracteristicas', label: 'Producto' },
  { href: '/recursos', label: 'Recursos' },
  { href: '/precios', label: 'Pricing' },
  { href: '/#por-que', label: 'Por qué nosotros' },
];

export default function Navbar({ showAnnouncement = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {showAnnouncement && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-slate-900/95 backdrop-blur border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 flex-wrap min-h-[38px]">
            <span className="px-2 py-0.5 rounded bg-black text-white text-xs font-medium shrink-0">Nuevo</span>
            <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 hidden sm:inline" />
            <span className="text-xs sm:text-sm text-slate-300 text-center">
              <span className="hidden sm:inline">WhatsApp Business API integrado. Empieza a vender por chat hoy.</span>
              <span className="sm:hidden">WhatsApp API integrado. Vende por chat.</span>
            </span>
            <a href="/#caracteristicas" className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 font-medium shrink-0">
              Más info →
            </a>
          </div>
        </div>
      )}
      <nav
        className={`fixed left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-slate-800 ${
          showAnnouncement ? 'top-[38px] sm:top-[42px]' : 'top-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo - más grande (85% más aprox: h-9→h-14) */}
            <a href="/" className="flex items-center shrink-0">
              <img src="/logo.png" alt="wazapp.ai" className="h-12 sm:h-14 w-auto" />
            </a>

            {/* Links desktop */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* CTA + menú móvil */}
            <div className="flex items-center gap-2 sm:gap-3">
              <a href="/login" className="text-sm font-medium text-white hover:text-slate-200 px-3 sm:px-4 py-2 transition-colors">
                Iniciar sesión
              </a>
              <a
                href="/register"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 transition-colors"
              >
                Empezar gratis
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Menú"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-gray-950 border-b border-slate-800 shadow-xl">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
