import createMiddleware from "next-intl/middleware";
import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";

const ADMIN_LOGIN_PATH = "/admin/login";
const ADMIN_DENIED_PATH = "/admin/denegado";
const ADMIN_SIGNUP_PATH = "/admin/registro";
const PUBLIC_ADMIN_PATHS = new Set([ADMIN_LOGIN_PATH, ADMIN_DENIED_PATH, ADMIN_SIGNUP_PATH]);

const handleI18nRouting = createMiddleware(routing);

// Edge-runtime gate. Admin paths keep the cheap Better Auth session-cookie check
// (full session + role validation happens in the (panel) layout, Node runtime).
// Every other (public) path is handled by next-intl routing, which — with
// localePrefix "as-needed" and a single default locale — rewrites `/...` to
// `/es/...` internally without ever adding a visible prefix. Admin never runs
// i18n routing, so admin URLs and behaviour are untouched.
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    const isProtected = !PUBLIC_ADMIN_PATHS.has(pathname);
    if (!isProtected) return NextResponse.next();

    const sessionCookie = getSessionCookie(request, { cookiePrefix: "homara" });
    if (!sessionCookie) {
      const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return handleI18nRouting(request);
}

export const config = {
  // Run on admin (gate) + all public paths (i18n routing). Exclude API routes,
  // Next internals, and any path with a dot (static assets, sitemap.xml,
  // robots.txt, llms.txt/llms-full.txt rewrites, favicons, manifest).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)", "/admin/:path*"],
};
