import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, Bell, HelpCircle, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onMenuClick?: () => void;
}

const breadcrumbMap: Record<string, string> = {
  '/': 'WhatsApp CRM',
  '/chats': 'WhatsApp CRM',
  '/dashboard': 'Dashboard',
  '/pedidos': 'Pedidos',
  '/llamadas-ia': 'Llamadas IA',
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
    <header className="bg-white border-b border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,.08),0_1px_2px_rgba(0,0,0,.05)] px-4 py-3 md:px-7 sticky top-0 z-30 font-professional">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <motion.button
            type="button"
            onClick={onMenuClick}
            whileTap={{ scale: 0.94 }}
            className="md:hidden p-2 hover:bg-[#f3f4f6] rounded-md transition-colors text-[#6D6D70] hover:text-[#3D3D40]"
          >
            <Menu size={22} />
          </motion.button>

          <div className="min-w-0 hidden sm:block">
            <p className="text-[13px] text-[#6D6D70] font-medium">
              Hola, <span className="text-[#3D3D40] font-semibold">{firstName}</span>
            </p>
            <h1 className="text-[22px] font-bold text-[#1a1a1c] leading-tight truncate font-professional">
              {getBreadcrumb()}
            </h1>
          </div>
          <div className="min-w-0 sm:hidden">
            <h1 className="text-lg font-bold text-[#1a1a1c] leading-tight truncate font-professional">{getBreadcrumb()}</h1>
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
              className="w-full min-w-0 pl-11 pr-10 py-2.5 text-[13px] bg-[#f9fafb] border border-[#E5E7EB] rounded-full text-[#3D3D40] placeholder:text-[#6D6D70] focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6D6D70] hover:text-[#3D3D40] transition-colors text-lg leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f3f4f6]"
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
            className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 bg-brand-500 text-white text-[13px] font-semibold rounded-md hover:opacity-[0.87] transition-opacity shadow-[0_1px_3px_rgba(0,0,0,.08)]"
            onClick={() => (window.location.href = '/pedidos')}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Nuevo pedido</span>
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            className="p-2.5 hover:bg-[#f3f4f6] rounded-full relative transition-colors text-[#6D6D70] hover:text-[#3D3D40]"
          >
            <Bell size={19} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            className="hidden md:block p-2.5 hover:bg-[#f3f4f6] rounded-full transition-colors text-[#6D6D70] hover:text-[#3D3D40]"
          >
            <HelpCircle size={19} />
          </motion.button>

          <div className="relative ml-0.5" ref={userMenuRef}>
            <motion.button
              type="button"
              onClick={() => setShowUserMenu((o) => !o)}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 p-1 hover:bg-[#f3f4f6] rounded-full transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center ring-2 ring-white shadow-md">
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
                    className="absolute right-0 top-full mt-2 w-56 bg-ref-card rounded-ref shadow-md border border-ref-border py-1.5 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-ref-border bg-ref-muted/50">
                      <p className="text-[10px] font-bold text-app-muted uppercase tracking-[0.12em]">Cuenta</p>
                      <p className="text-[15px] font-semibold text-app-ink mt-1 truncate leading-snug">{getUserName()}</p>
                      <p className="text-[12px] text-app-muted truncate mt-0.5 leading-snug">{user?.email || ''}</p>
                    </div>
                    <div className="p-1.5">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm text-app-ink hover:bg-ref-muted rounded-ref transition-colors"
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
