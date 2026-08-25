import { z } from "zod"

const optionalCount = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
  z.number().int().min(1, "Mínimo 1").max(20, "Máximo 20").optional()
)

const optionalRestSeconds = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
  z.number().int().min(0, "No puede ser negativo").max(3600, "Máximo 3600s").optional()
)

export const routineDayExerciseSchema = z.object({
  exerciseId: z.string().min(1, "Selecciona un ejercicio"),
  // Solo para mostrar en el formulario (picker/preview), no se persisten en la rutina
  name: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  gifUrl: z.string().optional(),
  sets: optionalCount,
  reps: z
    .string()
    .min(1, "Indica las repeticiones")
    .max(50)
    .refine((val) => !/(^|\s)-\d/.test(val), "No se permiten números negativos"),
  restSeconds: optionalRestSeconds,
  notes: z.string().max(500).optional(),
})

export const routineDaySchema = z.object({
  label: z.string().min(1, "El día necesita un nombre").max(100),
  notes: z.string().max(500).optional(),
  exercises: z.array(routineDayExerciseSchema).min(1, "Agrega al menos un ejercicio"),
})

export const routineSchema = z.object({
  patientId: z.string().uuid(),
  name: z.string().min(2, "El nombre es muy corto").max(150),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().default(true),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  days: z.array(routineDaySchema).min(1, "Agrega al menos un día"),
})

export type RoutineFormValues = z.infer<typeof routineSchema>
export type RoutineFormInput = z.input<typeof routineSchema>
