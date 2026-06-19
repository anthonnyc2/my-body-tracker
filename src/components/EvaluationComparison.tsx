"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Minus, TrendingDown, TrendingUp, Calendar, ArrowRightLeft } from "lucide-react"

import { getEvaluationById } from "@/actions/evaluation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { calculateSumOf6 } from "@/lib/calculations"

function DeltaIndicator({ current, previous, inverse = false }: { current: number | null, previous: number | null, inverse?: boolean }) {
  if (current === null || previous === null) return <Minus className="h-4 w-4 text-muted-foreground" />
  const delta = current - previous
  if (Math.abs(delta) < 0.1) return <Minus className="h-4 w-4 text-muted-foreground" />
  
  const isPositive = delta > 0
  const isGood = inverse ? !isPositive : isPositive
  
  return (
    <div className={`flex items-center text-sm font-medium ${isGood ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
      {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
      {Math.abs(delta).toFixed(1)}
    </div>
  )
}

function calculateEvaluationSumOf6(ev: Record<string, number | null | undefined>) {
  if (!ev) return null
  const measurements = {
    skinfoldTriceps: ev.skinfoldTriceps ?? undefined,
    skinfoldSubscap: ev.skinfoldSubscap ?? undefined,
    skinfoldSuprasp: ev.skinfoldSuprasp ?? undefined,
    skinfoldAbdom: ev.skinfoldAbdom ?? undefined,
    skinfoldThigh: ev.skinfoldThigh ?? undefined,
    skinfoldCalf: ev.skinfoldCalf ?? undefined,
  }
  return calculateSumOf6(measurements as unknown as Parameters<typeof calculateSumOf6>[0])
}

interface Props {
  currentEvaluation: Record<string, number | null | undefined>
  history: { id: string; date: Date }[]
}

export function EvaluationComparison({ currentEvaluation, history }: Props) {
  const [selectedId, setSelectedId] = useState<string>(history[0]?.id || "")

  const { data, isLoading } = useQuery({
    queryKey: ["evaluation", selectedId],
    queryFn: () => getEvaluationById(selectedId),
    enabled: !!selectedId,
  })

  const prevEvaluation = data?.current

  if (!history.length) return null

  const metrics = [
    { label: "Peso (kg)", key: "weight", inverse: true }, 
    { label: "Índice de Masa Corporal", key: "bmi", inverse: true },
    { label: "% Grasa Corporal", key: "bodyFatPct", inverse: true },
    { label: "Masa Muscular (kg)", key: "muscleMassKg", inverse: false },
    { label: "Perímetro Tórax (cm)", key: "girthThorax", inverse: false },
    { label: "Perímetro Brazo Contraído (cm)", key: "girthFlexedArm", inverse: false },
    { label: "Perímetro Cintura (cm)", key: "girthWaist", inverse: true },
    { label: "Perímetro Cadera (cm)", key: "girthHip", inverse: true },
    { label: "Perímetro Muslo Frontal (cm)", key: "girthThigh", inverse: false },
    { label: "Perímetro Pantorrilla (cm)", key: "girthCalf", inverse: false },
    { label: "Pliegue Tríceps (mm)", key: "skinfoldTriceps", inverse: true },
    { label: "Pliegue Subescapular (mm)", key: "skinfoldSubscap", inverse: true },
    { label: "Pliegue Supraespinal (mm)", key: "skinfoldSuprasp", inverse: true },
    { label: "Pliegue Abdominal (mm)", key: "skinfoldAbdom", inverse: true },
    { label: "Pliegue Muslo Frontal (mm)", key: "skinfoldThigh", inverse: true },
    { label: "Pliegue Pantorrilla (mm)", key: "skinfoldCalf", inverse: true },
  ]

  const currentSumOf6 = calculateEvaluationSumOf6(currentEvaluation)
  const prevSumOf6 = calculateEvaluationSumOf6(prevEvaluation)

  return (
    <Card className="shadow-sm border-border overflow-hidden mt-8">
      <CardHeader className="bg-muted/30 pb-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
              Comparativa de Progreso
            </CardTitle>
            <CardDescription className="mt-1">
              Compara los resultados actuales contra cualquier evaluación previa del paciente.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-3 divide-x divide-border">
          {/* Columna Métrica */}
          <div className="bg-muted/10 p-4 flex flex-col justify-end">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Métrica</p>
          </div>

          {/* Columna Anterior */}
          <div className="p-4 flex flex-col items-center text-center bg-slate-50/50 dark:bg-slate-900/20">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Evaluación Pasada</p>
            <Select value={selectedId} onValueChange={(val) => { if (val) setSelectedId(val) }}>
              <SelectTrigger className="w-[180px] bg-background">
                {(() => {
                  const selectedHistoryItem = history.find(h => h.id === selectedId)
                  if (!selectedHistoryItem) return <SelectValue placeholder="Seleccionar fecha" />
                  const d = new Date(selectedHistoryItem.date)
                  const localDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
                  return <span className="truncate">{format(localDate, "dd MMM yyyy", { locale: es })}</span>
                })()}
              </SelectTrigger>
              <SelectContent>
                {history.map((h) => {
                  const d = new Date(h.date)
                  const localDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
                  return (
                    <SelectItem key={h.id} value={h.id} label={format(localDate, "dd MMM yyyy", { locale: es })}>
                      {format(localDate, "dd MMM yyyy", { locale: es })}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Columna Actual */}
          <div className="p-4 flex flex-col items-center justify-center text-center bg-primary/5">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Evaluación Actual</p>
            <div className="flex items-center gap-2 text-foreground font-semibold border border-primary/20 bg-background px-4 py-2 rounded-md shadow-sm">
              <Calendar className="h-4 w-4 text-primary" />
              {format(new Date(new Date(currentEvaluation.date).getUTCFullYear(), new Date(currentEvaluation.date).getUTCMonth(), new Date(currentEvaluation.date).getUTCDate()), "dd MMM yyyy", { locale: es })}
            </div>
          </div>
        </div>

        <div className="divide-y divide-border">
          {metrics.map((metric) => (
            <div key={metric.key} className="grid grid-cols-3 divide-x divide-border hover:bg-muted/30 transition-colors">
              <div className="p-4 flex items-center">
                <span className="font-medium text-foreground">{metric.label}</span>
              </div>
              <div className="p-4 flex items-center justify-center">
                {isLoading ? (
                  <span className="text-muted-foreground animate-pulse">Cargando...</span>
                ) : (
                  <span className="text-lg font-semibold text-muted-foreground">
                    {(prevEvaluation as Record<string, number | null | undefined>)?.[metric.key] ? (prevEvaluation as Record<string, number | null | undefined>)[metric.key].toFixed(1) : "-"}
                  </span>
                )}
              </div>
              <div className="p-4 flex items-center justify-between bg-primary/5">
                <span className="text-lg font-bold text-foreground">
                  {(currentEvaluation as Record<string, number | null | undefined>)[metric.key] ? (currentEvaluation as Record<string, number | null | undefined>)[metric.key].toFixed(1) : "-"}
                </span>
                {!isLoading && (prevEvaluation as Record<string, number | null | undefined>)?.[metric.key] !== undefined && (currentEvaluation as Record<string, number | null | undefined>)[metric.key] !== undefined && (
                  <DeltaIndicator 
                    current={(currentEvaluation as Record<string, number | null | undefined>)[metric.key]} 
                    previous={(prevEvaluation as Record<string, number | null | undefined>)[metric.key]} 
                    inverse={metric.inverse}
                  />
                )}
              </div>
            </div>
          ))}

          {/* Sum of 6 Skinfolds special row */}
          <div className="grid grid-cols-3 divide-x divide-border hover:bg-muted/30 transition-colors">
            <div className="p-4 flex items-center">
              <span className="font-medium text-foreground">Sumatoria 6 Pliegues (mm)</span>
            </div>
            <div className="p-4 flex items-center justify-center">
              {isLoading ? (
                <span className="text-muted-foreground animate-pulse">Cargando...</span>
              ) : (
                <span className="text-lg font-semibold text-muted-foreground">
                  {prevSumOf6 ? prevSumOf6.toFixed(1) : "-"}
                </span>
              )}
            </div>
            <div className="p-4 flex items-center justify-between bg-primary/5">
              <span className="text-lg font-bold text-foreground">
                {currentSumOf6 ? currentSumOf6.toFixed(1) : "-"}
              </span>
              {!isLoading && prevSumOf6 !== null && currentSumOf6 !== null && (
                <DeltaIndicator 
                  current={currentSumOf6} 
                  previous={prevSumOf6} 
                  inverse={true}
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
