"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/lib/actions";
import { Eye, EyeOff, Timer } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="animate-fade-in">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] shadow-lg shadow-[#6c5ce7]/25">
          <Timer className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-[#8b8ca7]">
          Sign in to continue your focus sessions
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#1a1b2e]/80 p-8 shadow-2xl backdrop-blur-xl">
        {state?.error && (
          <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-[#c8c9e0]"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-[#55567a] outline-none transition-all duration-200 focus:border-[#6c5ce7]/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-[#6c5ce7]/20"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-[#c8c9e0]"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 pr-11 text-sm text-white placeholder-[#55567a] outline-none transition-all duration-200 focus:border-[#6c5ce7]/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-[#6c5ce7]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#55567a] transition-colors hover:text-[#c8c9e0]"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] py-3 text-sm font-semibold text-white shadow-lg shadow-[#6c5ce7]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#6c5ce7]/30 disabled:opacity-60"
          >
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#8b8ca7]">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-[#a29bfe] transition-colors hover:text-[#6c5ce7]"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
