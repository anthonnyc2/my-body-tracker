"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Check, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getEvaluationUsage } from "@/actions/subscription"
import { getProfile } from "@/actions/profile"

const UPGRADE_CONTACT_WHATSAPP_PHONE = "59178436728"

const FREE_FEATURES = [
  "Hasta 10 evaluaciones registradas",
  "Gestión de pacientes",
  "Reportes en PDF y enlaces para compartir",
]

const PRO_FEATURES = [
  "Evaluaciones ilimitadas",
  "Todo lo incluido en el plan gratuito",
  "Soporte prioritario",
]

export default function UpgradePage() {
  const { data: usage } = useQuery({
    queryKey: ["evaluationUsage"],
    queryFn: () => getEvaluationUsage(),
  })

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfile(),
  })

  const whatsappMessage = profile?.email
    ? `Hola, quiero actualizar mi cuenta de Body Tracker al plan Pro. Mi correo registrado es: ${profile.email}`
    : "Hola, quiero actualizar mi cuenta de Body Tracker al plan Pro."

  const whatsappHref = `https://api.whatsapp.com/send?phone=${UPGRADE_CONTACT_WHATSAPP_PHONE}&text=${encodeURIComponent(whatsappMessage)}`

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Actualiza tu plan</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Sigue registrando evaluaciones sin límites con el plan Pro.
          </p>
        </div>
      </div>

      {usage?.limit !== null && usage !== undefined && (
        <p className="text-sm text-muted-foreground">
          Has usado <span className="font-medium text-foreground">{usage.used}/{usage.limit}</span> evaluaciones
          incluidas en tu plan gratuito.
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Free plan */}
        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 shadow-sm flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold">Gratuito</h2>
            <p className="text-sm text-muted-foreground mt-1">Tu plan actual</p>
          </div>
          <ul className="flex flex-col gap-2 text-sm">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-muted-foreground shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro plan */}
        <div className="rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur-sm p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Pro</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Facturación mensual o anual. Escríbenos para conocer precios y activar tu plan.
          </p>
          <ul className="flex flex-col gap-2 text-sm">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-2">
            <Button className="w-full">Contáctanos por WhatsApp</Button>
          </a>
        </div>
      </div>
    </div>
  )
}
