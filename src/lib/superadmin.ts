/**
 * Superadmin authority is config, not DB state: an account is privileged iff its
 * email is listed in the comma-separated SUPERADMIN_EMAILS env var.
 */
export function isSuperadmin(email?: string | null): boolean {
  if (!email) return false;
  const target = email.trim().toLowerCase();
  if (!target) return false;
  return (process.env.SUPERADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .includes(target);
}
