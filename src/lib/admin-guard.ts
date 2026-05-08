import { headers } from "next/headers";

import { auth } from "./auth";

export class UnauthorizedError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Admin role required") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireAdmin() {
  const session = await getCurrentSession();
  if (!session?.user) throw new UnauthorizedError();
  if ((session.user as { role?: string }).role !== "admin") {
    throw new ForbiddenError();
  }
  return session;
}
