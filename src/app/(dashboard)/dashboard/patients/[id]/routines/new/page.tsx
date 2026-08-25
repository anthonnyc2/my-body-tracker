"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getPatientById } from "@/actions/patient"
import { RoutineForm } from "@/components/forms/RoutineForm"

export default function NewRoutinePage() {
  const params = useParams()
  const id = params.id as string

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => getPatientById(id),
  })

  if (isLoading) {
    return <div className="p-8 text-center">Cargando datos...</div>
  }

  if (!patient) {
    return <div className="p-8 text-center">Paciente no encontrado</div>
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/patients/${patient.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          Nueva Rutina: {patient.firstName}
        </h1>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
        <RoutineForm patientId={patient.id} />
      </div>
    </div>
  )
}
