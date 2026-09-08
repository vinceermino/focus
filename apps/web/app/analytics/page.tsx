import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function AnalyticsPage() {
  const supabase = await createClient(await cookies())

  const { data: claims } = await supabase.auth.getClaims()

  if (!claims) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-svh flex-col bg-black">
      <header className="flex items-center justify-between border-b border-gray-800 px-6 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Timer
        </Link>
      </header>

      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div>
            <h1 className="mb-2 text-3xl font-light tracking-tight text-white">
              Analytics
            </h1>
          </div>

          <AnalyticsDashboard />
        </div>
      </main>
    </div>
  )
}
