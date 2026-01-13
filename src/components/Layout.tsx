import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ProtectedRoute from './ProtectedRoute';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <Header />

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-5">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}