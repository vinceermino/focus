import { NextRequest } from "next/server"
import { prisma, SessionStatus } from "@workspace/db"
import { getSession } from "@/lib/auth"

const terminalStatuses = new Set<SessionStatus>([
  SessionStatus.COMPLETED,
  SessionStatus.INTERRUPTED,
])

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const status = body.status

  if (status !== undefined && !Object.values(SessionStatus).includes(status)) {
    return Response.json(
      { error: "Invalid focus session update" },
      { status: 400 }
    )
  }

  const focusSession = await prisma.focusSession.findFirst({
    where: { id, profileId: session.userId },
  })

  if (!focusSession) {
    return Response.json({ error: "Session not found" }, { status: 404 })
  }

  const nextStatus = status as SessionStatus | undefined
  const updated = await prisma.focusSession.update({
    where: { id },
    data: {
      status: nextStatus,
      ...(nextStatus && terminalStatuses.has(nextStatus)
        ? { endedAt: new Date() }
        : {}),
    },
  })

  return Response.json(updated)
}
