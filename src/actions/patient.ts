"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { PatientFormValues, patientSchema } from "@/types/patient"

export async function createPatient(data: PatientFormValues) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "No autorizado" }
  }

  const parsed = patientSchema.safeParse(data)
  if (!parsed.success) {
    return { error: "Datos inválidos" }
  }

  const { prisma } = await import("@/lib/prisma")
  const { ensureUserRecord } = await import("@/lib/ensure-user")
  // Ensure evaluator exists in Prisma, if not create it based on auth
  await ensureUserRecord(user)

  try {
    const patient = await prisma.patient.create({
      data: {
        ...parsed.data,
        evaluatorId: user.id,
      }
    })

    revalidatePath("/dashboard/patients")
    return { success: true, patientId: patient.id }
  } catch (error) {
    console.error("Error creating patient:", error)
    return { error: "Error al crear paciente. Inténtalo de nuevo." }
  }
}

export async function getPatients() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("No autorizado")
  }

  const { prisma } = await import("@/lib/prisma")
  const patients = await prisma.patient.findMany({
    where: {
      evaluatorId: user.id
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  return patients
}

export async function getPatientById(id: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("No autorizado")
  }

  const { prisma } = await import("@/lib/prisma")
  const patient = await prisma.patient.findFirst({
    where: {
      id,
      evaluatorId: user.id
    },
    include: {
      evaluations: {
        orderBy: { date: "desc" }
      }
    }
  })

  return patient
}

export async function deletePatient(id: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "No autorizado" }
  }

  const { prisma } = await import("@/lib/prisma")

  try {
    const patient = await prisma.patient.findUnique({
      where: { id }
    })

    if (!patient || patient.evaluatorId !== user.id) {
      return { error: "Paciente no encontrado o sin permisos" }
    }

    await prisma.patient.delete({
      where: { id }
    })

    revalidatePath("/dashboard/patients")
    return { success: true }
  } catch (error) {
    console.error("Error deleting patient:", error)
    return { error: "Error al eliminar paciente. Inténtalo de nuevo." }
  }
}

export async function updatePatient(id: string, data: PatientFormValues) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "No autorizado" }
  }

  const parsed = patientSchema.safeParse(data)
  if (!parsed.success) {
    return { error: "Datos inválidos" }
  }

  const { prisma } = await import("@/lib/prisma")
  
  // Verify ownership
  const existingPatient = await prisma.patient.findUnique({
    where: { id }
  })

  if (!existingPatient || existingPatient.evaluatorId !== user.id) {
    return { error: "Paciente no encontrado o sin permisos" }
  }

  try {
    await prisma.patient.update({
      where: { id },
      data: parsed.data
    })

    revalidatePath("/dashboard/patients")
    revalidatePath(`/dashboard/patients/${id}`)
    return { success: true, patientId: id }
  } catch (error) {
    console.error("Error updating patient:", error)
    return { error: "Error al actualizar paciente. Inténtalo de nuevo." }
  }
}
