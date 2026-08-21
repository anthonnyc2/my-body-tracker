"use client"

import { useTheme } from "next-themes"
import { useQuery } from "@tanstack/react-query"
import { Moon, Sun, Monitor, User, LogOut, KeyRound, CreditCard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { logoutAction } from "@/actions/auth"
import { getProfile } from "@/actions/profile"
import { getEvaluationUsage } from "@/actions/subscription"
import { ProfileForm } from "@/components/forms/ProfileForm"
import { PasswordForm } from "@/components/forms/PasswordForm"

export default function SettingsPage() {
  const { setTheme, theme } = useTheme()

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfile(),
  })

  const { data: usage } = useQuery({
    queryKey: ["evaluationUsage"],
    queryFn: () => getEvaluationUsage(),
  })

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Administra tus preferencias y los ajustes de tu cuenta.
        </p>
      </div>

      <div className="grid gap-6">
        
        {/* Appearance Settings */}
        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Apariencia</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Personaliza cómo se ve la interfaz en tu dispositivo.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button
              suppressHydrationWarning
              variant={theme === 'light' ? 'default' : 'outline'}
              className="gap-2 w-full sm:w-auto"
              onClick={() => setTheme('light')}
            >
              <Sun className="h-4 w-4" />
              Claro
            </Button>
            <Button
              suppressHydrationWarning
              variant={theme === 'dark' ? 'default' : 'outline'}
              className="gap-2 w-full sm:w-auto"
              onClick={() => setTheme('dark')}
            >
              <Moon className="h-4 w-4" />
              Oscuro
            </Button>
            <Button
              suppressHydrationWarning
              variant={theme === 'system' ? 'default' : 'outline'}
              className="gap-2 w-full sm:w-auto"
              onClick={() => setTheme('system')}
            >
              <Monitor className="h-4 w-4" />
              Sistema
            </Button>
          </div>
        </div>

        {/* Account Details */}
        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Perfil del Evaluador</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Actualiza tu información personal.
          </p>

          {isProfileLoading || !profile ? (
            <p className="text-sm text-muted-foreground">Cargando perfil...</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">{profile.email}</p>
              <ProfileForm initialData={{ firstName: profile.firstName, lastName: profile.lastName }} />
            </>
          )}
        </div>

        {/* Password */}
        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <KeyRound className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Contraseña</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Cambia la contraseña de acceso a tu cuenta.
          </p>
          <PasswordForm />
        </div>

        {/* Subscription */}
        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Suscripción</h2>
          </div>
          {usage && (
            <p className="text-sm text-muted-foreground">
              Plan actual:{" "}
              <span className="font-medium text-foreground">
                {usage.plan === "PRO" ? "Pro" : "Gratuito"}
              </span>
              {usage.limit !== null && ` · ${usage.used}/${usage.limit} evaluaciones usadas`}
            </p>
          )}
          {/* TODO: build out full subscription management (billing cycle, renewal date,
              upgrade/cancel, invoices) once payment processing is wired up. */}
        </div>

        {/* Session */}
        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 shadow-sm">
          <form action={logoutAction}>
            <Button variant="outline" className="gap-2">
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </form>
        </div>

      </div>
    </div>
  )
}
