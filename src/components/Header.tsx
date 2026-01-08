import { useState } from 'react';
import { Bell, Search, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    setShowMenu(false);
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Error al cerrar sesión:', error);
      }
      // Forzar redirección y limpiar cualquier estado
      window.location.replace('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Redirigir de todas formas
      window.location.replace('/login');
    }
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario';

  return (
    <header className="h-14 lg:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex-1 max-w-xl mr-2 lg:mr-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-9 pr-4 py-2 text-sm lg:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 lg:bg-white"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 lg:space-x-4">
        <button 
          className="relative p-2 lg:p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          aria-label="Notificaciones"
        >
          <Bell size={18} className="lg:w-5 lg:h-5" />
          <span className="absolute top-1.5 right-1.5 lg:top-2 lg:right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center space-x-2 px-2 lg:px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Menú de usuario"
          >
            <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-sm">
              <User size={16} className="lg:w-[18px] lg:h-[18px] text-white" />
            </div>
            <span className="hidden sm:block font-medium text-sm lg:text-base">{userName}</span>
            <ChevronDown size={14} className="hidden sm:block lg:w-4 lg:h-4" />
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-20 border border-gray-200">
                <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                  <div className="font-semibold">{userName}</div>
                  <div className="text-xs text-gray-500 mt-1 truncate">{user?.email}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}



