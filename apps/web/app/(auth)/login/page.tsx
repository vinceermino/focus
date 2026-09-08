"use client"

import Link from "next/link"
import { SubmitEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

const supabase = createClient()

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email")
    const password = formData.get("password")

    // Type validation
    if (typeof email !== "string" || typeof password !== "string") {
      setError("Invalid form data")
      setIsPending(false)
      return
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
      } else {
        // Successful login – redirect to dashboard/home
        router.push("/")
        router.refresh() // optional: refresh server components
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <p>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </p>

        <p>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </p>

        <button type="submit" disabled={isPending}>
          {isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p>
        <Link href="/signup">Create Account</Link>
      </p>
    </div>
  )
}
