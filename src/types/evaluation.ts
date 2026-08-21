import { z } from "zod"

const optionalGirth = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
  z.number().min(10, "Valor irreal (mín 10cm)").max(250, "Valor irreal (máx 250cm)").optional()
)

const optionalBreadth = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
  z.number().min(3, "Valor irreal (mín 3cm)").max(100, "Valor irreal (máx 100cm)").optional()
)

const optionalSkinfold = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
  z.number().min(2, "Valor irreal (mín 2mm)").max(150, "Valor irreal (máx 150mm)").optional()
)

const optionalPercentage = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
  z.number().min(2, "Mínimo 2%").max(80, "Máximo 80%").optional()
)

export const evaluationSchema = z.object({
  patientId: z.string().uuid(),
  date: z.date(),
  
  // Basic
  weight: z.coerce.number().min(20, "Peso inválido").max(400, "Valor irreal (máx 400kg)"),
  height: z.coerce.number().min(50, "Altura inválida").max(300, "Valor irreal (máx 300cm)"),

  // Girths (Perímetros)
  girthThorax: optionalGirth,
  girthAbdomen: optionalGirth,
  girthWaist: optionalGirth,
  girthHip: optionalGirth,
  girthRelaxedArm: optionalGirth,
  girthFlexedArm: optionalGirth,
  girthForearm: optionalGirth,
  girthWrist: optionalGirth,
  girthThigh: optionalGirth,
  girthMaxThigh: optionalGirth,
  girthCalf: optionalGirth,

  // Breadths (Diámetros)
  breadthHumerus: optionalBreadth,
  breadthFemur: optionalBreadth,
  breadthBistyl: optionalBreadth,
  breadthBimal: optionalBreadth,

  // Skinfolds (Pliegues)
  skinfoldTriceps: optionalSkinfold,
  skinfoldSubscap: optionalSkinfold,
  skinfoldBiceps: optionalSkinfold,
  skinfoldIliac: optionalSkinfold,
  skinfoldSuprasp: optionalSkinfold,
  skinfoldAbdom: optionalSkinfold,
  skinfoldThigh: optionalSkinfold,
  skinfoldCalf: optionalSkinfold,

  // Custom Targets
  targetBodyFatPct: optionalPercentage,
  targetMuscleMassPct: optionalPercentage,
})

export type EvaluationFormValues = z.infer<typeof evaluationSchema>
export type EvaluationFormInput = z.input<typeof evaluationSchema>

export const recommendationSchema = z.object({
  observations: z.string().optional(),
  conclusions: z.string().optional(),
  recommendations: z.string().optional(),
})

export type RecommendationFormValues = z.infer<typeof recommendationSchema>
