"use client"

import { useState } from "react"
import { Home, Calendar, DollarSign, Image, PanelLeftClose } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-provider"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"

const routes = [
  {
    title: "Home",
    icon: Home,
    href: "/home",
  },
  {
    title: "Itinerary",
    icon: Calendar,
    href: "/itinerary",
  },
  {
    title: "Expenses",
    icon: DollarSign,
    href: "/expenses",
  },
  {
    title: "Pics & Videos",
    icon: Image,
    href: "/media",
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Trigger */}
      <Button 
        variant="ghost" 
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-[240px] sm:w-[300px]">
          <div className="flex flex-col h-full">
            <div className="px-4 py-6">
              <h1 className="text-xl font-bold">Trip Planner</h1>
            </div>
            <SidebarContent>
              <SidebarMenu>
                {routes.map((route) => (
                  <SidebarMenuItem key={route.href}>
                    <SidebarMenuButton asChild isActive={pathname === route.href} tooltip={route.title}>
                      <Link href={route.href}>
                        <route.icon className="h-4 w-4" />
                        <span>{route.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="border-t p-3">
              <ThemeToggle />
            </SidebarFooter>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-[240px] border-r h-screen">
        <div className="px-4 py-6">
          <h1 className="text-xl font-bold">Trip Planner</h1>
        </div>
        <SidebarContent>
          <SidebarMenu>
            {routes.map((route) => (
              <SidebarMenuItem key={route.href}>
                <SidebarMenuButton asChild isActive={pathname === route.href} tooltip={route.title}>
                  <Link href={route.href}>
                    <route.icon className="h-4 w-4" />
                    <span>{route.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t p-3">
          <ThemeToggle />
        </SidebarFooter>
      </div>
    </>
  )
}

