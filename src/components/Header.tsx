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
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 md:px-6 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left: Menu + Breadcrumb */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Menu size={20} className="text-slate-500" />
          </button>
          
          <div>
            <h1 className="text-lg font-semibold text-slate-900 leading-tight">
              {getBreadcrumb()}
            </h1>
          </div>
        </div>


        {/* Center: Search (hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 focus:bg-white transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                ×
              </button>
            )}
          </div>
        </div>


        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* New Order Button (hidden on mobile) */}
          <button
            className="hidden md:flex items-center gap-2 px-3.5 py-2 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 shadow-sm shadow-violet-600/20 transition-all duration-150 active:scale-[0.97]"
            onClick={() => window.location.href = '/pedidos'}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Nuevo Pedido</span>
          </button>


          {/* Notifications */}
          <button className="p-2 hover:bg-slate-100 rounded-xl relative transition-colors">
            <Bell size={19} className="text-slate-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* Help */}
          <button className="hidden md:block p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <HelpCircle size={19} className="text-slate-500" />
          </button>


          {/* User Menu */}
          <div className="relative ml-1">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm shadow-violet-600/20">
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
                ></div>
                <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 py-1.5 z-20">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">{getUserName()}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email || ''}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                    >
                      <LogOut size={15} />
                      <span>Cerrar Sesión</span>
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