import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let anonymousClient: SupabaseClient | null = null;

function readEnv(...names: string[]): string {
  for (const name of names) {
    const value =
      typeof process !== "undefined" && process.env ? process.env[name] : undefined;
    if (value) return value;
  }
  throw new Error(`Missing required Supabase env. Looked for: ${names.join(", ")}`);
}

/**
 * Anonymous Supabase client that works in any execution context (RSC, server actions,
 * route handlers, browser). It does not read or write cookies, so it cannot make
 * authenticated calls. Use this for public catalog reads, sitemap generation, and the
 * affiliate redirect endpoint. For authenticated server work, use createServerSupabaseClient
 * from ./server.ts; for browser session work, use getSupabaseClient from ./client.ts.
 */
export function getAnonymousSupabaseClient(): SupabaseClient {
  if (anonymousClient) return anonymousClient;

  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
  const anonKey = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_ANON_KEY");

  anonymousClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return anonymousClient;
}
