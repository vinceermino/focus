"use client"

import { LogOut } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }
  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  )
}
