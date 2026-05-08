"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/integrations/supabase/server";
import { logger } from "@/infrastructure/logging/logger";

type AuthAction = "auth.login" | "auth.logout" | "auth.login_failed";

async function safeAudit(action: AuthAction, payload?: Record<string, unknown>): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.from("admin_actions").insert({
      action,
      entity_type: "auth",
      payload: { source: "admin._actions.auth", ...(payload || {}) },
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
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const redirectTo = String(formData.get("redirectTo") || "/admin");

  if (!email || !password) {
    return { ok: false, message: "Introduce email y contraseña." };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    await safeAudit("auth.login_failed", { reason: error?.message });
    logger.log({
      level: "warn",
      message: "Admin sign-in failed",
      timestamp: new Date().toISOString(),
      context: { email, reason: error?.message },
    });
    return { ok: false, message: "Credenciales no válidas." };
  }

  const { data: isAdminData } = await supabase.rpc("is_admin", { user_id: data.user.id });
  if (!isAdminData) {
    await supabase.auth.signOut();
    return { ok: false, message: "Esta cuenta no tiene permisos de administrador." };
  }

  await safeAudit("auth.login");
  return { ok: true, redirectTo };
}

export async function signOutAdminAction(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await safeAudit("auth.logout");
  await supabase.auth.signOut();
  redirect("/admin/login");
}
