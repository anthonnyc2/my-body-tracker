"use server"

import { createClient } from "@/lib/supabase/server"
import { FREE_PLAN_EVALUATION_LIMIT } from "@/lib/constants"
import { getEffectivePlan } from "@/lib/subscription"

export async function getEvaluationUsage() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("No autorizado")

  const { prisma } = await import("@/lib/prisma")
  const [subscription, used] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: user.id } }),
    prisma.evaluation.count({ where: { patient: { evaluatorId: user.id } } }),
  ])

  const plan = getEffectivePlan(subscription)
  const limit = plan === "FREE" ? FREE_PLAN_EVALUATION_LIMIT : null

  return {
    plan,
    used,
    limit,
    isAtLimit: limit !== null && used >= limit,
    billingCycle: subscription?.billingCycle ?? null,
    currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
  }
}
