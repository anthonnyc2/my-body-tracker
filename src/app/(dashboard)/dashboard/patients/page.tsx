"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Plus, Users, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getPatients } from "@/actions/patient"
import { DeletePatientButton } from "@/components/DeletePatientButton"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function PatientsPage() {
  const { data: patients, isLoading, error } = useQuery({
    queryKey: ["patients"],
    queryFn: () => getPatients(),
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
        <Link href="/dashboard/patients/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Paciente
          </Button>
        </Link>
      </div>
      
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando pacientes...</div>
        ) : error ? (
          <div className="p-8 text-center text-destructive">Error al cargar pacientes</div>
        ) : !patients || patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No hay pacientes</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Aún no has registrado ningún paciente.
            </p>
            <Link href="/dashboard/patients/new" className="mt-4">
              <Button variant="outline">Agregar el primero</Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead>Objetivo</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient: { id: string, documentId?: string | null, firstName: string, lastName: string, email?: string | null, phone?: string | null, birthDate: Date | string, goal: string, createdAt: Date | string }) => {
                const age = new Date().getFullYear() - new Date(patient.birthDate).getFullYear()
                return (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      {patient.firstName} {patient.lastName}
                    </TableCell>
                    <TableCell>{age} años</TableCell>
                    <TableCell>
                      {patient.goal === "FAT_LOSS" && "Pérdida de Grasa"}
                      {patient.goal === "MUSCLE_GAIN" && "Ganancia Muscular"}
                      {patient.goal === "BODY_RECOMPOSITION" && "Recomposición"}
                      {patient.goal === "SPORTS_PERFORMANCE" && "Rendimiento"}
                      {patient.goal === "MAINTENANCE" && "Mantenimiento"}
                    </TableCell>
                    <TableCell>{format(new Date(patient.createdAt), "dd MMM yyyy", { locale: es })}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/patients/${patient.id}`}>
                          <Button variant="ghost" size="sm">
                            Ver Detalle <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        <DeletePatientButton
                          id={patient.id}
                          patientName={`${patient.firstName} ${patient.lastName}`}
                          variant="ghost"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
