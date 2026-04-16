import { useState, useEffect } from 'react';
import { ArrowRight, Menu, X, Sparkles } from 'lucide-react';
import LogoBrand from './LogoBrand';

interface NavbarProps {
  showAnnouncement?: boolean;
}

const navLinks = [
  { href: '/#how-it-works', label: 'Cómo funciona' },
  { href: '/#pricing', label: 'Precios' },
  { href: '/#benefits', label: 'Beneficios' },
  { href: '/#faqs', label: 'Preguntas' },
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
      {showAnnouncement && (
        <div className="hidden lg:block fixed top-0 left-0 right-0 z-[60] bg-white text-app-ink border-b border-app-line">
          <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-center gap-3">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span className="text-sm text-app-muted font-medium">
              Bot web + bot WhatsApp integrados - Empieza a vender por chat hoy
            </span>
            <a
              href="/#features"
              className="text-sm font-semibold text-brand-600 hover:text-brand-500 transition-colors flex items-center gap-1 ml-2"
            >
              Descubrir
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      <nav
        className={`fixed left-0 right-0 z-50 transition-all duration-300 font-professional ${
          showAnnouncement ? 'lg:top-[44px] top-0' : 'top-0'
        } ${scrolled ? 'max-lg:bg-white/92 max-lg:backdrop-blur-xl max-lg:border-b max-lg:border-app-line max-lg:shadow-app-header' : ''}`}
      >
        <div
          className={`max-w-7xl mx-auto transition-all duration-300 ease-out ${
            scrolled
              ? 'max-lg:px-4 sm:max-lg:px-6 lg:mt-3 lg:mb-1 lg:mx-6 xl:mx-10 lg:rounded-2xl lg:border lg:border-app-line/70 lg:bg-white/85 lg:backdrop-blur-2xl lg:shadow-nav-float lg:px-5 xl:px-7'
              : 'px-4 sm:px-6 lg:px-8'
          }`}
        >
          <div className={`flex items-center justify-between ${scrolled ? 'h-[3.75rem] lg:h-[3.65rem]' : 'h-16 lg:h-20'}`}>
            <LogoBrand size="lg" href="/" />

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium text-app-muted hover:text-app-ink transition-colors rounded-xl group"
                >
                  {link.label}
                  <span className="absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-brand-500/0 via-brand-500/60 to-brand-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <a href="/login" className="px-4 py-2 text-sm font-medium text-app-muted hover:text-app-ink transition-colors">
                Iniciar sesión
              </a>
              <a
                href="/register"
                className="group relative inline-flex items-center gap-2 overflow-hidden px-5 py-2.5 text-white text-sm font-semibold rounded-2xl transition-all duration-200 shadow-app-card-premium hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="absolute inset-0 bg-gradient-to-b from-white/[0.14] to-transparent" />
                <span className="absolute inset-0 bg-brand-500" />
                <span className="relative">Empezar gratis</span>
                <ArrowRight className="relative w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-11 h-11 text-app-muted hover:text-app-ink hover:bg-app-field rounded-2xl transition-colors"
              aria-label="Menú"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div
          className={`lg:hidden absolute top-full left-0 right-0 bg-white border-b border-app-line shadow-lg transition-all duration-300 ${
            mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="px-4 py-6 space-y-1 max-h-[calc(100vh-80px)] overflow-y-auto">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3.5 text-base font-medium text-app-ink hover:bg-app-field/80 rounded-2xl transition-colors"
              >
                {link.label}
              </a>
            ))}

            <div className="my-4 mx-4 border-t border-app-line" />

            <a
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3.5 text-base font-medium text-app-muted hover:text-app-ink hover:bg-app-field/80 rounded-2xl transition-colors"
            >
              Iniciar sesión
            </a>

            <div className="px-4 pt-2">
              <a
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-full transition-colors shadow-md shadow-brand-500/20"
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
