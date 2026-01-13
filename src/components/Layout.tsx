import type { ReactNode } from 'react';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ProtectedRoute from './ProtectedRoute';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Overlay para móvil */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Topbar */}
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}