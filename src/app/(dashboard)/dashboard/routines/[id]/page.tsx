"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ChevronDown, ChevronUp, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getRoutineById } from "@/actions/routine"
import { DeleteRoutineButton } from "@/components/DeleteRoutineButton"

type RoutineDayExercise = NonNullable<
  Awaited<ReturnType<typeof getRoutineById>>
>["days"][number]["exercises"][number]

export default function RoutineDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { data: routine, isLoading } = useQuery({
    queryKey: ["routine", id],
    queryFn: () => getRoutineById(id),
  })

  // Days can genuinely change after mount (edit the routine, come back to
  // this page -- react-query may briefly serve stale cached days before the
  // refetch lands). An uncontrolled Accordion's `defaultValue` only applies
  // once, so `key={dayIdsKey}` forces a fresh mount (and a fresh default)
  // whenever the actual set of days changes, while `useMemo` keeps the array
  // reference stable when it hasn't -- together that avoids Base UI's
  // "changing the default value after initialized" warning either way.
  const dayIdsKey = routine?.days.map((d) => d.id).join(",") ?? ""
  const dayIds = useMemo(() => (dayIdsKey ? dayIdsKey.split(",") : []), [dayIdsKey])

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
        <Accordion key={dayIdsKey} multiple defaultValue={dayIds}>
          {routine.days.map((day) => (
            <AccordionItem key={day.id} value={day.id}>
              <AccordionTrigger>{day.label}</AccordionTrigger>
              <AccordionContent>
                {day.notes && <p className="text-sm text-muted-foreground mb-3">{day.notes}</p>}
                <div className="space-y-3">
                  {day.exercises.map((dayExercise) => (
                    <RoutineExerciseRow key={dayExercise.id} dayExercise={dayExercise} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}

function RoutineExerciseRow({ dayExercise }: { dayExercise: RoutineDayExercise }) {
  const [showInstructions, setShowInstructions] = useState(false)
  const instructions = dayExercise.exercise.instructionsEs

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium capitalize">{dayExercise.exercise.name}</p>
          <p className="text-sm text-muted-foreground">
            {dayExercise.sets ? `${dayExercise.sets} series × ` : ""}
            {dayExercise.reps}
            {dayExercise.restSeconds ? ` • Descanso ${dayExercise.restSeconds}s` : ""}
          </p>
          {dayExercise.notes && (
            <p className="text-sm text-muted-foreground mt-1">{dayExercise.notes}</p>
          )}
          {instructions.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-1 h-auto px-0 py-0 text-primary hover:bg-transparent"
              onClick={() => setShowInstructions((v) => !v)}
            >
              {showInstructions ? (
                <ChevronUp className="mr-1 h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="mr-1 h-3.5 w-3.5" />
              )}
              {showInstructions ? "Ocultar instrucciones" : "Ver instrucciones"}
            </Button>
          )}
        </div>
        {dayExercise.exercise.gifUrl || dayExercise.exercise.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dayExercise.exercise.gifUrl || dayExercise.exercise.thumbnailUrl || undefined}
            alt={`Animación de ${dayExercise.exercise.name}`}
            loading="lazy"
            className="h-20 w-20 rounded-md object-cover shrink-0 bg-muted"
          />
        ) : (
          <div className="h-20 w-20 rounded-md bg-muted shrink-0" />
        )}
      </div>
      {showInstructions && instructions.length > 0 && (
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted-foreground border-t pt-3">
          {instructions.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      )}
    </div>
  )
}
