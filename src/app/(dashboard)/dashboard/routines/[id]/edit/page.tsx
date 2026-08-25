"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getRoutineById } from "@/actions/routine"
import { RoutineForm } from "@/components/forms/RoutineForm"
import { RoutineFormValues } from "@/types/routine"

export default function EditRoutinePage() {
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

  const initialData: Partial<RoutineFormValues> = {
    name: routine.name,
    description: routine.description ?? undefined,
    isActive: routine.isActive,
    startDate: routine.startDate ?? undefined,
    endDate: routine.endDate ?? undefined,
    days: routine.days.map((day) => ({
      label: day.label,
      notes: day.notes ?? undefined,
      exercises: day.exercises.map((dayExercise) => ({
        exerciseId: dayExercise.exerciseId,
        name: dayExercise.exercise.name,
        thumbnailUrl: dayExercise.exercise.thumbnailUrl ?? undefined,
        gifUrl: dayExercise.exercise.gifUrl ?? undefined,
        sets: dayExercise.sets ?? undefined,
        reps: dayExercise.reps ?? "",
        restSeconds: dayExercise.restSeconds ?? undefined,
        notes: dayExercise.notes ?? undefined,
      })),
    })),
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/routines/${routine.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          Editar Rutina: {routine.name}
        </h1>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
        <RoutineForm patientId={routine.patientId} routineId={routine.id} initialData={initialData} />
      </div>
    </div>
  )
}
