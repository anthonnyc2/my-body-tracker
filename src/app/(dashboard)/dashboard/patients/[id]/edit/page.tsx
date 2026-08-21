"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PatientForm } from "@/components/forms/PatientForm"
import { getPatientById } from "@/actions/patient"

export default function EditPatientPage() {
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/patients/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Paciente</h1>
          <p className="text-muted-foreground">Actualiza los datos de {patient.firstName} {patient.lastName}</p>
        </div>
      </div>
      
      <div className="rounded-xl border bg-card text-card-foreground shadow p-6 max-w-4xl">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <PatientForm initialData={patient as any} patientId={id} />
      </div>
    </div>
  )
}
