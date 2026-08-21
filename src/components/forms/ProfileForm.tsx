"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProfileFormValues, profileSchema } from "@/types/profile"
import { updateProfile } from "@/actions/profile"

interface ProfileFormProps {
  initialData: { firstName: string; lastName: string }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData,
  })

  useEffect(() => {
    reset(initialData)
  }, [initialData, reset])

  async function onSubmit(data: ProfileFormValues) {
    const result = await updateProfile(data)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Perfil actualizado")
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="firstName">Nombres</Label>
        <Input id="firstName" {...register("firstName")} />
        {errors.firstName && <span className="text-xs text-destructive">{errors.firstName.message}</span>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Apellidos</Label>
        <Input id="lastName" {...register("lastName")} />
        {errors.lastName && <span className="text-xs text-destructive">{errors.lastName.message}</span>}
      </div>
      <div className="sm:col-span-2 flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar Cambios
        </Button>
      </div>
    </form>
  )
}
