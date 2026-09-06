import { cookies } from "next/headers"
import { NextRequest } from "next/server"
import { prisma, SessionStatus } from "@workspace/db"
import { createClient } from "@/utils/supabase/server"

const terminalStatuses = new Set<SessionStatus>([
  SessionStatus.COMPLETED,
  SessionStatus.INTERRUPTED,
])

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient(await cookies())
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const status = body.status
  const durationSeconds = body.durationSeconds

  if (
    (status !== undefined && !Object.values(SessionStatus).includes(status)) ||
    (durationSeconds !== undefined &&
      (!Number.isInteger(durationSeconds) || durationSeconds < 0))
  ) {
    return Response.json(
      { error: "Invalid focus session update" },
      { status: 400 }
    )
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  })

  if (!profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 })
  }

  const focusSession = await prisma.focusSession.findFirst({
    where: { id, profileId: profile.id },
  })

  if (!focusSession) {
    return Response.json({ error: "Session not found" }, { status: 404 })
  }

  const nextStatus = status as SessionStatus | undefined
  const updated = await prisma.focusSession.update({
    where: { id },
    data: {
      status: nextStatus,
      durationSeconds,
      ...(nextStatus && terminalStatuses.has(nextStatus)
        ? { endedAt: new Date() }
        : {}),
    },
  })

  return Response.json(updated)
}
