/**
 * Multi-phase orchestrator that resolves {{OFFER:slug}} placeholders in temp/**.md
 * into real product data via Firecrawl, then writes a typed data file consumed
 * by scripts/seed-products.ts.
 *
 * Usage:
 *   npx tsx scripts/scrape-products.ts --inventory-only
 *   npx tsx scripts/scrape-products.ts --map-merchants
 *   npx tsx scripts/scrape-products.ts --scrape   (requires FIRECRAWL_API_KEY)
 *   npx tsx scripts/scrape-products.ts --consolidate
 *
 * Phase 0 (--inventory-only) is implemented in this commit.
 */
import { existsSync, promises as fs } from "node:fs";
import * as path from "node:path";

const REPO_ROOT = process.cwd();
const TEMP_ROOT = path.join(REPO_ROOT, "temp");
const DATA_DIR = path.join(REPO_ROOT, "scripts", "data");

if (!existsSync(TEMP_ROOT) || !existsSync(path.join(REPO_ROOT, "package.json"))) {
  console.error(`Run this script from the homara-web repo root (couldn't find temp/ or package.json). cwd: ${REPO_ROOT}`);
  process.exit(1);
}

const PLACEHOLDER_RE = /\{\{OFFER:([a-z0-9-]+)\}\}/g;
const HEADING_RE = /^(#{1,6})\s+(.+?)\s*$/;
const CTA_LINE_RE = /\[([^\]]+)\]\(\{\{OFFER:([a-z0-9-]+)\}\}\)/;

interface PlaceholderOccurrence {
  articleSlug: string;
  articleTitle: string;
  articlePath: string;
  cluster: string;
  section: string;
  ctaLabel: string;
  lineNumber: number;
  contextBefore: string;
}

interface PlaceholderInventory {
  slug: string;
  occurrences: PlaceholderOccurrence[];
  flag?: "template-artifact" | "article-slug-collision" | "suspicious";
  flagReason?: string;
}

async function walk(dir: string, files: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, files);
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".md") &&
      entry.name !== "README.md" &&
      entry.name !== "PLAN.md" &&
      entry.name !== "HANDOFF.md"
    ) {
      files.push(full);
    }
  }
  return files;
}

function deriveArticleSlug(filePath: string): string {
  const base = path.basename(filePath, ".md");
  return base.replace(/^(P?[A-Z]\d{1,2}-)/, "");
}

function deriveCluster(filePath: string): string {
  const rel = path.relative(TEMP_ROOT, filePath);
  const parts = rel.split(path.sep);
  if (parts[0] === "pillars") return "pillars";
  if (parts[0] === "clusters" && parts.length >= 2) return parts[1];
  return "unknown";
}

function classify(
  slug: string,
  articleSlugs: Set<string>,
): { flag?: PlaceholderInventory["flag"]; reason?: string } {
  if (slug === "slug" || slug === "slug-producto") {
    return {
      flag: "template-artifact",
      reason: `Literal template placeholder "${slug}" left in draft`,
    };
  }
  if (articleSlugs.has(slug)) {
    return {
      flag: "article-slug-collision",
      reason: `Slug matches an article slug — writer pasted the article slug instead of a product slug`,
    };
  }
  if (slug.length < 6) {
    return {
      flag: "suspicious",
      reason: `Slug shorter than 6 chars — likely incomplete`,
    };
  }
  return {};
}

async function phase0Inventory(): Promise<void> {
  console.info("[phase-0] scanning temp/ for {{OFFER:slug}} placeholders...");

  const files = await walk(TEMP_ROOT);
  console.info(`[phase-0] found ${files.length} article files`);

  const articleSlugs = new Set<string>();
  for (const file of files) {
    articleSlugs.add(deriveArticleSlug(file));
  }

  const bySlug = new Map<string, PlaceholderOccurrence[]>();
  let totalOccurrences = 0;

  for (const file of files) {
    const raw = await fs.readFile(file, "utf-8");
    const lines = raw.split("\n");
    const articleSlug = deriveArticleSlug(file);
    const cluster = deriveCluster(file);
    let articleTitle = articleSlug;
    let currentSection = "";

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];

      const headingMatch = line.match(HEADING_RE);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const title = headingMatch[2];
        if (level === 1 && articleTitle === articleSlug) {
          articleTitle = title;
        } else if (level >= 2) {
          currentSection = title;
        }
      }

      const matches = [...line.matchAll(PLACEHOLDER_RE)];
      if (matches.length === 0) continue;

      const ctaMatch = line.match(CTA_LINE_RE);
      const ctaLabel = ctaMatch ? ctaMatch[1] : "";

      const contextBefore = lines
        .slice(Math.max(0, i - 4), i)
        .filter((entry) => entry.trim().length > 0)
        .slice(-3)
        .join(" | ")
        .slice(0, 400);

      for (const match of matches) {
        const slug = match[1];
        const occurrence: PlaceholderOccurrence = {
          articleSlug,
          articleTitle,
          articlePath: path.relative(REPO_ROOT, file),
          cluster,
          section: currentSection,
          ctaLabel,
          lineNumber: i + 1,
          contextBefore,
        };

        totalOccurrences += 1;
        const list = bySlug.get(slug) ?? [];
        list.push(occurrence);
        bySlug.set(slug, list);
      }
    }
  }

  const inventory: PlaceholderInventory[] = [];
  for (const [slug, occurrences] of bySlug.entries()) {
    const { flag, reason } = classify(slug, articleSlugs);
    inventory.push({ slug, occurrences, flag, flagReason: reason });
  }

  inventory.sort((a, b) => {
    const aFlag = a.flag ? 1 : 0;
    const bFlag = b.flag ? 1 : 0;
    if (aFlag !== bFlag) return aFlag - bFlag;
    return a.slug.localeCompare(b.slug);
  });

  await fs.mkdir(DATA_DIR, { recursive: true });
  const outPath = path.join(DATA_DIR, "placeholders.json");
  await fs.writeFile(outPath, JSON.stringify(inventory, null, 2), "utf-8");

  const flagged = inventory.filter((entry) => entry.flag);
  const clean = inventory.filter((entry) => !entry.flag);

  console.info("");
  console.info("======================================================");
  console.info("PHASE 0 — Placeholder inventory");
  console.info("======================================================");
  console.info(`Articles scanned:        ${files.length}`);
  console.info(`Placeholder occurrences: ${totalOccurrences}`);
  console.info(`Unique slugs:            ${inventory.length}`);
  console.info(`Clean (scrapable):       ${clean.length}`);
  console.info(`Flagged (need review):   ${flagged.length}`);
  console.info("");

  if (flagged.length > 0) {
    console.info("Flagged slugs requiring review BEFORE scraping:");
    console.info("------------------------------------------------------");
    for (const entry of flagged) {
      console.info(`  [${entry.flag}]  ${entry.slug}`);
      console.info(`     reason: ${entry.flagReason}`);
      console.info(`     used in ${entry.occurrences.length} occurrence(s):`);
      for (const occ of entry.occurrences) {
        console.info(`        ${occ.articlePath}:${occ.lineNumber}  (section: "${occ.section}")`);
      }
      console.info("");
    }
  }

  const slugsByCluster = new Map<string, number>();
  for (const entry of clean) {
    for (const occ of entry.occurrences) {
      slugsByCluster.set(occ.cluster, (slugsByCluster.get(occ.cluster) ?? 0) + 1);
    }
  }
  console.info("Clean-placeholder occurrences by cluster:");
  for (const [cluster, count] of [...slugsByCluster.entries()].sort()) {
    console.info(`   ${cluster.padEnd(35)}  ${count}`);
  }

  console.info("");
  console.info(`Wrote inventory to: ${path.relative(REPO_ROOT, outPath)}`);
  console.info("======================================================");

  if (flagged.length > 0) {
    console.info("");
    console.info("Next step: review the flagged slugs above. Fix the .md files to either");
    console.info("   (a) replace the bogus slug with a real product slug, or");
    console.info("   (b) accept they will be skipped at seed time.");
    console.info("   Re-run --inventory-only after edits, then proceed with --map-merchants.");
  }
}

// =====================================================================
// PHASE 1 — slug → merchant mapping
// =====================================================================

type MerchantKey =
  | "amazon"
  | "ikea"
  | "maisonsdumonde"
  | "kavehome"
  | "leroymerlin"
  | "elcorteingles"
  | "conforama"
  | "carrefour"
  | "aldi";

interface MerchantSpec {
  key: MerchantKey;
  name: string;
  domain: string;
  buildSearchUrl: (query: string) => string;
  productLinkPattern: RegExp; // matches a product page URL from the merchant's search results
}

const MERCHANTS: Record<MerchantKey, MerchantSpec> = {
  amazon: {
    key: "amazon",
    name: "Amazon",
    domain: "amazon.es",
    buildSearchUrl: (q) => `https://www.amazon.es/s?k=${encodeURIComponent(q)}`,
    productLinkPattern: /^https?:\/\/(?:www\.)?amazon\.es\/[^?]*?\/dp\/([A-Z0-9]{10})(?:[/?]|$)/i,
  },
  ikea: {
    key: "ikea",
    name: "IKEA",
    domain: "ikea.com",
    buildSearchUrl: (q) => `https://www.ikea.com/es/es/search/products/?q=${encodeURIComponent(q)}`,
    productLinkPattern: /^https?:\/\/(?:www\.)?ikea\.com\/es\/es\/p\/[a-z0-9-]+/i,
  },
  maisonsdumonde: {
    key: "maisonsdumonde",
    name: "Maisons du Monde",
    domain: "maisonsdumonde.com",
    buildSearchUrl: (q) => `https://www.maisonsdumonde.com/ES/es/search?text=${encodeURIComponent(q)}`,
    productLinkPattern: /^https?:\/\/(?:www\.)?maisonsdumonde\.com\/ES\/es\/p\//i,
  },
  kavehome: {
    key: "kavehome",
    name: "Kave Home",
    domain: "kavehome.com",
    buildSearchUrl: (q) => `https://kavehome.com/es/buscar?text=${encodeURIComponent(q)}`,
    productLinkPattern: /^https?:\/\/(?:www\.)?kavehome\.com\/es\/[a-z0-9-/]+\/[A-Z0-9]+\.html/i,
  },
  leroymerlin: {
    key: "leroymerlin",
    name: "Leroy Merlin",
    domain: "leroymerlin.es",
    buildSearchUrl: (q) => `https://www.leroymerlin.es/buscar/?q=${encodeURIComponent(q)}`,
    productLinkPattern: /^https?:\/\/(?:www\.)?leroymerlin\.es\/fp\/\d+/i,
  },
  elcorteingles: {
    key: "elcorteingles",
    name: "El Corte Inglés",
    domain: "elcorteingles.es",
    buildSearchUrl: (q) => `https://www.elcorteingles.es/search/?s=${encodeURIComponent(q)}`,
    productLinkPattern: /^https?:\/\/(?:www\.)?elcorteingles\.es\/[a-z0-9-]+\/A\d+-/i,
  },
  conforama: {
    key: "conforama",
    name: "Conforama",
    domain: "conforama.es",
    buildSearchUrl: (q) => `https://www.conforama.es/search?text=${encodeURIComponent(q)}`,
    productLinkPattern: /^https?:\/\/(?:www\.)?conforama\.es\/[a-z0-9-]+\/[a-z0-9-]+\/p\//i,
  },
  carrefour: {
    key: "carrefour",
    name: "Carrefour",
    domain: "carrefour.es",
    buildSearchUrl: (q) => `https://www.carrefour.es/?q=${encodeURIComponent(q)}`,
    productLinkPattern: /^https?:\/\/(?:www\.)?carrefour\.es\/.*\/p\//i,
  },
  aldi: {
    key: "aldi",
    name: "Aldi",
    domain: "aldi.es",
    buildSearchUrl: (q) => `https://www.aldi.es/?q=${encodeURIComponent(q)}`,
    productLinkPattern: /^https?:\/\/(?:www\.)?aldi\.es\//i,
  },
};

function pickMerchant(slug: string): MerchantSpec {
  if (slug.startsWith("ikea-")) return MERCHANTS.ikea;
  if (slug.startsWith("maisons-du-monde-")) return MERCHANTS.maisonsdumonde;
  if (slug.startsWith("kave-home-")) return MERCHANTS.kavehome;
  if (slug.startsWith("leroy-merlin-")) return MERCHANTS.leroymerlin;
  if (slug.startsWith("el-corte-ingles-")) return MERCHANTS.elcorteingles;
  if (slug.startsWith("conforama-")) return MERCHANTS.conforama;
  if (slug.startsWith("carrefour-")) return MERCHANTS.carrefour;
  if (slug.startsWith("aldi-")) return MERCHANTS.aldi;
  return MERCHANTS.amazon;
}

function slugToQuery(slug: string, merchantKey: MerchantKey): string {
  // Drop the merchant prefix from the query (e.g. "ikea-teodores-pack-4" → "teodores pack 4")
  let work = slug;
  const prefixes = ["ikea-", "maisons-du-monde-", "kave-home-", "leroy-merlin-", "el-corte-ingles-", "conforama-", "carrefour-", "aldi-"];
  for (const prefix of prefixes) {
    if (work.startsWith(prefix)) {
      work = work.slice(prefix.length);
      break;
    }
  }
  // Hyphens → spaces; keep digits/letters
  return work.replace(/-/g, " ").trim();
}

interface MerchantMapEntry {
  slug: string;
  merchantKey: MerchantKey;
  merchantName: string;
  searchUrl: string;
  query: string;
}

async function phase1MapMerchants(): Promise<void> {
  console.info("[phase-1] loading placeholders.json...");
  const placeholdersPath = path.join(DATA_DIR, "placeholders.json");
  const raw = await fs.readFile(placeholdersPath, "utf-8");
  const inventory: PlaceholderInventory[] = JSON.parse(raw);
  const clean = inventory.filter((entry) => !entry.flag);
  console.info(`[phase-1] mapping ${clean.length} clean slugs to merchants...`);

  const merchantCounts = new Map<MerchantKey, number>();
  const map: MerchantMapEntry[] = [];
  for (const entry of clean) {
    const merchant = pickMerchant(entry.slug);
    const query = slugToQuery(entry.slug, merchant.key);
    map.push({
      slug: entry.slug,
      merchantKey: merchant.key,
      merchantName: merchant.name,
      searchUrl: merchant.buildSearchUrl(query),
      query,
    });
    merchantCounts.set(merchant.key, (merchantCounts.get(merchant.key) ?? 0) + 1);
  }

  const outPath = path.join(DATA_DIR, "slug-merchant-map.json");
  await fs.writeFile(outPath, JSON.stringify(map, null, 2), "utf-8");

  console.info("");
  console.info("======================================================");
  console.info("PHASE 1 — Slug → merchant mapping");
  console.info("======================================================");
  console.info(`Slugs mapped: ${map.length}`);
  console.info("");
  console.info("By merchant:");
  for (const [key, count] of [...merchantCounts.entries()].sort((a, b) => b[1] - a[1])) {
    console.info(`   ${MERCHANTS[key].name.padEnd(20)} ${count}`);
  }
  console.info("");
  console.info(`Wrote map to: ${path.relative(REPO_ROOT, outPath)}`);
}

// =====================================================================
// PHASE 2 — Firecrawl scrape
// =====================================================================

interface FirecrawlScrapeOptions {
  formats?: ("markdown" | "html" | "rawHtml" | "links" | "screenshot")[];
  onlyMainContent?: boolean;
  waitFor?: number;
  timeout?: number;
  country?: string;
  languages?: string[];
}

interface FirecrawlResult {
  success: boolean;
  data?: {
    markdown?: string;
    html?: string;
    links?: string[];
    metadata?: Record<string, unknown>;
  };
  error?: string;
}

const FIRECRAWL_HARD_TIMEOUT_MS = 60_000;

async function firecrawlScrape(url: string, options: FirecrawlScrapeOptions = {}): Promise<FirecrawlResult> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    return { success: false, error: "FIRECRAWL_API_KEY not set in env" };
  }
  const body: Record<string, unknown> = {
    url,
    formats: options.formats ?? ["markdown", "links"],
    onlyMainContent: options.onlyMainContent ?? true,
    waitFor: options.waitFor ?? 0,
    timeout: options.timeout ?? 30000,
    location: {
      country: options.country ?? "ES",
      languages: options.languages ?? ["es-ES", "es"],
    },
  };
  const controller = new AbortController();
  const abortTimer = setTimeout(() => controller.abort(), FIRECRAWL_HARD_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    }
    return (await res.json()) as FirecrawlResult;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { success: false, error: `aborted-after-${FIRECRAWL_HARD_TIMEOUT_MS}ms` };
    }
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(abortTimer);
  }
}

interface ScrapedProduct {
  slug: string;
  merchant: string;
  merchantDomain: string;
  searchUrl: string;
  productUrl: string;
  name: string;
  brand?: string;
  price: number | null;
  oldPrice: number | null;
  imageUrl: string | null;
  description: string;
  rating: number | null;
  reviewCount: number | null;
  rawMarkdownSample: string;
  confidence: number;
  scrapedAt: string;
  warnings: string[];
}

// Scans for "<digits>[ ]€" candidates across the whole markdown, normalizes
// each to a number, and picks the price most likely to be the product's
// CURRENT price (not a coupon, financing-per-month, or struck-through old price).
//
// Heuristics:
//   - Reject obvious coupon / monthly-financing patterns appearing immediately
//     before/after the number ("/mes", "al mes", "cupón", "por mes").
//   - Reject "antes", "PVP", "RRP", "tachado" prefixes (old-price markers).
//   - When multiple candidates remain, prefer the LAST one (typical layouts put
//     the current price after old-price markup) and prefer >= €5 (filters
//     accessory promos like "Solo 1€ por mes").
function parsePrice(text: string): number | null {
  const candidatePattern = /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|\d+)\s*€/g;
  type Candidate = { value: number; idx: number };
  const candidates: Candidate[] = [];
  for (const match of text.matchAll(candidatePattern)) {
    const raw = match[1];
    let value = raw;
    if (value.includes(",") && value.includes(".")) {
      value = value.replace(/\./g, "").replace(",", ".");
    } else if (value.includes(",")) {
      value = value.replace(",", ".");
    } else if (value.includes(".")) {
      // Decide whether `.` is a thousands separator (e.g. "1.099") or a decimal
      // (e.g. "21.99"). Spanish convention: thousands sep takes exactly 3 digits.
      const right = value.split(".").pop() ?? "";
      if (right.length === 3) value = value.replace(/\./g, "");
    }
    const num = parseFloat(value);
    if (!Number.isFinite(num)) continue;
    const idx = match.index ?? 0;
    // Tight windows so an "antes" / "por mes" marker only invalidates the
    // IMMEDIATELY-adjacent price, not anything farther down the line.
    const ctxBefore = text.slice(Math.max(0, idx - 15), idx).toLowerCase();
    const ctxAfter = text.slice(idx + match[0].length, idx + match[0].length + 12).toLowerCase();
    // Skip monthly financing / coupons attached to THIS number.
    if (/^\s*\/\s*mes\b|^\s*al\s*mes\b|^\s*por\s*mes\b|cup[oó]n/i.test(ctxAfter)) continue;
    // Skip explicit old-price markers immediately before THIS number.
    if (/(\bantes\b|\bpvp\b|precio\s+anterior|tachad|recommended|recomendado)\s*[:\-]?\s*$/i.test(ctxBefore)) continue;
    candidates.push({ value: num, idx });
  }
  if (candidates.length === 0) return null;
  // Prefer the last reasonable candidate (>= €5 by default to drop "1€/mes" noise).
  const reasonable = candidates.filter((c) => c.value >= 5);
  const pool = reasonable.length > 0 ? reasonable : candidates;
  // Return the LAST reasonable price (current price typically follows old price).
  return pool[pool.length - 1].value;
}

function parseRating(text: string): number | null {
  const match = text.match(/(\d[.,]\d)\s*(?:de\s*5|estrellas|\/5|out of 5)/i);
  if (!match) return null;
  return parseFloat(match[1].replace(",", "."));
}

function parseReviewCount(text: string): number | null {
  const match = text.match(/(\d{1,3}(?:[.,]\d{3})*)\s*(?:valoraciones|reseñas|opiniones|ratings|reviews)/i);
  if (!match) return null;
  return parseInt(match[1].replace(/[.,]/g, ""), 10);
}

function parseAmazonImage(markdown: string): string | null {
  // Amazon CDN images: https://m.media-amazon.com/images/I/<id>.jpg
  const match = markdown.match(/https?:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9+\-]+\._[A-Z0-9_,]+_\.(?:jpg|png|webp)/i);
  if (match) return match[0];
  // Fallback: any media-amazon image
  const fallback = markdown.match(/https?:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9+\-]+\.(?:jpg|png|webp)/i);
  return fallback ? fallback[0] : null;
}

function pickProductImage(markdown: string, merchantKey: MerchantKey): string | null {
  if (merchantKey === "amazon") return parseAmazonImage(markdown);
  // For others, take first markdown image src
  const match = markdown.match(/!\[[^\]]*\]\((https?:\/\/[^\s)]+\.(?:jpg|jpeg|png|webp)[^\s)]*)\)/i);
  return match ? match[1] : null;
}

function normalizeForSim(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Jaccard similarity over multi-char tokens. Symmetric — uses union of both
// token sets in the denominator so a short candidate name cannot register 1.0
// just because all of its few tokens appear somewhere in a large context.
function similarity(a: string, b: string): number {
  const aTokens = new Set(normalizeForSim(a).split(" ").filter((t) => t.length > 2));
  const bTokens = new Set(normalizeForSim(b).split(" ").filter((t) => t.length > 2));
  if (aTokens.size === 0 || bTokens.size === 0) return 0;
  let intersection = 0;
  for (const t of aTokens) if (bTokens.has(t)) intersection += 1;
  const union = aTokens.size + bTokens.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function appendAmazonTag(url: string, tag: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set("tag", tag);
    return u.toString();
  } catch {
    return url;
  }
}

interface FirecrawlSearchResult {
  success: boolean;
  data?: Array<{
    url: string;
    title?: string;
    description?: string;
    markdown?: string;
    metadata?: Record<string, unknown>;
  }>;
  error?: string;
}

async function firecrawlSearch(query: string, limit: number, scrape = true): Promise<FirecrawlSearchResult> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) return { success: false, error: "FIRECRAWL_API_KEY not set" };
  const body: Record<string, unknown> = {
    query,
    limit,
    location: "Spain",
    lang: "es",
  };
  if (scrape) {
    body.scrapeOptions = {
      formats: ["markdown"],
      onlyMainContent: true,
    };
  }
  const controller = new AbortController();
  const abortTimer = setTimeout(() => controller.abort(), FIRECRAWL_HARD_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) return { success: false, error: `HTTP ${res.status}: ${(await res.text()).slice(0, 200)}` };
    return (await res.json()) as FirecrawlSearchResult;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { success: false, error: `aborted-after-${FIRECRAWL_HARD_TIMEOUT_MS}ms` };
    }
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(abortTimer);
  }
}

function buildSearchQuery(slug: string, sections: string[], merchantKey: MerchantKey): string {
  // Strip merchant prefixes from slug for cleaner query
  const prefixes = ["ikea-", "maisons-du-monde-", "kave-home-", "leroy-merlin-", "el-corte-ingles-", "conforama-", "carrefour-", "aldi-"];
  let slugPart = slug;
  for (const p of prefixes) if (slugPart.startsWith(p)) { slugPart = slugPart.slice(p.length); break; }
  const slugWords = slugPart.replace(/-/g, " ");

  // Use the most specific section heading if available
  // Section example: "1. IKEA TEODORES · pack 4" → "IKEA TEODORES pack 4"
  let sectionHint = "";
  for (const s of sections) {
    const cleaned = s.replace(/^[\d.]+\s*/, "").replace(/[·•|]/g, " ").trim();
    if (cleaned.length > 3 && cleaned.length < 80) {
      sectionHint = cleaned;
      break;
    }
  }

  const brandHint = merchantKey === "ikea" ? "IKEA" :
    merchantKey === "maisonsdumonde" ? "Maisons du Monde" :
    merchantKey === "kavehome" ? "Kave Home" :
    merchantKey === "leroymerlin" ? "Leroy Merlin" :
    merchantKey === "elcorteingles" ? "El Corte Inglés" :
    merchantKey === "conforama" ? "Conforama" :
    merchantKey === "carrefour" ? "Carrefour" :
    merchantKey === "aldi" ? "Aldi" : "";

  const merchant = MERCHANTS[merchantKey];
  const parts = [sectionHint, brandHint, slugWords].filter((p) => p);
  const dedup = parts.filter((p, i) => parts.findIndex((q) => q.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(q.toLowerCase())) === i || i === 0);
  const baseQuery = dedup.join(" ").replace(/\s+/g, " ").trim();
  return `${baseQuery} site:${merchant.domain}`;
}

function isProductPage(url: string, merchantKey: MerchantKey): boolean {
  const merchant = MERCHANTS[merchantKey];
  return merchant.productLinkPattern.test(url);
}

function stripModelCodes(text: string): string {
  // Strip tokens that look like model codes (≥5 chars, mix of letters+digits)
  // so the fallback query has a chance of matching when the exact model is
  // not indexed (e.g., "aeg bpe948330m horno" → "aeg horno").
  return text
    .split(/\s+/)
    .filter((t) => !(t.length >= 5 && /[a-z]/i.test(t) && /\d/.test(t)))
    .join(" ")
    .trim();
}

async function scrapeOne(entry: MerchantMapEntry, articleContext: { sections: string[]; firstContext: string }): Promise<ScrapedProduct | null> {
  const warnings: string[] = [];
  const merchant = MERCHANTS[entry.merchantKey];
  const primaryQuery = buildSearchQuery(entry.slug, articleContext.sections, entry.merchantKey);
  const baseQuery = primaryQuery.replace(/\s*site:\S+\s*$/, "").trim();

  // Strategy ladder. Each entry is { query, label, acceptMerchant }.
  //   acceptMerchant: which MerchantSpec to attribute the hit to (and which
  //     productLinkPattern to validate against). For non-Amazon primaries, we
  //     also accept Amazon-domain hits in later strategies.
  type Strategy = { query: string; label: string; targetMerchant: MerchantSpec };
  const strategies: Strategy[] = [
    { query: primaryQuery, label: "site-restricted", targetMerchant: merchant },
    { query: baseQuery, label: "broad-no-site", targetMerchant: merchant },
  ];
  const stripped = stripModelCodes(baseQuery);
  if (stripped && stripped !== baseQuery) {
    strategies.push({ query: `${stripped} site:${merchant.domain}`, label: "no-model-code-on-merchant", targetMerchant: merchant });
    if (entry.merchantKey !== "amazon") {
      strategies.push({ query: `${stripped} site:amazon.es`, label: "no-model-code-on-amazon", targetMerchant: MERCHANTS.amazon });
    }
  }
  if (entry.merchantKey !== "amazon") {
    strategies.push({ query: `${baseQuery} site:amazon.es`, label: "amazon-fallback", targetMerchant: MERCHANTS.amazon });
  }

  let firstNonEmpty: { hit: NonNullable<FirecrawlSearchResult["data"]>[number]; merchant: MerchantSpec; query: string } | null = null;

  for (const strat of strategies) {
    const res = await firecrawlSearch(strat.query, 3, true);
    if (!res.success) {
      warnings.push(`strategy-${strat.label}-error: ${res.error}`);
      continue;
    }
    if (!res.data || res.data.length === 0) {
      warnings.push(`strategy-${strat.label}-empty`);
      continue;
    }
    // Prefer a hit whose URL matches the targetMerchant's product pattern.
    const productHit = res.data.find((r) => isProductPage(r.url, strat.targetMerchant.key));
    if (productHit) {
      return extractFromSearchHit(entry, articleContext, productHit, strat.targetMerchant, strat.query, warnings);
    }
    // Some merchants don't always return product-shaped URLs (Carrefour, ECI).
    // Fall back to any amazon.es hit in the broader results before giving up.
    const amazonHit = res.data.find((r) => isProductPage(r.url, "amazon"));
    if (amazonHit) {
      warnings.push(`strategy-${strat.label}-found-amazon-hit-instead`);
      return extractFromSearchHit(entry, articleContext, amazonHit, MERCHANTS.amazon, strat.query, warnings);
    }
    if (!firstNonEmpty) firstNonEmpty = { hit: res.data[0], merchant: strat.targetMerchant, query: strat.query };
  }

  // No strategy yielded a product-shaped hit. If we saw ANY hit, store its
  // metadata (with price/image extracted) but mark it for review.
  if (firstNonEmpty) {
    warnings.push("no-strategy-produced-product-page");
    const stub = extractFromSearchHit(entry, articleContext, firstNonEmpty.hit, firstNonEmpty.merchant, firstNonEmpty.query, warnings);
    stub.price = null; // force into review queue
    stub.imageUrl = null;
    return stub;
  }

  warnings.push("all-strategies-empty");
  return {
    slug: entry.slug,
    merchant: merchant.name,
    merchantDomain: merchant.domain,
    searchUrl: primaryQuery,
    productUrl: "",
    name: entry.query,
    price: null,
    oldPrice: null,
    imageUrl: null,
    description: "",
    rating: null,
    reviewCount: null,
    rawMarkdownSample: "",
    confidence: 0,
    scrapedAt: new Date().toISOString(),
    warnings,
  };
}

function extractFromSearchHit(
  entry: MerchantMapEntry,
  articleContext: { sections: string[]; firstContext: string },
  hit: { url: string; title?: string; description?: string; markdown?: string; metadata?: Record<string, unknown> },
  merchant: MerchantSpec,
  query: string,
  warnings: string[],
): ScrapedProduct {
  const cleanProductUrl = hit.url.split("?")[0];
  const md = hit.markdown ?? "";
  const metadata = hit.metadata ?? {};

  let name = (metadata.title as string | undefined) ?? hit.title ?? "";
  if (!name) {
    const h1 = md.match(/^#\s+(.+)$/m);
    if (h1) name = h1[1].trim();
  }
  if (!name) name = entry.query;
  name = name.replace(/\s*[:|·]\s*Amazon\..*$/i, "").replace(/\s*[:|]\s*IKEA.*$/i, "").replace(/\s*-\s*IKEA\s*$/i, "").trim();

  const price = parsePrice(md);
  const rating = parseRating(md);
  const reviewCount = parseReviewCount(md);
  const imageUrl = pickProductImage(md, merchant.key) ?? (metadata["og:image"] as string | undefined) ?? null;

  const paragraphs = md.split(/\n{2,}/).filter((p) => p.trim().length > 80 && !p.startsWith("#") && !p.startsWith("!"));
  const description = (paragraphs[0] ?? hit.description ?? "").slice(0, 600);

  const confidenceTarget = [...articleContext.sections, entry.query].join(" ");
  const confidence = similarity(name, confidenceTarget);

  let affiliateUrl = cleanProductUrl;
  if (merchant.key === "amazon") {
    affiliateUrl = appendAmazonTag(cleanProductUrl, "ahorrhogar-21");
  }

  if (!isProductPage(hit.url, merchant.key)) {
    warnings.push("top-result-is-not-product-page");
  }

  return {
    slug: entry.slug,
    merchant: merchant.name,
    merchantDomain: merchant.domain,
    searchUrl: query,
    productUrl: affiliateUrl,
    name,
    price,
    oldPrice: null,
    imageUrl,
    description,
    rating,
    reviewCount,
    rawMarkdownSample: md.slice(0, 800),
    confidence,
    scrapedAt: new Date().toISOString(),
    warnings,
  };
}

async function runWithConcurrency<T, R>(items: T[], limit: number, worker: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length) as R[];
  let cursor = 0;
  const workers: Promise<void>[] = [];
  for (let w = 0; w < Math.min(limit, items.length); w += 1) {
    workers.push(
      (async () => {
        while (true) {
          const idx = cursor;
          cursor += 1;
          if (idx >= items.length) break;
          results[idx] = await worker(items[idx], idx);
        }
      })(),
    );
  }
  await Promise.all(workers);
  return results;
}

async function phase2Scrape(): Promise<void> {
  const mapPath = path.join(DATA_DIR, "slug-merchant-map.json");
  const placeholdersPath = path.join(DATA_DIR, "placeholders.json");
  const map: MerchantMapEntry[] = JSON.parse(await fs.readFile(mapPath, "utf-8"));
  const inventory: PlaceholderInventory[] = JSON.parse(await fs.readFile(placeholdersPath, "utf-8"));
  const contextBySlug = new Map<string, { sections: string[]; firstContext: string }>();
  for (const entry of inventory) {
    const sections = [...new Set(entry.occurrences.map((o) => o.section).filter((s) => s))];
    const firstContext = entry.occurrences[0]?.contextBefore ?? "";
    contextBySlug.set(entry.slug, { sections: sections.slice(0, 3), firstContext });
  }

  const scrapedDir = path.join(DATA_DIR, "scraped");
  await fs.mkdir(scrapedDir, { recursive: true });

  let subset = map;
  if (process.env.SCRAPE_LIMIT) {
    const lim = parseInt(process.env.SCRAPE_LIMIT, 10);
    if (!Number.isFinite(lim) || lim <= 0) {
      console.error(`Invalid SCRAPE_LIMIT=${JSON.stringify(process.env.SCRAPE_LIMIT)} — must be a positive integer.`);
      process.exit(1);
    }
    subset = map.slice(0, lim);
  }
  const slugFilter = process.env.SCRAPE_SLUGS
    ? new Set(process.env.SCRAPE_SLUGS.split(",").map((s) => s.trim()).filter(Boolean))
    : null;
  const targets = slugFilter ? subset.filter((m) => slugFilter.has(m.slug)) : subset;
  if (slugFilter && targets.length === 0) {
    console.error(`SCRAPE_SLUGS=${process.env.SCRAPE_SLUGS} matched no slugs in slug-merchant-map.json.`);
    process.exit(1);
  }
  console.info(`[phase-2] scraping ${targets.length} products (concurrency=5)...`);
  let done = 0;
  let cached = 0;
  let failed = 0;
  const lowConfidence: ScrapedProduct[] = [];

  await runWithConcurrency(targets, 5, async (entry) => {
    const cachePath = path.join(scrapedDir, `${entry.slug}.json`);
    try {
      try {
        const stat = await fs.stat(cachePath);
        const text = await fs.readFile(cachePath, "utf-8");
        let cachedJson: ScrapedProduct;
        try {
          cachedJson = JSON.parse(text);
        } catch (parseErr) {
          console.warn(`[phase-2] cache corrupt for ${entry.slug}, re-scraping: ${parseErr instanceof Error ? parseErr.message : parseErr}`);
          throw parseErr;
        }
        const ageMs = Date.now() - stat.mtimeMs;
        const isFresh = ageMs < 1000 * 60 * 60 * 24 * 7; // 7 days
        const isSuccessful =
          typeof cachedJson.price === "number" &&
          typeof cachedJson.imageUrl === "string" && cachedJson.imageUrl.length > 0;
        if (isFresh && isSuccessful) {
          cached += 1;
          done += 1;
          if (cachedJson.confidence < 0.6) lowConfidence.push(cachedJson);
          if (done % 10 === 0) console.info(`[phase-2] ${done}/${targets.length} (cached: ${cached}, failed: ${failed})`);
          return;
        }
      } catch (cacheErr) {
        const code = (cacheErr as NodeJS.ErrnoException)?.code;
        if (code && code !== "ENOENT") {
          console.warn(`[phase-2] cache read failed for ${entry.slug} (${code}), re-scraping`);
        }
      }
      const articleContext = contextBySlug.get(entry.slug) ?? { sections: [], firstContext: "" };
      const result = await scrapeOne(entry, articleContext);
      if (!result) {
        failed += 1;
      } else {
        await fs.writeFile(cachePath, JSON.stringify(result, null, 2), "utf-8");
        if (result.warnings.length > 0 || result.price === null) failed += 1;
        if (result.confidence < 0.6) lowConfidence.push(result);
      }
      done += 1;
      if (done % 10 === 0) console.info(`[phase-2] ${done}/${targets.length} (cached: ${cached}, failed: ${failed})`);
    } catch (workerErr) {
      // Never let a worker exception abort the pool — log, count, continue.
      failed += 1;
      done += 1;
      console.error(`[phase-2] worker failed for ${entry.slug}: ${workerErr instanceof Error ? workerErr.message : workerErr}`);
    }
  });

  const reviewPath = path.join(DATA_DIR, "review-needed.json");
  await fs.writeFile(reviewPath, JSON.stringify(lowConfidence, null, 2), "utf-8");

  console.info("");
  console.info("======================================================");
  console.info("PHASE 2 — Firecrawl scrape complete");
  console.info("======================================================");
  console.info(`Targets:                 ${targets.length}`);
  console.info(`Cached (skipped):        ${cached}`);
  console.info(`Scraped this run:        ${done - cached}`);
  console.info(`Failed/incomplete:       ${failed}`);
  console.info(`Low-confidence (<0.6):   ${lowConfidence.length}`);
  console.info("");
  console.info(`Per-slug cache:    ${path.relative(REPO_ROOT, scrapedDir)}/`);
  console.info(`Review queue:      ${path.relative(REPO_ROOT, reviewPath)}`);
}

// =====================================================================
// PHASE 3 — Consolidate scraped/*.json → scripts/data/products.ts
// =====================================================================

// Map an article cluster to a 2-level category path used by the catalog.
// The leaf is intentionally coarse — admin can re-categorize products in the
// /admin panel after seeding. Keys match the cluster values emitted by Phase 0.
const CLUSTER_CATEGORY_PATH: Record<string, string[]> = {
  "A-muebles-terraza-jardin": ["jardin-exterior", "muebles-jardin"],
  "B-electrodomesticos-verano": ["electrodomesticos", "climatizacion"],
  "C-muebles-general": ["muebles", "muebles-salon"],
  "D-electrodomesticos-general": ["electrodomesticos", "grandes-electrodomesticos"],
  "E-comparador-generico": ["destacados"],
  pillars: ["destacados"],
};

// Multi-word merchant-prefix slugs need to map to the proper brand display name.
// Keep this aligned with the prefixes in pickMerchant() / buildSearchQuery().
const MERCHANT_PREFIX_TO_BRAND: Array<[string, string]> = [
  ["el-corte-ingles-", "El Corte Inglés"],
  ["maisons-du-monde-", "Maisons du Monde"],
  ["kave-home-", "Kave Home"],
  ["leroy-merlin-", "Leroy Merlin"],
  ["conforama-", "Conforama"],
  ["carrefour-", "Carrefour"],
  ["ikea-", "IKEA"],
  ["aldi-", "Aldi"],
];

function deriveBrandFromName(name: string, slugFallback: string): string {
  // If the slug starts with a known multi-word merchant prefix, use that
  // canonical brand name (avoids "El", "Maisons", etc. polluting the Brand table).
  for (const [prefix, brand] of MERCHANT_PREFIX_TO_BRAND) {
    if (slugFallback.startsWith(prefix)) return brand;
  }
  // Otherwise prefer the first capitalized token (brand-like) from the scraped name.
  const cleaned = name.replace(/[®™]/g, "").trim();
  const firstToken = cleaned.split(/[\s,:|·-]+/)[0];
  if (firstToken && /^[A-ZÀ-Ý][A-Za-zÀ-ÿ0-9'&]+$/.test(firstToken)) return firstToken;
  // Last resort: derive from the slug's first hyphen-segment.
  const slugFirst = slugFallback.split("-")[0];
  return slugFirst.charAt(0).toUpperCase() + slugFirst.slice(1);
}

interface SeedProduct {
  slug: string;
  name: string;
  brand: string;
  categoryPath: string[];
  description: string;
  specs: Record<string, unknown>;
  attributes: Record<string, unknown>;
  imageUrl: string;
  offers: Array<{
    merchant: string;
    merchantDomain: string;
    price: number;
    oldPrice: number | null;
    url: string;
    scrapedAt: string;
  }>;
  sourceArticles: string[];
  confidence: number;
}

async function phase3Consolidate(): Promise<void> {
  const scrapedDir = path.join(DATA_DIR, "scraped");
  const placeholdersPath = path.join(DATA_DIR, "placeholders.json");
  const inventory: PlaceholderInventory[] = JSON.parse(await fs.readFile(placeholdersPath, "utf-8"));
  const inventoryBySlug = new Map(inventory.map((e) => [e.slug, e]));

  const files = (await fs.readdir(scrapedDir)).filter((f) => f.endsWith(".json"));
  console.info(`[phase-3] reading ${files.length} scraped JSONs...`);

  const products: SeedProduct[] = [];
  let skipped = 0;
  const skipReasons = new Map<string, number>();

  for (const file of files) {
    const raw = await fs.readFile(path.join(scrapedDir, file), "utf-8");
    let scraped: ScrapedProduct;
    try {
      scraped = JSON.parse(raw);
    } catch {
      skipped += 1;
      skipReasons.set("corrupt-json", (skipReasons.get("corrupt-json") ?? 0) + 1);
      continue;
    }

    if (!scraped.productUrl || scraped.price === null || !scraped.imageUrl) {
      skipped += 1;
      skipReasons.set("incomplete-scrape", (skipReasons.get("incomplete-scrape") ?? 0) + 1);
      continue;
    }

    const placeholder = inventoryBySlug.get(scraped.slug);
    if (!placeholder) {
      skipped += 1;
      skipReasons.set("no-placeholder-record", (skipReasons.get("no-placeholder-record") ?? 0) + 1);
      continue;
    }

    // Drop descriptions that are clearly cookie/legal banners — `onlyMainContent`
    // sometimes fails. Covers EN, ES, and a few common IKEA/MDM banner forms.
    const looksLikeBoilerplate = /^(if you agree|cookies and advertising|al hacer clic|cuando das tu consentimiento|en función de tu|aceptar cookies|política de cookies|usamos cookies|sin perjuicio de tus derechos)/i;
    const cleanDescription = (scraped.description && !looksLikeBoilerplate.test(scraped.description.trim()))
      ? scraped.description
      : "";

    const firstOcc = placeholder.occurrences[0];
    const categoryPath = CLUSTER_CATEGORY_PATH[firstOcc.cluster] ?? ["destacados"];
    const brand = deriveBrandFromName(scraped.name, scraped.slug);
    const sourceArticles = [...new Set(placeholder.occurrences.map((o) => o.articleSlug))];

    const specs: Record<string, unknown> = {
      slug: scraped.slug,
    };
    if (cleanDescription) specs.longdescription = cleanDescription;
    if (scraped.rating !== null) specs.rating = scraped.rating;
    if (scraped.reviewCount !== null) specs.reviewcount = scraped.reviewCount;

    // Build a useful, short description even when the scraped one was junk.
    const sectionHint = firstOcc.section
      .replace(/^[\d.]+\s*/, "")
      .replace(/[·•|]/g, " ")
      .trim();
    const fallbackDesc = sectionHint && sectionHint.length > 4
      ? `${scraped.name} — ${sectionHint} (referenced in ${sourceArticles[0]})`
      : scraped.name;
    const description = cleanDescription
      ? cleanDescription.slice(0, 500)
      : fallbackDesc.slice(0, 500);

    products.push({
      slug: scraped.slug,
      name: scraped.name,
      brand,
      categoryPath,
      description,
      specs,
      attributes: scraped.confidence < 0.5 ? { needsReview: true, scrapedConfidence: scraped.confidence } : {},
      imageUrl: scraped.imageUrl,
      offers: [
        {
          merchant: scraped.merchant,
          merchantDomain: scraped.merchantDomain,
          price: scraped.price,
          oldPrice: scraped.oldPrice,
          url: scraped.productUrl,
          scrapedAt: scraped.scrapedAt,
        },
      ],
      sourceArticles,
      confidence: scraped.confidence,
    });
  }

  products.sort((a, b) => a.slug.localeCompare(b.slug));

  const ts = new Date().toISOString();
  const header = `// Auto-generated by scripts/scrape-products.ts --consolidate on ${ts}
// Source: scripts/data/scraped/*.json (Firecrawl-scraped product data).
// Seed: npm run db:seed-products

export const AMAZON_AFFILIATE_TAG = "ahorrhogar-21";

export interface SeedProduct {
  slug: string;
  name: string;
  brand: string;
  categoryPath: string[];
  description: string;
  specs: Record<string, unknown>;
  attributes: Record<string, unknown>;
  imageUrl: string;
  offers: Array<{
    merchant: string;
    merchantDomain: string;
    price: number;
    oldPrice: number | null;
    url: string;
    scrapedAt: string;
  }>;
  sourceArticles: string[];
  confidence: number;
}

export const PRODUCTS: SeedProduct[] = `;

  const outPath = path.join(DATA_DIR, "products.ts");
  await fs.writeFile(outPath, header + JSON.stringify(products, null, 2) + ";\n", "utf-8");

  console.info("");
  console.info("======================================================");
  console.info("PHASE 3 — Consolidate scraped → products.ts");
  console.info("======================================================");
  console.info(`Scraped files:           ${files.length}`);
  console.info(`Products emitted:        ${products.length}`);
  console.info(`Skipped (need review):   ${skipped}`);
  if (skipReasons.size > 0) {
    console.info("Skip reasons:");
    for (const [reason, count] of skipReasons) console.info(`   ${reason.padEnd(28)} ${count}`);
  }
  console.info("");
  console.info(`Wrote: ${path.relative(REPO_ROOT, outPath)}`);
}

async function main(): Promise<void> {
  const flag = process.argv[2];

  switch (flag) {
    case "--inventory-only":
      await phase0Inventory();
      break;
    case "--map-merchants":
      await phase1MapMerchants();
      break;
    case "--scrape":
      await phase2Scrape();
      break;
    case "--consolidate":
      await phase3Consolidate();
      break;
    default:
      console.error("Usage: tsx scripts/scrape-products.ts <--inventory-only | --map-merchants | --scrape | --consolidate>");
      process.exit(1);
  }
}

main().catch((err) => {
  console.error("scrape-products failed:", err);
  process.exit(1);
});
