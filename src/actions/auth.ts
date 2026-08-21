"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"

async function getOrigin() {
  const headersList = await headers()
  const origin = headersList.get("origin")
  if (origin) return origin

  const proto = headersList.get("x-forwarded-proto") ?? "https"
  const host = headersList.get("host")
  return `${proto}://${host}`
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email y contraseña son obligatorios" }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function signupAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string

  if (!email || !password || !firstName || !lastName) {
    return { error: "Todos los campos son obligatorios" }
  }

  const supabase = await createClient()
  const origin = await getOrigin()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    }
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // Sincronización Inmediata con Prisma
    try {
      const { ensureUserRecord } = await import("@/lib/ensure-user")
      await ensureUserRecord(data.user)
    } catch (dbError) {
      console.error(`Error al sincronizar usuario ${data.user.id} (${data.user.email}) con Prisma tras signup:`, dbError)
      // No bloqueamos el flujo: el usuario ya quedó creado en Supabase Auth.
      // La fila en Prisma se autocorrige en el siguiente request al dashboard.
    }
  }

  // Si el proyecto de Supabase exige confirmación de email, signUp no devuelve
  // sesión activa: el usuario debe confirmar desde su correo antes de poder entrar.
  if (!data.session) {
    return { needsConfirmation: true }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}
