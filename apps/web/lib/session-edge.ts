// lib/session-edge.ts
import { jwtVerify } from "jose"

const SESSION_COOKIE = "focus_session"

function getSecretKey() {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error("SESSION_SECRET env var is required")
  return new TextEncoder().encode(secret)
}

export async function getSessionFromRequest(req: Request) {
  const cookieHeader = req.headers.get("cookie") || ""
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map((c) => {
      const [key, ...v] = c.split("=")
      return [key, v.join("=")]
    })
  )

  const token = cookies[SESSION_COOKIE]
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    return { userId: payload.userId as string }
  } catch {
    return null
  }
}
