import { useEffect, useState } from 'react';
import { 
  MessageSquare, 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Brain, 
  CreditCard, 
  Settings,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Chats', icon: MessageSquare, path: '/chats' },
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Pedidos', icon: ShoppingCart, path: '/pedidos' },
  { label: 'Productos', icon: Package, path: '/productos' },
  { label: 'Entrenar Bot', icon: Brain, path: '/entrenar-bot' },
  { label: 'Métodos de Pago', icon: CreditCard, path: '/metodos-pago' },
  { label: 'Configuración', icon: Settings, path: '/configuracion' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [currentPath, setCurrentPath] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    setCurrentPath(window.location.pathname);
    
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      if (onClose) onClose();
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [onClose]);

  const handleNavClick = (path: string) => {
    window.location.href = path;
  };

  const getUserName = () => {
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split('@')[0];
    return 'Usuario';
  };

  const getUserInitials = () => {
    const name = getUserName();
    return name.substring(0, 2).toUpperCase();
  };

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
      {/* Logo/Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <a href="/chats" className="flex items-center gap-2">
          <img src="/logo.png" alt="" className="h-12 w-auto shrink-0" />
          <span className="font-bold text-lg tracking-tight">
            <span className="text-teal-400">wazapp</span>
            <span className="text-emerald-400">.ai</span>
          </span>
        </a>
        {isOpen && (
          <button
            onClick={onClose}
            className="md:hidden p-1 hover:bg-gray-800 rounded"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold">{getUserInitials()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {getUserName()}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.email || ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
