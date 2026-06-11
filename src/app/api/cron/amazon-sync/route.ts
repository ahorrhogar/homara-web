import { runAmazonSync } from "@/data/catalog/amazon-sync";
import { logger } from "@/infrastructure/logging/logger";

/**
 * Background Amazon price/availability sync.
 *
 * Triggered by Vercel Cron (hourly) — see vercel.json. Secured by a bearer
 * token so it can't be invoked publicly. `?full=1` does the daily heavier pass
 * (pulls image/spec resources too); `?limit=N` bounds offers per invocation.
 */

export const runtime = "nodejs";
// Vercel Pro allows up to 300s; Hobby caps lower. The job self-bounds via limit.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
  if (!secret || auth !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const full = url.searchParams.get("full") === "1";
  const limitParam = Number(url.searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined;

  try {
    const result = await runAmazonSync({ full, limit });
    return Response.json({ ok: true, full, ...result });
  } catch (error) {
    logger.log({
      level: "error",
      message: "amazon-sync cron failed",
      context: { error: error instanceof Error ? error.message : String(error) },
      timestamp: new Date().toISOString(),
    });
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "sync failed" },
      { status: 500 },
    );
  }
}
