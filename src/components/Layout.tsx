import type { ReactNode } from 'react';
import { useState } from 'react';
import { AuthProvider } from '../hooks/useAuth';
import Sidebar from './Sidebar';
import Header from './Header';
import ProtectedRoute from './ProtectedRoute';
import DashboardContent from './DashboardContent';
import OrdersPage from './OrdersPage';
import ChatsPage from './ChatsPage';
import ProductsPage from './ProductsPage';
import BotTrainingPage from './BotTrainingPage';
import PaymentMethodsConfig from './PaymentMethodsConfig';
import ConfigPage from './ConfigPage';
import AiCallsPage from './AiCallsPage';


interface LayoutProps {
  children?: ReactNode;
  page?:
    | 'dashboard'
    | 'pedidos'
    | 'chats'
    | 'productos'
    | 'entrenar-bot'
    | 'metodos-pago'
    | 'configuracion'
    | 'llamadas-ia';
}


function renderPage(page: LayoutProps['page'], children?: ReactNode) {
  switch (page) {
    case 'dashboard':
      return <DashboardContent />;
    case 'pedidos':
      return <OrdersPage />;
    case 'chats':
      return <ChatsPage />;
    case 'productos':
      return <ProductsPage />;
    case 'entrenar-bot':
      return <BotTrainingPage />;
    case 'metodos-pago':
      return <PaymentMethodsConfig />;
    case 'configuracion':
      return <ConfigPage />;
    case 'llamadas-ia':
      return <AiCallsPage />;
    default:
      return children ?? null;
  }
}

export default function Layout({ children, page }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const content = renderPage(page, children);


  return (
    <AuthProvider>
      <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-ref-bg font-professional text-sm text-[#3D3D40] antialiased">
        {/* Overlay para sidebar en móvil */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40 md:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-250 ease-in-out md:relative md:translate-x-0`}>
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </div>

        {/* Contenido principal */}
        <main className="flex-1 flex flex-col overflow-hidden md:ml-0">
          {/* Header global: en chats desktop se oculta para maximizar altura útil */}
          {page === 'chats' ? (
            <div className="md:hidden">
              <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
            </div>
          ) : (
            <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          )}

          <div
            className={`flex-1 min-h-0 bg-transparent ${
              page === 'chats'
                ? 'flex flex-col overflow-hidden px-2 py-1.5 md:px-3 md:py-2'
                : 'overflow-y-auto px-5 py-5 md:px-7 md:pt-5 md:pb-7'
            }`}
          >
            {content}
          </div>
        </main>
      </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}