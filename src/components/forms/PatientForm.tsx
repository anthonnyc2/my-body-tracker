"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, CalendarIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { PatientFormValues, patientSchema } from "@/types/patient"
import { createPatient, updatePatient } from "@/actions/patient"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface PatientFormProps {
  initialData?: Partial<PatientFormValues> & { birthDate?: Date | string }
  patientId?: string
}

export function PatientForm({ initialData, patientId }: PatientFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const parseUTCDate = (dateVal: Date | string | undefined) => {
    if (!dateVal) return undefined
    const d = new Date(dateVal)
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      gender: initialData?.gender || "MALE",
      birthDate: parseUTCDate(initialData?.birthDate),
      documentId: initialData?.documentId || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      address: initialData?.address || "",
      initialWeight: initialData?.initialWeight || undefined,
      height: initialData?.height || undefined,
      activityLevel: initialData?.activityLevel || "SEDENTARY",
      goal: initialData?.goal || "FAT_LOSS",
    }
  })

  const birthDateValue = watch("birthDate")

  async function onSubmit(data: PatientFormValues) {
    setIsSubmitting(true)
    let result
    
    if (patientId) {
      result = await updatePatient(patientId, data)
    } else {
      result = await createPatient(data)
    }
    
    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(patientId ? "Paciente actualizado" : "Paciente registrado correctamente")
      router.push(`/dashboard/patients/${result.patientId}`)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        
        <div className="space-y-2">
          <Label htmlFor="gender">Género</Label>
          <Select defaultValue={initialData?.gender || "MALE"} onValueChange={(val) => setValue("gender", val as PatientFormValues["gender"])}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Masculino</SelectItem>
              <SelectItem value="FEMALE">Femenino</SelectItem>
              <SelectItem value="OTHER">Otro</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && <span className="text-xs text-destructive">{errors.gender.message}</span>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
          <Popover>
            <PopoverTrigger render={
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !birthDateValue && "text-muted-foreground"
                )}
              />
            }>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {birthDateValue ? format(birthDateValue, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={birthDateValue}
                onSelect={(d) => d && setValue("birthDate", d, { shouldValidate: true })}
                locale={es}
                defaultMonth={birthDateValue || new Date(new Date().getFullYear() - 25, 0)}
                captionLayout="dropdown"
                fromYear={1920}
                toYear={new Date().getFullYear()}
              />
            </PopoverContent>
          </Popover>
          {errors.birthDate && <span className="text-xs text-destructive">{errors.birthDate.message}</span>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="documentId">Documento de Identidad (Opcional)</Label>
          <Input id="documentId" {...register("documentId")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono (Opcional)</Label>
          <Input id="phone" {...register("phone")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (Opcional)</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Dirección (Opcional)</Label>
          <Input id="address" {...register("address")} />
        </div>
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium mb-4">Datos Físicos Base</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="initialWeight">Peso Inicial (kg)</Label>
            <Input id="initialWeight" type="number" step="0.1" {...register("initialWeight")} />
            {errors.initialWeight && <span className="text-xs text-destructive">{errors.initialWeight.message}</span>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Altura (cm)</Label>
            <Input id="height" type="number" {...register("height")} />
            {errors.height && <span className="text-xs text-destructive">{errors.height.message}</span>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="activityLevel">Nivel de Actividad</Label>
            <Select defaultValue={initialData?.activityLevel || "SEDENTARY"} onValueChange={(val) => setValue("activityLevel", val as PatientFormValues["activityLevel"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SEDENTARY">Sedentario</SelectItem>
                <SelectItem value="LIGHT">Ligero</SelectItem>
                <SelectItem value="MODERATE">Moderado</SelectItem>
                <SelectItem value="ACTIVE">Activo</SelectItem>
                <SelectItem value="VERY_ACTIVE">Muy Activo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal">Objetivo Principal</Label>
            <Select defaultValue={initialData?.goal || "FAT_LOSS"} onValueChange={(val) => setValue("goal", val as PatientFormValues["goal"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FAT_LOSS">Pérdida de grasa</SelectItem>
                <SelectItem value="MUSCLE_GAIN">Ganancia muscular</SelectItem>
                <SelectItem value="BODY_RECOMPOSITION">Recomposición corporal</SelectItem>
                <SelectItem value="SPORTS_PERFORMANCE">Rendimiento deportivo</SelectItem>
                <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {patientId ? "Guardar Cambios" : "Registrar Paciente"}
        </Button>
      </div>
    </form>
  )
}
