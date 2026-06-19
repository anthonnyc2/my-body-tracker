"use client"

import { useTheme } from "next-themes"
import { Moon, Sun, Monitor, User, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { logoutAction } from "@/actions/auth"

export default function SettingsPage() {
  const { setTheme, theme } = useTheme()

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
              variant={theme === 'light' ? 'default' : 'outline'} 
              className="gap-2 w-full sm:w-auto"
              onClick={() => setTheme('light')}
            >
              <Sun className="h-4 w-4" />
              Claro
            </Button>
            <Button 
              variant={theme === 'dark' ? 'default' : 'outline'} 
              className="gap-2 w-full sm:w-auto"
              onClick={() => setTheme('dark')}
            >
              <Moon className="h-4 w-4" />
              Oscuro
            </Button>
            <Button 
              variant={theme === 'system' ? 'default' : 'outline'} 
              className="gap-2 w-full sm:w-auto"
              onClick={() => setTheme('system')}
            >
              <Monitor className="h-4 w-4" />
              Sistema
            </Button>
          </div>
        </div>

        {/* Account Details (Placeholder) */}
        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Perfil del Evaluador</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Opciones para actualizar tu información personal y contraseña.
          </p>
          
          <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center">
            <p className="text-muted-foreground font-medium">
              Gestión de perfil en desarrollo. Pronto podrás editar tus datos aquí.
            </p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 backdrop-blur-sm p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-destructive mb-2">Zona de Peligro</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Acciones sensibles de la cuenta.
          </p>
          
          <form action={logoutAction}>
            <Button variant="destructive" className="gap-2">
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </form>
        </div>

      </div>
    </div>
  )
}
