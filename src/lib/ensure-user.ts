import type { User as SupabaseUser } from "@supabase/supabase-js"

export async function ensureUserRecord(user: SupabaseUser) {
  const { prisma } = await import("@/lib/prisma")

  const existingUser = await prisma.user.findUnique({ where: { id: user.id } })
  const dbUser = existingUser ?? await prisma.user.create({
    data: {
      id: user.id,
      email: user.email!,
      firstName: user.user_metadata?.first_name || "Evaluador",
      lastName: user.user_metadata?.last_name || "",
      role: "EVALUATOR",
    },
  })

  await prisma.subscription.upsert({
    where: { userId: dbUser.id },
    update: {},
    create: { userId: dbUser.id, plan: "FREE", status: "ACTIVE" },
  })

  return dbUser
}
