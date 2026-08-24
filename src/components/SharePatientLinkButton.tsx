"use client"

import { Share2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function SharePatientLinkButton({ shareToken, variant = "outline" }: { shareToken: string, variant?: "outline" | "ghost" | "default" }) {
  const handleShare = () => {
    const url = `${window.location.origin}/share/patient/${shareToken}`
    navigator.clipboard.writeText(url)
    toast.success("Enlace del historial copiado")
  }

  return (
    <Button variant={variant} size="icon" className="w-10 h-10 shrink-0" onClick={handleShare}>
      <Share2 className="h-4 w-4" />
      <span className="sr-only">Copiar enlace del historial</span>
    </Button>
  )
}
