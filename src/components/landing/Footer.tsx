import { MessageSquare, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800 bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          <div>
            <div className="mb-4">
              <img src="/logo.png" alt="wazapp.ai" className="h-8 w-auto" />
            </div>
            <div className="flex gap-3 text-slate-400">
              <a
                href="#"
                className="hover:text-white transition-colors w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="/sobre-nosotros" className="hover:text-white transition-colors">
                  Sobre nosotros
                </a>
              </li>
              <li>
                <a href="/contacto" className="hover:text-white transition-colors">
                  Contacto
                </a>
              </li>
              <li>
                <a href="/blog" className="hover:text-white transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Recursos</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="/recursos#guias" className="hover:text-white transition-colors">
                  WhatsApp Business API
                </a>
              </li>
              <li>
                <a href="/recursos" className="hover:text-white transition-colors">
                  Guías de uso
                </a>
              </li>
              <li>
                <a href="/precios" className="hover:text-white transition-colors">
                  Precios
                </a>
              </li>
              <li>
                <a href="/comparativas" className="hover:text-white transition-colors">
                  Comparativas
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="/privacidad" className="hover:text-white transition-colors">
                  Privacidad
                </a>
              </li>
              <li>
                <a href="/terminos" className="hover:text-white transition-colors">
                  Términos
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} wazapp.ai</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="/login" className="hover:text-white transition-colors">
              Iniciar sesión
            </a>
            <a href="/register" className="hover:text-white transition-colors">
              Registrarse
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
