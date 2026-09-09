"use server"

import { cookies } from "next/headers"
import { prisma } from "@workspace/db"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function createNote(formData: FormData) {
  const content = formData.get("content") as string
  if (!content || !content.trim()) return

  const supabase = await createClient(await cookies())
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  })

  if (!profile) {
    throw new Error("Profile not found")
  }

  await prisma.note.create({
    data: {
      content: content.trim(),
      profileId: profile.id,
    },
  })

  revalidatePath("/")
}

export async function getNotes() {
  const supabase = await createClient(await cookies())
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  })

  if (!profile) {
    return []
  }

  return prisma.note.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: "asc" },
  })
}
