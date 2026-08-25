"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { Plus, ArrowLeft, Activity, Pencil, Share2, Copy, Check, Dumbbell, FileText } from "lucide-react"
import QRCode from "react-qr-code"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { UpgradeBanner } from "@/components/UpgradeBanner"
import { getPatientById } from "@/actions/patient"
import { getEvaluationUsage } from "@/actions/subscription"
import { getRoutinesByPatientId } from "@/actions/routine"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { EvolutionChart } from "@/components/charts/EvolutionChart"
import { DeleteEvaluationButton } from "@/components/DeleteEvaluationButton"
import { DeletePatientButton } from "@/components/DeletePatientButton"
import { DeleteRoutineButton } from "@/components/DeleteRoutineButton"
import { SharePatientLinkButton } from "@/components/SharePatientLinkButton"

export default function PatientDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [copied, setCopied] = useState(false)

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => getPatientById(id),
  })

  const { data: usage } = useQuery({
    queryKey: ["evaluationUsage"],
    queryFn: () => getEvaluationUsage(),
  })

  const { data: routines } = useQuery({
    queryKey: ["routines", "patient", id],
    queryFn: () => getRoutinesByPatientId(id),
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/patients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            {patient.firstName} {patient.lastName}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          {patient.shareToken && (
            <SharePatientLinkButton shareToken={patient.shareToken} variant="outline" label="Compartir" />
          )}
          <Link href={`/dashboard/patients/${patient.id}/edit`}>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" /> Editar Paciente
            </Button>
          </Link>
          <DeletePatientButton
            id={patient.id}
            patientName={`${patient.firstName} ${patient.lastName}`}
            redirectUrl="/dashboard/patients"
            label="Eliminar Paciente"
          />
        </div>
      </div>

      <UpgradeBanner />

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
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="text-lg font-medium">Historial de Evaluaciones</h3>
            {usage?.isAtLimit ? (
              <Tooltip>
                <TooltipTrigger render={<Button size="sm" disabled />}>
                  <Plus className="mr-2 h-4 w-4" /> Nueva Evaluación
                </TooltipTrigger>
                <TooltipContent>
                  Límite de {usage.limit} evaluaciones del plan gratuito alcanzado
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link href={`/dashboard/patients/${patient.id}/evaluations/new`}>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Nueva Evaluación
                </Button>
              </Link>
            )}
          </div>
          <div className="p-0 flex-1 max-h-[350px] overflow-y-auto">
            {!patient.evaluations || patient.evaluations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-12 text-center text-muted-foreground">
                <Activity className="h-8 w-8 mb-4 opacity-20" />
                <p>No hay evaluaciones registradas</p>
              </div>
            ) : (
              <div className="divide-y">
                {patient.evaluations.map((evaluation: { id: string, date: Date | string, type: string, weight: number, bodyFatPct?: number | null, muscleMassKg?: number | null }) => (
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
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/evaluations/${evaluation.id}`}>
                        <Button variant="outline" size="sm">Ver Reporte</Button>
                      </Link>
                      <DeleteEvaluationButton id={evaluation.id} variant="ghost" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Routines section */}
        <div className="md:col-span-3 rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="text-lg font-medium">Rutinas de Ejercicio</h3>
            <Link href={`/dashboard/patients/${patient.id}/routines/new`}>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Nueva Rutina
              </Button>
            </Link>
          </div>
          <div className="p-0">
            {!routines || routines.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <Dumbbell className="h-8 w-8 mb-4 opacity-20" />
                <p>No hay rutinas asignadas</p>
              </div>
            ) : (
              <div className="divide-y">
                {routines.map((routine) => (
                  <div key={routine.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div>
                      <div className="font-medium">{routine.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {routine.isActive ? "Activa" : "Inactiva"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/routines/${routine.id}`}>
                        <Button variant="outline" size="sm">
                          <FileText className="mr-2 h-4 w-4" /> Ver Rutina
                        </Button>
                      </Link>
                      <DeleteRoutineButton id={routine.id} routineName={routine.name} variant="ghost" />
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

      {/* Share history section */}
      {patient.shareToken && (
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Compartir Historial</h3>
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-white p-3 rounded-xl border shadow-sm">
              <QRCode
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/share/patient/${patient.shareToken}`}
                size={120}
              />
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-sm text-muted-foreground">
                El paciente puede ver todo su historial de evaluaciones escaneando el código QR o accediendo al link. No se requiere cuenta.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-muted px-3 py-2 rounded-lg break-all">
                  {typeof window !== "undefined" ? window.location.origin : ""}/share/patient/{patient.shareToken}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/share/patient/${patient.shareToken}`)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
