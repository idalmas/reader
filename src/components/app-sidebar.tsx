'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ListCollapse, 
  Settings, 
  FileText,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react'
import { UserButton } from "@clerk/nextjs"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const pathname = usePathname()
  const isPath = (path: string) => pathname === path
  const { state, toggleSidebar } = useSidebar()

  const mainMenuItems = [
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
  ]

  const bottomMenuItems = [
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
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center justify-between px-4 py-2 group-data-[collapsible=icon]:px-2">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8">
              <svg className="w-5 h-5 text-foreground/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v18M8 21h8M7 3h10M9 6h6M9 9h6M9 12h6M9 15h6M7 18h10M8 3v2M16 3v2M10 6v3M14 6v3M10 12v3M14 12v3" />
              </svg>
            </div>
            <span className="ml-2 text-lg font-medium text-foreground group-data-[collapsible=icon]:hidden">Osgiliath</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            {state === "expanded" ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title}
                    isActive={isPath(item.url)}
                  >
                    <Link 
                      href={item.url}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2",
                        isPath(item.url) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <div className="flex items-center justify-center w-8 h-8">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title}
                    isActive={isPath(item.url)}
                  >
                    <Link 
                      href={item.url}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2",
                        isPath(item.url) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <div className="flex items-center justify-center w-8 h-8">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="p-4 flex flex-col items-center gap-2 group-data-[collapsible=icon]:px-2">
          <UserButton afterSignOutUrl="/" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
} 