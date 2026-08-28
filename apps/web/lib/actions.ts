"use server";

import { redirect } from "next/navigation";
import { prisma } from "@workspace/db";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
} from "./auth";

// ---------------------------------------------------------------------------
// Signup
// ---------------------------------------------------------------------------

export async function signup(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      settings: {
        create: {}, // defaults: 25/5/15/4
      },
    },
  });

  await createSession(user.id);
  redirect("/");
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export async function login(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Invalid email or password." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  await createSession(user.id);
  redirect("/");
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

export async function logout() {
  await destroySession();
  redirect("/login");
}
