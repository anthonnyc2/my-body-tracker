import type { Subscription } from "@prisma/client"

export function isSubscriptionActive(subscription: Subscription | null): boolean {
  if (!subscription) return false
  if (subscription.status !== "ACTIVE") return false
  if (subscription.plan === "FREE") return true
  if (!subscription.currentPeriodEnd) return false
  return subscription.currentPeriodEnd.getTime() > Date.now()
}

export function getEffectivePlan(subscription: Subscription | null): "FREE" | "PRO" {
  return subscription?.plan === "PRO" && isSubscriptionActive(subscription) ? "PRO" : "FREE"
}
