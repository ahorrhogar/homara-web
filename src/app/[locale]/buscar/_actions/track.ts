"use server";

import { headers } from "next/headers";
import { trackSearchTerm } from "@/data/catalog/tracking";
import { getClientIpFromHeaders } from "@/lib/getClientIp";

export interface RecordSearchInput {
  term: string;
  resultCount: number;
  topProductId?: string;
  sessionId?: string;
  path?: string;
}

export async function recordSearchTerm(input: RecordSearchInput): Promise<void> {
  const headersList = await headers();
  const ipAddress = await getClientIpFromHeaders();
  const userAgent = headersList.get("user-agent") || undefined;

  await trackSearchTerm(input.term, {
    sessionId: input.sessionId,
    resultCount: input.resultCount,
    topProductId: input.topProductId,
    path: input.path,
    ipAddress,
    userAgent,
  });
}
