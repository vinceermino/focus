"use client"

import { useEffect, useRef, useState } from "react"
import { createNote } from "@/app/actions/notes"
import { Send, MessageSquare, X } from "lucide-react"

type Note = {
  id: string
  content: string
  createdAt: Date
}

export function NotesWidget({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState(initialNotes)
  const [pendingContent, setPendingContent] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
      inputRef.current?.focus()
    }
  }, [notes, isOpen])

  // Update internal state when props change, but optimistic updates keep it fresh
  useEffect(() => {
    setNotes(initialNotes)
  }, [initialNotes])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore the shortcut if the user is typing in an input or textarea
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      // Toggle widget with Cmd/Ctrl + Shift + X
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.code === "KeyX" // e.code is more reliable than e.key
      ) {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }

      // Close on Escape if open
      if (e.code === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-xl transition-all duration-300 ease-in-out">
          <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900 p-4">
            <h3 className="text-sm font-medium tracking-wide text-neutral-300">
              Random Thoughts
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {notes.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-sm text-neutral-500">
                No thoughts yet. <br /> Type below to get distractions out of
                your head.
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="flex w-max max-w-[85%] flex-col gap-1 rounded-2xl rounded-bl-sm bg-neutral-800 px-4 py-2 text-sm text-neutral-200"
                >
                  <p className="break-words whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-neutral-800 bg-neutral-900 p-3">
            <form
              ref={formRef}
              action={async (formData) => {
                const content = formData.get("content") as string
                if (!content || !content.trim()) return

                // Optimistic update
                const newNote = {
                  id: Math.random().toString(),
                  content,
                  createdAt: new Date(),
                }
                setNotes((prev) => [...prev, newNote])
                setPendingContent("")

                await createNote(formData)
                formRef.current?.reset()
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                name="content"
                autoComplete="off"
                value={pendingContent}
                onChange={(e) => setPendingContent(e.target.value)}
                placeholder="Dump a thought..."
                className="flex-1 rounded-full border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!pendingContent.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black transition-opacity hover:bg-neutral-200 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <div className="mt-2 text-center text-xs text-neutral-500">
              Press{" "}
              <kbd className="rounded bg-neutral-800 px-1 py-0.5">
                Ctrl+Shift+N
              </kbd>{" "}
              to toggle
            </div>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-800 text-white shadow-lg transition-transform hover:scale-105 hover:bg-neutral-700 active:scale-95"
          title="Open Notes (Ctrl+Shift+N)"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}
