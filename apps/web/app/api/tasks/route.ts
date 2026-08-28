import { NextRequest } from "next/server";
import { prisma } from "@workspace/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = await prisma.task.findMany({
    where: { userId: session.userId, isArchived: false },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(tasks);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return Response.json({ error: "Task name is required" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      userId: session.userId,
      name: name.trim(),
      description: description?.trim() || null,
    },
  });

  return Response.json(task, { status: 201 });
}
