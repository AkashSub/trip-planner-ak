"use client"

import { ThemeProvider } from "next-themes"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AuthProvider } from "./contexts/auth-context"
import { useAuth } from "./contexts/auth-context"
import { usePathname } from "next/navigation"
import { AppSidebar } from "./components/app-sidebar" // Adjust this path

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()

  // Add console.log to debug
  console.log('MainLayout:', { user, pathname })

  if (pathname === '/login') {
    return <div className="min-h-screen">{children}</div>
  }

  if (!user) {
    // If no user, we should show nothing and let middleware handle redirect
    return null
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6 max-w-7xl min-h-screen">{children}</div>
      </main>
    </div>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <SidebarProvider defaultOpen={false}>
          <MainLayout>{children}</MainLayout>
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}