import type { SupabaseClient } from "@supabase/supabase-js"

import { EVALUATION_PHOTOS_BUCKET, EVALUATION_PHOTO_SIGNED_URL_TTL_SECONDS } from "@/lib/constants"
import type { EvaluationPhotoType } from "@prisma/client"

export function evaluationPhotoPath(evaluatorId: string, evaluationId: string, type: EvaluationPhotoType) {
  return `${evaluatorId}/${evaluationId}/${type}.jpg`
}

export async function uploadEvaluationPhoto(
  supabase: SupabaseClient,
  path: string,
  buffer: Buffer,
  contentType: string
) {
  return supabase.storage.from(EVALUATION_PHOTOS_BUCKET).upload(path, buffer, {
    upsert: true,
    contentType,
  })
}

export async function deleteEvaluationPhotoObjects(supabase: SupabaseClient, paths: string[]) {
  if (paths.length === 0) return
  await supabase.storage.from(EVALUATION_PHOTOS_BUCKET).remove(paths)
}

export async function getSignedPhotoUrls(supabase: SupabaseClient, paths: string[]) {
  const result = new Map<string, string>()
  if (paths.length === 0) return result

  const { data, error } = await supabase.storage
    .from(EVALUATION_PHOTOS_BUCKET)
    .createSignedUrls(paths, EVALUATION_PHOTO_SIGNED_URL_TTL_SECONDS)

  if (error || !data) return result

  for (const entry of data) {
    if (entry.signedUrl && !entry.error) {
      result.set(entry.path ?? "", entry.signedUrl)
    }
  }

  return result
}
