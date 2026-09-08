"use client"

import Link from "next/link"
import { SubmitEvent, useState } from "react"
import { createClient } from "@/utils/supabase/client"

const supabase = createClient()

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email")
    const password = formData.get("password")
    const confirmPassword = formData.get("confirmPassword")

    // Ensure all fields are strings (FormData can return File | string)
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      setError("Invalid form data")
      setIsPending(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsPending(false)
      return
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      })

      if (signUpError) {
        setError(signUpError.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      // Handle any unexpected errors (network, etc.)
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      )
    } finally {
      setIsPending(false)
    }
  }

  if (success) {
    return (
      <div>
        <h2>Check your email!</h2>
        <p>We&apos;ve sent a confirmation link to finish setting up your account.</p>
        <p>
          <Link href="/login">Go to sign in</Link>
        </p>
      </div>
    )
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
            placeholder="you@example.com"
          />
        </p>

        <p>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </p>

        <p>
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Re-enter your password"
          />
        </p>

        <button type="submit" disabled={isPending}>
          {isPending ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p>
        <Link href="/login">Sign in</Link>
      </p>
    </div>
  )
}
