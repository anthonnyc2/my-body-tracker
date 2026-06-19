import { Activity, Users, FileText, TrendingUp, Plus } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const firstName = user?.user_metadata?.first_name || "Evaluador"

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Bienvenido, {firstName}
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
          value="12" 
          icon={<Users className="h-5 w-5 text-primary" />} 
          trend="+2 esta semana"
        />
        <KPICard 
          title="Evaluaciones Totales" 
          value="48" 
          icon={<Activity className="h-5 w-5 text-secondary" />} 
          trend="+5 este mes"
        />
        <KPICard 
          title="Reportes Generados" 
          value="36" 
          icon={<FileText className="h-5 w-5 text-primary" />} 
          trend="PDFs descargados"
        />
        <KPICard 
          title="Casos de Éxito" 
          value="8" 
          icon={<TrendingUp className="h-5 w-5 text-secondary" />} 
          trend="Metas alcanzadas"
        />
      </div>

      {/* Content Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 shadow-sm">
          <h3 className="font-semibold text-xl mb-4">Evolución Promedio</h3>
          <div className="h-[300px] w-full rounded-xl bg-muted/20 border border-dashed border-border/50 flex items-center justify-center text-muted-foreground">
            Gráfico de tendencia general aquí
          </div>
        </div>
        
        <div className="col-span-3 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 shadow-sm">
          <h3 className="font-semibold text-xl mb-4">Actividad Reciente</h3>
          <div className="space-y-4">
            <ActivityRow patient="Carlos Ruiz" action="Evaluación inicial" time="Hace 2 horas" />
            <ActivityRow patient="María Pérez" action="Actualización de medidas" time="Ayer" />
            <ActivityRow patient="Luis Gómez" action="Nuevo reporte PDF" time="Ayer" />
          </div>
        </div>
      </div>
    </div>
  )
}

function KPICard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
      <div className="absolute -right-4 -top-4 opacity-10 blur-xl scale-150 transition-transform group-hover:scale-200">
        {icon}
      </div>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="p-2 bg-background/80 rounded-lg shadow-sm border border-border/40">
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
