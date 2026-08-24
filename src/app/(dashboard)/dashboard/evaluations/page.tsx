"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Plus, Activity, User, Calendar, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { getEvaluations } from "@/actions/evaluation"
import { getEvaluationUsage } from "@/actions/subscription"
import { DeleteEvaluationButton } from "@/components/DeleteEvaluationButton"
import { UpgradeBanner } from "@/components/UpgradeBanner"

export default function EvaluationsPage() {
  const { data: evaluations, isLoading } = useQuery({
    queryKey: ["evaluations"],
    queryFn: () => getEvaluations(),
  })

  const { data: usage } = useQuery({
    queryKey: ["evaluationUsage"],
    queryFn: () => getEvaluationUsage(),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Evaluaciones</h1>
          <p className="text-muted-foreground mt-1">
            Historial de todas las evaluaciones realizadas.
          </p>
        </div>
        {usage?.isAtLimit ? (
          <Tooltip>
            <TooltipTrigger render={<Button disabled />}>
              <Plus className="mr-2 h-4 w-4" /> Nueva Evaluación
            </TooltipTrigger>
            <TooltipContent>
              Límite de {usage.limit} evaluaciones del plan gratuito alcanzado
            </TooltipContent>
          </Tooltip>
        ) : (
          <Link href="/dashboard/patients">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nueva Evaluación
            </Button>
          </Link>
        )}
      </div>

      <UpgradeBanner />

      <div className="rounded-xl border bg-card text-card-foreground shadow">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Cargando evaluaciones...</p>
          </div>
        ) : !evaluations || evaluations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <Activity className="h-12 w-12 mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-1">Sin evaluaciones</h3>
            <p className="text-sm max-w-sm mb-6">
              Aún no has registrado ninguna evaluación física. Para comenzar, ve a la sección de Pacientes y selecciona uno.
            </p>
            <Link href="/dashboard/patients">
              <Button variant="outline">
                Ir a Pacientes
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {evaluations.map((evaluation: { id: string, date: Date | string, type: string, weight: number, bodyFatPct?: number | null, patient: { firstName: string, lastName: string } }) => (
              <div 
                key={evaluation.id} 
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Paciente</p>
                      <p className="text-base font-semibold">
                        {evaluation.patient.firstName} {evaluation.patient.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">Fecha</p>
                        <span className={`text-[10px] font-bold py-0.5 px-1.5 rounded-full ${evaluation.type === "SIMPLE" ? "bg-amber-500/10 text-amber-700" : "bg-emerald-500/10 text-emerald-700"}`}>
                          {evaluation.type === "SIMPLE" ? "Simple" : "Completa"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          new Date(new Date(evaluation.date).getUTCFullYear(), new Date(evaluation.date).getUTCMonth(), new Date(evaluation.date).getUTCDate()),
                          "dd MMMM yyyy",
                          { locale: es }
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Resultados</p>
                      <p className="text-sm text-muted-foreground">
                        Peso: {evaluation.weight} kg • Grasa: {evaluation.bodyFatPct?.toFixed(1) || "-"}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 md:mt-0 w-full md:w-auto">
                  <Link href={`/dashboard/evaluations/${evaluation.id}`} className="flex-1 md:flex-none">
                    <Button variant="outline" className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Ver Reporte
                    </Button>
                  </Link>
                  <DeleteEvaluationButton id={evaluation.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
