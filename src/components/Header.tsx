import { Home, Search, Bell, HelpCircle, Plus, X, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPath, setCurrentPath] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  useEffect(() => {
    const updatePath = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', updatePath);
    const intervalId = setInterval(updatePath, 200);

    return () => {
      window.removeEventListener('popstate', updatePath);
      clearInterval(intervalId);
    };
  }, []);

  const getBreadcrumb = () => {
    const path = currentPath;
    if (path === '/dashboard' || path === '/') return 'Dashboard';
    if (path.startsWith('/analytics')) return 'Analytics';
    if (path.startsWith('/chats')) return 'WhatsApp';
    if (path.startsWith('/pedidos')) return 'Orders';
    if (path.startsWith('/pipeline')) return 'Pipeline';
    if (path.startsWith('/customers')) return 'Customers';
    if (path.startsWith('/risk-scoring')) return 'Risk Scoring';
    if (path.startsWith('/ab-testing')) return 'A/B Testing';
    if (path.startsWith('/productos')) return 'Products';
    if (path.startsWith('/configuracion')) return 'Settings';
    if (path.startsWith('/integrations')) return 'Integrations';
    if (path.startsWith('/entrenar-bot')) return 'Automation';
    if (path.startsWith('/metodos-pago')) return 'Payment Methods';
    return 'Dashboard';
  };

  const handleNewOrder = () => {
    window.location.href = '/pedidos';
  };

  return (
    <header className="bg-white border-b border-[#E2E8F0] px-3 sm:px-4 md:px-5 flex items-center h-14 gap-2 sm:gap-3 md:gap-4">
      {/* Menu Button (Mobile) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-md transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-[#64748B] text-xs sm:text-[13px] min-w-0 flex-shrink">
        <div className="flex items-center gap-1 sm:gap-2">
          <Home size={12} className="sm:w-[14px] sm:h-[14px]" />
        </div>
        <span className="text-[#CBD5E1] hidden sm:inline">/</span>
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <span className="text-[#0F172A] font-semibold truncate">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Search - Oculto en móvil muy pequeño */}
      <div className="hidden sm:block relative flex-1 max-w-xs lg:max-w-sm xl:max-w-md ml-auto">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
        <input
          type="text"
          className="w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-md text-[13px] bg-[#F8FAFC] transition-all focus:outline-none focus:border-primary focus:bg-white"
          placeholder="Search orders, customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <button className="w-8 h-8 sm:w-9 sm:h-9 border-none bg-transparent rounded-md flex items-center justify-center text-[#64748B] cursor-pointer transition-all hover:bg-[#F8FAFC] hover:text-[#0F172A] relative">
          <Bell size={16} className="sm:w-4 sm:h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-danger rounded-full"></span>
        </button>
        <button className="hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 border-none bg-transparent rounded-md items-center justify-center text-[#64748B] cursor-pointer transition-all hover:bg-[#F8FAFC] hover:text-[#0F172A]">
          <HelpCircle size={16} className="sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={handleNewOrder}
          className="bg-primary text-white border-none px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-[13px] font-medium cursor-pointer flex items-center gap-1 sm:gap-1.5 transition-all hover:bg-primary-dark"
        >
          <Plus size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">New Order</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>
    </header>
  );
}