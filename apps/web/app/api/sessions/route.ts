import { prisma } from "@workspace/db"
import { getSession } from "@/lib/auth"

export async function POST() {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const focusSession = await prisma.focusSession.create({
    data: {
      profileId: session.userId,
    },
  })

  return Response.json(focusSession, { status: 201 })
}
