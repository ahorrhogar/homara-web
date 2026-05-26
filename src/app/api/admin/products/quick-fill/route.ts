import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/admin-guard";
import { parseAffiliateUrl } from "@/infrastructure/security/affiliateUrl";
import { parseQuickFillHtml } from "@/admin/services/quickFillParser";
import { logger } from "@/infrastructure/logging/logger";

export const runtime = "nodejs";

const bodySchema = z.object({ url: z.string().url() });

const HOSTNAME_TO_MERCHANT: Array<{ pattern: RegExp; merchantName: string }> = [
  { pattern: /(^|\.)amazon\.(es|com|de|fr|it|co\.uk|com\.mx|nl)$/i, merchantName: "Amazon" },
  { pattern: /(^|\.)ikea\.com$/i, merchantName: "IKEA" },
  { pattern: /(^|\.)leroymerlin\.es$/i, merchantName: "Leroy Merlin" },
  { pattern: /(^|\.)mediamarkt\.es$/i, merchantName: "MediaMarkt" },
  { pattern: /(^|\.)carrefour\.es$/i, merchantName: "Carrefour" },
  { pattern: /(^|\.)elcorteingles\.es$/i, merchantName: "El Corte Inglés" },
  { pattern: /(^|\.)pccomponentes\.com$/i, merchantName: "PcComponentes" },
  { pattern: /(^|\.)kavehome\.com$/i, merchantName: "Kave Home" },
  { pattern: /(^|\.)maisonsdumonde\.com$/i, merchantName: "Maisons du Monde" },
  { pattern: /(^|\.)conforama\.es$/i, merchantName: "Conforama" },
  { pattern: /(^|\.)aldi\.es$/i, merchantName: "Aldi" },
];

const FETCH_TIMEOUT_MS = 10_000;
const MAX_BODY_BYTES = 1_500_000;

function resolveMerchantName(hostname: string): string | null {
  const host = hostname.replace(/^www\./i, "").toLowerCase();
  for (const entry of HOSTNAME_TO_MERCHANT) {
    if (entry.pattern.test(host)) return entry.merchantName;
  }
  return null;
}

interface QuickFillResponseData {
  name: string | null;
  image: string | null;
  description: string | null;
  price: number | null;
  merchantId: string | null;
  merchantName: string | null;
  brandGuess: string | null;
  sourceUrl: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return Response.json({ ok: false, error: "auth-required" }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return Response.json({ ok: false, error: "admin-required" }, { status: 403 });
    }
    return Response.json({ ok: false, error: "auth-error" }, { status: 500 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return Response.json({ ok: false, error: "json-invalido" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "url-invalida" }, { status: 400 });
  }

  const targetUrl = parsed.data.url.trim();
  const safe = parseAffiliateUrl(targetUrl);
  if (!safe) {
    return Response.json({ ok: false, error: "url-no-permitida" }, { status: 400 });
  }

  let html: string;
  try {
    const response = await fetch(safe.toString(), {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: "follow",
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; HomaraAdmin/1.0; +https://homara.es)",
        "accept-language": "es-ES,es;q=0.9,en;q=0.8",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!response.ok) {
      return Response.json({ ok: false, error: `fetch-fallo-${response.status}` });
    }
    const text = await response.text();
    html = text.length > MAX_BODY_BYTES ? text.slice(0, MAX_BODY_BYTES) : text;
  } catch (error) {
    logger.log({
      level: "warn",
      message: "Quick-fill fetch failed",
      timestamp: new Date().toISOString(),
      context: { url: safe.toString(), error: error instanceof Error ? error.message : String(error) },
    });
    return Response.json({ ok: false, error: "no-se-pudo-leer-pagina" });
  }

  const parsedFields = parseQuickFillHtml(html);
  const merchantName = resolveMerchantName(safe.hostname);

  let merchantId: string | null = null;
  let resolvedMerchantName: string | null = merchantName;
  if (merchantName) {
    const row = await db.merchant.findFirst({
      where: { name: { equals: merchantName, mode: "insensitive" } },
      orderBy: [{ domain: "asc" }, { createdAt: "asc" }],
      select: { id: true, name: true },
    });
    if (row) {
      merchantId = row.id;
      resolvedMerchantName = row.name;
    }
  }

  const data: QuickFillResponseData = {
    name: parsedFields.name,
    image: parsedFields.image,
    description: parsedFields.description,
    price: parsedFields.price,
    merchantId,
    merchantName: resolvedMerchantName,
    brandGuess: parsedFields.brandGuess,
    sourceUrl: safe.toString(),
  };

  return Response.json({ ok: true, data });
}
