/**
 * Idempotent product seed for the SEO content pillar.
 * Reads scripts/data/products.ts (built by `--consolidate` in scrape-products.ts)
 * and upserts categories, brands, products, images, merchants, offers, and a
 * price_history row per offer.
 *
 * Usage: npm run db:seed-products
 *
 * Re-runs are safe: products are keyed by `specs.slug` (JSON path filter),
 * offers by `(product_id, merchant_id)`, and product_images are skipped if
 * any image already exists for the product. price_history grows on every run
 * to capture the price-trend snapshot.
 */
import { db } from "../src/lib/db";
import { PRODUCTS, type SeedProduct } from "./data/products";

interface RunStats {
  productsCreated: number;
  productsUpdated: number;
  imagesCreated: number;
  offersCreated: number;
  offersUpdated: number;
  priceHistoryRows: number;
  brandsTouched: Set<string>;
  merchantsTouched: Set<string>;
  categoriesTouched: Set<string>;
  failures: Array<{ slug: string; error: string }>;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function getOrCreateCategoryPath(pathSegments: string[]): Promise<string> {
  if (pathSegments.length === 0) {
    throw new Error("categoryPath must have at least one segment");
  }
  let parentId: string | null = null;
  let leafId = "";
  for (let i = 0; i < pathSegments.length; i += 1) {
    const slug = pathSegments[i];
    const existing = await db.category.findFirst({
      where: { slug, parentId: parentId ?? null },
      select: { id: true },
    });
    if (existing) {
      leafId = existing.id;
      parentId = existing.id;
      continue;
    }
    const created = await db.category.create({
      data: {
        name: humanizeSlug(slug),
        slug,
        parentId: parentId ?? null,
        sortOrder: i,
        isActive: true,
      },
      select: { id: true },
    });
    leafId = created.id;
    parentId = created.id;
  }
  return leafId;
}

async function getOrCreateBrand(name: string): Promise<string> {
  // Brand.name is @unique — use upsert so concurrent seeds don't race into a P2002.
  const row = await db.brand.upsert({
    where: { name },
    create: { name, isActive: true },
    update: {},
    select: { id: true },
  });
  return row.id;
}

async function getOrCreateMerchant(name: string, domain: string): Promise<string> {
  const existing = await db.merchant.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    select: { id: true, domain: true },
  });
  if (existing) {
    // If the existing merchant has no domain or a stale one, patch it so
    // affiliate URL validation can still match the URL host. Never widen an
    // existing correct domain.
    if (!existing.domain || existing.domain !== domain) {
      if (!existing.domain) {
        await db.merchant.update({ where: { id: existing.id }, data: { domain } });
      } else {
        console.warn(`[seed-products] merchant '${name}' has domain=${existing.domain} in DB but seed wants ${domain} — leaving as-is, please reconcile manually.`);
      }
    }
    return existing.id;
  }
  const created = await db.merchant.create({
    data: { name, domain, country: "ES", isActive: true },
    select: { id: true },
  });
  return created.id;
}

async function upsertProductBySlug(
  product: SeedProduct,
  brandId: string,
  categoryId: string,
  stats: RunStats,
): Promise<string> {
  // Slug lives inside specs JSON — no top-level column, no native upsert.
  const existing = await db.product.findFirst({
    where: { specs: { path: ["slug"], equals: product.slug } },
    select: { id: true, specs: true, attributes: true },
  });
  if (existing) {
    // MERGE specs and attributes on re-run so admin edits (featured, editorialpriority,
    // needsReview cleared, etc.) survive. The scraped fields take precedence for
    // their own keys (newer price/rating/description), but admin-added keys persist.
    const existingSpecs = (existing.specs as Record<string, unknown> | null) ?? {};
    const existingAttrs = (existing.attributes as Record<string, unknown> | null) ?? {};
    await db.product.update({
      where: { id: existing.id },
      data: {
        name: product.name,
        brandId,
        categoryId,
        description: product.description,
        specs: { ...existingSpecs, ...product.specs } as object,
        attributes: { ...existingAttrs, ...product.attributes } as object,
        isActive: true,
      },
    });
    stats.productsUpdated += 1;
    return existing.id;
  }
  const created = await db.product.create({
    data: {
      name: product.name,
      brandId,
      categoryId,
      description: product.description,
      specs: product.specs as object,
      attributes: product.attributes as object,
      isActive: true,
    },
    select: { id: true },
  });
  stats.productsCreated += 1;
  return created.id;
}

async function ensurePrimaryImage(productId: string, url: string, stats: RunStats): Promise<void> {
  // Promote a primary image if the product has none. If a primary already exists
  // but its URL differs from the freshly-scraped one, refresh it so re-scrapes
  // can correct stale/tiny thumbnails. Other (secondary) images are left alone.
  const primary = await db.productImage.findFirst({
    where: { productId, isPrimary: true },
    select: { id: true, url: true },
  });
  if (primary) {
    if (primary.url !== url) {
      await db.productImage.update({ where: { id: primary.id }, data: { url } });
    }
    return;
  }
  await db.productImage.create({
    data: { productId, url, isPrimary: true, sortOrder: 0 },
  });
  stats.imagesCreated += 1;
}

async function upsertOffer(
  productId: string,
  merchantId: string,
  offer: SeedProduct["offers"][number],
  stats: RunStats,
): Promise<string> {
  const existing = await db.offer.findFirst({
    where: { productId, merchantId },
    select: { id: true },
  });
  const now = new Date();
  // sourceType MUST match the admin UI's Zod enum at
  // src/app/admin/(panel)/offers/page.tsx:70 — extending it requires a UI
  // change too. "feed" is the closest fit for bulk-imported affiliate data.
  const offerData = {
    price: offer.price,
    oldPrice: offer.oldPrice,
    currentPrice: offer.price,
    url: offer.url,
    stock: true,
    isActive: true,
    sourceType: "feed" as const,
    updateMode: "manual" as const,
    syncStatus: "ok" as const,
    lastCheckedAt: now,
  };
  let offerId: string;
  if (existing) {
    await db.offer.update({ where: { id: existing.id }, data: offerData });
    offerId = existing.id;
    stats.offersUpdated += 1;
  } else {
    const created = await db.offer.create({
      data: { productId, merchantId, ...offerData },
      select: { id: true },
    });
    offerId = created.id;
    stats.offersCreated += 1;
  }
  await db.priceHistory.create({
    data: {
      productId,
      offerId,
      merchantId,
      price: offer.price,
      oldPrice: offer.oldPrice,
      sourceType: "feed",
      updateMode: "manual",
      syncStatus: "ok",
      checkedAt: now,
      changeReason: "initial-seed-or-rescrape",
    },
  });
  stats.priceHistoryRows += 1;
  return offerId;
}

async function seedOne(product: SeedProduct, stats: RunStats): Promise<void> {
  // Categories, brands and merchants are pre-resolved outside the per-product
  // transaction because they're shared by many products. Wrapping the
  // product+image+offer writes in $transaction keeps mid-failure atomic so a
  // half-seeded row never lingers (e.g. product without offer is silently
  // hidden by the public catalog).
  const categoryId = await getOrCreateCategoryPath(product.categoryPath);
  stats.categoriesTouched.add(product.categoryPath.join(" > "));
  const brandId = await getOrCreateBrand(product.brand);
  stats.brandsTouched.add(product.brand);

  const merchantIdByName = new Map<string, string>();
  for (const offer of product.offers) {
    if (!merchantIdByName.has(offer.merchant)) {
      merchantIdByName.set(offer.merchant, await getOrCreateMerchant(offer.merchant, offer.merchantDomain));
      stats.merchantsTouched.add(offer.merchant);
    }
  }

  await db.$transaction(async () => {
    const productId = await upsertProductBySlug(product, brandId, categoryId, stats);
    await ensurePrimaryImage(productId, product.imageUrl, stats);
    for (const offer of product.offers) {
      const merchantId = merchantIdByName.get(offer.merchant)!;
      await upsertOffer(productId, merchantId, offer, stats);
    }
  });
}

async function main(): Promise<void> {
  if (!Array.isArray(PRODUCTS) || PRODUCTS.length === 0) {
    console.error("scripts/data/products.ts is empty — run `npx tsx scripts/scrape-products.ts --consolidate` first.");
    process.exit(1);
  }

  const stats: RunStats = {
    productsCreated: 0,
    productsUpdated: 0,
    imagesCreated: 0,
    offersCreated: 0,
    offersUpdated: 0,
    priceHistoryRows: 0,
    brandsTouched: new Set(),
    merchantsTouched: new Set(),
    categoriesTouched: new Set(),
    failures: [],
  };

  console.info(`[seed-products] seeding ${PRODUCTS.length} products...`);
  for (let i = 0; i < PRODUCTS.length; i += 1) {
    const product = PRODUCTS[i];
    try {
      await seedOne(product, stats);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      stats.failures.push({ slug: product.slug, error: msg });
      console.error(`[seed-products] ${product.slug} FAILED: ${msg}`);
    }
    if ((i + 1) % 25 === 0) {
      console.info(`[seed-products] ${i + 1}/${PRODUCTS.length}  (created=${stats.productsCreated}, updated=${stats.productsUpdated}, failed=${stats.failures.length})`);
    }
  }

  console.info("");
  console.info("======================================================");
  console.info("seed-products complete");
  console.info("======================================================");
  console.info(`Products created:   ${stats.productsCreated}`);
  console.info(`Products updated:   ${stats.productsUpdated}`);
  console.info(`Primary images:     ${stats.imagesCreated}`);
  console.info(`Offers created:     ${stats.offersCreated}`);
  console.info(`Offers updated:     ${stats.offersUpdated}`);
  console.info(`price_history rows: ${stats.priceHistoryRows}`);
  console.info(`Brands touched:     ${stats.brandsTouched.size}`);
  console.info(`Merchants touched:  ${stats.merchantsTouched.size}`);
  console.info(`Categories touched: ${stats.categoriesTouched.size}`);
  console.info(`Failures:           ${stats.failures.length}`);
  if (stats.failures.length > 0) {
    console.info("");
    console.info("Failed slugs:");
    for (const f of stats.failures.slice(0, 20)) {
      console.info(`  - ${f.slug}: ${f.error}`);
    }
    if (stats.failures.length > 20) console.info(`  ... +${stats.failures.length - 20} more`);
    // Throw rather than calling process.exit(1) here — that would prevent the
    // outer .finally() from disconnecting Prisma cleanly. The outer .catch
    // handler exits 1 after disconnect.
    throw new Error(`${stats.failures.length} product(s) failed to seed`);
  }
}

main()
  .catch((err) => {
    console.error("seed-products failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
