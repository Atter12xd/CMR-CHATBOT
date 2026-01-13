import { Home, Search, Bell, HelpCircle, Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
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
    <header className="bg-white border-b border-[#E2E8F0] px-5 flex items-center h-14 gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[#64748B] text-[13px]">
        <div className="flex items-center gap-2">
          <Home size={14} />
        </div>
        <span className="text-[#CBD5E1]">/</span>
        <div className="flex items-center gap-2">
          <span className="text-[#0F172A] font-semibold">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-80 ml-auto">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
        <input
          type="text"
          className="w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-md text-[13px] bg-[#F8FAFC] transition-all focus:outline-none focus:border-primary focus:bg-white"
          placeholder="Search orders, customers, SKUs..."
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
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 border-none bg-transparent rounded-md flex items-center justify-center text-[#64748B] cursor-pointer transition-all hover:bg-[#F8FAFC] hover:text-[#0F172A] relative">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-danger rounded-full"></span>
        </button>
        <button className="w-8 h-8 border-none bg-transparent rounded-md flex items-center justify-center text-[#64748B] cursor-pointer transition-all hover:bg-[#F8FAFC] hover:text-[#0F172A]">
          <HelpCircle size={16} />
        </button>
        <button
          onClick={handleNewOrder}
          className="bg-primary text-white border-none px-4 py-2 rounded-md text-[13px] font-medium cursor-pointer flex items-center gap-1.5 transition-all hover:bg-primary-dark"
        >
          <Plus size={14} />
          New Order
        </button>
      </div>
    </header>
  );
}