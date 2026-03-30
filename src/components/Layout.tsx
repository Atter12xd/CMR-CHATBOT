import type { ReactNode } from 'react';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ProtectedRoute from './ProtectedRoute';


interface LayoutProps {
  children: ReactNode;
}


export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-app-shell font-sans">
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
          {/* Header */}
          <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-7 bg-app-shell">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}