import fs from "node:fs"
import path from "node:path"

import { prisma } from "../src/lib/prisma"

type SeedExercise = {
  id: string
  name: string
  nameEn: string
  category: string
  equipment: string | null
  targetMuscle: string | null
  secondaryMuscles: string[]
  instructionsEs: string[]
  thumbnailUrl: string | null
  gifUrl: string | null
  sourceUrl: string | null
}

const BATCH_SIZE = 50

async function main() {
  const dataPath = path.join(__dirname, "seed-data", "exercises.json")
  const exercises: SeedExercise[] = JSON.parse(fs.readFileSync(dataPath, "utf-8"))

  console.log(`Seeding ${exercises.length} exercises...`)

  for (let i = 0; i < exercises.length; i += BATCH_SIZE) {
    const batch = exercises.slice(i, i + BATCH_SIZE)
    await Promise.all(
      batch.map((exercise) =>
        prisma.exercise.upsert({
          where: { id: exercise.id },
          create: exercise,
          update: exercise,
        })
      )
    )
    console.log(`  ${Math.min(i + BATCH_SIZE, exercises.length)}/${exercises.length}`)
  }

  console.log("Done.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
