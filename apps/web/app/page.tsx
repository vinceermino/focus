import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Timer } from "@/components/timer"
import { LogoutButton } from "@/components/logout-button"
import { createClient } from "@/utils/supabase/server"

export default async function HomePage() {
  const supabase = await createClient(await cookies())

  const { data: claims } = await supabase.auth.getClaims()

  if (!claims) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-svh flex-col bg-black">
      <header className="flex items-center justify-between border-b border-gray-800 px-6 py-3">
        <LogoutButton />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <Timer />
      </main>
    </div>
  )
}
