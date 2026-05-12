import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { getClientIp } from "@/lib/getClientIp";
import { RATE_LIMITS } from "@/lib/redis";

const IP_HASH_SECRET = process.env.IP_HASH_SECRET || process.env.BETTER_AUTH_SECRET || "homara-ip";

function hashIp(ip?: string | null): string | null {
  if (!ip) return null;
  return createHash("sha256").update(`${IP_HASH_SECRET}:${ip}`).digest("hex").slice(0, 32);
}

interface ViewBody {
  slug?: string;
  sessionId?: string;
  path?: string;
  referrer?: string;
}

export async function POST(req: NextRequest): Promise<Response> {
  let body: ViewBody;
  try {
    body = (await req.json()) as ViewBody;
  } catch {
    return Response.json({ ok: false, reason: "bad-json" }, { status: 400 });
  }

  const slug = String(body.slug ?? "").trim().toLowerCase();
  if (!slug) return Response.json({ ok: false, reason: "missing-slug" }, { status: 400 });

  const ip = getClientIp(req);
  const limit = await RATE_LIMITS.articleView(`${ip ?? "anon"}:${slug}`);
  if (!limit.success) return Response.json({ ok: true, limited: true });

  const article = await db.editorialArticle.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!article) return Response.json({ ok: false, reason: "not-found" }, { status: 404 });

  try {
    await db.articleViewEvent.create({
      data: {
        articleId: article.id,
        articleSlug: slug,
        sessionId: String(body.sessionId ?? "").slice(0, 128) || "anon",
        path: body.path?.slice(0, 512) ?? null,
        referrer: body.referrer?.slice(0, 512) ?? null,
        ipHash: hashIp(ip),
        userAgent: req.headers.get("user-agent")?.slice(0, 256) ?? null,
      },
    });

    await db.editorialArticle.update({
      where: { id: article.id },
      data: { viewsCount: { increment: 1 } },
    });
  } catch {
    // Tracking must never break the user-visible flow.
  }

  return Response.json({ ok: true });
}
