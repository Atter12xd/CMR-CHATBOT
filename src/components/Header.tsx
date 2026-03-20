import { useEffect, useState } from 'react';
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

  useEffect(() => {
    setCurrentPath(window.location.pathname);

    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
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
    <header className="bg-app-raised/95 backdrop-blur-xl border-b border-app-line shadow-app-header px-4 py-2.5 md:px-6 sticky top-0 z-30">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-white/[0.06] rounded-xl transition-colors text-slate-400"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-white leading-tight font-display tracking-tight truncate">
              {getBreadcrumb()}
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block truncate">
              Panel wazapp AI
            </p>
          </div>
        </div>

        <div className="hidden md:flex flex-1 max-w-sm mx-2">
          <div className="relative w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Buscar en el panel…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500/40 transition-all"
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
          <button
            type="button"
            className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-400 shadow-lg shadow-brand-500/20 transition-all duration-150 active:scale-[0.97]"
            onClick={() => (window.location.href = '/pedidos')}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Nuevo pedido</span>
          </button>

          <button
            type="button"
            className="p-2 hover:bg-white/[0.06] rounded-xl relative transition-colors text-slate-400"
          >
            <Bell size={19} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-app-raised" />
          </button>

          <button
            type="button"
            className="hidden md:block p-2 hover:bg-white/[0.06] rounded-xl transition-colors text-slate-400"
          >
            <HelpCircle size={19} />
          </button>

          <div className="relative ml-0.5">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 hover:bg-white/[0.06] rounded-xl transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-md shadow-brand-900/40 ring-1 ring-white/10">
                <span className="text-[11px] font-bold text-white">
                  {getUserName().substring(0, 2).toUpperCase()}
                </span>
              </div>
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-app-card backdrop-blur-xl rounded-2xl shadow-app-card border border-app-line py-1.5 z-20">
                  <div className="px-4 py-3 border-b border-app-line">
                    <p className="text-sm font-semibold text-white">{getUserName()}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email || ''}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white rounded-xl transition-colors"
                    >
                      <LogOut size={15} />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
