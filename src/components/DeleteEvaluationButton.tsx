"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteEvaluation } from "@/actions/evaluation"

export function DeleteEvaluationButton({ id, redirectUrl, variant = "outline" }: { id: string, redirectUrl?: string, variant?: "outline" | "ghost" | "destructive" | "default" }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteEvaluation(id)
    setIsDeleting(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Evaluación eliminada correctamente")
      if (redirectUrl) {
        router.push(redirectUrl)
      } else {
        router.refresh()
      }
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant={variant} size="icon" className="w-10 h-10 shrink-0 text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Eliminar evaluación</span>
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminarán permanentemente todos los datos físicos y recomendaciones de esta evaluación.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sí, eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
