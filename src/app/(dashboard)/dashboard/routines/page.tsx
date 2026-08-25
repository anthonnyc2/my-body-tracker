"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Dumbbell, User, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getRoutines } from "@/actions/routine"
import { DeleteRoutineButton } from "@/components/DeleteRoutineButton"

export default function RoutinesPage() {
  const { data: routines, isLoading } = useQuery({
    queryKey: ["routines"],
    queryFn: () => getRoutines(),
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rutinas</h1>
        <p className="text-muted-foreground mt-1">
          Rutinas de ejercicio asignadas a tus pacientes.
        </p>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Cargando rutinas...</p>
          </div>
        ) : !routines || routines.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <Dumbbell className="h-12 w-12 mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-1">Sin rutinas</h3>
            <p className="text-sm max-w-sm mb-6">
              Aún no has creado ninguna rutina de ejercicios. Para comenzar, ve a la sección de Pacientes y selecciona uno.
            </p>
            <Link href="/dashboard/patients">
              <Button variant="outline">Ir a Pacientes</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {routines.map((routine) => (
              <div
                key={routine.id}
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Paciente</p>
                      <p className="text-base font-semibold">
                        {routine.patient.firstName} {routine.patient.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{routine.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {routine.isActive ? "Activa" : "Inactiva"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 md:mt-0 w-full md:w-auto">
                  <Link href={`/dashboard/routines/${routine.id}`} className="flex-1 md:flex-none">
                    <Button variant="outline" className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Ver Rutina
                    </Button>
                  </Link>
                  <DeleteRoutineButton id={routine.id} routineName={routine.name} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
