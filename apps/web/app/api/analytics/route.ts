import { cookies } from "next/headers"
import { NextRequest } from "next/server"
import { prisma } from "@workspace/db"
import { createClient } from "@/utils/supabase/server"
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
  format,
  parseISO,
  differenceInCalendarDays,
  getDay,
  getHours,
  eachDayOfInterval,
  eachMonthOfInterval,
} from "date-fns"

export async function GET(request: NextRequest) {
  const supabase = await createClient(await cookies())
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  })

  if (!profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 })
  }

  const searchParams = request.nextUrl.searchParams
  const period = searchParams.get("period") || "week" // week, month, year
  const dateParam = searchParams.get("date")

  const referenceDate = dateParam ? parseISO(dateParam) : new Date()

  let startDate: Date
  let endDate: Date

  if (period === "week") {
    startDate = startOfWeek(referenceDate, { weekStartsOn: 1 }) // Monday start
    endDate = endOfWeek(referenceDate, { weekStartsOn: 1 })
  } else if (period === "month") {
    startDate = startOfMonth(referenceDate)
    endDate = endOfMonth(referenceDate)
  } else {
    startDate = startOfYear(referenceDate)
    endDate = endOfYear(referenceDate)
  }

  // Fetch all completed sessions for streak and total stats
  const allSessions = await prisma.focusSession.findMany({
    where: {
      profileId: profile.id,
      durationSeconds: { not: null },
    },
    orderBy: { startedAt: "asc" },
  })

  // Calculate Streak
  let longestStreak = 0
  let currentStreak = 0
  let lastDate: Date | null = null

  const uniqueDates = Array.from(
    new Set(allSessions.map((s) => format(s.startedAt, "yyyy-MM-dd")))
  ).sort()

  for (const dateStr of uniqueDates) {
    const date = parseISO(dateStr)
    if (!lastDate) {
      currentStreak = 1
    } else {
      const diff = differenceInCalendarDays(date, lastDate)
      if (diff === 1) {
        currentStreak++
      } else if (diff > 1) {
        currentStreak = 1
      }
    }
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak
    }
    lastDate = date
  }

  const periodSessions = allSessions.filter((s) =>
    isWithinInterval(s.startedAt, { start: startDate, end: endDate })
  )

  const totalSessions = periodSessions.length
  const totalFocusSeconds = periodSessions.reduce(
    (acc, s) => acc + (s.durationSeconds || 0),
    0
  )
  const averageSessionSeconds =
    totalSessions > 0 ? Math.round(totalFocusSeconds / totalSessions) : 0

  // Daily Data for Charts
  const dailyDataMap = new Map<
    string,
    { totalSeconds: number; sessionCount: number }
  >()

  if (period === "week" || period === "month") {
    const days = eachDayOfInterval({ start: startDate, end: endDate })
    days.forEach((d) => {
      dailyDataMap.set(format(d, "yyyy-MM-dd"), {
        totalSeconds: 0,
        sessionCount: 0,
      })
    })

    periodSessions.forEach((s) => {
      const key = format(s.startedAt, "yyyy-MM-dd")
      if (dailyDataMap.has(key)) {
        const entry = dailyDataMap.get(key)!
        entry.totalSeconds += s.durationSeconds || 0
        entry.sessionCount += 1
      }
    })
  } else if (period === "year") {
    const months = eachMonthOfInterval({ start: startDate, end: endDate })
    months.forEach((m) => {
      dailyDataMap.set(format(m, "yyyy-MM"), {
        totalSeconds: 0,
        sessionCount: 0,
      })
    })

    periodSessions.forEach((s) => {
      const key = format(s.startedAt, "yyyy-MM")
      if (dailyDataMap.has(key)) {
        const entry = dailyDataMap.get(key)!
        entry.totalSeconds += s.durationSeconds || 0
        entry.sessionCount += 1
      }
    })
  }

  const dailyData = Array.from(dailyDataMap.entries()).map(([date, data]) => ({
    date,
    ...data,
  }))

  // Hourly Distribution (Heatmap) - using all data in the period, or globally? Let's use period data.
  // Actually, heatmap across the period is good.
  const hourlyDistribution: Array<{
    dayOfWeek: number
    hour: number
    totalSeconds: number
  }> = []

  // Initialize heatmap 0-6 (Sun-Sat), 0-23
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      hourlyDistribution.push({ dayOfWeek: d, hour: h, totalSeconds: 0 })
    }
  }

  // Day of Week Patterns
  const dayOfWeekPatterns = Array.from({ length: 7 }, (_, i) => ({
    dayOfWeek: i,
    totalSeconds: 0,
    sessionCount: 0,
    averageSeconds: 0,
  }))

  periodSessions.forEach((s) => {
    const day = getDay(s.startedAt)
    const hour = getHours(s.startedAt)

    // Update Heatmap
    const heatEntry = hourlyDistribution.find(
      (e) => e.dayOfWeek === day && e.hour === hour
    )
    if (heatEntry) {
      heatEntry.totalSeconds += s.durationSeconds || 0
    }

    // Update Patterns
    if (dayOfWeekPatterns[day]) {
      dayOfWeekPatterns[day].totalSeconds += s.durationSeconds || 0
      dayOfWeekPatterns[day].sessionCount += 1
    }
  })

  dayOfWeekPatterns.forEach((p) => {
    p.averageSeconds =
      p.sessionCount > 0 ? Math.round(p.totalSeconds / p.sessionCount) : 0
  })

  // Peak Hours Insight (rolling 2-hour window on hourly totals)
  let maxRolling = -1
  let peakStartHour = 0
  let peakEndHour = 2

  const hourTotals = new Array(24).fill(0)
  hourlyDistribution.forEach((h) => {
    hourTotals[h.hour] += h.totalSeconds
  })

  for (let i = 0; i < 23; i++) {
    const rolling = hourTotals[i] + hourTotals[i + 1]
    if (rolling > maxRolling) {
      maxRolling = rolling
      peakStartHour = i
      peakEndHour = i + 2
    }
  }

  const formatHour = (h: number) => {
    const ampm = h >= 12 ? "PM" : "AM"
    const h12 = h % 12 || 12
    return `${h12}:00 ${ampm}`
  }

  const peakHours = {
    startHour: peakStartHour,
    endHour: peakEndHour,
    label: `${formatHour(peakStartHour)} - ${formatHour(peakEndHour)}`,
  }

  return Response.json({
    summary: {
      totalSessions,
      totalFocusSeconds,
      averageSessionSeconds,
      longestStreakDays: longestStreak,
    },
    dailyData,
    hourlyDistribution,
    dayOfWeekPatterns,
    peakHours,
  })
}
