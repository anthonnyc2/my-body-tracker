import { notFound } from "next/navigation"

import { RoutineDaysAccordion } from "@/components/RoutineDaysAccordion"

interface Props {
  params: Promise<{ token: string }>
}

export default async function ShareRoutinePage({ params }: Props) {
  const { token } = await params
  const { prisma } = await import("@/lib/prisma")

  const routine = await prisma.routine.findUnique({
    where: { shareToken: token },
    include: {
      patient: { select: { firstName: true, lastName: true } },
      evaluator: { select: { firstName: true, lastName: true } },
      days: {
        orderBy: { order: "asc" },
        include: {
          exercises: {
            orderBy: { order: "asc" },
            include: { exercise: true },
          },
        },
      },
    },
  })

  if (!routine) notFound()

  // Increment view count (fire-and-forget, don't block render)
  prisma.routine.update({
    where: { shareToken: token },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {})

  const evaluatorName = `${routine.evaluator.firstName} ${routine.evaluator.lastName}`

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
            Rutina de Ejercicios
          </div>
          <h1 className="text-2xl font-bold">{routine.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {routine.patient.firstName} {routine.patient.lastName} • Evaluador: {evaluatorName}
          </p>
          {routine.description && (
            <p className="text-sm text-muted-foreground mt-3">{routine.description}</p>
          )}
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
          <RoutineDaysAccordion days={routine.days} />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Generado con Body Tracker
        </p>
      </div>
    </div>
  )
}
