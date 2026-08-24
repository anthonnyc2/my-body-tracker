"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2, Edit2, Target } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { GoalsFormInput, GoalsFormValues, goalsSchema } from "@/types/evaluation"
import { updateEvaluationGoals } from "@/actions/evaluation"

interface GoalsEditorProps {
  evaluationId: string
  gender: "MALE" | "FEMALE" | "OTHER"
  targetBodyFatPct: number | null
  targetMuscleMassPct: number | null
  currentBodyFatPct: number | null
  currentMuscleMassPct: number | null
  readOnly?: boolean
}

export function GoalsEditor({
  evaluationId,
  gender,
  targetBodyFatPct,
  targetMuscleMassPct,
  currentBodyFatPct,
  currentMuscleMassPct,
  readOnly = false,
}: GoalsEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  const { register, handleSubmit, formState: { errors } } = useForm<GoalsFormInput, unknown, GoalsFormValues>({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      targetBodyFatPct: targetBodyFatPct ?? undefined,
      targetMuscleMassPct: targetMuscleMassPct ?? undefined,
    }
  })

  const defaultFatPct = gender === "MALE" ? 15 : 22
  const defaultMusclePct = gender === "MALE" ? 45 : 35
  const hasTargets = Boolean(targetBodyFatPct || targetMuscleMassPct)

  if (readOnly && !hasTargets) return null

  const onSubmit = async (data: GoalsFormValues) => {
    setIsSubmitting(true)
    const result = await updateEvaluationGoals(evaluationId, data)
    setIsSubmitting(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Metas actualizadas exitosamente")
      setIsEditing(false)
      queryClient.invalidateQueries({ queryKey: ["evaluation", evaluationId] })
    }
  }

  if (!isEditing) {
    return (
      <Card className="shadow-sm border-border mb-8 print:hidden">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Target className="h-5 w-5 text-muted-foreground" />
                Metas de Composición Corporal
              </CardTitle>
              <CardDescription className="mt-1">
                {targetBodyFatPct || targetMuscleMassPct
                  ? "Metas personalizadas definidas para este paciente según estos resultados."
                  : `Aún no se ha definido una meta. Se usa el estándar óptimo por defecto (${defaultFatPct}% grasa / ${defaultMusclePct}% músculo).`}
              </CardDescription>
            </div>
            {!readOnly && (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Edit2 className="w-4 h-4 mr-2" />
                {targetBodyFatPct || targetMuscleMassPct ? "Editar Metas" : "Definir Metas"}
              </Button>
            )}
          </div>
        </CardHeader>
        {(targetBodyFatPct || targetMuscleMassPct) && (
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Meta Grasa Corporal: </span>
              <span className="font-semibold">{targetBodyFatPct ?? defaultFatPct}%</span>
              {currentBodyFatPct !== null && (
                <span className="text-muted-foreground"> (actual: {currentBodyFatPct.toFixed(1)}%)</span>
              )}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Meta Masa Muscular: </span>
              <span className="font-semibold">{targetMuscleMassPct ?? defaultMusclePct}%</span>
              {currentMuscleMassPct !== null && (
                <span className="text-muted-foreground"> (actual: {currentMuscleMassPct.toFixed(1)}%)</span>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border-border border-primary/20 mb-8 print:hidden">
      <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
        <CardTitle className="text-xl">Definir Metas</CardTitle>
        <CardDescription className="mt-1">
          Con base en los resultados de esta evaluación, define el % de grasa y músculo a alcanzar.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Meta Grasa Corporal (%)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder={`Ej. ${defaultFatPct}`}
                {...register("targetBodyFatPct")}
              />
              {currentBodyFatPct !== null && (
                <p className="text-xs text-muted-foreground">Actual: {currentBodyFatPct.toFixed(1)}%</p>
              )}
              {errors.targetBodyFatPct && <span className="text-xs text-destructive">{errors.targetBodyFatPct.message}</span>}
            </div>
            <div className="space-y-2">
              <Label>Meta Masa Muscular (%)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder={`Ej. ${defaultMusclePct}`}
                {...register("targetMuscleMassPct")}
              />
              {currentMuscleMassPct !== null && (
                <p className="text-xs text-muted-foreground">Actual: {currentMuscleMassPct.toFixed(1)}%</p>
              )}
              {errors.targetMuscleMassPct && <span className="text-xs text-destructive">{errors.targetMuscleMassPct.message}</span>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Metas
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
