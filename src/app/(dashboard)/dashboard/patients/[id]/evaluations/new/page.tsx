"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getPatientById } from "@/actions/patient"
import { getLatestEvaluationByPatientId } from "@/actions/evaluation"
import { getEvaluationUsage } from "@/actions/subscription"
import { EvaluationForm } from "@/components/forms/EvaluationForm"

export default function NewEvaluationPage() {
  const params = useParams()
  const id = params.id as string

  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => getPatientById(id),
  })

  const { data: latestEvaluation, isLoading: isLoadingLatest } = useQuery({
    queryKey: ["latestEvaluation", id],
    queryFn: () => getLatestEvaluationByPatientId(id),
  })

  const { data: usage } = useQuery({
    queryKey: ["evaluationUsage"],
    queryFn: () => getEvaluationUsage(),
  })

  if (isLoadingPatient || isLoadingLatest) {
    return <div className="p-8 text-center">Cargando datos...</div>
  }

  if (!patient) {
    return <div className="p-8 text-center">Paciente no encontrado</div>
  }

  if (usage?.isAtLimit) {
    return (
      <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/patients/${patient.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            Nueva Evaluación: {patient.firstName}
          </h1>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-12 text-center text-muted-foreground flex flex-col items-center">
          <Lock className="h-8 w-8 mb-4 opacity-30" />
          <h3 className="text-lg font-medium mb-1 text-foreground">Límite del plan gratuito alcanzado</h3>
          <p className="text-sm max-w-sm">
            Has registrado {usage.used} de {usage.limit} evaluaciones incluidas en tu plan gratuito.
            Actualiza tu plan para seguir registrando evaluaciones.
          </p>
          <Link href="/dashboard/upgrade" className="mt-4">
            <Button>Actualizar Plan</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Pre-fill with latest evaluation if exists, otherwise patient's initial height
  const initialHeight = latestEvaluation?.height || patient.height
  const initialBreadths = latestEvaluation ? {
    breadthHumerus: latestEvaluation.breadthHumerus,
    breadthFemur: latestEvaluation.breadthFemur,
    breadthBistyl: latestEvaluation.breadthBistyl,
    breadthBimal: latestEvaluation.breadthBimal,
  } : undefined

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/patients/${patient.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          Nueva Evaluación: {patient.firstName}
        </h1>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
        <EvaluationForm 
          patientId={patient.id} 
          initialWeight={patient.initialWeight} 
          initialHeight={initialHeight} 
          initialBreadths={initialBreadths}
        />
      </div>
    </div>
  )
}
