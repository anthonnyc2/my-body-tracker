import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PatientForm } from "@/components/forms/PatientForm"

export default function NewPatientPage() {
  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/patients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Nuevo Paciente</h1>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
        <PatientForm />
      </div>
    </div>
  )
}
