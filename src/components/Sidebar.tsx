import { useEffect, useState } from 'react';
import { 
  MessageSquare, 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Brain, 
  CreditCard, 
  Settings,
  X,
  LogOut
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
    <div className="w-[260px] bg-app-shell text-white flex flex-col h-full border-r border-app-line">
      {/* Logo / Header */}
      <div className="px-4 sm:px-5 py-4 flex items-center justify-between gap-2">
        <a href="/chats" className="flex items-center gap-3 min-w-0 group">
          <img
            src="/logo.png"
            alt="wazapp AI"
            className="h-[4.75rem] sm:h-[5.25rem] w-auto max-w-[8.5rem] object-contain object-left shrink-0 opacity-95 group-hover:opacity-100 transition-opacity"
          />
          <div className="min-w-0 leading-tight">
            <span className="font-display font-extrabold text-[18px] sm:text-[19px] tracking-tight block">
              <span className="text-brand-400">wazapp</span>
              <span className="text-emerald-400"> AI</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide">Panel de control</span>
          </div>
        </a>
        {isOpen && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={18} className="text-slate-500" />
          </button>
        )}
      </div>

      {/* Navigation Label */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
          Menú
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                active
                  ? 'bg-brand-500/12 text-brand-400 shadow-[inset_0_0_0_1px_rgba(42,139,255,0.15)]'
                  : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'
              }`}
            >
              <Icon
                size={18}
                className={`${
                  active
                    ? 'text-brand-400'
                    : 'text-slate-600 group-hover:text-slate-400'
                } transition-colors`}
              />
              <span className={`text-[13px] ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(42,139,255,0.6)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-app-line">
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-lg shadow-brand-900/40 ring-1 ring-white/10 flex-shrink-0">
            <span className="text-[11px] font-bold text-white">{getUserInitials()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">
              {getUserName()}
            </p>
            <p className="text-[11px] text-slate-600 truncate">
              {user?.email || ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}