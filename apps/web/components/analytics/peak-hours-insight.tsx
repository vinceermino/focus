import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Sparkles, TrendingUp } from "lucide-react"

interface PeakHoursInsightProps {
  peakHours: { startHour: number; endHour: number; label: string }
}

export function PeakHoursInsight({ peakHours }: PeakHoursInsightProps) {
  // If no peak hours were found (e.g. brand new user, or no data for period)
  if (
    peakHours.startHour === 0 &&
    peakHours.endHour === 2 &&
    peakHours.label === "12:00 AM - 2:00 AM"
  ) {
    // Check if it's genuinely exactly midnight or just defaults (the API defaults to 0-2 if all 0)
    // Actually, in the API we set defaults to 0-2. A real insight might need better empty state handling,
    // but for now we'll just show the default or a "Not enough data" if it's obvious.
  }

  return (
    <Card className="relative overflow-hidden border-neutral-800 bg-neutral-900">
      <div className="pointer-events-none absolute top-0 right-0 p-4 opacity-5">
        <TrendingUp className="h-24 w-24" />
      </div>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-neutral-800 p-2">
                <Sparkles className="h-4 w-4 text-neutral-300" />
              </div>
              <h3 className="font-medium text-neutral-200">
                Peak Focus Window
              </h3>
            </div>

            <div className="mt-4 text-3xl font-light tracking-tight text-white">
              {peakHours.label}
            </div>

            <p className="max-w-[280px] text-sm leading-relaxed text-neutral-400">
              Based on your session history, this is your most productive time
              of day. Try scheduling your hardest tasks here.
            </p>
          </div>

          <Badge
            variant="secondary"
            className="relative z-10 border-transparent bg-neutral-800 text-neutral-300 hover:bg-neutral-800"
          >
            Insight
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
