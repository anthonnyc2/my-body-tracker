"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getEvaluationUsage } from "@/actions/subscription"

export function UpgradeBanner() {
  const { data: usage } = useQuery({
    queryKey: ["evaluationUsage"],
    queryFn: () => getEvaluationUsage(),
  })

  if (!usage?.isAtLimit) return null

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-primary shrink-0" />
        <p className="text-sm text-foreground">
          Has alcanzado el límite de <span className="font-medium">{usage.limit} evaluaciones</span> del plan
          gratuito. Actualiza tu plan para seguir registrando evaluaciones.
        </p>
      </div>
      <Link href="/dashboard/upgrade" className="shrink-0">
        <Button size="sm">Actualizar Plan</Button>
      </Link>
    </div>
  )
}
