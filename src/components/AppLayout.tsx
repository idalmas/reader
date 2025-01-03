'use client'

import { type ReactNode, useState, useEffect } from 'react'
import { Inter } from 'next/font/google'
import { AppSidebar } from './app-sidebar'
import { SidebarProvider } from "@/components/ui/sidebar"

const inter = Inter({ subsets: ['latin'] })
const SIDEBAR_STATE_KEY = 'sidebar:state'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [open, setOpen] = useState(true);

  // Initialize from localStorage after mount
  useEffect(() => {
    const savedState = localStorage.getItem(SIDEBAR_STATE_KEY)
    if (savedState !== null) {
      setOpen(savedState === 'true')
    }
  }, []);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    localStorage.setItem(SIDEBAR_STATE_KEY, String(newOpen))
  }

  return (
    <SidebarProvider open={open} onOpenChange={handleOpenChange}>
      <div className={`flex min-h-screen ${inter.className}`}>
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <div className="flex-1">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
} 