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
    <div className="w-[260px] bg-slate-900 text-white flex flex-col h-full">
      {/* Logo / Header */}
      <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
        <a href="/chats" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="" className="h-12 w-auto shrink-0" />
          <span className="font-bold text-lg tracking-tight">
            <span className="text-violet-400">wazapp</span>
            <span className="text-emerald-400">.ai</span>
          </span>
        </a>
        {isOpen && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 hover:bg-slate-700/60 rounded-lg transition-colors"
          >
            <X size={18} className="text-slate-400" />
          </button>
        )}
      </div>

      {/* Sección de navegación */}
      <div className="px-3 pt-5 pb-2">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                active
                  ? 'bg-violet-600/90 text-white shadow-lg shadow-violet-600/20'
                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
              }`}
            >
              <Icon size={18} className={active ? 'text-white' : ''} />
              <span className="text-[13px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>


      {/* User Info */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/20 flex-shrink-0">
            <span className="text-xs font-bold text-white">{getUserInitials()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">
              {getUserName()}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {user?.email || ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}