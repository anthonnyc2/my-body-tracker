"use client"

import { useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2, Camera, X, ImageIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { compressImageToJpeg } from "@/lib/image"
import type { EvaluationPhotoType } from "@prisma/client"

const SLOTS: { type: EvaluationPhotoType; label: string }[] = [
  { type: "FRONTAL", label: "Frontal" },
  { type: "POSTERIOR", label: "Posterior" },
  { type: "PROFILE_LEFT", label: "Perfil Izquierdo" },
  { type: "PROFILE_RIGHT", label: "Perfil Derecho" },
]

interface Photo {
  type: EvaluationPhotoType
  signedUrl: string | null
}

interface PhotosEditorProps {
  evaluationId: string
  photos: Photo[]
  readOnly?: boolean
}

export function PhotosEditor({ evaluationId, photos, readOnly = false }: PhotosEditorProps) {
  const [pendingType, setPendingType] = useState<EvaluationPhotoType | null>(null)
  const queryClient = useQueryClient()
  const fileInputRefs = useRef<Partial<Record<EvaluationPhotoType, HTMLInputElement | null>>>({})

  const photoByType = new Map(photos.map((p) => [p.type, p]))

  if (readOnly && photos.length === 0) return null

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["evaluation", evaluationId] })

  const handleUpload = async (type: EvaluationPhotoType, file: File) => {
    setPendingType(type)
    try {
      const compressed = await compressImageToJpeg(file)
      const formData = new FormData()
      formData.append("file", compressed)
      formData.append("type", type)

      const res = await fetch(`/api/evaluations/${evaluationId}/photos`, {
        method: "POST",
        body: formData,
      })
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || "No se pudo subir la foto")
      } else {
        toast.success("Foto guardada")
        invalidate()
      }
    } catch {
      toast.error("No se pudo procesar la imagen")
    } finally {
      setPendingType(null)
    }
  }

  const handleDelete = async (type: EvaluationPhotoType) => {
    setPendingType(type)
    try {
      const res = await fetch(`/api/evaluations/${evaluationId}/photos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      })
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || "No se pudo eliminar la foto")
      } else {
        toast.success("Foto eliminada")
        invalidate()
      }
    } catch {
      toast.error("No se pudo eliminar la foto")
    } finally {
      setPendingType(null)
    }
  }

  return (
    <Card className="shadow-sm border-border mt-8 print:hidden">
      <Accordion>
        <AccordionItem value="photos" className="border-b-0 px-6">
          <AccordionTrigger className="py-4 hover:no-underline">
            <span className="flex items-center gap-2 text-xl font-semibold">
              <Camera className="h-5 w-5 text-muted-foreground" />
              Fotos de la Evaluación
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <p className="text-sm text-muted-foreground mb-4">
              Fotos opcionales del paciente para esta evaluación. Solo visibles para ti, no se comparten con el paciente.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SLOTS.map(({ type, label }) => {
                const photo = photoByType.get(type)
                const isPending = pendingType === type

                if (readOnly && !photo) return null

                return (
                  <div key={type} className="space-y-2">
                    <div className="aspect-square rounded-lg border bg-muted/20 overflow-hidden relative flex items-center justify-center">
                      {isPending ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      ) : photo?.signedUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo.signedUrl} alt={label} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                      )}
                      {!readOnly && photo?.signedUrl && !isPending && (
                        <button
                          type="button"
                          onClick={() => handleDelete(type)}
                          className="absolute top-1 right-1 bg-background/90 hover:bg-destructive hover:text-destructive-foreground rounded-full p-1 shadow-sm transition-colors"
                          aria-label={`Eliminar foto ${label}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-center text-muted-foreground">{label}</p>
                    {!readOnly && (
                      <>
                        <input
                          ref={(el) => { fileInputRefs.current[type] = el }}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          disabled={isPending}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            e.target.value = ""
                            if (file) handleUpload(type, file)
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          disabled={isPending}
                          onClick={() => fileInputRefs.current[type]?.click()}
                        >
                          {photo ? "Reemplazar" : "Subir"}
                        </Button>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}
