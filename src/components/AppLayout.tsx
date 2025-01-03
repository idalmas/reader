'use client'

import { type ReactNode, useState } from 'react'
import { Inter } from 'next/font/google'
import { AppSidebar } from './app-sidebar'
import { SidebarProvider } from "@/components/ui/sidebar"

const inter = Inter({ subsets: ['latin'] })
const SIDEBAR_STATE_KEY = 'sidebar:state'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [open, setOpen] = useState(() => {
    // Try to read initial state from localStorage during initialization
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(SIDEBAR_STATE_KEY)
      return savedState === null ? true : savedState === 'true'
    }
    return true
  })

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