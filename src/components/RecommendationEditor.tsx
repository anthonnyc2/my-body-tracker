"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Edit2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RecommendationFormValues, recommendationSchema } from "@/types/evaluation"
import { upsertRecommendation } from "@/actions/evaluation"

interface RecommendationEditorProps {
  evaluationId: string
  initialData?: {
    observations: string | null
    conclusions: string | null
    recommendations: string | null
  } | null
  readOnly?: boolean
}

export function RecommendationEditor({ evaluationId, initialData, readOnly = false }: RecommendationEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasContent = Boolean(initialData?.observations || initialData?.conclusions || initialData?.recommendations)

  const { register, handleSubmit, formState: { errors } } = useForm<RecommendationFormValues>({
    resolver: zodResolver(recommendationSchema),
    defaultValues: {
      observations: initialData?.observations || "",
      conclusions: initialData?.conclusions || "",
      recommendations: initialData?.recommendations || "",
    }
  })

  if (readOnly && !hasContent) return null

  const onSubmit = async (data: RecommendationFormValues) => {
    setIsSubmitting(true)
    const result = await upsertRecommendation(evaluationId, data)
    setIsSubmitting(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Reporte actualizado exitosamente")
      setIsEditing(false)
    }
  }

  if (!isEditing && (!initialData?.observations && !initialData?.conclusions && !initialData?.recommendations)) {
    return (
      <Card className="shadow-sm border-border mt-8">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Reporte del Profesional</CardTitle>
              <CardDescription className="mt-1">
                Aún no has escrito observaciones clínicas o recomendaciones para esta evaluación.
              </CardDescription>
            </div>
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit2 className="w-4 h-4 mr-2" />
              Escribir Reporte
            </Button>
          </div>
        </CardHeader>
      </Card>
    )
  }

  if (!isEditing) {
    return (
      <Card className="shadow-sm border-border mt-8">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Reporte del Profesional</CardTitle>
              <CardDescription className="mt-1">
                Observaciones clínicas, conclusiones y recomendaciones entregadas al paciente.
              </CardDescription>
            </div>
            {!readOnly && (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Edit2 className="w-4 h-4 mr-2" />
                Editar Reporte
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {initialData?.observations && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Observaciones Clínicas</h3>
              <p className="text-foreground bg-muted/10 p-4 rounded-md whitespace-pre-wrap">{initialData.observations}</p>
            </div>
          )}
          {initialData?.conclusions && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Conclusiones</h3>
              <p className="text-foreground bg-muted/10 p-4 rounded-md whitespace-pre-wrap">{initialData.conclusions}</p>
            </div>
          )}
          {initialData?.recommendations && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Recomendaciones</h3>
              <p className="text-foreground bg-muted/10 p-4 rounded-md whitespace-pre-wrap">{initialData.recommendations}</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border-border border-primary/20 mt-8">
      <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Editando Reporte</CardTitle>
            <CardDescription className="mt-1">
              Escribe tus anotaciones clínicas analizando los datos obtenidos.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Observaciones Clínicas</Label>
            <Textarea 
              {...register("observations")} 
              placeholder="Ej: El paciente presenta retención de líquidos..."
              className="min-h-[100px]"
            />
            {errors.observations && <span className="text-xs text-destructive">{errors.observations.message}</span>}
          </div>
          
          <div className="space-y-2">
            <Label>Conclusiones</Label>
            <Textarea 
              {...register("conclusions")} 
              placeholder="Ej: Hubo una disminución del porcentaje de grasa de 2% respecto al mes anterior."
              className="min-h-[100px]"
            />
            {errors.conclusions && <span className="text-xs text-destructive">{errors.conclusions.message}</span>}
          </div>
          
          <div className="space-y-2">
            <Label>Recomendaciones</Label>
            <Textarea 
              {...register("recommendations")} 
              placeholder="Ej: Aumentar el consumo de proteínas a 1.8g/kg y priorizar entrenamiento de fuerza."
              className="min-h-[100px]"
            />
            {errors.recommendations && <span className="text-xs text-destructive">{errors.recommendations.message}</span>}
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsEditing(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Guardar Reporte
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
