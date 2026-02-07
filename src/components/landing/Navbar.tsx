import { useState } from 'react';
import { MessageSquare, ArrowRight, Menu, X } from 'lucide-react';
import LogoBrand from './LogoBrand';

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
      {/* Anuncio: solo en desktop */}
      {showAnnouncement && (
        <div className="hidden md:block fixed top-0 left-0 right-0 z-[60] bg-slate-900/95 backdrop-blur border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2">
            <span className="px-2 py-0.5 rounded bg-black text-white text-xs font-medium shrink-0">Nuevo</span>
            <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-sm text-slate-300">
              WhatsApp Business API integrado. Empieza a vender por chat hoy.
            </span>
            <a href="/#caracteristicas" className="text-sm text-blue-400 hover:text-blue-300 font-medium shrink-0">
              Más info →
            </a>
          </div>
        </div>
      )}
      <nav
        className={`fixed left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-slate-800 ${
          showAnnouncement ? 'md:top-[42px] top-0' : 'top-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-24 md:h-28 min-h-[64px] sm:min-h-[96px] md:min-h-[112px]">
            {/* Logo + texto */}
            <LogoBrand size="lg" href="/" />

            {/* Links desktop */}
            <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
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

            {/* CTA desktop + hamburger móvil */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Solo en desktop */}
              <div className="hidden md:flex items-center gap-2">
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
              {/* Hamburguesa solo en móvil - siempre visible */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex items-center justify-center w-12 h-12 text-white hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
                aria-label="Menú"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil desplegable - Producto, Recursos, etc. + Login/Register */}
        {mobileMenuOpen && (
          <div
            className="md:hidden absolute top-full left-0 right-0 bg-gray-950 border-b border-slate-800 shadow-2xl z-[70] max-h-[calc(100vh-64px)] overflow-y-auto"
            role="dialog"
            aria-label="Menú de navegación"
          >
            <div className="px-4 py-6 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3.5 text-base font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="border-t border-slate-800 my-4" />
              <a
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3.5 text-base font-medium text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                Iniciar sesión
              </a>
              <a
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 mx-4 mt-2 py-3.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors"
              >
                Empezar gratis
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
