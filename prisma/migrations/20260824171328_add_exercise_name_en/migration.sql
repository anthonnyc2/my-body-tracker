-- AlterTable
-- Added nullable first because the table already has rows; a follow-up
-- migration backfills via `pnpm prisma db seed` and then sets NOT NULL.
ALTER TABLE "Exercise" ADD COLUMN     "nameEn" TEXT;

-- CreateIndex
CREATE INDEX "Exercise_nameEn_idx" ON "Exercise"("nameEn");

