import { cookies } from "next/headers"
import { prisma } from "@workspace/db"
import { createClient } from "@/utils/supabase/server"

export async function POST() {
  const supabase = await createClient(await cookies())
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Ensure a profile exists for this Supabase Auth user
  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, email: user.email },
    update: {},
  })

  const focusSession = await prisma.focusSession.create({
    data: {
      profileId: profile.id,
    },
  })

  return Response.json(focusSession, { status: 201 })
}
