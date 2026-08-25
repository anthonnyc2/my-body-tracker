"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  useForm,
  useFieldArray,
  Control,
  UseFormRegister,
  UseFormGetValues,
  FieldErrors,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus, Trash2, Copy, ArrowUp, ArrowDown } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ExercisePicker } from "@/components/forms/ExercisePicker"
import { RoutineFormValues, RoutineFormInput, routineSchema } from "@/types/routine"
import { createRoutine, updateRoutine } from "@/actions/routine"

interface RoutineFormProps {
  patientId: string
  routineId?: string
  initialData?: Partial<RoutineFormValues>
}

export function RoutineForm({ patientId, routineId, initialData }: RoutineFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RoutineFormInput, unknown, RoutineFormValues>({
    resolver: zodResolver(routineSchema),
    defaultValues: {
      patientId,
      name: initialData?.name || "",
      description: initialData?.description || "",
      isActive: initialData?.isActive ?? true,
      days:
        initialData?.days && initialData.days.length > 0
          ? initialData.days
          : [{ label: "Día 1", notes: "", exercises: [] }],
    },
  })

  const {
    fields: dayFields,
    append: appendDay,
    remove: removeDay,
    move: moveDay,
  } = useFieldArray({ control, name: "days" })

  async function onSubmit(data: RoutineFormValues) {
    setIsSubmitting(true)
    try {
      const result = routineId
        ? await updateRoutine(routineId, data)
        : await createRoutine(data)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(routineId ? "Rutina actualizada" : "Rutina creada correctamente")
        router.push(`/dashboard/patients/${patientId}`)
      }
    } catch {
      toast.error("No se pudo conectar con el servidor. Intenta nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre de la rutina</Label>
          <Input id="name" placeholder="Ej. Fuerza - Fase 1" {...register("name")} />
          {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descripción (Opcional)</Label>
          <Textarea id="description" {...register("description")} />
        </div>
      </div>

      <div className="space-y-4">
        {dayFields.map((day, dayIndex) => (
          <RoutineDayFields
            key={day.id}
            control={control}
            register={register}
            getValues={getValues}
            errors={errors}
            dayIndex={dayIndex}
            onRemoveDay={() => removeDay(dayIndex)}
            canRemoveDay={dayFields.length > 1}
            onMoveUp={() => moveDay(dayIndex, dayIndex - 1)}
            onMoveDown={() => moveDay(dayIndex, dayIndex + 1)}
            canMoveUp={dayIndex > 0}
            canMoveDown={dayIndex < dayFields.length - 1}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          appendDay({ label: `Día ${dayFields.length + 1}`, notes: "", exercises: [] })
        }
      >
        <Plus className="mr-2 h-4 w-4" /> Agregar día
      </Button>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {routineId ? "Guardar Cambios" : "Crear Rutina"}
        </Button>
      </div>
    </form>
  )
}

function RoutineDayFields({
  control,
  register,
  getValues,
  errors,
  dayIndex,
  onRemoveDay,
  canRemoveDay,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  control: Control<RoutineFormInput>
  register: UseFormRegister<RoutineFormInput>
  getValues: UseFormGetValues<RoutineFormInput>
  errors: FieldErrors<RoutineFormInput>
  dayIndex: number
  onRemoveDay: () => void
  canRemoveDay: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
}) {
  const {
    fields: exerciseFields,
    append: appendExercise,
    remove: removeExercise,
    move: moveExercise,
    insert: insertExercise,
  } = useFieldArray({ control, name: `days.${dayIndex}.exercises` })

  function handleDuplicate(exerciseIndex: number) {
    const current = getValues(`days.${dayIndex}.exercises.${exerciseIndex}`)
    insertExercise(exerciseIndex + 1, { ...current })
  }

  const dayErrors = errors.days?.[dayIndex]
  const [hoveredExerciseId, setHoveredExerciseId] = useState<string | null>(null)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="flex flex-col gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onMoveUp}
            disabled={!canMoveUp}
          >
            <ArrowUp className="h-3.5 w-3.5" />
            <span className="sr-only">Mover día hacia arriba</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onMoveDown}
            disabled={!canMoveDown}
          >
            <ArrowDown className="h-3.5 w-3.5" />
            <span className="sr-only">Mover día hacia abajo</span>
          </Button>
        </div>
        <div className="flex-1 space-y-1">
          <Input
            placeholder="Ej. Día 1 - Empuje"
            {...register(`days.${dayIndex}.label`)}
          />
          {dayErrors?.label && (
            <span className="text-xs text-destructive">{dayErrors.label.message}</span>
          )}
        </div>
        {canRemoveDay && (
          <Button type="button" variant="ghost" size="icon" onClick={onRemoveDay}>
            <Trash2 className="h-4 w-4 text-destructive" />
            <span className="sr-only">Eliminar día</span>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {exerciseFields.map((exerciseField, exerciseIndex) => {
          const exerciseErrors = dayErrors?.exercises?.[exerciseIndex]
          return (
            <div key={exerciseField.id} className="flex items-start gap-2 rounded-lg border p-3">
              <div className="flex flex-col gap-0.5 pt-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => moveExercise(exerciseIndex, exerciseIndex - 1)}
                  disabled={exerciseIndex === 0}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                  <span className="sr-only">Mover ejercicio hacia arriba</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => moveExercise(exerciseIndex, exerciseIndex + 1)}
                  disabled={exerciseIndex === exerciseFields.length - 1}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                  <span className="sr-only">Mover ejercicio hacia abajo</span>
                </Button>
              </div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div
                  className="col-span-2 sm:col-span-3 flex items-center gap-2"
                  onMouseEnter={() => setHoveredExerciseId(exerciseField.id)}
                  onMouseLeave={() => setHoveredExerciseId(null)}
                >
                  {(exerciseField.thumbnailUrl || exerciseField.gifUrl) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        (hoveredExerciseId === exerciseField.id && exerciseField.gifUrl) ||
                        exerciseField.thumbnailUrl
                      }
                      alt=""
                      loading="lazy"
                      className="h-10 w-10 rounded-md object-cover shrink-0 bg-muted"
                    />
                  )}
                  <span className="text-sm font-medium capitalize">
                    {exerciseField.name || "Ejercicio"}
                  </span>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Series</Label>
                  <Input type="number" {...register(`days.${dayIndex}.exercises.${exerciseIndex}.sets`)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Reps</Label>
                  <Input placeholder="8-12" {...register(`days.${dayIndex}.exercises.${exerciseIndex}.reps`)} />
                  {exerciseErrors?.reps && (
                    <span className="text-xs text-destructive">{exerciseErrors.reps.message}</span>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Descanso (s)</Label>
                  <Input type="number" {...register(`days.${dayIndex}.exercises.${exerciseIndex}.restSeconds`)} />
                </div>
                <div className="col-span-2 sm:col-span-3 space-y-1">
                  <Label className="text-xs">Notas</Label>
                  <Textarea
                    rows={2}
                    className="min-h-0"
                    {...register(`days.${dayIndex}.exercises.${exerciseIndex}.notes`)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDuplicate(exerciseIndex)}
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Duplicar ejercicio</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeExercise(exerciseIndex)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Quitar ejercicio</span>
                </Button>
              </div>
            </div>
          )
        })}

        {dayErrors?.exercises?.root && (
          <p className="text-xs text-destructive">{dayErrors.exercises.root.message}</p>
        )}

        <ExercisePicker
          onSelect={(exercise) =>
            appendExercise({
              exerciseId: exercise.id,
              name: exercise.name,
              thumbnailUrl: exercise.thumbnailUrl ?? undefined,
              gifUrl: exercise.gifUrl ?? undefined,
              sets: undefined,
              reps: "",
              restSeconds: undefined,
              notes: "",
            })
          }
        />
      </CardContent>
    </Card>
  )
}
