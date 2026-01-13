import { 
  LayoutDashboard, 
  BarChart3, 
  Package, 
  Workflow, 
  MessageSquare, 
  Users, 
  Shield, 
  Bot, 
  FlaskConical, 
  Settings, 
  Plug,
  MoreVertical,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { user } = useAuth();
  const [currentPath, setCurrentPath] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  useEffect(() => {
    const updatePath = () => {
      setCurrentPath(window.location.pathname);
    };

    // Actualizar cuando cambia la ruta
    window.addEventListener('popstate', updatePath);
    
    // También actualizar periódicamente para cambios programáticos
    const intervalId = setInterval(updatePath, 200);

    return () => {
      window.removeEventListener('popstate', updatePath);
      clearInterval(intervalId);
    };
  }, []);

  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/' || currentPath === '/chats';
    }
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    if (window.location.pathname !== path) {
      window.location.href = path;
    }
  };

  const navItems = [
    {
      section: 'Overview',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', badge: undefined },
        { icon: BarChart3, label: 'Analytics', path: '/analytics', badge: undefined },
      ],
    },
    {
      section: 'Operations',
      items: [
        { icon: Package, label: 'Orders', path: '/pedidos', badge: '127' },
        { icon: Workflow, label: 'Pipeline', path: '/pipeline', badge: undefined },
        { icon: MessageSquare, label: 'WhatsApp', path: '/chats', badge: '23' },
        { icon: Users, label: 'Customers', path: '/customers', badge: undefined },
      ],
    },
    {
      section: 'Intelligence',
      items: [
        { icon: Shield, label: 'Risk Scoring', path: '/risk-scoring', badge: undefined },
        { icon: Bot, label: 'Automation', path: '/entrenar-bot', badge: undefined },
        { icon: FlaskConical, label: 'A/B Testing', path: '/ab-testing', badge: undefined },
      ],
    },
    {
      section: 'Configuration',
      items: [
        { icon: Settings, label: 'Settings', path: '/configuracion', badge: undefined },
        { icon: Plug, label: 'Integrations', path: '/integrations', badge: undefined },
      ],
    },
  ];

  const getUserName = () => {
    if (!user) return 'Usuario';
    return user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario';
  };

  const getUserInitials = () => {
    const name = getUserName();
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Overlay para móvil */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-secondary-800 text-white flex flex-col border-r border-white/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo y botón cerrar (móvil) */}
        <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-[15px] tracking-tight">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center font-bold text-white">
              C
            </div>
            <div>CRM COD</div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 hover:bg-white/10 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        {navItems.map((section) => (
          <div key={section.section} className="mb-6">
            <div className="px-3 py-0 pb-2 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              {section.section}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleNavClick(e, item.path)}
                  className={`flex items-center gap-2.5 px-3 py-2 mx-2 rounded-md text-[13px] transition-all mb-0.5 cursor-pointer ${
                    active
                      ? 'bg-secondary-700 text-white font-medium'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-white/15 text-white px-1.5 py-0.5 rounded-full text-[11px] font-semibold">
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className="mt-auto px-3 py-3 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {getUserInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-white truncate">
              {getUserName()}
            </div>
            <div className="text-[11px] text-slate-400">Administrator</div>
          </div>
          <MoreVertical size={16} className="text-slate-400 cursor-pointer flex-shrink-0" />
        </div>
      </div>
      </aside>
    </>
  );
}