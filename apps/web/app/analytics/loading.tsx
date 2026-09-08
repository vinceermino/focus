import { Skeleton } from "@workspace/ui/components/skeleton"

export default function AnalyticsLoading() {
  return (
    <div className="flex min-h-svh flex-col bg-black">
      <header className="flex items-center justify-between border-b border-gray-800 px-6 py-3">
        <Skeleton className="h-5 w-24 bg-neutral-800" />
      </header>

      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div>
            <Skeleton className="mb-2 h-9 w-48 bg-neutral-800" />
            <Skeleton className="h-5 w-64 bg-neutral-800" />
          </div>

          {/* Stat Cards Skeleton */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-32 w-full rounded-xl bg-neutral-800"
              />
            ))}
          </div>

          {/* Main Chart Skeleton */}
          <Skeleton className="h-[400px] w-full rounded-xl bg-neutral-800" />

          {/* Bottom Grid Skeleton */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Skeleton className="h-[300px] w-full rounded-xl bg-neutral-800" />
            <Skeleton className="h-[300px] w-full rounded-xl bg-neutral-800" />
          </div>
        </div>
      </main>
    </div>
  )
}
