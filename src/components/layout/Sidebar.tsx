"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Users, 
  Activity, 
  Settings, 
  BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Pacientes",
    href: "/dashboard/patients",
    icon: Users,
  },
  {
    title: "Evaluaciones",
    href: "/dashboard/evaluations",
    icon: Activity,
  },
  {
    title: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function Sidebar({
  className,
  onNavigate,
}: {
  className?: string
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <div className={cn("flex h-full flex-col border-r border-border/40 bg-background/60 backdrop-blur-xl", className)}>
      <div className="flex h-14 items-center border-b border-border/40 px-4 lg:h-[70px] lg:px-6">
        <Link href="/" className="flex items-center gap-3 font-semibold transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-lg tracking-tight">Body Tracker</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-6">
        <nav className="grid items-start px-3 text-sm font-medium gap-1 lg:px-4">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const isActive = item.href === "/dashboard" 
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={index}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300",
                  isActive 
                    ? "bg-primary/10 text-primary font-semibold shadow-sm" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
