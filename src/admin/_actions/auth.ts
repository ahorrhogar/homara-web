"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { logger } from "@/infrastructure/logging/logger";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type AuthAction = "auth.login" | "auth.logout" | "auth.login_failed";

const GENERIC_FAILURE = "Credenciales no válidas.";

async function safeAudit(
  action: AuthAction,
  payload: Record<string, unknown> = {},
  userId?: string,
): Promise<void> {
  try {
    await db.adminAction.create({
      data: {
        action,
        entityType: "auth",
        userId: userId ?? null,
        payload: { source: "admin._actions.auth", ...payload },
      },
    });
  } catch {
    // Audit failures must never block sign-in/out flows.
  }
}

export interface SignInResult {
  ok: boolean;
  redirectTo?: string;
  message?: string;
}

export async function signInAdminAction(formData: FormData): Promise<SignInResult> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const redirectTo = String(formData.get("redirectTo") || "/admin");

  if (!email || !password) {
    return { ok: false, message: "Introduce email y contraseña." };
  }

  // Pre-flight role gate. Returning the same generic error for "no user",
  // "non-admin", and "bad password" keeps account enumeration off the table.
  const user = await db.user.findUnique({ where: { email }, select: { role: true } });
  if (!user || user.role !== "admin") {
    await safeAudit("auth.login_failed", { reason: user ? "non-admin" : "no-user", email });
    return { ok: false, message: GENERIC_FAILURE };
  }

  try {
    const result = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
      asResponse: false,
    });

    if (!result?.user?.id) {
      await safeAudit("auth.login_failed", { reason: "no-session", email });
      return { ok: false, message: GENERIC_FAILURE };
    }

    await safeAudit("auth.login", { email }, result.user.id);
    return { ok: true, redirectTo };
  } catch (err) {
    await safeAudit("auth.login_failed", {
      reason: err instanceof Error ? err.message : "unknown",
      email,
    });
    logger.log({
      level: "warn",
      message: "Admin sign-in failed",
      timestamp: new Date().toISOString(),
      context: { email },
    });
    return { ok: false, message: GENERIC_FAILURE };
  }
}

export async function signOutAdminAction(): Promise<void> {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  await safeAudit("auth.logout", {}, session?.user?.id);
  await auth.api.signOut({ headers: reqHeaders });
  redirect("/admin/login");
}
