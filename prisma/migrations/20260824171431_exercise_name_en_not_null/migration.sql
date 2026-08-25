-- Backfilled via `pnpm prisma db seed` in the prior migration; safe to enforce now.
ALTER TABLE "Exercise" ALTER COLUMN "nameEn" SET NOT NULL;
