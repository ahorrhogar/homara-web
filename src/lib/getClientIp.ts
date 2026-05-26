import "server-only";
import { headers } from "next/headers";

function parseClientIp(forwardedFor: string | null, realIp: string | null): string | undefined {
  const candidate = forwardedFor || realIp || "";
  const ip = candidate.split(",")[0]?.trim();
  return ip || undefined;
}

export function getClientIp(request: { headers: Headers }): string | undefined {
  return parseClientIp(
    request.headers.get("x-forwarded-for"),
    request.headers.get("x-real-ip"),
  );
}

export async function getClientIpFromHeaders(): Promise<string | undefined> {
  const list = await headers();
  return parseClientIp(list.get("x-forwarded-for"), list.get("x-real-ip"));
}
