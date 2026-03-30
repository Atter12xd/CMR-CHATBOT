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

  return (
    <header className="bg-app-raised/95 backdrop-blur-xl border-b border-app-line shadow-app-header px-4 py-2.5 md:px-6 sticky top-0 z-30 font-professional">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <motion.button
            type="button"
            onClick={onMenuClick}
            whileTap={{ scale: 0.94 }}
            className="md:hidden p-2 hover:bg-white/[0.08] rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <Menu size={22} />
          </motion.button>

          <div className="min-w-0">
            <h1 className="text-xl md:text-[1.35rem] font-semibold text-white leading-tight tracking-tight truncate">
              {getBreadcrumb()}
            </h1>
            <p className="text-[12px] text-slate-500 hidden sm:block truncate mt-0.5 font-medium">
              Panel wazapp AI
            </p>
          </div>
        </div>

        <div className="hidden md:flex flex-1 max-w-sm mx-2">
          <div className="relative w-full">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Buscar en el panel…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-w-0 pl-9 pr-9 py-2.5 text-[14px] bg-white/[0.05] border border-app-line rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15 focus:border-brand-500/40 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors text-lg leading-none"
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
            className="hidden md:inline-flex items-center gap-2 px-3.5 py-2.5 bg-brand-500 text-white text-[13px] font-semibold rounded-xl hover:bg-brand-400 shadow-lg shadow-brand-500/25 border border-brand-400/30 transition-colors"
            onClick={() => (window.location.href = '/pedidos')}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Nuevo pedido</span>
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-white/[0.08] rounded-xl relative transition-colors text-slate-400 hover:text-slate-200"
          >
            <Bell size={19} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-app-raised" />
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            className="hidden md:block p-2 hover:bg-white/[0.08] rounded-xl transition-colors text-slate-400 hover:text-slate-200"
          >
            <HelpCircle size={19} />
          </motion.button>

          <div className="relative ml-0.5" ref={userMenuRef}>
            <motion.button
              type="button"
              onClick={() => setShowUserMenu((o) => !o)}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 p-1.5 hover:bg-white/[0.08] rounded-xl transition-colors"
            >
              <div className="rounded-lg p-[2px] bg-gradient-to-br from-brand-400 to-purple-600">
                <div className="w-8 h-8 rounded-md bg-app-card flex items-center justify-center">
                  <span className="text-[11px] font-bold text-white">
                    {getUserName().substring(0, 2).toUpperCase()}
                  </span>
                </div>
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
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <motion.div
                    key="user-menu-panel"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1.5 w-56 bg-app-card rounded-2xl shadow-app-card border border-app-line py-1.5 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-gradient-to-br from-brand-500/10 via-transparent to-purple-600/10 border-b border-app-line">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em]">Cuenta</p>
                      <p className="text-[15px] font-semibold text-white mt-1 truncate leading-snug">{getUserName()}</p>
                      <p className="text-[12px] text-slate-500 truncate mt-0.5 leading-snug">{user?.email || ''}</p>
                    </div>
                    <div className="p-1.5">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-[14px] text-slate-300 hover:bg-white/[0.06] rounded-xl transition-colors"
                      >
                        <LogOut size={14} className="text-slate-500" />
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
