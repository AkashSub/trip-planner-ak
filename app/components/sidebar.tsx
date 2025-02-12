import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Itinerary', href: '/itinerary' },
    { name: 'Expenses', href: '/expenses' },
    { name: 'Settings', href: '/settings' },
  ]

  return (
    <>
      {/* Mobile Navigation Toggle */}
      <Button
        variant="ghost"
        className="fixed top-4 right-4 z-50 md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar Container */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-background border-r transition-transform duration-200 ease-in-out",
          "md:translate-x-0 md:static md:w-64",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold truncate">Trip Planner</h1>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-2 text-sm rounded-md w-full",
                "hover:bg-accent hover:text-accent-foreground",
                "transition-colors duration-200",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground/60",
                "truncate"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}