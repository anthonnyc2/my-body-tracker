"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { ProfileFormValues, profileSchema, PasswordFormValues, passwordSchema } from "@/types/profile"

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("No autorizado")

  const { ensureUserRecord } = await import("@/lib/ensure-user")
  const dbUser = await ensureUserRecord(user)

  return {
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
    email: dbUser.email,
    role: dbUser.role,
  }
}

export async function updateProfile(data: ProfileFormValues) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: "No autorizado" }
  }

  const parsed = profileSchema.safeParse(data)
  if (!parsed.success) {
    return { error: "Datos inválidos" }
  }

  const { prisma } = await import("@/lib/prisma")

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
      },
    })

    revalidatePath("/dashboard/settings")
    return { success: true }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { error: "Error al actualizar el perfil. Inténtalo de nuevo." }
  }
}

export async function updatePassword(data: PasswordFormValues) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: "No autorizado" }
  }

  const parsed = passwordSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Datos inválidos" }
  }

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: parsed.data.currentPassword,
  })
  if (reauthError) {
    return { error: "La contraseña actual es incorrecta" }
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
