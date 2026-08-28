import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-svh flex-col bg-[#0f1021]">
      {/* Top nav */}
      <header className="flex items-center justify-between border-b border-white/[0.06] px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white">Focus</span>
        </div>
        <LogoutButton />
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        {children}
      </main>
    </div>
  );
}
