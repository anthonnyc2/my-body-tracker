import { z } from "zod"

export const patientSchema = z.object({
  firstName: z.string().min(2, "El nombre es muy corto"),
  lastName: z.string().min(2, "El apellido es muy corto"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    message: "Debes seleccionar un género",
  }),
  birthDate: z.date({
    message: "La fecha de nacimiento es requerida",
  }),
  documentId: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  address: z.string().optional(),
  initialWeight: z.coerce.number().min(20, "Peso inválido"),
  height: z.coerce.number().min(50, "Altura inválida (en cm)"),
  activityLevel: z.enum(["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE"]),
  goal: z.enum(["FAT_LOSS", "MUSCLE_GAIN", "BODY_RECOMPOSITION", "SPORTS_PERFORMANCE", "MAINTENANCE"]),
})

export type PatientFormValues = z.infer<typeof patientSchema>
export type PatientFormInput = z.input<typeof patientSchema>
