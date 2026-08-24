import { notFound } from "next/navigation"
import { EvaluationReport } from "@/components/EvaluationReport"
import { BackButton } from "@/components/shared/BackButton"

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
        include: {
          evaluator: true,
          evaluations: { orderBy: { date: "desc" } },
        },
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

  const siblingEvaluations = patient.evaluations.filter((e) => e.id !== evaluation.id)
  const previous = siblingEvaluations.find((e) => e.date < evaluation.date) ?? null

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <BackButton />
          <div className="text-xs text-muted-foreground uppercase tracking-widest">
            Reporte de Evaluación
          </div>
        </div>

        <EvaluationReport
          current={evaluation}
          previous={previous}
          patient={patient}
          historyEvaluationsFull={siblingEvaluations}
          evaluatorName={evaluatorName}
          readOnly
        />

        <p className="text-center text-xs text-muted-foreground mt-8">
          Generado con Body Tracker
        </p>
      </div>
    </div>
  )
}
