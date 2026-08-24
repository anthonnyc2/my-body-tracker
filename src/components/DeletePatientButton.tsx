"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
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
import { deletePatient } from "@/actions/patient"

export function DeletePatientButton({ id, patientName, redirectUrl, variant = "outline", label }: { id: string, patientName: string, redirectUrl?: string, variant?: "outline" | "ghost" | "destructive" | "default", label?: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deletePatient(id)
    setIsDeleting(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Paciente eliminado correctamente")
      setOpen(false)
      await queryClient.invalidateQueries()
      if (redirectUrl) {
        router.push(redirectUrl)
      } else {
        router.refresh()
      }
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          label ? (
            <Button variant={variant} className="shrink-0 text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20">
              <Trash2 className="mr-2 h-4 w-4" />
              {label}
            </Button>
          ) : (
            <Button variant={variant} size="icon" className="w-10 h-10 shrink-0 text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Eliminar paciente</span>
            </Button>
          )
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar a {patientName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminarán permanentemente el paciente y todas sus evaluaciones, fotos y recomendaciones asociadas.
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
