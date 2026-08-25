"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface RoutineDayExercise {
  id: string
  sets: number | null
  reps: string | null
  restSeconds: number | null
  notes: string | null
  exercise: {
    name: string
    thumbnailUrl: string | null
    gifUrl: string | null
    instructionsEs: string[]
  }
}

interface RoutineDay {
  id: string
  label: string
  notes: string | null
  exercises: RoutineDayExercise[]
}

export function RoutineDaysAccordion({ days }: { days: RoutineDay[] }) {
  // Days can genuinely change after mount (edit the routine, come back to
  // this page -- react-query may briefly serve stale cached days before the
  // refetch lands). An uncontrolled Accordion's `defaultValue` only applies
  // once, so `key={dayIdsKey}` forces a fresh mount (and a fresh default)
  // whenever the actual set of days changes, while `useMemo` keeps the array
  // reference stable when it hasn't -- together that avoids Base UI's
  // "changing the default value after initialized" warning either way.
  const dayIdsKey = days.map((d) => d.id).join(",")
  const dayIds = useMemo(() => (dayIdsKey ? dayIdsKey.split(",") : []), [dayIdsKey])

  return (
    <Accordion key={dayIdsKey} multiple defaultValue={dayIds}>
      {days.map((day) => (
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
