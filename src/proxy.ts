import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_LOGIN_PATH = "/admin/login";
const ADMIN_DENIED_PATH = "/admin/denegado";
const ADMIN_SIGNUP_PATH = "/admin/registro";
const PUBLIC_ADMIN_PATHS = new Set([ADMIN_LOGIN_PATH, ADMIN_DENIED_PATH, ADMIN_SIGNUP_PATH]);

// Edge-runtime gate. We only confirm the presence of a Better Auth session
// cookie here — full session + role validation happens in the (panel) layout
// (Node runtime) where Prisma can run. This keeps proxy work cheap.
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected =
    pathname.startsWith("/admin") && !PUBLIC_ADMIN_PATHS.has(pathname);

  if (!isProtected) return NextResponse.next();

  const sessionCookie = getSessionCookie(request, { cookiePrefix: "homara" });
  if (!sessionCookie) {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
