"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Path, FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Info } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { EvaluationFormValues, EvaluationFormInput, evaluationSchema } from "@/types/evaluation"
import { createEvaluation, updateEvaluation } from "@/actions/evaluation"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function EvaluationForm({ 
  patientId, 
  evaluationId,
  initialWeight, 
  initialHeight,
  initialBreadths,
  initialData // For edit mode
}: { 
  patientId: string, 
  evaluationId?: string,
  initialWeight: number, 
  initialHeight: number,
  initialBreadths?: {
    breadthHumerus?: number | null
    breadthFemur?: number | null
    breadthBistyl?: number | null
    breadthBimal?: number | null
  },
  initialData?: Partial<EvaluationFormValues>
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basico")
  
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
  } = useForm<EvaluationFormInput, unknown, EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: initialData ? {
      ...initialData,
      date: initialData.date ? parseUTCDate(initialData.date) : new Date(),
      patientId
    } : {
      patientId,
      date: new Date(),
      weight: initialWeight,
      height: initialHeight,
      breadthHumerus: initialBreadths?.breadthHumerus || undefined,
      breadthFemur: initialBreadths?.breadthFemur || undefined,
      breadthBistyl: initialBreadths?.breadthBistyl || undefined,
      breadthBimal: initialBreadths?.breadthBimal || undefined,
    }
  })

  const dateValue = watch("date")

  // Helper for rendering girth fields with hover cards
  const renderMeasurement = (name: keyof EvaluationFormInput, label: string, desc: string, imgPath: string, required?: boolean) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <HoverCard>
          <HoverCardTrigger>
            <Info className="h-4 w-4 text-muted-foreground hover:text-primary cursor-help transition-colors" />
          </HoverCardTrigger>
          <HoverCardContent className="w-[320px] p-4 shadow-xl border-muted bg-card z-50">
            <div className="flex flex-col gap-3">
              <Image src={imgPath} alt={label} width={300} height={300} className="rounded-md object-contain bg-slate-50 w-full h-auto border" />
              <p className="text-sm text-foreground font-medium leading-relaxed">{desc}</p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
      <Input type="number" step="0.1" min="0" {...register(name as Path<EvaluationFormInput>)} />
      {errors[name] && <span className="text-xs text-destructive">{errors[name]?.message as string}</span>}
    </div>
  )

  const onSubmit = async (data: EvaluationFormValues) => {
    setIsSubmitting(true)
    const result = evaluationId 
      ? await updateEvaluation(evaluationId, data)
      : await createEvaluation(data)
    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(evaluationId ? "Evaluación actualizada exitosamente" : "Evaluación guardada y calculada exitosamente")
      router.push(`/dashboard/evaluations/${result.evaluationId}`)
    }
  }

  const handleNext = (nextTab: string) => {
    setActiveTab(nextTab)
  }

  const onError = (errors: FieldErrors<EvaluationFormInput>) => {
    toast.error("Por favor revisa los campos marcados en rojo")
    if (errors.weight || errors.height || errors.date) {
      setActiveTab("basico")
    } else if (
      errors.girthThorax || errors.girthAbdomen || errors.girthWaist || errors.girthHip || 
      errors.girthRelaxedArm || errors.girthFlexedArm || errors.girthForearm || errors.girthWrist || 
      errors.girthThigh || errors.girthMaxThigh || errors.girthCalf
    ) {
      setActiveTab("perimetros")
    } else if (errors.breadthHumerus || errors.breadthFemur || errors.breadthBistyl || errors.breadthBimal) {
      setActiveTab("diametros")
    } else if (
      errors.skinfoldTriceps || errors.skinfoldSubscap || errors.skinfoldBiceps || errors.skinfoldIliac || 
      errors.skinfoldSuprasp || errors.skinfoldAbdom || errors.skinfoldThigh || errors.skinfoldCalf
    ) {
      setActiveTab("pliegues")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6 max-w-4xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basico">Básico</TabsTrigger>
          <TabsTrigger value="perimetros">Perímetros</TabsTrigger>
          <TabsTrigger value="diametros">Diámetros</TabsTrigger>
          <TabsTrigger value="pliegues">Pliegues</TabsTrigger>
        </TabsList>
        
        {/* BASICO */}
        <TabsContent value="basico" className="p-4 border rounded-md mt-4 space-y-4 bg-card text-card-foreground shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Fecha de Evaluación</Label>
              <Popover>
                <PopoverTrigger render={
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateValue && "text-muted-foreground"
                    )}
                  />
                }>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateValue ? format(dateValue, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateValue}
                    onSelect={(d) => d && setValue("date", d, { shouldValidate: true })}
                    locale={es}
                    defaultMonth={dateValue || new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Peso (kg) <span className="text-destructive">*</span></Label>
              <Input type="number" step="0.1" min="0" {...register("weight")} />
              {errors.weight && <span className="text-xs text-destructive">{errors.weight.message}</span>}
            </div>
            <div className="space-y-2">
              <Label>Talla / Altura (cm) <span className="text-destructive">*</span></Label>
              <Input type="number" step="0.1" min="0" {...register("height")} />
              {errors.height && <span className="text-xs text-destructive">{errors.height.message}</span>}
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="button" onClick={() => handleNext("perimetros")}>Siguiente: Perímetros</Button>
          </div>
        </TabsContent>

        {/* PERIMETROS */}
        <TabsContent value="perimetros" className="p-4 border rounded-md mt-4 space-y-4 bg-card text-card-foreground shadow-sm">
          <Accordion defaultValue={["tronco"]} className="w-full">
            <AccordionItem value="tronco" className="border-b-0 mb-2 border rounded-lg px-4 bg-muted/30">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">Tronco</AccordionTrigger>
              <AccordionContent className="pt-2 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-1">
                  {renderMeasurement("girthThorax", "Tórax (cm)", "Medir en el plano horizontal a nivel de la marca mesoesternal. Lectura al final de una espiración normal.", "/images/anatomy/trunk.png")}
                  {renderMeasurement("girthAbdomen", "Abdomen (cm)", "Medir en el plano horizontal al nivel de la mayor protuberancia anterior del abdomen, usualmente a nivel del ombligo.", "/images/anatomy/trunk.png")}
                  {renderMeasurement("girthWaist", "Cintura (cm)", "Medir en el punto más estrecho entre el borde costal inferior y la cresta ilíaca.", "/images/anatomy/trunk.png")}
                  {renderMeasurement("girthHip", "Cadera (cm)", "Medir en el plano horizontal en el nivel de la máxima protuberancia posterior de los glúteos.", "/images/anatomy/trunk.png")}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="superior" className="border-b-0 mb-2 border rounded-lg px-4 bg-muted/30">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">Miembro Superior</AccordionTrigger>
              <AccordionContent className="pt-2 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-1">
                  {renderMeasurement("girthRelaxedArm", "Brazo Relajado (cm)", "Medir en la marca del pliegue del tríceps, perpendicular al eje longitudinal del brazo.", "/images/anatomy/arm.png", true)}
                  {renderMeasurement("girthFlexedArm", "Brazo Flexionado (cm)", "Medir en la máxima circunferencia del brazo cuando el sujeto flexiona el bíceps con el hombro a 90 grados.", "/images/anatomy/arm.png")}
                  {renderMeasurement("girthForearm", "Antebrazo (cm)", "Medir en la circunferencia máxima del antebrazo distal al pliegue del codo.", "/images/anatomy/arm.png")}
                  {renderMeasurement("girthWrist", "Muñeca (cm)", "Medir la circunferencia mínima de la muñeca perpendicular al eje largo del antebrazo, distal a las apófisis estiloides.", "/images/anatomy/arm.png")}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="inferior" className="border-b-0 border rounded-lg px-4 bg-muted/30">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">Miembro Inferior</AccordionTrigger>
              <AccordionContent className="pt-2 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-1">
                  {renderMeasurement("girthThigh", "Muslo Medio (cm)", "Medir perpendicularmente al eje largo del fémur, en el punto medio entre el pliegue inguinal y el borde superior de la patela.", "/images/anatomy/leg.png", true)}
                  {renderMeasurement("girthMaxThigh", "Muslo Máximo (cm)", "Medir la máxima circunferencia del muslo, justo debajo del pliegue glúteo.", "/images/anatomy/leg.png")}
                  {renderMeasurement("girthCalf", "Pantorrilla (cm)", "Medir la circunferencia máxima de la pantorrilla en un plano horizontal a la marca respectiva.", "/images/anatomy/leg.png", true)}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="flex justify-between pt-4 mt-2">
            <Button type="button" variant="outline" onClick={() => handleNext("basico")}>Atrás</Button>
            <Button type="button" onClick={() => handleNext("diametros")}>Siguiente: Diámetros</Button>
          </div>
        </TabsContent>

        {/* DIAMETROS */}
        <TabsContent value="diametros" className="p-4 border rounded-md mt-4 space-y-4 bg-card text-card-foreground shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><Label>Humeral (cm)</Label><Input type="number" step="0.1" min="0" {...register("breadthHumerus")} />{errors.breadthHumerus && <span className="text-xs text-destructive">{errors.breadthHumerus.message}</span>}</div>
            <div className="space-y-2"><Label>Femoral (cm) <span className="text-destructive">*</span></Label><Input type="number" step="0.1" min="0" {...register("breadthFemur")} />{errors.breadthFemur && <span className="text-xs text-destructive">{errors.breadthFemur.message}</span>}</div>
            <div className="space-y-2"><Label>Bi-estiloideo (cm) <span className="text-destructive">*</span></Label><Input type="number" step="0.1" min="0" {...register("breadthBistyl")} />{errors.breadthBistyl && <span className="text-xs text-destructive">{errors.breadthBistyl.message}</span>}</div>
            <div className="space-y-2"><Label>Bi-maleolar (cm)</Label><Input type="number" step="0.1" min="0" {...register("breadthBimal")} />{errors.breadthBimal && <span className="text-xs text-destructive">{errors.breadthBimal.message}</span>}</div>
          </div>
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => handleNext("perimetros")}>Atrás</Button>
            <Button type="button" onClick={() => handleNext("pliegues")}>Siguiente: Pliegues</Button>
          </div>
        </TabsContent>

        {/* PLIEGUES */}
        <TabsContent value="pliegues" className="p-4 border rounded-md mt-4 space-y-4 bg-card text-card-foreground shadow-sm">
          <Accordion defaultValue={["tronco"]} className="w-full">
            <AccordionItem value="tronco" className="border-b-0 mb-2 border rounded-lg px-4 bg-muted/30">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">Tronco</AccordionTrigger>
              <AccordionContent className="pt-2 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-1">
                  {renderMeasurement("skinfoldSubscap", "Subescapular (mm)", "Se toma en el ángulo inferior de la escápula en dirección diagonal a 45°.", "/images/anatomy/skinfold_trunk.png", true)}
                  {renderMeasurement("skinfoldIliac", "Cresta Ilíaca (mm)", "Pliegue horizontal tomado justo por encima de la cresta ilíaca.", "/images/anatomy/skinfold_trunk.png")}
                  {renderMeasurement("skinfoldSuprasp", "Supraespinal (mm)", "Pliegue diagonal medido en la intersección del borde del ilion y la línea axilar anterior.", "/images/anatomy/skinfold_trunk.png", true)}
                  {renderMeasurement("skinfoldAbdom", "Abdominal (mm)", "Pliegue vertical tomado a 5 cm a la derecha del ombligo.", "/images/anatomy/skinfold_trunk.png", true)}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="superior" className="border-b-0 mb-2 border rounded-lg px-4 bg-muted/30">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">Miembro Superior</AccordionTrigger>
              <AccordionContent className="pt-2 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-1">
                  {renderMeasurement("skinfoldTriceps", "Tríceps (mm)", "Pliegue vertical paralelo al eje longitudinal del brazo, en la parte posterior.", "/images/anatomy/skinfold_arm.png", true)}
                  {renderMeasurement("skinfoldBiceps", "Bíceps (mm)", "Pliegue vertical en la cara anterior del brazo, en la marca del bíceps.", "/images/anatomy/skinfold_arm.png")}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="inferior" className="border-b-0 border rounded-lg px-4 bg-muted/30">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">Miembro Inferior</AccordionTrigger>
              <AccordionContent className="pt-2 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-1">
                  {renderMeasurement("skinfoldThigh", "Muslo Anterior (mm)", "Pliegue vertical en el punto medio del muslo anterior.", "/images/anatomy/skinfold_leg.png", true)}
                  {renderMeasurement("skinfoldCalf", "Pantorrilla (mm)", "Pliegue vertical en la cara medial de la pantorrilla, al nivel de su máxima circunferencia.", "/images/anatomy/skinfold_leg.png", true)}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="flex justify-between pt-4 border-t mt-6">
            <Button type="button" variant="outline" onClick={() => handleNext("diametros")}>Atrás</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {evaluationId ? "Actualizar Evaluación" : "Guardar y Calcular"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </form>
  )
}
