import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Timer } from "@/components/timer"
import { LogoutButton } from "@/components/logout-button"
import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { BarChart3 } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient(await cookies())

  const { data: claims } = await supabase.auth.getClaims()

  if (!claims) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-svh flex-col bg-black">
      <header className="flex items-center justify-between border-b border-gray-800 px-6 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/analytics"
            className="flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Link>
        </div>
        <LogoutButton />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <Timer />
      </main>
    </div>
  )
}
