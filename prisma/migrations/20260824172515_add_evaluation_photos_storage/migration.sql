-- CreateEnum
CREATE TYPE "EvaluationPhotoType" AS ENUM ('FRONTAL', 'POSTERIOR', 'PROFILE_LEFT', 'PROFILE_RIGHT');

-- AlterTable
ALTER TABLE "EvaluationPhoto" DROP COLUMN "url",
ADD COLUMN     "path" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "EvaluationPhotoType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationPhoto_evaluationId_type_key" ON "EvaluationPhoto"("evaluationId", "type");

-- Provision Supabase Storage for evaluation photos.
-- This project has no separate `supabase/migrations` history — Storage config
-- (buckets, RLS policies) lives in the same Postgres database managed by
-- Prisma, so it's provisioned here to keep a single migration history and a
-- single `prisma migrate deploy` for every environment.

-- Private bucket: objects are only reachable via short-lived signed URLs
-- generated server-side, never via a public URL.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evaluation-photos',
  'evaluation-photos',
  false,
  8388608, -- 8 MiB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS is already enabled on storage.objects by default in every Supabase
-- project (owned by supabase_storage_admin) — the migration role doesn't
-- have ALTER privileges on that table to re-enable it, and doesn't need to.

-- Objects are stored at `{evaluatorId}/{evaluationId}/{type}.jpg`. An
-- evaluator may only read/write objects under their own uid prefix; the
-- application additionally verifies the evaluator owns the evaluation
-- before ever issuing an upload/signed-url request for a given path.
CREATE POLICY "evaluation_photos_select_own"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'evaluation-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "evaluation_photos_insert_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'evaluation-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "evaluation_photos_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'evaluation-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'evaluation-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "evaluation_photos_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'evaluation-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
