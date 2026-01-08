import { useState, useEffect } from 'react';
import { MessageSquare, ShoppingCart, BarChart3, Settings, Menu, X, Package, Brain, CreditCard } from 'lucide-react';

interface SidebarProps {}

export default function Sidebar({}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    setCurrentPath(window.location.pathname);
    // Cerrar sidebar en móvil cuando cambia la ruta
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, []);

  const menuItems = [
    { icon: MessageSquare, label: 'Chats', href: '/' },
    { icon: ShoppingCart, label: 'Pedidos', href: '/pedidos' },
    { icon: Package, label: 'Productos', href: '/productos' },
    { icon: Brain, label: 'Entrenar Bot', href: '/entrenar-bot' },
    { icon: CreditCard, label: 'Métodos de Pago', href: '/metodos-pago' },
    { icon: BarChart3, label: 'Dashboard', href: '/dashboard' },
    { icon: Settings, label: 'Configuración', href: '/configuracion' },
  ];

  const handleLinkClick = (href: string) => {
    setCurrentPath(href);
    // Cerrar sidebar en móvil al hacer clic
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile menu button - mejorado */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-gray-200 hover:bg-gray-50 transition-all"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={22} className="text-gray-700" /> : <Menu size={22} className="text-gray-700" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-72 lg:w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-xl lg:shadow-none`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 lg:h-16 border-b border-gray-200 px-6">
            <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              CMR Chat
            </h1>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 lg:px-4 py-4 lg:py-6 space-y-1 lg:space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href || (item.href === '/' && currentPath === '/chats');
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => handleLinkClick(item.href)}
                  className={`flex items-center space-x-3 px-4 py-3 lg:py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 font-semibold shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 active:bg-gray-50'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-primary-600' : 'text-gray-500'} />
                  <span className="text-sm lg:text-base">{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              <p className="font-medium">Versión 1.0.0</p>
              <p className="mt-1 text-xs">CMR Chatbot</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
