"use client"

import { Pause, Play, RotateCcw } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

const STORAGE_KEY = "focus_timer_state"

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
  const accumulatedRef = useRef(0)
  const startTimeRef = useRef<number | null>(null)
  const elapsedSecondsRef = useRef(0)

  const syncToStorage = useCallback((running: boolean) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        activeSessionId: activeSessionId.current,
        isRunning: running,
        startTime: startTimeRef.current,
        accumulatedSeconds: accumulatedRef.current,
      })
    )
  }, [])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const state = JSON.parse(stored)
        if (state) {
          activeSessionId.current = state.activeSessionId || null
          accumulatedRef.current = state.accumulatedSeconds || 0
          startTimeRef.current = state.startTime || null

          let total = accumulatedRef.current
          if (state.isRunning && state.startTime) {
            const now = Date.now()
            const diff = Math.floor((now - state.startTime) / 1000)
            total += diff
            setIsRunning(true)
          } else {
            setIsRunning(false)
          }
          setElapsedSeconds(total)
          elapsedSecondsRef.current = total
        }
      }
    } catch (e) {
      console.error("Failed to parse timer state", e)
    }
  }, [])

  useEffect(() => {
    document.title = `${formatTime(elapsedSeconds)} · Focus`
    return () => {
      document.title = "Focus"
    }
  }, [elapsedSeconds])

  useEffect(() => {
    if (!isRunning) return

    const interval = window.setInterval(() => {
      if (startTimeRef.current) {
        const now = Date.now()
        const diff = Math.floor((now - startTimeRef.current) / 1000)
        const total = accumulatedRef.current + diff
        setElapsedSeconds(total)
        elapsedSecondsRef.current = total
      }
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isRunning])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        isRunning &&
        startTimeRef.current
      ) {
        const now = Date.now()
        const diff = Math.floor((now - startTimeRef.current) / 1000)
        const total = accumulatedRef.current + diff
        setElapsedSeconds(total)
        elapsedSecondsRef.current = total
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange)
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
    startTimeRef.current = Date.now()
    syncToStorage(true)

    if (activeSessionId.current) return

    try {
      const response = await fetch("/api/sessions", { method: "POST" })
      if (!response.ok) return

      const timerSession = await response.json()
      activeSessionId.current = timerSession.id
      syncToStorage(true)
    } catch {
      // The timer continues locally if saving a session is unavailable.
    }
  }, [syncToStorage])

  const pauseTimer = useCallback(() => {
    setIsRunning(false)
    if (startTimeRef.current) {
      const now = Date.now()
      const diff = Math.floor((now - startTimeRef.current) / 1000)
      accumulatedRef.current += diff
      startTimeRef.current = null

      const total = accumulatedRef.current
      setElapsedSeconds(total)
      elapsedSecondsRef.current = total
    }
    syncToStorage(false)
  }, [syncToStorage])

  const handleResetClick = useCallback(() => {
    if (elapsedSeconds === 0) return
    pauseTimer()
    setShowConfirm(true)
  }, [elapsedSeconds, pauseTimer])

  const confirmReset = useCallback(async () => {
    await endSession()
    activeSessionId.current = null
    accumulatedRef.current = 0
    startTimeRef.current = null
    elapsedSecondsRef.current = 0
    setElapsedSeconds(0)
    setIsRunning(false)
    setShowConfirm(false)
    localStorage.removeItem(STORAGE_KEY)
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

      {/* Wrapper for smooth transition between confirm and controls */}
      <div className="relative mt-10 h-24">
        {/* Confirmation dialog – always rendered, toggled with opacity */}
        <div
          className={`absolute inset-0 flex flex-col items-center gap-4 transition-opacity duration-300 ease-in-out ${
            showConfirm ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={!showConfirm}
        >
          <p className="text-sm text-neutral-400">End this session?</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={cancelReset}
              className="rounded-full border border-neutral-700 px-5 py-2 text-xs font-medium text-neutral-400 transition-colors hover:text-white"
              tabIndex={showConfirm ? 0 : -1}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmReset}
              className="rounded-full bg-white px-5 py-2 text-xs font-medium text-black transition-opacity hover:opacity-80"
              tabIndex={showConfirm ? 0 : -1}
            >
              End session
            </button>
          </div>
        </div>

        {/* Timer controls – always rendered, toggled with opacity */}
        <div
          className={`absolute inset-0 flex items-center justify-center gap-6 transition-opacity duration-300 ease-in-out ${
            showConfirm ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          aria-hidden={showConfirm}
        >
          <button
            type="button"
            onClick={handleResetClick}
            className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-600 transition-colors hover:text-white"
            title="Reset timer"
            tabIndex={showConfirm ? -1 : 0}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={isRunning ? pauseTimer : startTimer}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-neutral-700 text-white transition-colors hover:bg-white hover:text-black"
            title={isRunning ? "Pause timer" : "Start timer"}
            tabIndex={showConfirm ? -1 : 0}
          >
            {isRunning ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="ml-0.5 h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </section>
  )
}
