"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getEvaluationById } from "@/actions/evaluation"
import { EvaluationForm } from "@/components/forms/EvaluationForm"
import { EvaluationFormValues } from "@/types/evaluation"

export default function EditEvaluationPage() {
  const params = useParams()
  const id = params.id as string

  const { data, isLoading } = useQuery({
    queryKey: ["evaluation", id],
    queryFn: () => getEvaluationById(id),
  })

  if (isLoading) {
    return <div className="p-8 text-center">Cargando datos...</div>
  }

  if (!data || !data.current) {
    return <div className="p-8 text-center">Evaluación no encontrada</div>
  }

  const evaluation = data.current
  const patient = evaluation.patient

  // Map the database evaluation to the form structure
  const initialData: Partial<EvaluationFormValues> = {
    date: evaluation.date,
    type: evaluation.type,
    weight: evaluation.weight,
    height: evaluation.height,

    girthRelaxedArm: evaluation.girthRelaxedArm ?? undefined,
    girthFlexedArm: evaluation.girthFlexedArm ?? undefined,
    girthForearm: evaluation.girthForearm ?? undefined,
    girthWaist: evaluation.girthWaist ?? undefined,
    girthHip: evaluation.girthHip ?? undefined,
    girthThigh: evaluation.girthThigh ?? undefined,
    girthCalf: evaluation.girthCalf ?? undefined,

    breadthHumerus: evaluation.breadthHumerus ?? undefined,
    breadthFemur: evaluation.breadthFemur ?? undefined,
    breadthBistyl: evaluation.breadthBistyl ?? undefined,
    breadthBimal: evaluation.breadthBimal ?? undefined,

    skinfoldTriceps: evaluation.skinfoldTriceps ?? undefined,
    skinfoldSubscap: evaluation.skinfoldSubscap ?? undefined,
    skinfoldBiceps: evaluation.skinfoldBiceps ?? undefined,
    skinfoldIliac: evaluation.skinfoldIliac ?? undefined,
    skinfoldSuprasp: evaluation.skinfoldSuprasp ?? undefined,
    skinfoldAbdom: evaluation.skinfoldAbdom ?? undefined,
    skinfoldThigh: evaluation.skinfoldThigh ?? undefined,
    skinfoldCalf: evaluation.skinfoldCalf ?? undefined,
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/evaluations/${evaluation.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          Editar Evaluación: {patient.firstName}
        </h1>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
        <EvaluationForm 
          patientId={patient.id}
          evaluationId={evaluation.id}
          initialWeight={evaluation.weight} 
          initialHeight={evaluation.height} 
          initialData={initialData}
        />
      </div>
    </div>
  )
}
