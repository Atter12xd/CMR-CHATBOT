import { ReactNode, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  useEffect(() => {
    console.log('[Layout] Component mounted');
    console.log('[Layout] Children:', children);
  }, []);

  useEffect(() => {
    console.log('[Layout] Children changed:', children);
  }, [children]);

  console.log('[Layout] Rendering layout with children');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="md:pl-64">
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
