import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { evaluationPhotoPath, uploadEvaluationPhoto, deleteEvaluationPhotoObjects, getSignedPhotoUrls } from "@/lib/supabase/storage"
import { EVALUATION_PHOTO_MAX_BYTES, EVALUATION_PHOTO_ALLOWED_MIME_TYPES } from "@/lib/constants"
import type { EvaluationPhotoType } from "@prisma/client"

const PHOTO_TYPES: EvaluationPhotoType[] = ["FRONTAL", "POSTERIOR", "PROFILE_LEFT", "PROFILE_RIGHT"]

interface RouteParams {
  params: Promise<{ id: string }>
}

async function verifyOwnership(evaluationId: string, userId: string) {
  const { prisma } = await import("@/lib/prisma")
  const evaluation = await prisma.evaluation.findFirst({
    where: { id: evaluationId, patient: { evaluatorId: userId } },
  })
  return evaluation
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const evaluation = await verifyOwnership(id, user.id)
  if (!evaluation) {
    return NextResponse.json({ error: "Evaluación no encontrada o sin permisos" }, { status: 404 })
  }

  const formData = await request.formData()
  const file = formData.get("file")
  const type = formData.get("type")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo no proporcionado" }, { status: 400 })
  }
  if (typeof type !== "string" || !PHOTO_TYPES.includes(type as EvaluationPhotoType)) {
    return NextResponse.json({ error: "Tipo de foto inválido" }, { status: 400 })
  }
  if (!EVALUATION_PHOTO_ALLOWED_MIME_TYPES.includes(file.type as (typeof EVALUATION_PHOTO_ALLOWED_MIME_TYPES)[number])) {
    return NextResponse.json({ error: "Formato de imagen no soportado" }, { status: 415 })
  }
  if (file.size > EVALUATION_PHOTO_MAX_BYTES) {
    return NextResponse.json({ error: "La imagen supera el tamaño máximo permitido" }, { status: 413 })
  }

  const photoType = type as EvaluationPhotoType
  const path = evaluationPhotoPath(user.id, id, photoType)
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await uploadEvaluationPhoto(supabase, path, buffer, file.type)
  if (uploadError) {
    return NextResponse.json({ error: "No se pudo subir la imagen" }, { status: 500 })
  }

  const { prisma } = await import("@/lib/prisma")
  try {
    await prisma.evaluationPhoto.upsert({
      where: { evaluationId_type: { evaluationId: id, type: photoType } },
      create: { evaluationId: id, type: photoType, path },
      update: { path },
    })
  } catch (error) {
    console.error("Error saving evaluation photo:", error)
    return NextResponse.json({ error: "No se pudo guardar la foto" }, { status: 500 })
  }

  const signedUrls = await getSignedPhotoUrls(supabase, [path])

  revalidatePath(`/dashboard/evaluations/${id}`)
  return NextResponse.json({ success: true, type: photoType, signedUrl: signedUrls.get(path) ?? null })
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const evaluation = await verifyOwnership(id, user.id)
  if (!evaluation) {
    return NextResponse.json({ error: "Evaluación no encontrada o sin permisos" }, { status: 404 })
  }

  const body = await request.json().catch(() => null)
  const type = body?.type
  if (typeof type !== "string" || !PHOTO_TYPES.includes(type as EvaluationPhotoType)) {
    return NextResponse.json({ error: "Tipo de foto inválido" }, { status: 400 })
  }

  const { prisma } = await import("@/lib/prisma")
  const photo = await prisma.evaluationPhoto.findUnique({
    where: { evaluationId_type: { evaluationId: id, type: type as EvaluationPhotoType } },
  })

  if (!photo) {
    return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 })
  }

  await deleteEvaluationPhotoObjects(supabase, [photo.path])
  await prisma.evaluationPhoto.delete({ where: { id: photo.id } })

  revalidatePath(`/dashboard/evaluations/${id}`)
  return NextResponse.json({ success: true })
}
