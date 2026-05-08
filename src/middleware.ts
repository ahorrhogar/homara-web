import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_LOGIN_PATH = "/admin/login";
const ADMIN_DENIED_PATH = "/admin/denegado";
const PUBLIC_ADMIN_PATHS = new Set([ADMIN_LOGIN_PATH, ADMIN_DENIED_PATH]);

function readEnv(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  throw new Error(`Missing required Supabase env. Looked for: ${names.join(", ")}`);
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = readEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
  const supabaseAnonKey = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_ANON_KEY");

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Refresh the session on every request so cookies stay alive.
  const { data: userResult } = await supabase.auth.getUser();
  const user = userResult.user;

  const pathname = request.nextUrl.pathname;
  const isProtectedAdmin = pathname.startsWith("/admin") && !PUBLIC_ADMIN_PATHS.has(pathname);

  if (isProtectedAdmin) {
    if (!user) {
      const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { data: isAdminData } = await supabase.rpc("is_admin", { user_id: user.id });
    if (!isAdminData) {
      return NextResponse.redirect(new URL(ADMIN_DENIED_PATH, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
