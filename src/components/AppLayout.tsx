'use client'

import { useState, useEffect } from 'react';
import { Inter } from 'next/font/google'
import Sidebar from './Sidebar'

const inter = Inter({ subsets: ['latin'] })

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sidebarCollapsed');
    if (stored !== null) {
      setIsCollapsed(JSON.parse(stored));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  return (
    <div className={`flex min-h-screen bg-white selection:bg-black selection:text-white ${inter.className}`}>
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      
      {/* Main content area */}
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'pl-[4.5rem]' : 'pl-48'}`}>
        {children}
      </div>
    </div>
  );
} 