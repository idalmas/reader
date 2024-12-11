'use client'

import { useState } from 'react';
import { Inter } from 'next/font/google'
import Sidebar from './Sidebar'

const inter = Inter({ subsets: ['latin'] })

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`flex min-h-screen bg-white selection:bg-black selection:text-white ${inter.className}`}>
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      
      {/* Main content area */}
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'pl-16' : 'pl-64'}`}>
        {children}
      </div>
    </div>
  );
} 