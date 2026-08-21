"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

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

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      }
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
      // No bloqueamos el redirect: el usuario ya tiene sesión válida en Supabase Auth.
      // La fila en Prisma se autocorrige en el siguiente request al dashboard.
    }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}
