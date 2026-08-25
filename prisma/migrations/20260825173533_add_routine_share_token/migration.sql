-- AlterTable
ALTER TABLE "Routine" ADD COLUMN     "shareToken" TEXT,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- Backfill shareToken for existing rows
UPDATE "Routine" SET "shareToken" = gen_random_uuid()::text WHERE "shareToken" IS NULL;

-- Make shareToken required now that every row has a value
ALTER TABLE "Routine" ALTER COLUMN "shareToken" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Routine_shareToken_key" ON "Routine"("shareToken");
