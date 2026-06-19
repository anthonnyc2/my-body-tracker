"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { EvaluationFormValues, evaluationSchema } from "@/types/evaluation"
import { 
  calculateBMI, 
  calculateFatYuhasz, 
  calculateFatFaulkner,
  calculateFatDurninWomersley,
  calculateMuscleMassLee,
  calculateBoneMassRocha,
  calculateResidualMassWurch,
  calculateIdealWeight,
  calculate4ComponentFractionation,
  Measurements 
} from "@/lib/calculations"

export async function createEvaluation(data: EvaluationFormValues) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "No autorizado" }
  }

  const parsed = evaluationSchema.safeParse(data)
  if (!parsed.success) {
    return { error: "Datos inválidos" }
  }

  const { prisma } = await import("@/lib/prisma")
  const patient = await prisma.patient.findUnique({
    where: { id: parsed.data.patientId }
  })

  if (!patient || patient.evaluatorId !== user.id) {
    return { error: "Paciente no encontrado" }
  }

  // Calculate age
  const age = new Date().getFullYear() - new Date(patient.birthDate).getFullYear()

  // Prepare measurements object for calculations
  const m: Measurements = {
    ...parsed.data,
    gender: patient.gender,
    age,
  }

  const bmi = calculateBMI(m.weight, m.height)
  
  // Calculate Body Composition
  const fourC = calculate4ComponentFractionation(m)
  
  let bodyFatKg = null, muscleMassKg = null, boneMassKg = null, residualMassKg = null, bodyFatPct = null, muscleMassPct = null

  if (fourC) {
    bodyFatKg = fourC.fatMassKg
    muscleMassKg = fourC.muscleMassKg
    boneMassKg = fourC.boneMassKg
    residualMassKg = fourC.residualMassKg
    bodyFatPct = (bodyFatKg / m.weight) * 100
    muscleMassPct = (muscleMassKg / m.weight) * 100
  } else {
    // Fallback if missing data for 4C
    bodyFatPct = calculateFatYuhasz(m) ?? calculateFatFaulkner(m) ?? calculateFatDurninWomersley(m)
    bodyFatKg = bodyFatPct ? (m.weight * bodyFatPct) / 100 : null
    boneMassKg = calculateBoneMassRocha(m)
    residualMassKg = calculateResidualMassWurch(m)
    muscleMassKg = calculateMuscleMassLee(m)
    if (muscleMassKg === null && bodyFatKg !== null && boneMassKg !== null && residualMassKg !== null) {
      muscleMassKg = m.weight - bodyFatKg - boneMassKg - residualMassKg
    }
    muscleMassPct = muscleMassKg ? (muscleMassKg / m.weight) * 100 : null
  }

  const fatFreeMass = bodyFatKg ? m.weight - bodyFatKg : null
  
  try {
    const evaluation = await prisma.evaluation.create({
      data: {
        patientId: parsed.data.patientId,
        date: parsed.data.date,
        weight: parsed.data.weight,
        height: parsed.data.height,
        
        girthThorax: parsed.data.girthThorax,
        girthAbdomen: parsed.data.girthAbdomen,
        girthRelaxedArm: parsed.data.girthRelaxedArm,
        girthFlexedArm: parsed.data.girthFlexedArm,
        girthForearm: parsed.data.girthForearm,
        girthWrist: parsed.data.girthWrist,
        girthWaist: parsed.data.girthWaist,
        girthHip: parsed.data.girthHip,
        girthThigh: parsed.data.girthThigh,
        girthMaxThigh: parsed.data.girthMaxThigh,
        girthCalf: parsed.data.girthCalf,
        
        breadthHumerus: parsed.data.breadthHumerus,
        breadthFemur: parsed.data.breadthFemur,
        breadthBistyl: parsed.data.breadthBistyl,
        breadthBimal: parsed.data.breadthBimal,
        
        skinfoldTriceps: parsed.data.skinfoldTriceps,
        skinfoldSubscap: parsed.data.skinfoldSubscap,
        skinfoldBiceps: parsed.data.skinfoldBiceps,
        skinfoldIliac: parsed.data.skinfoldIliac,
        skinfoldSuprasp: parsed.data.skinfoldSuprasp,
        skinfoldAbdom: parsed.data.skinfoldAbdom,
        skinfoldThigh: parsed.data.skinfoldThigh,
        skinfoldCalf: parsed.data.skinfoldCalf,
        
        bmi,
        bodyFatPct,
        bodyFatKg,
        boneMassKg,
        residualMassKg,
        muscleMassPct,
        muscleMassKg,
        fatFreeMass,
        idealWeight: calculateIdealWeight(fatFreeMass, m.gender),
      }
    })

    revalidatePath(`/dashboard/patients/${patient.id}`)
    revalidatePath(`/dashboard/evaluations`)
    return { success: true, evaluationId: evaluation.id }
  } catch (error) {
    console.error("Error creating evaluation:", error)
    return { error: "Error al registrar la evaluación" }
  }
}

export async function updateEvaluation(id: string, data: EvaluationFormValues) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "No autorizado" }
  }

  const parsed = evaluationSchema.safeParse(data)
  if (!parsed.success) {
    return { error: "Datos inválidos" }
  }

  const { prisma } = await import("@/lib/prisma")
  
  // Verify ownership
  const existingEvaluation = await prisma.evaluation.findUnique({
    where: { id },
    include: { patient: true }
  })

  if (!existingEvaluation || existingEvaluation.patient.evaluatorId !== user.id) {
    return { error: "Evaluación no encontrada o sin permisos" }
  }

  // Calculate age
  const age = new Date().getFullYear() - new Date(existingEvaluation.patient.birthDate).getFullYear()

  // Prepare measurements object for calculations
  const m: Measurements = {
    ...parsed.data,
    gender: existingEvaluation.patient.gender,
    age,
  }

  const bmi = calculateBMI(m.weight, m.height)
  
  // Calculate Body Composition
  const fourC = calculate4ComponentFractionation(m)
  
  let bodyFatKg = null, muscleMassKg = null, boneMassKg = null, residualMassKg = null, bodyFatPct = null, muscleMassPct = null

  if (fourC) {
    bodyFatKg = fourC.fatMassKg
    muscleMassKg = fourC.muscleMassKg
    boneMassKg = fourC.boneMassKg
    residualMassKg = fourC.residualMassKg
    bodyFatPct = (bodyFatKg / m.weight) * 100
    muscleMassPct = (muscleMassKg / m.weight) * 100
  } else {
    // Fallback if missing data for 4C
    bodyFatPct = calculateFatYuhasz(m) ?? calculateFatFaulkner(m) ?? calculateFatDurninWomersley(m)
    bodyFatKg = bodyFatPct ? (m.weight * bodyFatPct) / 100 : null
    boneMassKg = calculateBoneMassRocha(m)
    residualMassKg = calculateResidualMassWurch(m)
    muscleMassKg = calculateMuscleMassLee(m)
    if (muscleMassKg === null && bodyFatKg !== null && boneMassKg !== null && residualMassKg !== null) {
      muscleMassKg = m.weight - bodyFatKg - boneMassKg - residualMassKg
    }
    muscleMassPct = muscleMassKg ? (muscleMassKg / m.weight) * 100 : null
  }

  const fatFreeMass = bodyFatKg ? m.weight - bodyFatKg : null
  
  try {
    await prisma.evaluation.update({
      where: { id },
      data: {
        date: parsed.data.date,
        weight: parsed.data.weight,
        height: parsed.data.height,
        
        girthThorax: parsed.data.girthThorax,
        girthAbdomen: parsed.data.girthAbdomen,
        girthRelaxedArm: parsed.data.girthRelaxedArm,
        girthFlexedArm: parsed.data.girthFlexedArm,
        girthForearm: parsed.data.girthForearm,
        girthWrist: parsed.data.girthWrist,
        girthWaist: parsed.data.girthWaist,
        girthHip: parsed.data.girthHip,
        girthThigh: parsed.data.girthThigh,
        girthMaxThigh: parsed.data.girthMaxThigh,
        girthCalf: parsed.data.girthCalf,
        
        breadthHumerus: parsed.data.breadthHumerus,
        breadthFemur: parsed.data.breadthFemur,
        breadthBistyl: parsed.data.breadthBistyl,
        breadthBimal: parsed.data.breadthBimal,
        
        skinfoldTriceps: parsed.data.skinfoldTriceps,
        skinfoldSubscap: parsed.data.skinfoldSubscap,
        skinfoldBiceps: parsed.data.skinfoldBiceps,
        skinfoldIliac: parsed.data.skinfoldIliac,
        skinfoldSuprasp: parsed.data.skinfoldSuprasp,
        skinfoldAbdom: parsed.data.skinfoldAbdom,
        skinfoldThigh: parsed.data.skinfoldThigh,
        skinfoldCalf: parsed.data.skinfoldCalf,
        
        bmi,
        bodyFatPct,
        bodyFatKg,
        boneMassKg,
        residualMassKg,
        muscleMassPct,
        muscleMassKg,
        fatFreeMass,
        idealWeight: calculateIdealWeight(fatFreeMass, m.gender),
      }
    })

    revalidatePath(`/dashboard/patients/${existingEvaluation.patientId}`)
    revalidatePath(`/dashboard/evaluations/${id}`)
    revalidatePath(`/dashboard/evaluations`)
    return { success: true, evaluationId: id }
  } catch (error) {
    console.error("Error updating evaluation:", error)
    return { error: "Error al actualizar la evaluación" }
  }
}

export async function getEvaluations() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("No autorizado")
  }

  const { prisma } = await import("@/lib/prisma")
  const evaluations = await prisma.evaluation.findMany({
    where: {
      patient: {
        evaluatorId: user.id
      }
    },
    orderBy: {
      date: 'desc'
    },
    include: {
      patient: {
        select: {
          firstName: true,
          lastName: true,
        }
      }
    }
  })

  return evaluations
}

export async function getLatestEvaluationByPatientId(patientId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("No autorizado")
  }

  const { prisma } = await import("@/lib/prisma")
  const evaluation = await prisma.evaluation.findFirst({
    where: {
      patientId,
      patient: {
        evaluatorId: user.id
      }
    },
    orderBy: {
      date: 'desc'
    }
  })

  return evaluation
}

export async function getEvaluationById(id: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("No autorizado")
  }

  const { prisma } = await import("@/lib/prisma")
  const evaluation = await prisma.evaluation.findFirst({
    where: {
      id,
      patient: {
        evaluatorId: user.id
      }
    },
    include: {
      patient: true,
      recommendation: true,
    }
  })

  if (!evaluation) return null

  // Fetch previous evaluation to calculate deltas
  const previousEvaluation = await prisma.evaluation.findFirst({
    where: {
      patientId: evaluation.patientId,
      date: {
        lt: evaluation.date
      }
    },
    orderBy: {
      date: 'desc'
    }
  })

  return { current: evaluation, previous: previousEvaluation }
}

export async function deleteEvaluation(id: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "No autorizado" }
  }

  const { prisma } = await import("@/lib/prisma")

  try {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: { patient: true }
    })

    if (!evaluation || evaluation.patient.evaluatorId !== user.id) {
      return { error: "Evaluación no encontrada o sin permisos" }
    }

    await prisma.evaluation.delete({
      where: { id }
    })

    revalidatePath(`/dashboard/patients/${evaluation.patientId}`)
    revalidatePath(`/dashboard/evaluations`)
    return { success: true, patientId: evaluation.patientId }
  } catch (error) {
    console.error("Error deleting evaluation:", error)
    return { error: "Error al eliminar la evaluación" }
  }
}

export async function getPatientEvaluationsHistory(patientId: string, excludeId?: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("No autorizado")
  }

  const { prisma } = await import("@/lib/prisma")
  const evaluations = await prisma.evaluation.findMany({
    where: {
      patientId,
      patient: {
        evaluatorId: user.id
      },
      ...(excludeId ? { id: { not: excludeId } } : {})
    },
    select: {
      id: true,
      date: true,
    },
    orderBy: {
      date: 'desc'
    }
  })

  return evaluations
}

export async function upsertRecommendation(evaluationId: string, data: { observations?: string; conclusions?: string; recommendations?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autorizado" }
  }

  const { prisma } = await import("@/lib/prisma")
  
  // Verify ownership
  const evaluation = await prisma.evaluation.findUnique({
    where: { id: evaluationId },
    include: { patient: true }
  })

  if (!evaluation || evaluation.patient.evaluatorId !== user.id) {
    return { error: "Evaluación no encontrada o sin acceso" }
  }

  try {
    await prisma.recommendation.upsert({
      where: { evaluationId },
      create: {
        evaluationId,
        observations: data.observations || null,
        conclusions: data.conclusions || null,
        recommendations: data.recommendations || null,
      },
      update: {
        observations: data.observations || null,
        conclusions: data.conclusions || null,
        recommendations: data.recommendations || null,
      }
    })

    revalidatePath(`/dashboard/evaluations/${evaluationId}`)
    return { success: true }
  } catch (error) {
    console.error("Error upserting recommendation:", error)
    return { error: "Error al guardar el reporte" }
  }
}
