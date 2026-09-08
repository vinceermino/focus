"use client"

import { useState, useEffect } from "react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { StatCards } from "./stat-cards"
import { FocusTimeChart } from "./focus-time-chart"
import { HourlyHeatmap } from "./hourly-heatmap"
import { DayOfWeekChart } from "./day-of-week-chart"
import { PeakHoursInsight } from "./peak-hours-insight"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  format,
  subWeeks,
  addWeeks,
  subMonths,
  addMonths,
  subYears,
  addYears,
} from "date-fns"
import { Button } from "@workspace/ui/components/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export type AnalyticsData = {
  summary: {
    totalSessions: number
    totalFocusSeconds: number
    averageSessionSeconds: number
    longestStreakDays: number
  }
  dailyData: Array<{ date: string; totalSeconds: number; sessionCount: number }>
  hourlyDistribution: Array<{
    dayOfWeek: number
    hour: number
    totalSeconds: number
  }>
  dayOfWeekPatterns: Array<{
    dayOfWeek: number
    averageSeconds: number
    totalSeconds: number
  }>
  peakHours: { startHour: number; endHour: number; label: string }
}

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("week")
  const [referenceDate, setReferenceDate] = useState<Date>(new Date())
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/analytics?period=${period}&date=${referenceDate.toISOString()}`
        )
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (error) {
        console.error("Failed to fetch analytics", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [period, referenceDate])

  const navigateDate = (direction: "prev" | "next") => {
    if (period === "week") {
      setReferenceDate((prev) =>
        direction === "prev" ? subWeeks(prev, 1) : addWeeks(prev, 1)
      )
    } else if (period === "month") {
      setReferenceDate((prev) =>
        direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)
      )
    } else {
      setReferenceDate((prev) =>
        direction === "prev" ? subYears(prev, 1) : addYears(prev, 1)
      )
    }
  }

  const resetDate = () => setReferenceDate(new Date())

  const getDateLabel = () => {
    if (period === "week") {
      return `Week of ${format(referenceDate, "MMM d, yyyy")}`
    } else if (period === "month") {
      return format(referenceDate, "MMMM yyyy")
    } else {
      return format(referenceDate, "yyyy")
    }
  }

  if (loading && !data) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-32 w-full rounded-xl bg-neutral-800"
            />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl bg-neutral-800" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-8">
      {data && <StatCards summary={data.summary} />}

      <div className="space-y-4">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Tabs
            value={period}
            onValueChange={(v) => setPeriod(v as any)}
            className="w-full sm:w-auto"
          >
            <TabsList className="border border-neutral-800 bg-neutral-900 text-neutral-400">
              <TabsTrigger
                value="week"
                className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white"
              >
                Weekly
              </TabsTrigger>
              <TabsTrigger
                value="month"
                className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white"
              >
                Monthly
              </TabsTrigger>
              <TabsTrigger
                value="year"
                className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white"
              >
                Yearly
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDate("prev")}
              className="border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={resetDate}
              className="w-[180px] font-mono text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              {getDateLabel()}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDate("next")}
              className="border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {data && (
          <>
            <FocusTimeChart dailyData={data.dailyData} period={period} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <HourlyHeatmap hourlyDistribution={data.hourlyDistribution} />
              </div>
              <div className="space-y-4">
                <DayOfWeekChart dayOfWeekPatterns={data.dayOfWeekPatterns} />
                <PeakHoursInsight peakHours={data.peakHours} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
