import { Activity, Users, FileText, TrendingUp, Plus } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const firstName = user?.user_metadata?.first_name || "Evaluador"

  if (!user) {
    return null
  }

  const evaluatorId = user.id
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalPatients,
    newPatientsThisWeek,
    totalEvaluations,
    evaluationsThisMonth,
    reportsGenerated,
    successCasesResult,
    recentEvaluations,
  ] = await Promise.all([
    prisma.patient.count({ where: { evaluatorId } }),
    prisma.patient.count({ where: { evaluatorId, createdAt: { gte: weekAgo } } }),
    prisma.evaluation.count({ where: { patient: { evaluatorId } } }),
    prisma.evaluation.count({ where: { patient: { evaluatorId }, createdAt: { gte: monthAgo } } }),
    prisma.evaluation.count({ where: { patient: { evaluatorId }, recommendation: { isNot: null } } }),
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT count(*) as count
      FROM "Evaluation" e
      JOIN "Patient" p ON p.id = e."patientId"
      WHERE p."evaluatorId" = ${evaluatorId}
      AND (
        (e."targetBodyFatPct" IS NOT NULL AND e."bodyFatPct" IS NOT NULL AND e."bodyFatPct" <= e."targetBodyFatPct")
        OR
        (e."targetMuscleMassPct" IS NOT NULL AND e."muscleMassPct" IS NOT NULL AND e."muscleMassPct" >= e."targetMuscleMassPct")
      )
    `,
    prisma.evaluation.findMany({
      where: { patient: { evaluatorId } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        createdAt: true,
        patient: { select: { firstName: true, lastName: true } },
      },
    }),
  ])

  const successCases = Number(successCasesResult[0]?.count ?? 0)

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Bienvenido, <span className="text-primary">{firstName}</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Monitorea el progreso y la evolución de tus pacientes.
          </p>
        </div>
        
        <Link 
          href="/dashboard/patients"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-[1.02] transition-all"
        >
          <Plus className="mr-2 h-5 w-5" />
          Registrar Paciente
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Pacientes Activos"
          value={String(totalPatients)}
          icon={<Users className="h-5 w-5 text-primary" />}
          trend={`+${newPatientsThisWeek} esta semana`}
        />
        <KPICard
          title="Evaluaciones Totales"
          value={String(totalEvaluations)}
          icon={<Activity className="h-5 w-5 text-primary" />}
          trend={`+${evaluationsThisMonth} este mes`}
        />
        <KPICard
          title="Reportes Generados"
          value={String(reportsGenerated)}
          icon={<FileText className="h-5 w-5 text-primary" />}
          trend="Con recomendaciones"
        />
        <KPICard
          title="Casos de Éxito"
          value={String(successCases)}
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          trend="Metas alcanzadas"
        />
      </div>

      {/* Content Section */}
      <div className="grid gap-6">
        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 shadow-sm">
          <h3 className="font-semibold text-xl mb-4">Actividad Reciente</h3>
          <div className="space-y-4">
            {recentEvaluations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay evaluaciones registradas.</p>
            ) : (
              recentEvaluations.map((evaluation) => (
                <ActivityRow
                  key={evaluation.id}
                  patient={`${evaluation.patient.firstName} ${evaluation.patient.lastName}`}
                  action="Nueva evaluación registrada"
                  time={formatDistanceToNow(evaluation.createdAt, { addSuffix: true, locale: es })}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function KPICard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <p className="tracking-tight text-sm font-medium text-muted-foreground">{title}</p>
        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <div className="text-4xl font-extrabold tracking-tighter">{value}</div>
        <p className="text-xs text-muted-foreground mt-2 font-medium">{trend}</p>
      </div>
    </div>
  )
}

function ActivityRow({ patient, action, time }: { patient: string, action: string, time: string }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-muted/40 cursor-pointer">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
        {patient.charAt(0)}
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold leading-none">{patient}</p>
        <p className="text-xs text-muted-foreground">{action}</p>
      </div>
      <div className="text-xs text-muted-foreground font-medium">
        {time}
      </div>
    </div>
  )
}
