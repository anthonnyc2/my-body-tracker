"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Sidebar } from "@/components/layout/Sidebar"
import { logoutAction } from "@/actions/auth"

export function Header() {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="w-72 max-w-[85%] p-0" showCloseButton={false}>
          <SheetHeader className="sr-only">
            <SheetTitle>Navegación</SheetTitle>
          </SheetHeader>
          <Sidebar onNavigate={() => setNavOpen(false)} />
        </SheetContent>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 md:hidden"
          onClick={() => setNavOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </Sheet>
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
