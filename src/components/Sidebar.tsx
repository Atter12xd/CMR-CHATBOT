import { useState, useEffect } from 'react';
import { MessageSquare, ShoppingCart, BarChart3, Settings, Menu, X, Package, Brain, CreditCard } from 'lucide-react';

interface SidebarProps {}

export default function Sidebar({}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    setCurrentPath(window.location.pathname);
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

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200 px-6">
            <h1 className="text-2xl font-bold text-primary-600">CMR Chat</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href || (item.href === '/' && currentPath === '/chats');
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setCurrentPath(item.href)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              <p>Versión 1.0.0</p>
              <p className="mt-1">Demo CMR Chatbot</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
