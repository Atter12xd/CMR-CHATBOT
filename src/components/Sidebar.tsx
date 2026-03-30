import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  LayoutDashboard,
  ShoppingCart,
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
  { label: 'Chats', icon: MessageSquare, path: '/chats' },
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Pedidos', icon: ShoppingCart, path: '/pedidos' },
  { label: 'Productos', icon: Package, path: '/productos' },
  { label: 'Entrenar Bot', icon: Brain, path: '/entrenar-bot' },
  { label: 'Métodos de Pago', icon: CreditCard, path: '/metodos-pago' },
  { label: 'Configuración', icon: Settings, path: '/configuracion' },
];

const navList = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.04 },
  },
};

const navRow = {
  hidden: { opacity: 0, x: -10 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 380, damping: 28 },
  },
};


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
    <div className="w-[278px] min-w-[278px] max-w-[278px] text-white flex flex-col h-full border-r border-app-line bg-gradient-to-b from-app-card to-[#0c1018] shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.04)] overflow-hidden font-professional">
      {/* Cabecera — mismo lenguaje que ficha CRM / lista chats */}
      <div className="shrink-0 px-4 sm:px-5 py-4 bg-gradient-to-br from-brand-500/10 via-app-card to-purple-600/10 border-b border-app-line">
        <div className="flex items-start justify-between gap-2">
          <a href="/chats" className="flex items-center gap-3 min-w-0 group flex-1">
            <img
              src="/logo.png"
              alt="wazapp AI"
              className="h-[4.75rem] sm:h-[5.25rem] w-auto max-w-[8.5rem] object-contain object-left shrink-0 opacity-95 group-hover:opacity-100 transition-opacity"
            />
            <div className="min-w-0 leading-tight pt-1">
              <span className="font-display font-extrabold text-[19px] sm:text-[21px] tracking-tight block">
                <span className="text-brand-400">wazapp</span>
                <span className="text-emerald-400"> AI</span>
              </span>
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-[0.14em] mt-0.5 block">
                Panel de control
              </span>
            </div>
          </a>
          {isOpen && (
            <motion.button
              type="button"
              onClick={onClose}
              whileTap={{ scale: 0.94 }}
              className="md:hidden p-2 hover:bg-white/[0.08] rounded-xl transition-colors shrink-0"
            >
              <X size={18} className="text-slate-400" />
            </motion.button>
          )}
        </div>
      </div>

      <div className="px-5 pt-4 pb-2 shrink-0">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.14em]">Menú</p>
      </div>

      <motion.nav
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3 min-h-0 overscroll-contain flex flex-col gap-1"
        variants={navList}
        initial="hidden"
        animate="show"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <motion.button
              key={item.path}
              type="button"
              variants={navRow}
              onClick={() => handleNavClick(item.path)}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
              whileTap={{ scale: 0.995 }}
              className={`w-full min-w-0 flex items-center gap-3.5 px-3.5 py-3.5 rounded-xl text-left transition-[box-shadow,border-color] border ${
                active
                  ? 'bg-gradient-to-r from-brand-500/12 to-purple-600/10 border-brand-500/25 text-brand-300 shadow-[inset_3px_0_0_0_rgb(42,139,255)]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-app-line'
              }`}
            >
              <Icon
                size={20}
                className={`shrink-0 ${active ? 'text-brand-400' : 'text-slate-500'}`}
              />
              <span className={`text-[15px] leading-snug truncate ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
              {active && (
                <span className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(42,139,255,0.55)]" />
              )}
            </motion.button>
          );
        })}
      </motion.nav>

      <div className="p-3 pt-2 shrink-0 border-t border-app-line bg-white/[0.02]">
        <div className="rounded-2xl border border-app-line bg-white/[0.03] px-3 py-3 flex items-center gap-3 shadow-app-card">
          <div className="rounded-full p-[2px] bg-gradient-to-br from-brand-400 to-purple-600 shrink-0">
            <div className="w-9 h-9 rounded-full bg-app-card flex items-center justify-center">
              <span className="text-[11px] font-bold text-white">{getUserInitials()}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-white truncate leading-snug">{getUserName()}</p>
            <p className="text-[12px] text-slate-500 truncate mt-0.5 leading-snug">{user?.email || 'Sesión activa'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}