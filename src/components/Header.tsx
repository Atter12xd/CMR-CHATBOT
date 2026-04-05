import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, Bell, HelpCircle, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onMenuClick?: () => void;
}

const breadcrumbMap: Record<string, string> = {
  '/': 'Chats',
  '/chats': 'Chats',
  '/dashboard': 'Dashboard',
  '/pedidos': 'Pedidos',
  '/productos': 'Productos',
  '/entrenar-bot': 'Entrenar Bot',
  '/metodos-pago': 'Métodos de Pago',
  '/configuracion': 'Configuración',
};

export default function Header({ onMenuClick }: HeaderProps) {
  const [currentPath, setCurrentPath] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPath(window.location.pathname);

    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const getBreadcrumb = () => {
    return breadcrumbMap[currentPath] || 'Dashboard';
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  const getUserName = () => {
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split('@')[0];
    return 'Usuario';
  };

  const firstName = getUserName().split(/\s+/)[0] || getUserName();

  return (
    <header className="bg-white/88 backdrop-blur-xl border-b border-app-line/90 shadow-app-header px-4 py-3 md:px-7 sticky top-0 z-30 font-professional supports-[backdrop-filter]:bg-white/72">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <motion.button
            type="button"
            onClick={onMenuClick}
            whileTap={{ scale: 0.94 }}
            className="md:hidden p-2 hover:bg-app-field rounded-2xl transition-colors text-app-muted hover:text-app-ink"
          >
            <Menu size={22} />
          </motion.button>

          <div className="min-w-0 hidden sm:block">
            <p className="text-[13px] text-app-muted font-medium">
              Hola, <span className="text-app-ink font-semibold">{firstName}</span>
            </p>
            <h1 className="text-xl md:text-[1.6rem] font-bold text-app-ink leading-tight tracking-tight truncate font-display">
              {getBreadcrumb()}
            </h1>
          </div>
          <div className="min-w-0 sm:hidden">
            <h1 className="text-lg font-bold text-app-ink leading-tight truncate font-display">{getBreadcrumb()}</h1>
          </div>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-app-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar en el panel…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-w-0 pl-11 pr-10 py-3 text-[14px] bg-app-field border-0 rounded-full text-app-ink placeholder:text-app-muted focus:outline-none focus:ring-2 focus:ring-app-charcoal/15 transition-all shadow-inner shadow-black/[0.03]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-app-muted hover:text-app-ink transition-colors text-lg leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/80"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-app-charcoal text-white text-[13px] font-semibold rounded-full hover:bg-black transition-colors shadow-md shadow-black/10"
            onClick={() => (window.location.href = '/pedidos')}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Nuevo pedido</span>
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            className="p-2.5 hover:bg-app-field rounded-full relative transition-colors text-app-muted hover:text-app-ink"
          >
            <Bell size={19} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            className="hidden md:block p-2.5 hover:bg-app-field rounded-full transition-colors text-app-muted hover:text-app-ink"
          >
            <HelpCircle size={19} />
          </motion.button>

          <div className="relative ml-0.5" ref={userMenuRef}>
            <motion.button
              type="button"
              onClick={() => setShowUserMenu((o) => !o)}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 p-1 hover:bg-app-field rounded-full transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-app-charcoal flex items-center justify-center ring-2 ring-white shadow-md">
                <span className="text-[11px] font-bold text-white">
                  {getUserName().substring(0, 2).toUpperCase()}
                </span>
              </div>
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <>
                  <motion.div
                    key="user-menu-scrim"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <motion.div
                    key="user-menu-panel"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-app-card border border-app-line py-1.5 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-app-line bg-app-field/40">
                      <p className="text-[10px] font-bold text-app-muted uppercase tracking-[0.12em]">Cuenta</p>
                      <p className="text-[15px] font-semibold text-app-ink mt-1 truncate leading-snug">{getUserName()}</p>
                      <p className="text-[12px] text-app-muted truncate mt-0.5 leading-snug">{user?.email || ''}</p>
                    </div>
                    <div className="p-1.5">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-[14px] text-app-ink hover:bg-app-field rounded-xl transition-colors"
                      >
                        <LogOut size={14} className="text-app-muted" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
