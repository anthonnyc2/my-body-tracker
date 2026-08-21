"use client"

import Link from "next/link"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/actions/auth"

export function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <div className="w-full flex-1">
        {/* Placeholder for Search or Breadcrumbs */}
      </div>
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full">
            <User className="h-5 w-5" />
            <span className="sr-only">Ir a Configuración</span>
          </Button>
        </Link>
        <form action={logoutAction}>
          <Button variant="outline" size="default" className="h-11 px-5" type="submit">
            Salir
          </Button>
        </form>
      </div>
    </header>
  )
}
