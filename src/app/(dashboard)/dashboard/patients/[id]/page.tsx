"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Plus, ArrowLeft, Activity, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getPatientById } from "@/actions/patient"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { EvolutionChart } from "@/components/charts/EvolutionChart"
import { DeleteEvaluationButton } from "@/components/DeleteEvaluationButton"

export default function PatientDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => getPatientById(id),
  })

  if (isLoading) {
    return <div className="p-8 text-center">Cargando paciente...</div>
  }

  if (!patient) {
    return <div className="p-8 text-center">Paciente no encontrado</div>
  }

  const age = new Date().getFullYear() - new Date(patient.birthDate).getFullYear()

  // Reverse evaluations for chronological chart order
  const chartData = patient.evaluations 
    ? [...patient.evaluations].reverse().map(e => ({
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
    : []

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/patients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          {patient.firstName} {patient.lastName}
        </h1>
        <div className="ml-auto flex gap-2">
          <Link href={`/dashboard/patients/${patient.id}/edit`}>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" /> Editar Paciente
            </Button>
          </Link>
          <Link href={`/dashboard/patients/${patient.id}/evaluations/new`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nueva Evaluación
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col gap-4 md:col-span-3 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold mb-4">
              {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
            </div>
            <h2 className="text-xl font-semibold">{patient.firstName} {patient.lastName}</h2>
            <p className="text-sm text-muted-foreground">{patient.email || "Sin email"}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm mt-4">
            <div>
              <span className="text-muted-foreground block">Edad</span>
              <span className="font-medium">{age} años</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Género</span>
              <span className="font-medium">
                {patient.gender === "MALE" ? "Masculino" : patient.gender === "FEMALE" ? "Femenino" : "Otro"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Peso Inicial</span>
              <span className="font-medium">{patient.initialWeight} kg</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Altura</span>
              <span className="font-medium">{patient.height} cm</span>
            </div>
          </div>
        </div>

        {/* Evaluations History - Moved to right side for better layout if charts are many */}
        <div className="rounded-xl border bg-card text-card-foreground shadow flex flex-col md:col-span-3 lg:col-span-2">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium">Historial de Evaluaciones</h3>
          </div>
          <div className="p-0 flex-1 max-h-[350px] overflow-y-auto">
            {!patient.evaluations || patient.evaluations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-12 text-center text-muted-foreground">
                <Activity className="h-8 w-8 mb-4 opacity-20" />
                <p>No hay evaluaciones registradas</p>
              </div>
            ) : (
              <div className="divide-y">
                {patient.evaluations.map((evaluation: { id: string, date: Date | string, weight: number, bodyFatPct?: number, muscleMassKg?: number }) => (
                  <div key={evaluation.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div>
                      <div className="font-medium">
                        {format(
                          new Date(new Date(evaluation.date).getUTCFullYear(), new Date(evaluation.date).getUTCMonth(), new Date(evaluation.date).getUTCDate()), 
                          "dd MMMM yyyy", 
                          { locale: es }
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Peso: {evalRecord.weight} kg • Grasa: {evalRecord.bodyFatPct?.toFixed(1) || "-"}%
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/evaluations/${evalRecord.id}`}>
                        <Button variant="outline" size="sm">Ver Reporte</Button>
                      </Link>
                      <DeleteEvaluationButton id={evalRecord.id} variant="ghost" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Multi-Charts Grid */}
        {chartData.length > 0 && (
          <div className="md:col-span-3 grid gap-6 md:grid-cols-2 mt-4">
            
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
    </div>
  )
}
