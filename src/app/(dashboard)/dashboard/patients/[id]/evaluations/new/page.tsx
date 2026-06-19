"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getPatientById } from "@/actions/patient"
import { getLatestEvaluationByPatientId } from "@/actions/evaluation"
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

  if (isLoadingPatient || isLoadingLatest) {
    return <div className="p-8 text-center">Cargando datos...</div>
  }

  if (!patient) {
    return <div className="p-8 text-center">Paciente no encontrado</div>
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
