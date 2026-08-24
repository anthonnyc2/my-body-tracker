"use client"

import { Minus, TrendingDown, TrendingUp, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Evaluation, Patient, Recommendation } from "@prisma/client"

import {
  getBMICategory,
  calculateWHR,
  getWHRRisk,
  calculateSumOf6,
  calculateIdealWeight,
  calculateSomatotype,
  getBodyFatCategory,
  getMuscleMassCategory,
  getBoneMassCategory,
  calculateGoalProjections,
} from "@/lib/calculations"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

import { SomatoChart } from "@/components/charts/SomatoChart"
import { BodyCompositionChart } from "@/components/charts/BodyCompositionChart"
import { EvaluationComparison } from "@/components/EvaluationComparison"
import { RecommendationEditor } from "@/components/RecommendationEditor"
import { GoalsEditor } from "@/components/GoalsEditor"
import { PhotosEditor } from "@/components/PhotosEditor"
import type { EvaluationPhotoType } from "@prisma/client"

const GOAL_LABELS: Record<string, string> = {
  FAT_LOSS: "Pérdida de Grasa",
  MUSCLE_GAIN: "Ganancia Muscular",
  BODY_RECOMPOSITION: "Recomposición Corporal",
  SPORTS_PERFORMANCE: "Rendimiento Deportivo",
  MAINTENANCE: "Mantenimiento",
}

function DeltaIndicator({ current, previous, inverse = false }: { current: number | null, previous: number | null, inverse?: boolean }) {
  if (current === null || previous === null) return <Minus className="h-4 w-4 text-muted-foreground" />
  const delta = current - previous
  if (Math.abs(delta) < 0.1) return <Minus className="h-4 w-4 text-muted-foreground" />

  const isPositive = delta > 0
  const isGood = inverse ? !isPositive : isPositive

  return (
    <div className={`flex items-center text-sm ${isGood ? 'text-green-600' : 'text-red-600'}`}>
      {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
      {Math.abs(delta).toFixed(1)}
    </div>
  )
}

function MetricLabel({ title, tooltip }: { title: string, tooltip: string }) {
  return (
    <div className="text-sm text-muted-foreground mb-1 flex items-center justify-center gap-1.5">
      {title}
      <Tooltip>
        <TooltipTrigger className="cursor-help bg-transparent border-none p-0">
          <Info className="h-3.5 w-3.5 text-muted-foreground/70 hover:text-foreground transition-colors" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[250px] text-xs font-normal text-center bg-card text-card-foreground shadow-md border leading-relaxed">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

interface EvaluationReportProps {
  current: Evaluation & {
    recommendation?: Recommendation | null
    /** Only populated by the authenticated dashboard action — never fetched or passed on public share pages. */
    photos?: { type: EvaluationPhotoType; signedUrl: string | null }[]
  }
  previous?: Evaluation | null
  patient: Patient
  /** Lightweight history (evaluator mode): EvaluationComparison fetches full rows on demand via an auth-only action. */
  historyForComparison?: { id: string; date: Date; type?: string }[]
  /** Full sibling evaluations already in hand (public mode): EvaluationComparison looks these up locally, no auth required. */
  historyEvaluationsFull?: Evaluation[]
  /** Hides editing affordances (goals/recommendations) for unauthenticated public views. */
  readOnly?: boolean
  /** Evaluator's display name, e.g. for the public share page. */
  evaluatorName?: string
}

export function EvaluationReport({
  current,
  previous,
  patient,
  historyForComparison,
  historyEvaluationsFull,
  readOnly = false,
  evaluatorName,
}: EvaluationReportProps) {
  const isSimple = current.type === "SIMPLE"

  const bmiCategory = current.bmi ? getBMICategory(current.bmi) : null
  const whr = calculateWHR(current.girthWaist ?? 0, current.girthHip ?? 0)
  const whrRisk = whr ? getWHRRisk(whr, patient.gender) : null

  const muscleMassPct = current.muscleMassKg ? (current.muscleMassKg / current.weight) * 100 : null
  const boneMassPct = current.boneMassKg ? (current.boneMassKg / current.weight) * 100 : null

  const bodyFatCat = current.bodyFatPct ? getBodyFatCategory(current.bodyFatPct, patient.gender as "MALE" | "FEMALE") : null
  const muscleMassCat = muscleMassPct ? getMuscleMassCategory(muscleMassPct, patient.gender as "MALE" | "FEMALE") : null
  const boneMassCat = boneMassPct ? getBoneMassCategory(boneMassPct, patient.gender as "MALE" | "FEMALE") : null

  const goalProjections = current.bodyFatKg && current.muscleMassKg
    ? calculateGoalProjections(
        current.weight,
        current.bodyFatKg,
        current.muscleMassKg,
        patient.gender as "MALE" | "FEMALE",
        current.targetBodyFatPct,
        current.targetMuscleMassPct
      )
    : null

  const measurements = {
    gender: patient.gender,
    age: new Date().getFullYear() - new Date(patient.birthDate).getFullYear(),
    weight: current.weight,
    height: current.height,
    girthRelaxedArm: current.girthRelaxedArm ?? undefined,
    girthFlexedArm: current.girthFlexedArm ?? undefined,
    girthForearm: current.girthForearm ?? undefined,
    girthWaist: current.girthWaist ?? undefined,
    girthHip: current.girthHip ?? undefined,
    girthThigh: current.girthThigh ?? undefined,
    girthCalf: current.girthCalf ?? undefined,
    breadthHumerus: current.breadthHumerus ?? undefined,
    breadthFemur: current.breadthFemur ?? undefined,
    breadthBistyl: current.breadthBistyl ?? undefined,
    breadthBimal: current.breadthBimal ?? undefined,
    skinfoldTriceps: current.skinfoldTriceps ?? undefined,
    skinfoldSubscap: current.skinfoldSubscap ?? undefined,
    skinfoldBiceps: current.skinfoldBiceps ?? undefined,
    skinfoldIliac: current.skinfoldIliac ?? undefined,
    skinfoldSuprasp: current.skinfoldSuprasp ?? undefined,
    skinfoldAbdom: current.skinfoldAbdom ?? undefined,
    skinfoldThigh: current.skinfoldThigh ?? undefined,
    skinfoldCalf: current.skinfoldCalf ?? undefined,
  }

  const sumOf6 = calculateSumOf6(measurements)
  const idealWeight = calculateIdealWeight(current.fatFreeMass, patient.gender)
  const somatotype = calculateSomatotype(measurements)

  let previousSomatotype = null
  if (previous) {
    const prevMeasurements = {
      ...measurements,
      weight: previous.weight,
      height: previous.height,
      girthRelaxedArm: previous.girthRelaxedArm ?? undefined,
      girthFlexedArm: previous.girthFlexedArm ?? undefined,
      girthForearm: previous.girthForearm ?? undefined,
      girthWaist: previous.girthWaist ?? undefined,
      girthHip: previous.girthHip ?? undefined,
      girthThigh: previous.girthThigh ?? undefined,
      girthCalf: previous.girthCalf ?? undefined,
      breadthHumerus: previous.breadthHumerus ?? undefined,
      breadthFemur: previous.breadthFemur ?? undefined,
      breadthBistyl: previous.breadthBistyl ?? undefined,
      breadthBimal: previous.breadthBimal ?? undefined,
      skinfoldTriceps: previous.skinfoldTriceps ?? undefined,
      skinfoldSubscap: previous.skinfoldSubscap ?? undefined,
      skinfoldBiceps: previous.skinfoldBiceps ?? undefined,
      skinfoldIliac: previous.skinfoldIliac ?? undefined,
      skinfoldSuprasp: previous.skinfoldSuprasp ?? undefined,
      skinfoldAbdom: previous.skinfoldAbdom ?? undefined,
      skinfoldThigh: previous.skinfoldThigh ?? undefined,
      skinfoldCalf: previous.skinfoldCalf ?? undefined,
    }
    previousSomatotype = calculateSomatotype(prevMeasurements)
  }

  const historyForComparisonSafe = historyForComparison ?? (historyEvaluationsFull ?? []).map((e) => ({ id: e.id, date: e.date, type: e.type }))

  return (
    <div className="bg-card text-card-foreground shadow-sm rounded-xl border p-8 print:shadow-none print:border-none print:p-0">
      <div className="flex justify-between items-start mb-8 pb-8 border-b">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold">{patient.firstName} {patient.lastName}</h2>
            <span className={cn(
              "text-[11px] font-bold py-0.5 px-2 rounded-full",
              isSimple ? "bg-amber-500/10 text-amber-700" : "bg-emerald-500/10 text-emerald-700"
            )}>
              {isSimple ? "Simple" : "Completa"}
            </span>
          </div>
          <p className="text-muted-foreground">Fecha: {format(
            new Date(new Date(current.date).getUTCFullYear(), new Date(current.date).getUTCMonth(), new Date(current.date).getUTCDate()),
            "dd MMMM yyyy",
            { locale: es }
          )}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Objetivo: {GOAL_LABELS[patient.goal]}</p>
          <p className="text-sm font-medium">{evaluatorName || "Dr/a. Evaluador"}</p>
        </div>
      </div>

      {isSimple && (
        <div className="flex items-start gap-3 mb-8 p-4 rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5">
          <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            <strong>Evaluación simplificada:</strong> no incluye pliegues cutáneos, por lo que no se calculan grasa corporal, masa muscular ni somatotipo. Sigue siendo útil para comparar peso, IMC y perímetros con evaluaciones anteriores.
          </p>
        </div>
      )}

      <div className={cn("grid grid-cols-2 gap-6 mb-8", isSimple ? "md:grid-cols-3" : "md:grid-cols-5")}>
        <div className="p-4 bg-muted/50 rounded-lg text-center flex flex-col justify-center">
          <MetricLabel title="Peso Actual" tooltip="Peso total en el momento de la evaluación." />
          <div className="text-2xl font-bold">{current.weight} kg</div>
          <div className="flex justify-center mt-2">
            <DeltaIndicator current={current.weight} previous={previous?.weight || null} inverse={true} />
          </div>
        </div>
        {!isSimple && (
          <div className="p-4 bg-muted/50 rounded-lg text-center flex flex-col justify-center">
            <MetricLabel title="Masa Adiposa" tooltip="Peso del tejido graso. Niveles elevados aumentan riesgos de salud metabólica y cardiovascular." />
            <div className="text-2xl font-bold text-red-500">{current.bodyFatKg?.toFixed(1) || "-"} kg</div>
            <div className="text-xs font-medium text-red-600 mt-1">{current.bodyFatPct?.toFixed(1) || "-"}%</div>
            {bodyFatCat && <div className={`text-[11px] font-bold mt-1 bg-red-500/10 text-red-700 py-0.5 px-2 rounded-full mx-auto w-fit`}>{bodyFatCat.category}</div>}
            <div className="flex justify-center mt-2">
              <DeltaIndicator current={current.bodyFatKg} previous={previous?.bodyFatKg || null} inverse={true} />
            </div>
          </div>
        )}
        {!isSimple && (
          <div className="p-4 bg-muted/50 rounded-lg text-center flex flex-col justify-center">
            <MetricLabel title="Masa Muscular" tooltip="Peso del tejido muscular. Mayor masa aumenta el metabolismo basal, fuerza y salud general." />
            <div className="text-2xl font-bold text-blue-600">{current.muscleMassKg?.toFixed(1) || "-"} kg</div>
            <div className="text-xs font-medium text-blue-700 mt-1">{current.muscleMassKg ? ((current.muscleMassKg / current.weight) * 100).toFixed(1) : "-"}%</div>
            {muscleMassCat && <div className={`text-[11px] font-bold mt-1 bg-blue-500/10 text-blue-700 py-0.5 px-2 rounded-full mx-auto w-fit`}>{muscleMassCat.category}</div>}
            <div className="flex justify-center mt-2">
              <DeltaIndicator current={current.muscleMassKg} previous={previous?.muscleMassKg || null} inverse={false} />
            </div>
          </div>
        )}
        <div className="p-4 bg-muted/50 rounded-lg text-center flex flex-col justify-center">
          <MetricLabel title="Masa Ósea" tooltip="Peso estimado de tu esqueleto. Depende de genética y nutrición, sirve como indicador de densidad y robustez." />
          <div className="text-2xl font-bold text-slate-600">{current.boneMassKg?.toFixed(1) || "-"} kg</div>
          <div className="text-xs font-medium text-slate-500 mt-1">{current.boneMassKg ? ((current.boneMassKg / current.weight) * 100).toFixed(1) : "-"}%</div>
          {boneMassCat && <div className={`text-[11px] font-bold mt-1 bg-slate-500/10 text-slate-700 py-0.5 px-2 rounded-full mx-auto w-fit`}>{boneMassCat.category}</div>}
          <div className="flex justify-center mt-2">
            <DeltaIndicator current={current.boneMassKg} previous={previous?.boneMassKg || null} inverse={false} />
          </div>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg text-center flex flex-col justify-center">
          <MetricLabel title="Masa Residual" tooltip="Representa órganos, fluidos y tejidos restantes. Es un porcentaje matemáticamente constante según tu anatomía y sexo." />
          <div className="text-2xl font-bold text-teal-600">{current.residualMassKg?.toFixed(1) || "-"} kg</div>
          <div className="text-xs font-medium text-teal-700 mt-1">{current.residualMassKg ? ((current.residualMassKg / current.weight) * 100).toFixed(1) : "-"}%</div>
          {current.residualMassKg && <div className="text-[11px] font-bold mt-1 bg-teal-500/10 text-teal-700 py-0.5 px-2 rounded-full mx-auto w-fit">Constante Anatómica</div>}
          <div className="flex justify-center mt-2">
            <DeltaIndicator current={current.residualMassKg} previous={previous?.residualMassKg || null} inverse={false} />
          </div>
        </div>
      </div>

      {/* Advanced Metrics Grid */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Análisis Avanzado</h3>
        <div className={cn("grid grid-cols-2 gap-6", isSimple ? "md:grid-cols-3" : "md:grid-cols-5")}>
          <div className="p-4 bg-muted/30 border rounded-lg text-center flex flex-col justify-center">
            <MetricLabel title="IMC" tooltip="Índice de Masa Corporal. Relación estadística entre peso y estatura, útil como referencia médica general pero no discrimina tu nivel de músculo vs grasa." />
            <div className="text-xl font-bold">{current.bmi?.toFixed(1) || "-"}</div>
            {bmiCategory && (
              <div className={`text-xs font-medium mt-1 ${bmiCategory.color}`}>
                {bmiCategory.category}
              </div>
            )}
          </div>
          {!isSimple && (
            <div className="p-4 bg-muted/30 border rounded-lg text-center flex flex-col justify-center">
              <MetricLabel title="Sumatoria 6 Pliegues" tooltip="Suma total de los principales pliegues de grasa corporal (subcutánea). Excelente indicador directo de tu evolución de pérdida o ganancia de tejido adiposo puro." />
              <div className="text-xl font-bold">{sumOf6 ? `${sumOf6.toFixed(1)} mm` : "N/A"}</div>
              <div className="text-xs text-muted-foreground mt-1">Grasa subcutánea pura</div>
            </div>
          )}
          <div className="p-4 bg-muted/30 border rounded-lg text-center flex flex-col justify-center">
            <MetricLabel title="Índice Cintura-Cadera" tooltip="Indicador de distribución de grasa. Valores elevados indican acumulación central (abdominal), vinculada a mayor riesgo cardiovascular." />
            <div className="text-xl font-bold">{whr ? whr.toFixed(2) : "N/A"}</div>
            {whrRisk && (
              <div className={`text-xs font-medium mt-1 ${whrRisk.color}`}>
                Riesgo: {whrRisk.risk}
              </div>
            )}
          </div>
          <div className="p-4 bg-muted/30 border rounded-lg text-center flex flex-col justify-center">
            <MetricLabel title="Peso Ideal Sugerido" tooltip="Peso meta calculado en función de tu masa magra actual asumiendo que llegas a un porcentaje óptimo/fitness de grasa." />
            <div className="text-xl font-bold">{idealWeight ? `${idealWeight.toFixed(1)} kg` : "N/A"}</div>
            <div className="text-xs text-muted-foreground mt-1">Meta Fitness</div>
          </div>
          {!isSimple && (
            <div className="p-4 bg-muted/30 border rounded-lg text-center flex flex-col justify-center">
              <MetricLabel title="Somatotipo" tooltip="Clasifica tu biotipo: Endomorfo (tendencia acumular grasa), Mesomorfo (atlético, buena masa muscular) o Ectomorfo (delgado, estructura ligera)." />
              <div className="text-lg font-bold mt-1 leading-tight">{somatotype ? somatotype.classification : "N/A"}</div>
            </div>
          )}
        </div>
      </div>

      <GoalsEditor
        evaluationId={current.id}
        gender={patient.gender as "MALE" | "FEMALE" | "OTHER"}
        targetBodyFatPct={current.targetBodyFatPct}
        targetMuscleMassPct={current.targetMuscleMassPct}
        currentBodyFatPct={current.bodyFatPct}
        currentMuscleMassPct={current.muscleMassPct}
        readOnly={readOnly}
      />

      {/* Goal Projections Section */}
      {goalProjections && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Proyección de Metas</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Cantidades estimadas para alcanzar un estado físico {goalProjections.isCustom ? "personalizado" : "fitness"} ({current.targetBodyFatPct || (patient.gender === 'MALE' ? '15' : '22')}% grasa y {current.targetMuscleMassPct || (patient.gender === 'MALE' ? '45' : '35')}% músculo).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-muted/30 border rounded-lg flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground font-medium mb-1">Grasa a Perder</div>
                <div className="text-2xl font-bold text-red-600">
                  {goalProjections.fatToLose > 0 ? `- ${goalProjections.fatToLose} kg` : "En meta"}
                </div>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500/50" />
            </div>
            <div className="p-4 bg-muted/30 border rounded-lg flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground font-medium mb-1">Músculo a Ganar</div>
                <div className="text-2xl font-bold text-blue-600">
                  {goalProjections.muscleToGain > 0 ? `+ ${goalProjections.muscleToGain} kg` : "En meta"}
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500/50" />
            </div>
          </div>
        </div>
      )}

      {/* Body Composition Section */}
      <div className="mb-8">
        <BodyCompositionChart
          muscleMassKg={current.muscleMassKg}
          bodyFatKg={current.bodyFatKg}
          boneMassKg={current.boneMassKg}
          residualMassKg={current.residualMassKg}
          weight={current.weight}
        />
      </div>

      {/* Somatochart Section */}
      {somatotype && (
        <div className="mb-8 p-6 bg-card text-card-foreground border rounded-xl shadow-sm print:shadow-none print:border-none print:p-0">
          <h3 className="text-lg font-semibold mb-2">Somatocarta</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Representación visual de tu composición corporal actual{previousSomatotype ? " y la dirección de tu evolución." : "."}
          </p>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-2/3 border rounded-lg bg-muted/30">
              <SomatoChart
                currentEndo={somatotype.endomorphy}
                currentMeso={somatotype.mesomorphy}
                currentEcto={somatotype.ectomorphy}
                previousEndo={previousSomatotype?.endomorphy}
                previousMeso={previousSomatotype?.mesomorphy}
                previousEcto={previousSomatotype?.ectomorphy}
              />
            </div>
            <div className="w-full md:w-1/3 space-y-4">
              <div className="bg-primary/5 border border-primary/10 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-sky-600"></div>
                  <h4 className="font-semibold text-foreground">Punto Actual</h4>
                </div>
                <p className="text-sm text-muted-foreground font-medium">{somatotype.classification}</p>
              </div>

              {previousSomatotype && (
                <>
                  <div className="bg-muted/10 border border-border p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                      <h4 className="font-semibold text-foreground">Evaluación Anterior</h4>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">{previousSomatotype.classification}</p>
                  </div>

                  <div className="text-sm text-muted-foreground mt-4 p-3 bg-muted/30 rounded-lg">
                    La <strong>flecha azul</strong> indica la trayectoria de tu progreso entre ambas mediciones.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Evaluation Comparison */}
      {historyForComparisonSafe.length > 0 && (
        <EvaluationComparison
          currentEvaluation={current}
          history={historyForComparisonSafe}
          historyEvaluations={historyEvaluationsFull}
        />
      )}

      <RecommendationEditor evaluationId={current.id} initialData={current.recommendation} readOnly={readOnly} />

      <PhotosEditor
        evaluationId={current.id}
        photos={current.photos ?? []}
        readOnly={readOnly}
      />

      {/* CSS for printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:p-0 { padding: 0 !important; }
        }
      `}} />
    </div>
  )
}
