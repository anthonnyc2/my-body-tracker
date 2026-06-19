import Image from "next/image"
import Link from "next/link"
import { LoginForm } from "@/components/forms/LoginForm"
import { Activity } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Left Column: Form */}
      <div className="flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative z-10">
        <div className="w-full max-w-[400px] flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">BodyTracker</span>
          </div>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Bienvenido de vuelta</h1>
            <p className="text-muted-foreground">
              Ingresa tus credenciales para acceder a tu panel de evaluaciones.
            </p>
          </div>

          <LoginForm />
          
          <div className="text-center text-sm text-muted-foreground mt-4 relative z-50">
            ¿No tienes cuenta?{" "}
            <a href="/register" className="font-semibold text-foreground underline-offset-4 hover:underline transition-all">
              Regístrate ahora
            </a>
          </div>
        </div>
      </div>

      {/* Right Column: Hero Graphic */}
      <div className="hidden lg:flex relative flex-col justify-between overflow-hidden bg-zinc-950 p-12 text-zinc-50 border-l border-zinc-800">
        <div className="absolute inset-0 w-full h-full">
          <Image 
            src="/login-bg.png" 
            alt="Abstract 3D Background" 
            fill
            className="object-cover opacity-80"
            priority
          />
          {/* Gradient Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        </div>
        
        {/* Top subtle text */}
        <div className="relative z-20 flex items-center gap-2 text-sm font-medium tracking-widest uppercase text-zinc-400">
          <span className="w-8 h-px bg-zinc-600"></span>
          Plataforma Profesional
        </div>
        
        {/* Bottom Text content */}
        <div className="relative z-20 max-w-lg mb-12">
          <h2 className="text-4xl font-bold tracking-tighter mb-4 text-white drop-shadow-sm">
            Evolución basada en datos, no en suposiciones.
          </h2>
          <p className="text-lg text-zinc-300 leading-relaxed font-light">
            Gestiona la composición corporal de tus pacientes con precisión clínica. Múltiples fórmulas antropométricas, gráficos interactivos y reportes automáticos en un solo lugar.
          </p>
        </div>
      </div>
    </div>
  )
}
