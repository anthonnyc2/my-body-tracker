import { notFound } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  getBMICategory,
  calculateWHR,
  getWHRRisk,
  calculateSumOf6,
  calculateSomatotype,
  getBodyFatCategory,
  getMuscleMassCategory,
  getBoneMassCategory,
} from "@/lib/calculations"
import type { Gender } from "@prisma/client"

interface Props {
  params: Promise<{ token: string }>
}

export default async function SharePage({ params }: Props) {
  const { token } = await params
  const { prisma } = await import("@/lib/prisma")

  const evaluation = await prisma.evaluation.findUnique({
    where: { shareToken: token },
    include: {
      patient: {
        include: { evaluator: true },
      },
      recommendation: true,
    },
  })

  if (!evaluation) notFound()

  // Increment view count (fire-and-forget, don't block render)
  prisma.evaluation.update({
    where: { shareToken: token },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {})

  const { patient } = evaluation
  const evaluatorName = `${patient.evaluator.firstName} ${patient.evaluator.lastName}`

  // Gender.OTHER → FEMALE for category functions that only accept MALE | FEMALE
  const genderForCategories: "MALE" | "FEMALE" =
    patient.gender === "MALE" ? "MALE" : "FEMALE"

  const bmiCategory = evaluation.bmi ? getBMICategory(evaluation.bmi) : null
  const bodyFatCat = evaluation.bodyFatPct
    ? getBodyFatCategory(evaluation.bodyFatPct, genderForCategories)
    : null
  const muscleMassPct = evaluation.muscleMassKg
    ? (evaluation.muscleMassKg / evaluation.weight) * 100
    : null
  const muscleMassCat = muscleMassPct
    ? getMuscleMassCategory(muscleMassPct, genderForCategories)
    : null
  const boneMassPct = evaluation.boneMassKg
    ? (evaluation.boneMassKg / evaluation.weight) * 100
    : null
  const boneMassCat = boneMassPct
    ? getBoneMassCategory(boneMassPct, genderForCategories)
    : null

  const whr = calculateWHR(evaluation.girthWaist ?? 0, evaluation.girthHip ?? 0)
  // getWHRRisk handles OTHER natively
  const whrRisk = whr ? getWHRRisk(whr, patient.gender as Gender) : null

  const measurements = {
    gender: patient.gender as Gender,
    age: evaluation.decimalAge ?? 25,
    weight: evaluation.weight,
    height: evaluation.height,
    girthRelaxedArm: evaluation.girthRelaxedArm ?? undefined,
    girthFlexedArm: evaluation.girthFlexedArm ?? undefined,
    girthForearm: evaluation.girthForearm ?? undefined,
    girthWaist: evaluation.girthWaist ?? undefined,
    girthHip: evaluation.girthHip ?? undefined,
    girthThigh: evaluation.girthThigh ?? undefined,
    girthCalf: evaluation.girthCalf ?? undefined,
    breadthHumerus: evaluation.breadthHumerus ?? undefined,
    breadthFemur: evaluation.breadthFemur ?? undefined,
    breadthBistyl: evaluation.breadthBistyl ?? undefined,
    breadthBimal: evaluation.breadthBimal ?? undefined,
    skinfoldTriceps: evaluation.skinfoldTriceps ?? undefined,
    skinfoldSubscap: evaluation.skinfoldSubscap ?? undefined,
    skinfoldBiceps: evaluation.skinfoldBiceps ?? undefined,
    skinfoldIliac: evaluation.skinfoldIliac ?? undefined,
    skinfoldSuprasp: evaluation.skinfoldSuprasp ?? undefined,
    skinfoldAbdom: evaluation.skinfoldAbdom ?? undefined,
    skinfoldThigh: evaluation.skinfoldThigh ?? undefined,
    skinfoldCalf: evaluation.skinfoldCalf ?? undefined,
  }

  const sumOf6 = calculateSumOf6(measurements)
  const somatotype = calculateSomatotype(measurements)

  const evalDate = format(
    new Date(
      new Date(evaluation.date).getUTCFullYear(),
      new Date(evaluation.date).getUTCMonth(),
      new Date(evaluation.date).getUTCDate()
    ),
    "dd MMMM yyyy",
    { locale: es }
  )

  const fmt = (v: number | null | undefined, dec = 1) =>
    v != null ? v.toFixed(dec) : "—"

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
            Reporte de Evaluación
          </div>
          <h1 className="text-2xl font-bold">{patient.firstName} {patient.lastName}</h1>
          <p className="text-muted-foreground text-sm mt-1">{evalDate}</p>
          <p className="text-muted-foreground text-sm">Evaluador: {evaluatorName}</p>
        </div>

        {/* Body Composition */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Composición Corporal
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Metric
              label="Peso"
              value={`${fmt(evaluation.weight)} kg`}
            />
            <Metric
              label="IMC"
              value={fmt(evaluation.bmi)}
              sub={bmiCategory?.category}
            />
            <Metric
              label="Masa Adiposa"
              value={`${fmt(evaluation.bodyFatKg)} kg`}
              sub={evaluation.bodyFatPct ? `${fmt(evaluation.bodyFatPct)}% · ${bodyFatCat?.category ?? ""}` : undefined}
            />
            <Metric
              label="Masa Muscular"
              value={`${fmt(evaluation.muscleMassKg)} kg`}
              sub={muscleMassPct ? `${fmt(muscleMassPct)}% · ${muscleMassCat?.category ?? ""}` : undefined}
            />
            <Metric
              label="Masa Ósea"
              value={`${fmt(evaluation.boneMassKg)} kg`}
              sub={boneMassCat?.category}
            />
            <Metric
              label="Masa Residual"
              value={`${fmt(evaluation.residualMassKg)} kg`}
            />
          </div>
        </section>

        {/* Advanced */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Indicadores Avanzados
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Metric
              label="Peso Ideal Sugerido"
              value={evaluation.idealWeight ? `${fmt(evaluation.idealWeight)} kg` : "—"}
            />
            <Metric
              label="Sumatoria 6 Pliegues"
              value={sumOf6 ? `${fmt(sumOf6)} mm` : "—"}
            />
            <Metric
              label="Índice Cintura-Cadera"
              value={whr ? whr.toFixed(2) : "—"}
              sub={whrRisk ? `Riesgo: ${whrRisk.risk}` : undefined}
            />
            <Metric
              label="Somatotipo"
              value={somatotype?.classification ?? "—"}
              sub={
                somatotype
                  ? `${somatotype.endomorphy.toFixed(1)} · ${somatotype.mesomorphy.toFixed(1)} · ${somatotype.ectomorphy.toFixed(1)}`
                  : undefined
              }
            />
          </div>
        </section>

        {/* Recommendation */}
        {evaluation.recommendation && (
          <section className="mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Informe del Evaluador
            </h2>
            <div className="rounded-xl border bg-card p-4 space-y-3 text-sm">
              {evaluation.recommendation.observations && (
                <div>
                  <div className="font-medium mb-1">Observaciones</div>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {evaluation.recommendation.observations}
                  </p>
                </div>
              )}
              {evaluation.recommendation.conclusions && (
                <div>
                  <div className="font-medium mb-1">Conclusiones</div>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {evaluation.recommendation.conclusions}
                  </p>
                </div>
              )}
              {evaluation.recommendation.recommendations && (
                <div>
                  <div className="font-medium mb-1">Recomendaciones</div>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {evaluation.recommendation.recommendations}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Generado con Body Tracker
        </p>
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-lg font-bold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  )
}
