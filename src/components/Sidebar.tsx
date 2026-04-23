import { useEffect, useState } from 'react';
import {
  MessageSquare,
  LayoutDashboard,
  ShoppingCart,
  Truck,
  Phone,
  Package,
  Brain,
  CreditCard,
  Settings,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Pedidos', icon: ShoppingCart, path: '/pedidos' },
  { label: 'Seguimiento', icon: Truck, path: '/seguimiento-pedidos' },
  { label: 'Llamadas IA', icon: Phone, path: '/llamadas-ia' },
  { label: 'Inbox multicanal', icon: MessageSquare, path: '/chats' },
  { label: 'Productos', icon: Package, path: '/productos' },
  { label: 'Entrenar Bot', icon: Brain, path: '/entrenar-bot' },
  { label: 'Métodos de Pago', icon: CreditCard, path: '/metodos-pago' },
  { label: 'Configuración', icon: Settings, path: '/configuracion' },
];

function LogoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M9 1L16.5 5.25V12.75L9 17L1.5 12.75V5.25L9 1Z" fill="white" opacity=".9" />
      <path
        d="M5.5 9C5.5 9 7 11.5 9 11.5C11 11.5 12.5 9 12.5 9"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="6.5" cy="7" r="1" fill="white" />
      <circle cx="11.5" cy="7" r="1" fill="white" />
    </svg>
  );
}

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
    <div className="w-[220px] min-w-[220px] max-w-[220px] flex flex-col h-full bg-[#212123] text-[#B8B8BB] overflow-hidden font-professional">
      {/* Logo — wazapp .sidebar-logo */}
      <div className="shrink-0 px-4 pt-5 pb-4 border-b border-white/[0.08]">
        <div className="flex items-start justify-between gap-2">
          <a href="/dashboard" className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
              <LogoIcon />
            </div>
            <div className="min-w-0 leading-none">
              <h1 className="text-sm font-bold text-white leading-none">Wazapp.ai</h1>
              <span className="text-[9px] font-semibold text-[#B8B8BB] tracking-[0.06em] block mt-0.5">
                COD PLATFORM
              </span>
            </div>
          </a>
          {isOpen && (
            <button
              type="button"
              onClick={onClose}
              className="md:hidden p-2 hover:bg-white/[0.06] rounded-md transition-colors shrink-0 text-white/80"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 min-h-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <a
              key={item.path}
              href={item.path}
              data-astro-prefetch
              onClick={() => onClose?.()}
              className={`w-full flex items-center gap-2.5 px-2.5 py-[9px] rounded-md text-left text-[13px] font-medium mb-0.5 transition-colors select-none ${
                active
                  ? 'bg-brand-500 text-white'
                  : 'text-[#B8B8BB] hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <Icon size={16} className="shrink-0 opacity-90" strokeWidth={2} />
              <span className="truncate">{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Footer — wazapp .sidebar-footer */}
      <div className="shrink-0 px-3.5 py-3 border-t border-white/[0.08] flex items-center gap-2.5">
        <div className="relative w-[34px] h-[34px] rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
          {getUserInitials()}
          <span
            className="absolute bottom-px right-px w-2 h-2 rounded-full bg-emerald-500 border-[1.5px] border-[#212123]"
            aria-hidden
          />
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="text-xs font-semibold text-white truncate">{getUserName()}</div>
          <div className="text-[10px] text-[#B8B8BB] truncate">{user?.email || 'Sesión activa'}</div>
        </div>
      </div>
    </div>
  );
}
