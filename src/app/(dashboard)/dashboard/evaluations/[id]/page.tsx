"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Printer, Pencil, Download, Copy, Check, Share2 } from "lucide-react"
import QRCode from "react-qr-code"

import { Button } from "@/components/ui/button"
import { getEvaluationById, getPatientEvaluationsHistory } from "@/actions/evaluation"
import { EvaluationReport } from "@/components/EvaluationReport"
import { DeleteEvaluationButton } from "@/components/DeleteEvaluationButton"

export default function EvaluationReportPage() {
  const params = useParams()
  const id = params.id as string
  const [copied, setCopied] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["evaluation", id],
    queryFn: () => getEvaluationById(id),
  })

  const current = data?.current

  const { data: historyData } = useQuery({
    queryKey: ["evaluationHistory", current?.patientId, id],
    queryFn: () => getPatientEvaluationsHistory(current!.patientId, id),
    enabled: !!current?.patientId,
  })

  if (isLoading) return <div className="p-8 text-center">Cargando reporte...</div>
  if (!data || !current) return <div className="p-8 text-center">Evaluación no encontrada</div>

  const { previous } = data
  const { patient } = current

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full mb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center print:hidden">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/patients/${patient.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Reporte de Evaluación</h1>
        </div>
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <Link href={`/dashboard/evaluations/${id}/edit`}>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
          <a href={`/api/evaluations/${id}/pdf`} download>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Descargar PDF
            </Button>
          </a>
          <DeleteEvaluationButton id={id} redirectUrl={`/dashboard/patients/${patient.id}`} />
        </div>
      </div>

      <EvaluationReport
        current={current}
        previous={previous}
        patient={patient}
        historyForComparison={historyData}
      />

      {/* Share section */}
      {current.shareToken && (
        <div className="pt-8 border-t print:hidden">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Compartir con el Paciente</h3>
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-white p-3 rounded-xl border shadow-sm">
              <QRCode
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/share/${current.shareToken}`}
                size={120}
              />
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-sm text-muted-foreground">
                El paciente puede ver sus resultados escaneando el código QR o accediendo al link. No se requiere cuenta.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-muted px-3 py-2 rounded-lg break-all">
                  {typeof window !== "undefined" ? window.location.origin : ""}/share/{current.shareToken}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/share/${current.shareToken}`)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
