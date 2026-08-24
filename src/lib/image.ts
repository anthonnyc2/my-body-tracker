interface CompressImageOptions {
  maxDimension?: number
  quality?: number
}

/** Resizes and re-encodes an image client-side before upload, keeping phone photos well under body-size limits. */
export async function compressImageToJpeg(
  file: File,
  { maxDimension = 1600, quality = 0.82 }: CompressImageOptions = {}
): Promise<File> {
  const bitmap = await createImageBitmap(file)

  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("No se pudo procesar la imagen")

  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  )
  if (!blob) throw new Error("No se pudo procesar la imagen")

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg"
  return new File([blob], name, { type: "image/jpeg" })
}
