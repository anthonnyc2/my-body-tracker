"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordFormValues, passwordSchema } from "@/types/profile"
import { updatePassword } from "@/actions/profile"

export function PasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", password: "", confirmPassword: "" },
  })

  async function onSubmit(data: PasswordFormValues) {
    const result = await updatePassword(data)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Contraseña actualizada")
      reset()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="currentPassword">Contraseña Actual</Label>
        <Input id="currentPassword" type="password" {...register("currentPassword")} />
        {errors.currentPassword && <span className="text-xs text-destructive">{errors.currentPassword.message}</span>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Nueva Contraseña</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
        <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
        {errors.confirmPassword && <span className="text-xs text-destructive">{errors.confirmPassword.message}</span>}
      </div>
      <div className="sm:col-span-2 flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Actualizar Contraseña
        </Button>
      </div>
    </form>
  )
}
