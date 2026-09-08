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
  CartesianGrid,
} from "recharts"
import { format, parseISO } from "date-fns"

interface FocusTimeChartProps {
  dailyData: Array<{ date: string; totalSeconds: number; sessionCount: number }>
  period: "week" | "month" | "year"
}

export function FocusTimeChart({ dailyData, period }: FocusTimeChartProps) {
  const data = dailyData.map((d) => {
    // During tab transition, `period` might be "year" while `d.date` is still "2023-10-25" (from "week")
    // If it's a month string like "2023-10", append "-01" so parseISO can read it.
    const dateString = d.date.length === 7 ? `${d.date}-01` : d.date
    const parsedDate = parseISO(dateString)

    return {
      ...d,
      minutes: Math.round(d.totalSeconds / 60),
      label:
        period === "year"
          ? format(parsedDate, "MMM")
          : period === "week"
            ? format(parsedDate, "EEE")
            : format(parsedDate, "d"),
    }
  })

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const dateString = data.date.length === 7 ? `${data.date}-01` : data.date
      const parsedDate = parseISO(dateString)

      return (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-sm shadow-lg">
          <p className="mb-1 font-medium text-white">
            {period === "year"
              ? format(parsedDate, "MMMM yyyy")
              : format(parsedDate, "MMMM d, yyyy")}
          </p>
          <div className="flex flex-col gap-1 text-neutral-400">
            <span>
              Focus Time:{" "}
              <span className="font-medium text-white">{data.minutes}m</span>
            </span>
            <span>
              Sessions:{" "}
              <span className="font-medium text-white">
                {data.sessionCount}
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
          Focus Minutes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#262626"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#737373", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#737373", fontSize: 12 }}
                tickFormatter={(value) => `${value}m`}
              />
              <Tooltip
                cursor={{ fill: "#262626" }}
                content={<CustomTooltip />}
              />
              <Bar
                dataKey="minutes"
                fill="#e5e5e5"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
