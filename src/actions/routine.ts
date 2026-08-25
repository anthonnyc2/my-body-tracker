"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { RoutineFormValues, routineSchema } from "@/types/routine"

type ExerciseCatalogFilters = {
  search?: string
  category?: string
  equipment?: string
  targetMuscle?: string
  page?: number
  pageSize?: number
}

export async function getExerciseCatalog(filters: ExerciseCatalogFilters = {}) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("No autorizado")
  }

  const { prisma } = await import("@/lib/prisma")

  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 30

  const where = {
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" as const } },
            { nameEn: { contains: filters.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.equipment ? { equipment: filters.equipment } : {}),
    ...(filters.targetMuscle ? { targetMuscle: filters.targetMuscle } : {}),
  }

  const [exercises, total] = await Promise.all([
    prisma.exercise.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.exercise.count({ where }),
  ])

  return { exercises, total, page, pageSize }
}

export async function getExerciseFilterOptions() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("No autorizado")
  }

  const { prisma } = await import("@/lib/prisma")

  const [categories, equipment, targetMuscles] = await Promise.all([
    prisma.exercise.findMany({ distinct: ["category"], select: { category: true }, orderBy: { category: "asc" } }),
    prisma.exercise.findMany({ distinct: ["equipment"], select: { equipment: true }, orderBy: { equipment: "asc" } }),
    prisma.exercise.findMany({ distinct: ["targetMuscle"], select: { targetMuscle: true }, orderBy: { targetMuscle: "asc" } }),
  ])

  return {
    categories: categories.map((c) => c.category),
    equipment: equipment.map((e) => e.equipment).filter((e): e is string => Boolean(e)),
    targetMuscles: targetMuscles.map((t) => t.targetMuscle).filter((t): t is string => Boolean(t)),
  }
}

function daysCreateInput(days: RoutineFormValues["days"]) {
  return days.map((day, dayIndex) => ({
    order: dayIndex,
    label: day.label,
    notes: day.notes,
    exercises: {
      create: day.exercises.map((exercise, exerciseIndex) => ({
        order: exerciseIndex,
        exerciseId: exercise.exerciseId,
        sets: exercise.sets,
        reps: exercise.reps,
        restSeconds: exercise.restSeconds,
        notes: exercise.notes,
      })),
    },
  }))
}

export async function createRoutine(data: RoutineFormValues) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "No autorizado" }
  }

  const parsed = routineSchema.safeParse(data)
  if (!parsed.success) {
    return { error: "Datos inválidos" }
  }

  const { prisma } = await import("@/lib/prisma")

  const patient = await prisma.patient.findUnique({
    where: { id: parsed.data.patientId },
  })

  if (!patient || patient.evaluatorId !== user.id) {
    return { error: "Paciente no encontrado" }
  }

  try {
    const routine = await prisma.routine.create({
      data: {
        patientId: parsed.data.patientId,
        evaluatorId: user.id,
        name: parsed.data.name,
        description: parsed.data.description,
        isActive: parsed.data.isActive,
        startDate: parsed.data.startDate,
        endDate: parsed.data.endDate,
        days: { create: daysCreateInput(parsed.data.days) },
      },
    })

    revalidatePath(`/dashboard/patients/${patient.id}`)
    revalidatePath("/dashboard/routines")
    return { success: true, routineId: routine.id }
  } catch (error) {
    console.error("Error creating routine:", error)
    return { error: "Error al crear la rutina" }
  }
}

export async function updateRoutine(id: string, data: RoutineFormValues) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "No autorizado" }
  }

  const parsed = routineSchema.safeParse(data)
  if (!parsed.success) {
    return { error: "Datos inválidos" }
  }

  const { prisma } = await import("@/lib/prisma")

  const existingRoutine = await prisma.routine.findUnique({
    where: { id },
  })

  if (!existingRoutine || existingRoutine.evaluatorId !== user.id) {
    return { error: "Rutina no encontrada o sin permisos" }
  }

  try {
    await prisma.$transaction([
      prisma.routineDay.deleteMany({ where: { routineId: id } }),
      prisma.routine.update({
        where: { id },
        data: {
          name: parsed.data.name,
          description: parsed.data.description,
          isActive: parsed.data.isActive,
          startDate: parsed.data.startDate,
          endDate: parsed.data.endDate,
          days: { create: daysCreateInput(parsed.data.days) },
        },
      }),
    ])

    revalidatePath(`/dashboard/patients/${existingRoutine.patientId}`)
    revalidatePath(`/dashboard/routines/${id}`)
    revalidatePath("/dashboard/routines")
    return { success: true, routineId: id }
  } catch (error) {
    console.error("Error updating routine:", error)
    return { error: "Error al actualizar la rutina" }
  }
}

export async function deleteRoutine(id: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "No autorizado" }
  }

  const { prisma } = await import("@/lib/prisma")

  try {
    const routine = await prisma.routine.findUnique({
      where: { id },
    })

    if (!routine || routine.evaluatorId !== user.id) {
      return { error: "Rutina no encontrada o sin permisos" }
    }

    await prisma.routine.delete({ where: { id } })

    revalidatePath(`/dashboard/patients/${routine.patientId}`)
    revalidatePath("/dashboard/routines")
    return { success: true, patientId: routine.patientId }
  } catch (error) {
    console.error("Error deleting routine:", error)
    return { error: "Error al eliminar la rutina" }
  }
}

export async function getRoutines() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("No autorizado")
  }

  const { prisma } = await import("@/lib/prisma")
  const routines = await prisma.routine.findMany({
    where: { evaluatorId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      patient: { select: { firstName: true, lastName: true } },
    },
  })

  return routines
}

export async function getRoutinesByPatientId(patientId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("No autorizado")
  }

  const { prisma } = await import("@/lib/prisma")
  const routines = await prisma.routine.findMany({
    where: {
      patientId,
      evaluatorId: user.id,
    },
    orderBy: { createdAt: "desc" },
  })

  return routines
}

export async function getRoutineById(id: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("No autorizado")
  }

  const { prisma } = await import("@/lib/prisma")
  const routine = await prisma.routine.findFirst({
    where: {
      id,
      evaluatorId: user.id,
    },
    include: {
      patient: { select: { firstName: true, lastName: true } },
      days: {
        orderBy: { order: "asc" },
        include: {
          exercises: {
            orderBy: { order: "asc" },
            include: { exercise: true },
          },
        },
      },
    },
  })

  return routine
}
