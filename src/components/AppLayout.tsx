'use client'

import { Inter } from 'next/font/google'
import { AppSidebar } from './app-sidebar'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

const inter = Inter({ subsets: ['latin'] })

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className={`flex min-h-screen bg-background ${inter.className}`}>
        <AppSidebar />
        <main className="flex-1 bg-background">
          <SidebarTrigger />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
} 