"use client"

import { useState } from "react"
import { Menu, X, BarChart3 } from "lucide-react"
import Link from "next/link"
import { LogoutButton } from "./logout-button"

export function SlideMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="-ml-2 flex items-center justify-center p-2 text-neutral-400 transition-colors hover:text-white"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide Menu */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 transform border-r border-gray-800 bg-black transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-800 p-4">
          <span className="font-semibold text-white">Menu</span>
          <button
            onClick={() => setIsOpen(false)}
            className="-mr-2 p-2 text-neutral-400 transition-colors hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-6 p-6">
          <Link
            href="/analytics"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 text-sm text-neutral-400 transition-colors hover:text-white"
          >
            <BarChart3 className="h-5 w-5" />
            Analytics
          </Link>

          <div onClick={() => setIsOpen(false)}>
            <LogoutButton />
          </div>
        </div>
      </div>
    </>
  )
}
