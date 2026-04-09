import { Twitter, Linkedin, Instagram, Mail } from 'lucide-react';
import LogoBrand from './LogoBrand';

const footerLinks = {
  producto: [
    { href: '/#caracteristicas', label: 'Características' },
    { href: '/precios', label: 'Precios' },
    { href: '/recursos', label: 'Recursos' },
    { href: '/comparativas', label: 'Comparativas' },
  ],
  empresa: [
    { href: '/sobre-nosotros', label: 'Sobre nosotros' },
    { href: '/blog', label: 'Blog' },
    { href: '/contacto', label: 'Contacto' },
  ],
  legal: [
    { href: '/privacidad', label: 'Privacidad' },
    { href: '/terminos', label: 'Términos de servicio' },
  ],
};

const socialLinks = [
  { href: '#', icon: Twitter, label: 'Twitter' },
  { href: '#', icon: Linkedin, label: 'LinkedIn' },
  { href: '#', icon: Instagram, label: 'Instagram' },
];

export default function Footer() {
  return (
    <footer className="relative bg-white dark:bg-ref-bg border-t border-app-line dark:border-ref-border font-professional">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 lg:py-20">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-12">
            <div className="col-span-2 md:col-span-4 lg:col-span-5">
              <LogoBrand size="md" href="/" />
              <p className="mt-4 text-app-muted text-sm leading-relaxed max-w-sm">
                Centraliza tus conversaciones de WhatsApp, gestiona pedidos y aumenta tus ventas desde un solo lugar.
              </p>

              <div className="flex items-center gap-2 mt-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 flex items-center justify-center rounded-2xl border border-app-line bg-app-field/50 text-app-muted hover:bg-app-field hover:text-app-ink transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>

              <div className="mt-6 space-y-2">
                <a
                  href="mailto:hola@wazapp.ai"
                  className="flex items-center gap-2 text-sm text-app-muted hover:text-app-ink transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  hola@wazapp.ai
                </a>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <h4 className="text-[11px] font-semibold text-app-muted uppercase tracking-[0.14em] mb-4">Producto</h4>
              <ul className="space-y-3">
                {footerLinks.producto.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm text-app-muted hover:text-app-ink transition-colors inline-block">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-1 md:col-span-2">
              <h4 className="text-[11px] font-semibold text-app-muted uppercase tracking-[0.14em] mb-4">Empresa</h4>
              <ul className="space-y-3">
                {footerLinks.empresa.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm text-app-muted hover:text-app-ink transition-colors inline-block">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-1 md:col-span-2">
              <h4 className="text-[11px] font-semibold text-app-muted uppercase tracking-[0.14em] mb-4">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm text-app-muted hover:text-app-ink transition-colors inline-block">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 md:col-span-4 lg:col-span-3">
              <h4 className="text-sm font-semibold text-app-ink mb-4">¿Listo para empezar?</h4>
              <p className="text-sm text-app-muted mb-4">
                Crea tu cuenta gratis y empieza a vendir más por WhatsApp hoy mismo.
              </p>
              <a
                href="/register"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-full transition-colors shadow-md shadow-brand-500/20"
              >
                Crear cuenta gratis
              </a>
            </div>
          </div>
        </div>

        <div className="py-6 border-t border-app-line flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-app-muted">© {new Date().getFullYear()} wazapp.ai — Todos los derechos reservados</p>
          <div className="flex items-center gap-6">
            <a href="/login" className="text-sm text-app-muted hover:text-app-ink transition-colors">
              Iniciar sesión
            </a>
            <a href="/register" className="text-sm text-app-muted hover:text-app-ink transition-colors">
              Registrarse
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
