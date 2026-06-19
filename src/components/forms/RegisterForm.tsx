"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signupAction } from "@/actions/auth"

const registerSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Debe ser un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

type RegisterValues = z.infer<typeof registerSchema>

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterValues) {
    setError(null)
    const formData = new FormData()
    formData.append("firstName", data.firstName)
    formData.append("lastName", data.lastName)
    formData.append("email", data.email)
    formData.append("password", data.password)
    
    const res = await signupAction(formData)
    if (res?.error) {
      setError(res.error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`flex flex-col gap-6 w-full ${className}`} {...props}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5 relative group">
          <Label htmlFor="firstName" className="text-muted-foreground font-medium text-xs uppercase tracking-wider">
            Nombre
          </Label>
          <Input
            id="firstName"
            placeholder="Juan"
            required
            className="h-12 bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary/40 focus-visible:border-primary transition-all duration-300"
            {...register("firstName")}
          />
          {errors.firstName && (
            <span className="text-xs text-destructive font-medium absolute -bottom-5 left-0">{errors.firstName.message}</span>
          )}
        </div>
        <div className="space-y-1.5 relative group">
          <Label htmlFor="lastName" className="text-muted-foreground font-medium text-xs uppercase tracking-wider">
            Apellido
          </Label>
          <Input
            id="lastName"
            placeholder="Pérez"
            required
            className="h-12 bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary/40 focus-visible:border-primary transition-all duration-300"
            {...register("lastName")}
          />
          {errors.lastName && (
            <span className="text-xs text-destructive font-medium absolute -bottom-5 left-0">{errors.lastName.message}</span>
          )}
        </div>
      </div>

      <div className="space-y-1.5 relative group mt-1">
        <Label htmlFor="email" className="text-muted-foreground font-medium text-xs uppercase tracking-wider">
          Dirección de Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="nombre@ejemplo.com"
          required
          className="h-12 bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary/40 focus-visible:border-primary transition-all duration-300"
          {...register("email")}
        />
        {errors.email && (
          <span className="text-xs text-destructive font-medium absolute -bottom-5 left-0">{errors.email.message}</span>
        )}
      </div>

      <div className="space-y-1.5 relative group mt-1">
        <Label htmlFor="password" className="text-muted-foreground font-medium text-xs uppercase tracking-wider">
          Contraseña Segura
        </Label>
        <Input 
          id="password" 
          type="password"
          placeholder="••••••••"
          required 
          className="h-12 bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary/40 focus-visible:border-primary transition-all duration-300"
          {...register("password")}
        />
        {errors.password && (
          <span className="text-xs text-destructive font-medium absolute -bottom-5 left-0">{errors.password.message}</span>
        )}
      </div>
      
      {error && (
        <div className="mt-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 animate-in fade-in zoom-in duration-300">
          {error}
        </div>
      )}

      <Button 
        type="submit" 
        className="h-12 w-full mt-4 group relative overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/25" 
        disabled={isSubmitting}
      >
        <span className="relative z-10 flex items-center font-semibold text-base">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            <>
              Registrarse
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </span>
      </Button>
    </form>
  )
}
