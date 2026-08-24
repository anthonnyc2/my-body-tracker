import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Activity } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EvolutionChart } from "@/components/charts/EvolutionChart"

interface Props {
  params: Promise<{ token: string }>
}

export default async function SharePatientPage({ params }: Props) {
  const { token } = await params
  const { prisma } = await import("@/lib/prisma")

  const patient = await prisma.patient.findUnique({
    where: { shareToken: token },
    include: {
      evaluator: true,
      evaluations: { orderBy: { date: "desc" } },
    },
  })

  if (!patient) notFound()

  // Increment view count (fire-and-forget, don't block render)
  prisma.patient.update({
    where: { shareToken: token },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {})

  const evaluatorName = `${patient.evaluator.firstName} ${patient.evaluator.lastName}`

  // Reverse evaluations for chronological chart order
  const chartData = [...patient.evaluations].reverse().map((e) => ({
    date: e.date,
    weight: e.weight,
    bodyFatPct: e.bodyFatPct,
    muscleMassKg: e.muscleMassKg,
    girthFlexedArm: e.girthFlexedArm,
    skinfoldTriceps: e.skinfoldTriceps,
    skinfoldSubscap: e.skinfoldSubscap,
    skinfoldAbdom: e.skinfoldAbdom,
    skinfoldThigh: e.skinfoldThigh,
  }))

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
            Historial de Evaluaciones
          </div>
          <h1 className="text-2xl font-bold">{patient.firstName} {patient.lastName}</h1>
          <p className="text-muted-foreground text-sm mt-1">Evaluador: {evaluatorName}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Evaluations list */}
          <div className="rounded-xl border bg-card text-card-foreground shadow flex flex-col md:col-span-3">
            <div className="p-6 border-b">
              <h3 className="text-lg font-medium">Evaluaciones</h3>
            </div>
            <div className="p-0 flex-1 max-h-[350px] overflow-y-auto">
              {patient.evaluations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-12 text-center text-muted-foreground">
                  <Activity className="h-8 w-8 mb-4 opacity-20" />
                  <p>No hay evaluaciones registradas</p>
                </div>
              ) : (
                <div className="divide-y">
                  {patient.evaluations.map((evaluation) => (
                    <div key={evaluation.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {format(
                            new Date(new Date(evaluation.date).getUTCFullYear(), new Date(evaluation.date).getUTCMonth(), new Date(evaluation.date).getUTCDate()),
                            "dd MMMM yyyy",
                            { locale: es }
                          )}
                          <span className={`text-[10px] font-bold py-0.5 px-1.5 rounded-full ${evaluation.type === "SIMPLE" ? "bg-amber-500/10 text-amber-700" : "bg-emerald-500/10 text-emerald-700"}`}>
                            {evaluation.type === "SIMPLE" ? "Simple" : "Completa"}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Peso: {evaluation.weight} kg • Grasa: {evaluation.bodyFatPct?.toFixed(1) || "-"}%
                        </div>
                      </div>
                      <Link href={`/share/${evaluation.shareToken}`}>
                        <Button variant="outline" size="sm">Ver Reporte</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Multi-Charts Grid */}
          {chartData.length > 0 && (
            <div className="md:col-span-3 grid gap-6 md:grid-cols-2">

              <div className="rounded-xl border bg-card text-card-foreground shadow flex flex-col">
                <div className="p-4 border-b bg-slate-50/50">
                  <h3 className="text-md font-semibold text-slate-800">Evolución de Peso (kg)</h3>
                </div>
                <div className="p-4 pt-6">
                  <EvolutionChart data={chartData} metrics={[{ dataKey: "weight", name: "Peso (kg)", color: "#2563eb" }]} />
                </div>
              </div>

              <div className="rounded-xl border bg-card text-card-foreground shadow flex flex-col">
                <div className="p-4 border-b bg-slate-50/50">
                  <h3 className="text-md font-semibold text-slate-800">Evolución de Grasa (%)</h3>
                </div>
                <div className="p-4 pt-6">
                  <EvolutionChart data={chartData} metrics={[{ dataKey: "bodyFatPct", name: "Grasa (%)", color: "#ef4444" }]} />
                </div>
              </div>

              <div className="rounded-xl border bg-card text-card-foreground shadow flex flex-col">
                <div className="p-4 border-b bg-slate-50/50">
                  <h3 className="text-md font-semibold text-slate-800">Evolución de Masa Muscular (kg)</h3>
                </div>
                <div className="p-4 pt-6">
                  <EvolutionChart data={chartData} metrics={[{ dataKey: "muscleMassKg", name: "Músculo (kg)", color: "#10b981" }]} />
                </div>
              </div>

              <div className="rounded-xl border bg-card text-card-foreground shadow flex flex-col">
                <div className="p-4 border-b bg-slate-50/50">
                  <h3 className="text-md font-semibold text-slate-800">Brazo Flexionado (cm)</h3>
                </div>
                <div className="p-4 pt-6">
                  <EvolutionChart data={chartData} metrics={[{ dataKey: "girthFlexedArm", name: "Brazo (cm)", color: "#8b5cf6" }]} />
                </div>
              </div>

              <div className="md:col-span-2 rounded-xl border bg-card text-card-foreground shadow flex flex-col">
                <div className="p-4 border-b bg-slate-50/50">
                  <h3 className="text-md font-semibold text-slate-800">Evolución de Pliegues Clave (mm)</h3>
                </div>
                <div className="p-4 pt-6">
                  <EvolutionChart data={chartData} metrics={[
                    { dataKey: "skinfoldTriceps", name: "Tríceps", color: "#f59e0b" },
                    { dataKey: "skinfoldSubscap", name: "Subescapular", color: "#ec4899" },
                    { dataKey: "skinfoldAbdom", name: "Abdominal", color: "#06b6d4" },
                    { dataKey: "skinfoldThigh", name: "Muslo", color: "#84cc16" },
                  ]} />
                </div>
              </div>

            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Generado con Body Tracker
        </p>
      </div>
    </div>
  )
}
