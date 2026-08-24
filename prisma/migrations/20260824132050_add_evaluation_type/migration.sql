-- CreateEnum
CREATE TYPE "EvaluationType" AS ENUM ('FULL', 'SIMPLE');

-- AlterTable
ALTER TABLE "Evaluation" ADD COLUMN     "type" "EvaluationType" NOT NULL DEFAULT 'FULL';
