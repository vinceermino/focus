"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Plus,
  X,
  Check,
  SkipForward,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SessionType = "FOCUS" | "SHORT_BREAK" | "LONG_BREAK";
type Tab = "timer" | "tasks";

interface Task {
  id: string;
  name: string;
  description?: string | null;
}

interface UserSettings {
  focusDurationMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
}

interface TimerProps {
  initialTasks: Task[];
  settings: UserSettings;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SESSION_LABELS: Record<SessionType, string> = {
  FOCUS: "Focus",
  SHORT_BREAK: "Short Break",
  LONG_BREAK: "Long Break",
};

const SESSION_COLORS: Record<SessionType, string> = {
  FOCUS: "#6c5ce7",
  SHORT_BREAK: "#00b894",
  LONG_BREAK: "#0984e3",
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function getDuration(type: SessionType, settings: UserSettings): number {
  switch (type) {
    case "FOCUS":
      return settings.focusDurationMinutes * 60;
    case "SHORT_BREAK":
      return settings.shortBreakMinutes * 60;
    case "LONG_BREAK":
      return settings.longBreakMinutes * 60;
  }
}

// ---------------------------------------------------------------------------
// SVG Ring
// ---------------------------------------------------------------------------

const RING_SIZE = 240;
const RING_STROKE = 8;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ProgressRing({
  progress,
  color,
}: {
  progress: number;
  color: string;
}) {
  const offset = RING_CIRCUMFERENCE * (1 - progress);

  return (
    <svg
      width={RING_SIZE}
      height={RING_SIZE}
      className="absolute inset-0 -rotate-90"
    >
      {/* Track */}
      <circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_RADIUS}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={RING_STROKE}
      />
      {/* Progress */}
      <circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_RADIUS}
        fill="none"
        stroke={color}
        strokeWidth={RING_STROKE}
        strokeLinecap="round"
        strokeDasharray={RING_CIRCUMFERENCE}
        strokeDashoffset={offset}
        className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        style={{
          filter: `drop-shadow(0 0 8px ${color}40)`,
        }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Task Select Modal
// ---------------------------------------------------------------------------

function TaskSelectModal({
  tasks,
  onSelect,
  onClose,
  onCreateTask,
}: {
  tasks: Task[];
  onSelect: (task: Task | null) => void;
  onClose: () => void;
  onCreateTask: (name: string) => void;
}) {
  const [newTaskName, setNewTaskName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-[90%] max-w-xs animate-scale-in rounded-xl border border-white/[0.08] bg-[#1e2040] p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Select a task</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-[#8b8ca7] transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-48 space-y-1 overflow-y-auto">
          <button
            onClick={() => onSelect(null)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#8b8ca7] transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            No task
          </button>
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => onSelect(task)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#c8c9e0] transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <div className="h-2 w-2 rounded-full bg-[#6c5ce7]" />
              {task.name}
            </button>
          ))}
        </div>

        {isAdding ? (
          <div className="mt-3 flex gap-2">
            <input
              autoFocus
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTaskName.trim()) {
                  onCreateTask(newTaskName.trim());
                  setNewTaskName("");
                  setIsAdding(false);
                }
              }}
              placeholder="Task name..."
              className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-sm text-white placeholder-[#55567a] outline-none focus:border-[#6c5ce7]/50"
            />
            <button
              onClick={() => {
                if (newTaskName.trim()) {
                  onCreateTask(newTaskName.trim());
                  setNewTaskName("");
                  setIsAdding(false);
                }
              }}
              className="rounded-lg bg-[#6c5ce7] p-1.5 text-white transition-colors hover:bg-[#5a4bd5]"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="mt-3 flex w-full items-center gap-2 rounded-lg border border-dashed border-white/[0.1] px-3 py-2 text-sm text-[#8b8ca7] transition-colors hover:border-[#6c5ce7]/30 hover:text-[#a29bfe]"
          >
            <Plus className="h-3.5 w-3.5" />
            New task
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task List Panel
// ---------------------------------------------------------------------------

function TaskListPanel({
  tasks,
  onCreateTask,
}: {
  tasks: Task[];
  onCreateTask: (name: string) => void;
}) {
  const [newTaskName, setNewTaskName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="w-full animate-fade-in space-y-3 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Your Tasks</h2>
        <span className="text-xs text-[#8b8ca7]">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-2">
        {tasks.length === 0 && !isAdding && (
          <p className="py-8 text-center text-sm text-[#55567a]">
            No tasks yet. Create one to get started!
          </p>
        )}
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 transition-colors hover:bg-white/[0.06]"
          >
            <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe]" />
            <span className="flex-1 text-sm text-[#c8c9e0]">{task.name}</span>
          </div>
        ))}
      </div>

      {isAdding ? (
        <div className="flex gap-2">
          <input
            autoFocus
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newTaskName.trim()) {
                onCreateTask(newTaskName.trim());
                setNewTaskName("");
                setIsAdding(false);
              }
              if (e.key === "Escape") {
                setIsAdding(false);
                setNewTaskName("");
              }
            }}
            placeholder="Task name..."
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-[#55567a] outline-none focus:border-[#6c5ce7]/50"
          />
          <button
            onClick={() => {
              if (newTaskName.trim()) {
                onCreateTask(newTaskName.trim());
                setNewTaskName("");
                setIsAdding(false);
              }
            }}
            className="rounded-xl bg-[#6c5ce7] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5a4bd5]"
          >
            Add
          </button>
          <button
            onClick={() => {
              setIsAdding(false);
              setNewTaskName("");
            }}
            className="rounded-xl border border-white/[0.08] px-3 py-2.5 text-sm text-[#8b8ca7] transition-colors hover:bg-white/[0.06]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.1] py-3 text-sm text-[#8b8ca7] transition-all hover:border-[#6c5ce7]/30 hover:text-[#a29bfe]"
        >
          <Plus className="h-4 w-4" />
          Add task
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Timer Component
// ---------------------------------------------------------------------------

export function Timer({ initialTasks, settings }: TimerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("timer");
  const [sessionType, setSessionType] = useState<SessionType>("FOCUS");
  const [totalSeconds, setTotalSeconds] = useState(
    getDuration("FOCUS", settings)
  );
  const [secondsLeft, setSecondsLeft] = useState(
    getDuration("FOCUS", settings)
  );
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [completedSessions, setCompletedSessions] = useState(0);
  const activeSessionId = useRef<string | null>(null);

  // Audio notification
  const playNotification = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.3;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio not supported
    }
  }, []);

  // Timer tick
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // When timer reaches 0
  useEffect(() => {
    if (secondsLeft !== 0 || !isRunning) return;

    setIsRunning(false);
    playNotification();

    // End the session in the API
    if (activeSessionId.current) {
      fetch(`/api/sessions/${activeSessionId.current}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "COMPLETED",
          actualDurationSeconds: totalSeconds,
        }),
      }).catch(() => {});
      activeSessionId.current = null;
    }

    // Auto-transition
    if (sessionType === "FOCUS") {
      const next = completedSessions + 1;
      setCompletedSessions(next);
      if (next >= settings.sessionsBeforeLongBreak) {
        switchSession("LONG_BREAK");
        setCompletedSessions(0);
      } else {
        switchSession("SHORT_BREAK");
      }
    } else {
      switchSession("FOCUS");
    }
  }, [secondsLeft, isRunning]);

  const switchSession = useCallback(
    (type: SessionType) => {
      const dur = getDuration(type, settings);
      setSessionType(type);
      setTotalSeconds(dur);
      setSecondsLeft(dur);
      setIsRunning(false);
      activeSessionId.current = null;
    },
    [settings]
  );

  const startTimer = useCallback(async () => {
    setIsRunning(true);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionType,
          plannedDurationSeconds: totalSeconds,
          taskId: selectedTask?.id || null,
        }),
      });
      const data = await res.json();
      activeSessionId.current = data.id;
    } catch {
      // Continue timer even if API fails
    }
  }, [sessionType, totalSeconds, selectedTask]);

  const pauseTimer = useCallback(async () => {
    setIsRunning(false);

    if (activeSessionId.current) {
      fetch(`/api/sessions/${activeSessionId.current}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "INTERRUPTED",
          actualDurationSeconds: totalSeconds - secondsLeft,
        }),
      }).catch(() => {});
      activeSessionId.current = null;
    }
  }, [totalSeconds, secondsLeft]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    const dur = getDuration(sessionType, settings);
    setTotalSeconds(dur);
    setSecondsLeft(dur);

    if (activeSessionId.current) {
      fetch(`/api/sessions/${activeSessionId.current}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "INTERRUPTED",
          actualDurationSeconds: totalSeconds - secondsLeft,
        }),
      }).catch(() => {});
      activeSessionId.current = null;
    }
  }, [sessionType, settings, totalSeconds, secondsLeft]);

  const skipSession = useCallback(() => {
    if (activeSessionId.current) {
      fetch(`/api/sessions/${activeSessionId.current}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "INTERRUPTED",
          actualDurationSeconds: totalSeconds - secondsLeft,
        }),
      }).catch(() => {});
      activeSessionId.current = null;
    }

    if (sessionType === "FOCUS") {
      const next = completedSessions + 1;
      setCompletedSessions(next);
      if (next >= settings.sessionsBeforeLongBreak) {
        switchSession("LONG_BREAK");
        setCompletedSessions(0);
      } else {
        switchSession("SHORT_BREAK");
      }
    } else {
      switchSession("FOCUS");
    }
  }, [
    sessionType,
    completedSessions,
    settings,
    switchSession,
    totalSeconds,
    secondsLeft,
  ]);

  const createTask = useCallback(async (name: string) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const task = await res.json();
      setTasks((prev) => [task, ...prev]);
    } catch {
      // Ignore
    }
  }, []);

  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
  const currentColor = SESSION_COLORS[sessionType];

  return (
    <div className="w-full max-w-md animate-fade-in">
      {/* Tab Switcher */}
      <div className="relative mb-1 flex rounded-xl border border-white/[0.06] bg-[#1a1b2e]/60 p-1">
        <div
          className="absolute left-1 top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-lg bg-white/[0.08] transition-transform duration-300 ease-out"
          style={{
            transform:
              activeTab === "tasks" ? "translateX(100%)" : "translateX(0)",
          }}
        />
        <button
          id="tab-timer"
          onClick={() => setActiveTab("timer")}
          className={`relative z-10 flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            activeTab === "timer" ? "text-white" : "text-[#55567a]"
          }`}
        >
          Timer
        </button>
        <button
          id="tab-tasks"
          onClick={() => setActiveTab("tasks")}
          className={`relative z-10 flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            activeTab === "tasks" ? "text-white" : "text-[#55567a]"
          }`}
        >
          Tasks
        </button>
      </div>

      {/* Content Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#1a1b2e]/80 shadow-2xl backdrop-blur-xl">
        {activeTab === "timer" ? (
          <div className="relative flex flex-col items-center px-6 pb-8 pt-10">
            {/* Session Type Selector */}
            <div className="mb-8 flex gap-1 rounded-lg bg-white/[0.04] p-1">
              {(["FOCUS", "SHORT_BREAK", "LONG_BREAK"] as SessionType[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => !isRunning && switchSession(type)}
                    disabled={isRunning}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                      sessionType === type
                        ? "bg-white/[0.1] text-white shadow-sm"
                        : "text-[#55567a] hover:text-[#8b8ca7] disabled:opacity-50"
                    }`}
                  >
                    {SESSION_LABELS[type]}
                  </button>
                )
              )}
            </div>

            {/* Timer Ring */}
            <div
              className="relative flex items-center justify-center"
              style={{ width: RING_SIZE, height: RING_SIZE }}
            >
              <ProgressRing progress={progress} color={currentColor} />

              {/* Center content */}
              <div className="relative z-10 flex flex-col items-center">
                <span
                  className="mb-1 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: currentColor }}
                >
                  {SESSION_LABELS[sessionType]}
                </span>
                <span className="font-mono text-5xl font-bold tabular-nums text-white">
                  {formatTime(secondsLeft)}
                </span>
                <button
                  id="select-task-btn"
                  onClick={() => !isRunning && setShowTaskModal(true)}
                  disabled={isRunning}
                  className="mt-2 flex items-center gap-1 text-xs text-[#6c5ce7] transition-colors hover:text-[#a29bfe] disabled:opacity-50"
                >
                  {selectedTask ? selectedTask.name : "Select a task"}
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              {/* Task Modal */}
              {showTaskModal && (
                <TaskSelectModal
                  tasks={tasks}
                  onSelect={(task) => {
                    setSelectedTask(task);
                    setShowTaskModal(false);
                  }}
                  onClose={() => setShowTaskModal(false)}
                  onCreateTask={createTask}
                />
              )}
            </div>

            {/* Session Progress Dots */}
            <div className="mt-6 flex gap-2">
              {Array.from({
                length: settings.sessionsBeforeLongBreak,
              }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    i < completedSessions
                      ? "bg-[#6c5ce7] shadow-sm shadow-[#6c5ce7]/50"
                      : "bg-white/[0.1]"
                  }`}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="mt-6 flex items-center gap-4">
              <button
                id="reset-btn"
                onClick={resetTimer}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] text-[#8b8ca7] transition-all hover:bg-white/[0.06] hover:text-white"
                title="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                id="play-pause-btn"
                onClick={isRunning ? pauseTimer : startTimer}
                className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${currentColor}, ${currentColor}cc)`,
                  boxShadow: `0 8px 32px ${currentColor}40`,
                }}
              >
                {isRunning ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="ml-0.5 h-6 w-6" />
                )}
              </button>

              <button
                id="skip-btn"
                onClick={skipSession}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] text-[#8b8ca7] transition-all hover:bg-white/[0.06] hover:text-white"
                title="Skip"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <TaskListPanel tasks={tasks} onCreateTask={createTask} />
        )}
      </div>
    </div>
  );
}
