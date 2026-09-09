import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Timer } from "@/components/timer"
import { createClient } from "@/utils/supabase/server"
import { NotesWidget } from "@/components/notes-widget"
import { getNotes } from "@/app/actions/notes"
import { SlideMenu } from "@/components/slide-menu"

export default async function HomePage() {
  const supabase = await createClient(await cookies())

  const { data: claims } = await supabase.auth.getClaims()

  if (!claims) {
    redirect("/login")
  }

  const initialNotes = await getNotes()

  return (
    <div className="flex min-h-svh flex-col bg-black">
      <header className="flex items-center border-b border-gray-800 px-6 py-3">
        <SlideMenu />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-12 px-4 py-8 md:flex-row md:items-stretch">
        <div className="flex flex-1 items-center justify-center">
          <Timer />
        </div>
      </main>
      <NotesWidget initialNotes={initialNotes} />
    </div>
  )
}
