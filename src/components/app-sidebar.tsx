'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ListCollapse, 
  Settings, 
  FileText
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const pathname = usePathname()
  const isPath = (path: string) => pathname === path

  const menuItems = [
    {
      title: "Feed",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Your List",
      url: "/feeds",
      icon: ListCollapse,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Docs",
      url: "/docs",
      icon: FileText,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center px-4 py-2">
          <svg className="w-6 h-6 text-foreground/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v18M8 21h8M7 3h10M9 6h6M9 9h6M9 12h6M9 15h6M7 18h10M8 3v2M16 3v2M10 6v3M14 6v3M10 12v3M14 12v3" />
          </svg>
          <span className="ml-2 text-lg font-medium text-foreground">Osgiliath</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      href={item.url}
                      className={isPath(item.url) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
} 