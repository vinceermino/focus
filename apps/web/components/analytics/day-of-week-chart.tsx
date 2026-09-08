"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

interface DayOfWeekChartProps {
  dayOfWeekPatterns: Array<{
    dayOfWeek: number
    averageSeconds: number
    totalSeconds: number
  }>
}

const DAYS_MAP = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function DayOfWeekChart({ dayOfWeekPatterns }: DayOfWeekChartProps) {
  // We want to sort the days starting from Monday for typical work week view
  const displayOrder = [1, 2, 3, 4, 5, 6, 0] // Mon-Sun

  const data = displayOrder.map((dayIdx) => {
    const entry = dayOfWeekPatterns.find((d) => d.dayOfWeek === dayIdx)
    return {
      name: DAYS_MAP[dayIdx],
      minutes: entry ? Math.round(entry.averageSeconds / 60) : 0,
      totalMinutes: entry ? Math.round(entry.totalSeconds / 60) : 0,
    }
  })

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-sm shadow-lg">
          <p className="mb-1 font-medium text-white">{label}</p>
          <div className="flex flex-col gap-1 text-neutral-400">
            <span>
              Avg:{" "}
              <span className="font-medium text-white">{data.minutes}m</span>
            </span>
            <span>
              Total:{" "}
              <span className="font-medium text-white">
                {data.totalMinutes}m
              </span>
            </span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="border-neutral-800 bg-neutral-900">
      <CardHeader>
        <CardTitle className="text-base font-medium text-neutral-200">
          Productivity by Day (Average)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a3a3a3", fontSize: 12 }}
                width={40}
              />
              <Tooltip
                cursor={{ fill: "#262626" }}
                content={<CustomTooltip />}
              />
              <Bar
                dataKey="minutes"
                fill="#737373"
                radius={[0, 4, 4, 0]}
                barSize={16}
                activeBar={{ fill: "#e5e5e5" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
