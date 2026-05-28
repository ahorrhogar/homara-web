import { headers } from "next/headers";

import { auth } from "./auth";
import { isSuperadmin } from "./superadmin";

export class UnauthorizedError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Superadmin access required") {
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
  if (!isSuperadmin(session.user.email)) {
    throw new ForbiddenError();
  }
  return session;
}
