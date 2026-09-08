import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { ListTodo, Timer, Clock, Flame } from "lucide-react"

interface StatCardsProps {
  summary: {
    totalSessions: number
    totalFocusSeconds: number
    averageSessionSeconds: number
    longestStreakDays: number
  }
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return "0m"

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

function formatAvgDuration(seconds: number): string {
  if (seconds === 0) return "0m 0s"

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}m ${remainingSeconds}s`
}

export function StatCards({ summary }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-neutral-800 bg-neutral-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-neutral-400">
            Total Sessions
          </CardTitle>
          <ListTodo className="h-4 w-4 text-neutral-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {summary.totalSessions}
          </div>
        </CardContent>
      </Card>

      <Card className="border-neutral-800 bg-neutral-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-neutral-400">
            Total Focus Time
          </CardTitle>
          <Timer className="h-4 w-4 text-neutral-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatDuration(summary.totalFocusSeconds)}
          </div>
        </CardContent>
      </Card>

      <Card className="border-neutral-800 bg-neutral-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-neutral-400">
            Average Session
          </CardTitle>
          <Clock className="h-4 w-4 text-neutral-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatAvgDuration(summary.averageSessionSeconds)}
          </div>
        </CardContent>
      </Card>

      <Card className="border-neutral-800 bg-neutral-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-neutral-400">
            Longest Streak
          </CardTitle>
          <Flame className="h-4 w-4 text-neutral-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {summary.longestStreakDays} days
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
