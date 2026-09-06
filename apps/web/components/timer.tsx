"use client"

import { Pause, Play, RotateCcw } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`
  }

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`
}

export function Timer() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const activeSessionId = useRef<string | null>(null)
  const elapsedSecondsRef = useRef(0)

  useEffect(() => {
    document.title = `${formatTime(elapsedSeconds)} · Focus`

    return () => {
      document.title = "Focus"
    }
  }, [elapsedSeconds])

  useEffect(() => {
    if (!isRunning) return

    const interval = window.setInterval(() => {
      setElapsedSeconds((current) => {
        const next = current + 1
        elapsedSecondsRef.current = next
        return next
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isRunning])

  const saveElapsedTime = useCallback(
    (status?: "COMPLETED" | "INTERRUPTED") => {
      if (!activeSessionId.current) return

      fetch(`/api/sessions/${activeSessionId.current}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actualDurationSeconds: elapsedSecondsRef.current,
          ...(status ? { status } : {}),
        }),
      }).catch(() => {})
    },
    []
  )

  const startTimer = useCallback(async () => {
    setIsRunning(true)

    if (activeSessionId.current) return

    try {
      const response = await fetch("/api/sessions", { method: "POST" })
      if (!response.ok) return

      const timerSession = await response.json()
      activeSessionId.current = timerSession.id
    } catch {
      // The timer continues locally if saving a session is unavailable.
    }
  }, [])

  const pauseTimer = useCallback(() => {
    setIsRunning(false)
    saveElapsedTime()
  }, [saveElapsedTime])

  const resetTimer = useCallback(() => {
    setIsRunning(false)
    saveElapsedTime("INTERRUPTED")
    activeSessionId.current = null
    elapsedSecondsRef.current = 0
    setElapsedSeconds(0)
  }, [saveElapsedTime])

  return (
    <section className="w-full max-w-sm text-center">
      <p className="text-xs font-medium tracking-[0.3em] text-neutral-500 uppercase">
        Focus
      </p>
      <time className="mt-6 block font-mono text-7xl font-light tracking-tight text-white tabular-nums">
        {formatTime(elapsedSeconds)}
      </time>

      <div className="mt-10 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={resetTimer}
          className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-600 transition-colors hover:text-white"
          title="Reset timer"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={isRunning ? pauseTimer : startTimer}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-neutral-700 text-white transition-colors hover:bg-white hover:text-black"
          title={isRunning ? "Pause timer" : "Start timer"}
        >
          {isRunning ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="ml-0.5 h-5 w-5" />
          )}
        </button>
      </div>
    </section>
  )
}
