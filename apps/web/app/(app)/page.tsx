import { prisma } from "@workspace/db";
import { getSession } from "@/lib/auth";
import { Timer } from "@/components/timer";

export default async function HomePage() {
  const session = await getSession();

  // Layout already guards for auth, but be safe
  if (!session) return null;

  const [tasks, userSettings] = await Promise.all([
    prisma.task.findMany({
      where: { userId: session.userId, isArchived: false },
      orderBy: { createdAt: "desc" },
    }),
    prisma.userSettings.findUnique({
      where: { userId: session.userId },
    }),
  ]);

  const settings = userSettings ?? {
    focusDurationMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,
  };

  return (
    <Timer
      initialTasks={tasks.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
      }))}
      settings={{
        focusDurationMinutes: settings.focusDurationMinutes,
        shortBreakMinutes: settings.shortBreakMinutes,
        longBreakMinutes: settings.longBreakMinutes,
        sessionsBeforeLongBreak: settings.sessionsBeforeLongBreak,
      }}
    />
  );
}
