-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EVALUATOR', 'PATIENT');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "PhysicalActivityLevel" AS ENUM ('SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE');

-- CreateEnum
CREATE TYPE "Goal" AS ENUM ('FAT_LOSS', 'MUSCLE_GAIN', 'BODY_RECOMPOSITION', 'SPORTS_PERFORMANCE', 'MAINTENANCE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EVALUATOR',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "evaluatorId" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "documentId" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "initialWeight" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "activityLevel" "PhysicalActivityLevel" NOT NULL,
    "goal" "Goal" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "decimalAge" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "girthThorax" DOUBLE PRECISION,
    "girthAbdomen" DOUBLE PRECISION,
    "girthWaist" DOUBLE PRECISION,
    "girthHip" DOUBLE PRECISION,
    "girthRelaxedArm" DOUBLE PRECISION,
    "girthFlexedArm" DOUBLE PRECISION,
    "girthForearm" DOUBLE PRECISION,
    "girthWrist" DOUBLE PRECISION,
    "girthThigh" DOUBLE PRECISION,
    "girthMaxThigh" DOUBLE PRECISION,
    "girthCalf" DOUBLE PRECISION,
    "breadthHumerus" DOUBLE PRECISION,
    "breadthFemur" DOUBLE PRECISION,
    "breadthBistyl" DOUBLE PRECISION,
    "breadthBimal" DOUBLE PRECISION,
    "skinfoldTriceps" DOUBLE PRECISION,
    "skinfoldSubscap" DOUBLE PRECISION,
    "skinfoldBiceps" DOUBLE PRECISION,
    "skinfoldIliac" DOUBLE PRECISION,
    "skinfoldSuprasp" DOUBLE PRECISION,
    "skinfoldAbdom" DOUBLE PRECISION,
    "skinfoldThigh" DOUBLE PRECISION,
    "skinfoldCalf" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "bodyFatPct" DOUBLE PRECISION,
    "bodyFatKg" DOUBLE PRECISION,
    "muscleMassPct" DOUBLE PRECISION,
    "muscleMassKg" DOUBLE PRECISION,
    "boneMassKg" DOUBLE PRECISION,
    "residualMassKg" DOUBLE PRECISION,
    "fatFreeMass" DOUBLE PRECISION,
    "idealWeight" DOUBLE PRECISION,
    "targetBodyFatPct" DOUBLE PRECISION,
    "targetMuscleMassPct" DOUBLE PRECISION,
    "shareToken" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationPhoto" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluationPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "observations" TEXT,
    "conclusions" TEXT,
    "recommendations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_userId_key" ON "Patient"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_shareToken_key" ON "Evaluation"("shareToken");

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_evaluationId_key" ON "Recommendation"("evaluationId");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationPhoto" ADD CONSTRAINT "EvaluationPhoto_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

