import { useState, useEffect } from 'react';
import { ArrowRight, Menu, X, Sparkles } from 'lucide-react';
import LogoBrand from './LogoBrand';

interface NavbarProps {
  showAnnouncement?: boolean;
}

const navLinks = [
  { href: '/#caracteristicas', label: 'Producto' },
  { href: '/recursos', label: 'Recursos' },
  { href: '/precios', label: 'Precios' },
  { href: '/sobre-nosotros', label: 'Nosotros' },
];

export default function Navbar({ showAnnouncement = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Announcement Bar - más sutil y elegante */}
      {showAnnouncement && (
        <div className="hidden lg:block fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-brand-600/90 via-brand-500/90 to-brand-600/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-center gap-3">
            <Sparkles className="w-4 h-4 text-brand-200" />
            <span className="text-sm text-white/90 font-medium">
              WhatsApp Business API integrado — Empieza a vender por chat hoy
            </span>
            <a 
              href="/#caracteristicas" 
              className="text-sm text-white font-semibold hover:text-brand-100 transition-colors flex items-center gap-1 ml-2"
            >
              Descubrir
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          showAnnouncement ? 'lg:top-[44px] top-0' : 'top-0'
        } ${
          scrolled 
            ? 'bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/50 shadow-lg shadow-slate-950/50' 
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <LogoBrand size="lg" href="/" />

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-lg group"
                >
                  {link.label}
                  <span className="absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-brand-500/0 via-brand-500/70 to-brand-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <a 
                href="/login" 
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Iniciar sesión
              </a>
              <a
                href="/register"
                className="group inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-600/25 hover:shadow-brand-500/30 hover:shadow-xl"
              >
                Empezar gratis
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-11 h-11 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors"
              aria-label="Menú"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 bg-slate-950/98 backdrop-blur-xl border-b border-slate-800/50 shadow-2xl transition-all duration-300 ${
            mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="px-4 py-6 space-y-1 max-h-[calc(100vh-80px)] overflow-y-auto">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3.5 text-base font-medium text-slate-200 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors"
              >
                {link.label}
              </a>
            ))}
            
            <div className="my-4 mx-4 border-t border-slate-800/70" />
            
            <a
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3.5 text-base font-medium text-slate-200 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors"
            >
              Iniciar sesión
            </a>
            
            <div className="px-4 pt-2">
              <a
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-brand-600/25"
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