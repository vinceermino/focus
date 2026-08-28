import { NextRequest } from "next/server";
import { prisma } from "@workspace/db";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { sessionType, plannedDurationSeconds, taskId } = body;

  if (!sessionType || !plannedDurationSeconds) {
    return Response.json(
      { error: "sessionType and plannedDurationSeconds are required" },
      { status: 400 }
    );
  }

  const focusSession = await prisma.focusSession.create({
    data: {
      userId: session.userId,
      sessionType,
      plannedDurationSeconds,
      taskId: taskId || null,
    },
  });

  return Response.json(focusSession, { status: 201 });
}
