// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionFromRequest } from "./apps/web/lib/session-edge"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const session = await getSessionFromRequest(req)

  // 1. If user is not logged in and tries to access a protected route, redirect to /login
  const protectedRoutes = ["/dashboard", "/profile", "/settings"] // add your protected paths
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname) // optional: remember where they wanted to go
    return NextResponse.redirect(loginUrl)
  }

  // 2. If user is already logged in and tries to visit /login, redirect to /dashboard (or home)
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // 3. Otherwise, continue
  return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - API routes (if they handle their own auth, or you want them public)
     * - login page (you don't need middleware on /login itself)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api|login).*)",
  ],
}
