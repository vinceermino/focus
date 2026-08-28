import { NextRequest } from "next/server";
import { prisma } from "@workspace/db";
import { getSession } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status, actualDurationSeconds } = body;

  const focusSession = await prisma.focusSession.findFirst({
    where: { id, userId: session.userId },
  });

  if (!focusSession) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  const updated = await prisma.focusSession.update({
    where: { id },
    data: {
      status: status || "COMPLETED",
      actualDurationSeconds,
      endedAt: new Date(),
    },
  });

  return Response.json(updated);
}
