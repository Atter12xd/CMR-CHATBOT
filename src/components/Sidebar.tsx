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

function GeometricMark() {
  return (
    <div className="flex items-center gap-1.5 shrink-0" aria-hidden>
      <span className="w-2.5 h-2.5 rounded-sm bg-app-charcoal" />
      <span className="w-2.5 h-2.5 rounded-full bg-app-charcoal/35 border border-app-charcoal/20" />
      <span
        className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[9px] border-l-transparent border-r-transparent border-b-app-charcoal"
        style={{ marginTop: '-1px' }}
      />
    </div>
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
    <div className="w-[278px] min-w-[278px] max-w-[278px] text-app-ink flex flex-col h-full border-r border-app-line bg-gradient-to-b from-white via-white to-app-field/20 shadow-[4px_0_32px_-14px_rgba(15,23,42,0.1)] overflow-hidden font-professional rounded-r-[28px] md:rounded-none md:rounded-r-none">
      <div className="shrink-0 px-5 pt-6 pb-4">
        <div className="flex items-start justify-between gap-2">
          <a href="/chats" className="flex items-center gap-3 min-w-0 group flex-1">
            <GeometricMark />
            <div className="min-w-0 leading-tight">
              <span className="font-display font-bold text-[18px] sm:text-[19px] tracking-tight text-app-ink block">
                wazapp AI
              </span>
              <span className="text-[11px] text-app-muted font-medium tracking-wide mt-0.5 block">
                Panel de control
              </span>
            </div>
          </a>
          {isOpen && (
            <motion.button
              type="button"
              onClick={onClose}
              whileTap={{ scale: 0.94 }}
              className="md:hidden p-2 hover:bg-app-field rounded-2xl transition-colors shrink-0"
            >
              <X size={18} className="text-app-muted" />
            </motion.button>
          )}
        </div>
      </div>

      <div className="px-5 pb-2 shrink-0">
        <p className="text-[10px] font-semibold text-app-muted uppercase tracking-[0.14em]">Menú</p>
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
              whileTap={{ scale: 0.995 }}
              className={`w-full min-w-0 flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-left transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-br from-brand-50/95 to-white text-app-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_2px_8px_-2px_rgba(42,130,118,0.12)] ring-1 ring-brand-500/20'
                  : 'text-app-muted hover:text-app-ink hover:bg-white/80 hover:shadow-sm'
              }`}
            >
              <Icon size={20} className={`shrink-0 ${active ? 'text-brand-700' : 'text-app-muted'}`} />
              <span className={`text-[15px] leading-snug truncate ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </motion.nav>

      <div className="p-4 pt-2 shrink-0">
        <div className="rounded-[22px] bg-app-charcoal text-white p-4 shadow-lg shadow-black/15 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/[0.06] blur-2xl pointer-events-none" />
          <div className="absolute right-2 bottom-2 w-16 h-16 rounded-full bg-white/[0.04] blur-xl pointer-events-none" />
          <p className="text-[13px] font-semibold leading-snug relative z-[1] pr-2">
            Saca más partido a tu negocio con wazapp AI
          </p>
          <motion.a
            href="/configuracion"
            whileTap={{ scale: 0.98 }}
            className="mt-3 inline-flex items-center justify-center w-full py-2.5 rounded-full text-[13px] font-semibold bg-white/15 text-white/95 hover:bg-white/25 transition-colors relative z-[1]"
          >
            Ver planes
          </motion.a>
        </div>
      </div>

      <div className="p-4 pt-0 pb-5 shrink-0 border-t border-app-line">
        <div className="rounded-2xl border border-app-line bg-app-field/50 px-3 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-app-charcoal flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-white">{getUserInitials()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-app-ink truncate leading-snug">{getUserName()}</p>
            <p className="text-[12px] text-app-muted truncate mt-0.5 leading-snug">{user?.email || 'Sesión activa'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
