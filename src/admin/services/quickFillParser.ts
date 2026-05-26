/**
 * Pure HTML → product-fields parser used by the admin "Quick fill from URL"
 * affordance. Extracts OG/Twitter meta + JSON-LD Product nodes via plain
 * regex (no cheerio) so the function stays cheap and unit-testable.
 *
 * Returns every field as `null` when missing — callers decide what to do.
 * Never throws on malformed input.
 */

export interface QuickFillParseResult {
  name: string | null;
  image: string | null;
  description: string | null;
  price: number | null;
  brandGuess: string | null;
}

const META_PATTERNS = [
  (key: string) =>
    new RegExp(
      `<meta[^>]+(?:property|name)\\s*=\\s*["']${escapeRegex(key)}["'][^>]*\\bcontent\\s*=\\s*["']([^"']*)["']`,
      "i",
    ),
  (key: string) =>
    new RegExp(
      `<meta[^>]+\\bcontent\\s*=\\s*["']([^"']*)["'][^>]+(?:property|name)\\s*=\\s*["']${escapeRegex(key)}["']`,
      "i",
    ),
];

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractMeta(html: string, key: string): string | null {
  for (const buildRegex of META_PATTERNS) {
    const match = html.match(buildRegex(key));
    if (match && match[1]) {
      const decoded = decodeEntities(match[1].trim());
      if (decoded) return decoded;
    }
  }
  return null;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function extractJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const re = /<script[^>]+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(re)) {
    const raw = match[1].trim();
    if (!raw) continue;
    try {
      blocks.push(JSON.parse(raw));
    } catch {
      // Some sites embed multiple JSON objects concatenated. Recover what we can.
      const recovered = tryRecoverMultipleObjects(raw);
      for (const node of recovered) blocks.push(node);
    }
  }
  return blocks;
}

function tryRecoverMultipleObjects(raw: string): unknown[] {
  const out: unknown[] = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i];
    if (ch === "{") {
      if (depth === 0) start = i;
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        try {
          out.push(JSON.parse(raw.slice(start, i + 1)));
        } catch {
          // Skip malformed slice.
        }
        start = -1;
      }
    }
  }
  return out;
}

function isProductType(typeValue: unknown): boolean {
  if (typeof typeValue === "string") return typeValue.toLowerCase().endsWith("product");
  if (Array.isArray(typeValue)) return typeValue.some(isProductType);
  return false;
}

function walkForProduct(node: unknown, depth = 0): Record<string, unknown> | null {
  if (depth > 5 || node === null || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = walkForProduct(child, depth + 1);
      if (found) return found;
    }
    return null;
  }
  const obj = node as Record<string, unknown>;
  if (isProductType(obj["@type"])) return obj;
  for (const key of Object.keys(obj)) {
    const found = walkForProduct(obj[key], depth + 1);
    if (found) return found;
  }
  return null;
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9,.\-]/g, "");
    if (!cleaned) return null;
    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");
    let normalized: string;
    if (lastComma > lastDot) {
      normalized = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = cleaned.replace(/,/g, "");
    }
    const num = Number(normalized);
    if (Number.isFinite(num) && num > 0) return num;
  }
  return null;
}

function pickPriceFromOffer(offer: unknown): number | null {
  if (offer === null || typeof offer !== "object") return null;
  const obj = offer as Record<string, unknown>;
  const candidates = [obj.price, obj.lowPrice, obj.highPrice];
  for (const c of candidates) {
    const num = coerceNumber(c);
    if (num !== null) return num;
  }
  if (obj.priceSpecification) {
    const num = pickPriceFromOffer(obj.priceSpecification);
    if (num !== null) return num;
  }
  return null;
}

function pickProductPrice(productNode: Record<string, unknown>): number | null {
  const offers = productNode.offers;
  if (!offers) return null;
  if (Array.isArray(offers)) {
    const prices = offers
      .map((o) => pickPriceFromOffer(o))
      .filter((n): n is number => n !== null);
    if (prices.length === 0) return null;
    return Math.min(...prices);
  }
  return pickPriceFromOffer(offers);
}

function pickProductString(productNode: Record<string, unknown>, key: string): string | null {
  const value = productNode[key];
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function pickProductImage(productNode: Record<string, unknown>): string | null {
  const value = productNode.image;
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    for (const v of value) {
      if (typeof v === "string" && v.trim()) return v.trim();
      if (v && typeof v === "object") {
        const url = (v as Record<string, unknown>).url;
        if (typeof url === "string" && url.trim()) return url.trim();
      }
    }
  }
  if (value && typeof value === "object") {
    const url = (value as Record<string, unknown>).url;
    if (typeof url === "string" && url.trim()) return url.trim();
  }
  return null;
}

function pickProductBrand(productNode: Record<string, unknown>): string | null {
  const value = productNode.brand;
  if (typeof value === "string" && value.trim()) return value.trim();
  if (value && typeof value === "object") {
    const name = (value as Record<string, unknown>).name;
    if (typeof name === "string" && name.trim()) return name.trim();
  }
  return null;
}

function stripSiteSuffix(title: string): string {
  return title
    .replace(/\s*[|\-–·:]\s*(amazon[^|\-–·:]*|ikea[^|\-–·:]*|leroy merlin[^|\-–·:]*|mediamarkt[^|\-–·:]*|carrefour[^|\-–·:]*|el corte ingl[ée]s[^|\-–·:]*|pccomponentes[^|\-–·:]*).*$/i, "")
    .trim();
}

function firstWord(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const first = trimmed.split(/\s+/)[0];
  if (first.length < 2) return null;
  return first;
}

export function parseQuickFillHtml(html: string): QuickFillParseResult {
  const result: QuickFillParseResult = {
    name: null,
    image: null,
    description: null,
    price: null,
    brandGuess: null,
  };

  const ogTitle = extractMeta(html, "og:title");
  const ogImage = extractMeta(html, "og:image") ?? extractMeta(html, "twitter:image");
  const ogDescription = extractMeta(html, "og:description") ?? extractMeta(html, "description");

  if (ogTitle) result.name = stripSiteSuffix(ogTitle);
  if (ogImage) result.image = ogImage;
  if (ogDescription) result.description = ogDescription;

  const jsonLdBlocks = extractJsonLdBlocks(html);
  for (const block of jsonLdBlocks) {
    const product = walkForProduct(block);
    if (!product) continue;
    const productName = pickProductString(product, "name");
    const productDescription = pickProductString(product, "description");
    const productImage = pickProductImage(product);
    const productPrice = pickProductPrice(product);
    const productBrand = pickProductBrand(product);
    if (productName) result.name = stripSiteSuffix(productName);
    if (productDescription) result.description = productDescription;
    if (productImage) result.image = productImage;
    if (productPrice !== null) result.price = productPrice;
    if (productBrand) result.brandGuess = productBrand;
    if (productPrice !== null) break;
  }

  if (!result.brandGuess && result.name) {
    result.brandGuess = firstWord(result.name);
  }

  return result;
}
