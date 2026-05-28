"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { logger } from "@/infrastructure/logging/logger";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isSuperadmin } from "@/lib/superadmin";

type AuthAction = "auth.login" | "auth.logout" | "auth.login_failed";

const GENERIC_FAILURE = "Credenciales no válidas.";
const SIGNUP_FAILURE =
  "No se pudo crear la cuenta. La contraseña debe tener al menos 12 caracteres. Si ya tienes una cuenta, inicia sesión.";

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

  // Pre-flight authority gate. Returning the same generic error for
  // "not a superadmin" and "bad password" keeps account enumeration off the table.
  if (!isSuperadmin(email)) {
    await safeAudit("auth.login_failed", { reason: "non-superadmin", email });
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

export async function signUpAdminAction(formData: FormData): Promise<SignInResult> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { ok: false, message: "Introduce email y contraseña." };
  }

  // Accounts exist solely for admin access (also enforced at the DB-creation hook
  // in src/lib/auth.ts, which covers the public /api/auth/sign-up endpoint too).
  // Every failure path returns the identical SIGNUP_FAILURE so a probe cannot tell
  // an allowlisted email from a rejected one.
  if (!isSuperadmin(email)) {
    await safeAudit("auth.login_failed", { reason: "signup-non-superadmin", email });
    return { ok: false, message: SIGNUP_FAILURE };
  }

  try {
    const created = await auth.api.signUpEmail({
      body: { email, password, name: email.split("@")[0] },
    });

    if (!created?.user?.id) {
      await safeAudit("auth.login_failed", { reason: "signup-no-user", email });
      return { ok: false, message: SIGNUP_FAILURE };
    }

    // Establish the session right away (global autoSignIn is off).
    const signedIn = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
      asResponse: false,
    });

    if (!signedIn?.user?.id) {
      return { ok: true, redirectTo: "/admin/login" };
    }

    await safeAudit("auth.login", { email, signup: true }, signedIn.user.id);
    return { ok: true, redirectTo: "/admin" };
  } catch (err) {
    await safeAudit("auth.login_failed", {
      reason: err instanceof Error ? err.message : "signup-unknown",
      email,
    });
    logger.log({
      level: "warn",
      message: "Admin sign-up failed",
      timestamp: new Date().toISOString(),
      context: { email },
    });
    return { ok: false, message: SIGNUP_FAILURE };
  }
}

export async function signOutAdminAction(): Promise<void> {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  await safeAudit("auth.logout", {}, session?.user?.id);
  await auth.api.signOut({ headers: reqHeaders });
  redirect("/admin/login");
}
