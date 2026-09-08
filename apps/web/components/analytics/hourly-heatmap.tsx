"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

interface HourlyHeatmapProps {
  hourlyDistribution: Array<{
    dayOfWeek: number
    hour: number
    totalSeconds: number
  }>
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const HOURS = Array.from({ length: 18 }, (_, i) => i + 5) // 5 AM to 10 PM (18 rows)

export function HourlyHeatmap({ hourlyDistribution }: HourlyHeatmapProps) {
  // Find max minutes to calculate opacity/intensity
  let maxMinutes = 1
  hourlyDistribution.forEach((d) => {
    const minutes = Math.round(d.totalSeconds / 60)
    if (minutes > maxMinutes) maxMinutes = minutes
  })

  const getIntensityClass = (minutes: number) => {
    if (minutes === 0) return "bg-neutral-800/50"

    const ratio = minutes / maxMinutes
    if (ratio < 0.2) return "bg-neutral-700"
    if (ratio < 0.4) return "bg-neutral-600"
    if (ratio < 0.6) return "bg-neutral-500"
    if (ratio < 0.8) return "bg-neutral-400"
    return "bg-neutral-200"
  }

  const formatHour = (h: number) => {
    const ampm = h >= 12 ? "PM" : "AM"
    const h12 = h % 12 || 12
    return `${h12}${ampm}`
  }

  return (
    <Card className="h-full border-neutral-800 bg-neutral-900">
      <CardHeader>
        <CardTitle className="text-base font-medium text-neutral-200">
          Hourly Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex">
          {/* Y-axis Labels (Hours) */}
          <div className="flex flex-col gap-[2px] pt-6 pr-2">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="flex h-6 w-8 items-center justify-end text-[10px] text-neutral-500"
              >
                {formatHour(hour)}
              </div>
            ))}
          </div>

          {/* Heatmap Grid */}
          <div className="flex-1">
            {/* X-axis Labels (Days) */}
            <div className="mb-2 grid grid-cols-7 gap-[2px]">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-[11px] text-neutral-500"
                >
                  {day}
                </div>
              ))}
            </div>

            <TooltipProvider delay={100}>
              <div className="grid grid-cols-7 gap-[2px]">
                {HOURS.map((hour) =>
                  DAYS.map((_, dayIdx) => {
                    // Find data for this cell
                    const entry = hourlyDistribution.find(
                      (d) => d.dayOfWeek === dayIdx && d.hour === hour
                    )
                    const minutes = entry
                      ? Math.round(entry.totalSeconds / 60)
                      : 0

                    return (
                      <Tooltip key={`${dayIdx}-${hour}`}>
                        <TooltipTrigger
                          render={
                            <div
                              className={`h-6 rounded-sm transition-colors hover:ring-1 hover:ring-white ${getIntensityClass(minutes)}`}
                            />
                          }
                        />
                        <TooltipContent className="border-neutral-700 bg-neutral-800 text-neutral-200">
                          <p className="text-sm font-medium">
                            {DAYS[dayIdx]}, {formatHour(hour)}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {minutes} minutes of focus
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })
                )}
              </div>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
