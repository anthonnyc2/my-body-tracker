"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getRoutineById } from "@/actions/routine"
import { DeleteRoutineButton } from "@/components/DeleteRoutineButton"
import { RoutineDaysAccordion } from "@/components/RoutineDaysAccordion"
import { RoutineShareLinkButton } from "@/components/RoutineShareLinkButton"

export default function RoutineDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { data: routine, isLoading } = useQuery({
    queryKey: ["routine", id],
    queryFn: () => getRoutineById(id),
  })

  if (isLoading) {
    return <div className="p-8 text-center">Cargando rutina...</div>
  }

  if (!routine) {
    return <div className="p-8 text-center">Rutina no encontrada</div>
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/patients/${routine.patientId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{routine.name}</h1>
            <p className="text-sm text-muted-foreground">
              {routine.patient.firstName} {routine.patient.lastName}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <RoutineShareLinkButton shareToken={routine.shareToken} label="Compartir" />
          <Link href={`/dashboard/routines/${routine.id}/edit`}>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" /> Editar Rutina
            </Button>
          </Link>
          <DeleteRoutineButton
            id={routine.id}
            routineName={routine.name}
            redirectUrl={`/dashboard/patients/${routine.patientId}`}
            label="Eliminar Rutina"
          />
        </div>
      </div>

      {routine.description && (
        <p className="text-sm text-muted-foreground">{routine.description}</p>
      )}

      <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
        <RoutineDaysAccordion days={routine.days} />
      </div>
    </div>
  )
}
