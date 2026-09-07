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
  const [showConfirm, setShowConfirm] = useState(false)
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

  const endSession = useCallback(async () => {
    if (!activeSessionId.current) return

    const sessionId = activeSessionId.current
    const duration = elapsedSecondsRef.current

    await fetch(`/api/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        durationSeconds: duration,
      }),
    }).catch(() => {})
  }, [])

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
  }, [])

  const handleResetClick = useCallback(() => {
    if (elapsedSeconds === 0) return
    setIsRunning(false)
    setShowConfirm(true)
  }, [elapsedSeconds])

  const confirmReset = useCallback(async () => {
    await endSession()
    activeSessionId.current = null
    elapsedSecondsRef.current = 0
    setElapsedSeconds(0)
    setShowConfirm(false)
  }, [endSession])

  const cancelReset = useCallback(() => {
    setShowConfirm(false)
  }, [])

  return (
    <section className="w-full max-w-sm text-center">
      <p className="text-xs font-medium tracking-[0.3em] text-neutral-500 uppercase">
        Focus
      </p>
      <time className="mt-6 block font-mono text-7xl font-light tracking-tight text-white tabular-nums">
        {formatTime(elapsedSeconds)}
      </time>

      {showConfirm ? (
        <div className="mt-10 flex flex-col items-center gap-4">
          <p className="text-sm text-neutral-400">End this session?</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={cancelReset}
              className="rounded-full border border-neutral-700 px-5 py-2 text-xs font-medium text-neutral-400 transition-colors hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmReset}
              className="rounded-full bg-white px-5 py-2 text-xs font-medium text-black transition-opacity hover:opacity-80"
            >
              End session
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-10 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={handleResetClick}
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
      )}
    </section>
  )
}
