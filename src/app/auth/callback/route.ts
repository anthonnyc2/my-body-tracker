import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ensureUserRecord } from "@/lib/ensure-user"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      if (data.user) {
        try {
          await ensureUserRecord(data.user)
        } catch (dbError) {
          console.error(`Error al sincronizar usuario ${data.user.id} (${data.user.email}) con Prisma tras confirmación:`, dbError)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=No se pudo verificar el correo`)
}
