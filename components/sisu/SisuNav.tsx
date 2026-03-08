"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/sisu", label: "Home" },
  { href: "/structure-of-studies", label: "Structure of Studies" },
  { href: "/search", label: "Search" },
]

export function SisuNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/sisu" className="flex items-center">
          <span className="text-2xl font-bold text-primary">SISU</span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Student Profile */}
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-foreground">
            Mikael Virtanen
          </span>
          <span className="text-xs text-muted-foreground">STU2024001</span>
        </div>
      </div>
    </header>
  )
}
