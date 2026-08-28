"use client";

import { logout } from "@/lib/actions";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-[#8b8ca7] transition-colors hover:bg-white/[0.06] hover:text-white"
      >
        <LogOut className="h-3.5 w-3.5" />
        Sign out
      </button>
    </form>
  );
}
