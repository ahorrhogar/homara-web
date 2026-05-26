"use server";

import { revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";

import { mapAdminErrorMessage } from "@/admin/services/admin-helpers";
import {
  IMPORT_BATCH_SIZE,
  IMPORT_CHUNK_SIZE,
  assertCsvLimits,
  buildImportPayload,
  parseCsv,
  validateImportPayloadRows,
  type ImportPayloadRow,
} from "@/admin/services/adminImportService-helpers";

export type { CsvPreviewResult } from "@/admin/services/adminImportService-helpers";
import { slugify } from "@/data/catalog/_helpers";
import {
  CATALOG_CACHE_TAG,
  RANKING_SIGNALS_CACHE_TAG,
} from "@/data/catalog/snapshot";
import type { ImportColumnMapping } from "@/admin/types";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { rehostRemoteImage } from "@/lib/r2";

// Re-export the preview helper so callers keep the same import path.
// (Inside a "use server" file, only async functions can be exported, so we
// wrap the sync helper.)
export async function parseCsvPreview(csvText: string) {
  const { parseCsvPreview: pure } = await import("@/admin/services/adminImportService-helpers");
  return pure(csvText);
}

export interface CsvImportResult {
  jobId: string;
  createdCount: number;
  updatedCount: number;
  errorCount: number;
  warningCount: number;
  processedRows: number;
  totalRows: number;
  nextIndex: number;
  done: boolean;
}

async function logImportAudit(
  userId: string,
  action: string,
  jobId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  try {
    await db.adminAction.create({
      data: {
        userId,
        action,
        entityType: "catalog",
        entityId: jobId,
        payload: { source: "adminImportService", ...payload },
      },
    });
  } catch {
    // never block import on audit failures
  }
}

async function persistRowErrors(jobId: string, errors: Array<{ rowIndex: number; message: string }>) {
  if (!errors.length) return;
  await db.importJobLog.createMany({
    data: errors.slice(0, 200).map((e) => ({
      jobId,
      level: "error",
      rowIndex: e.rowIndex,
      message: e.message.slice(0, 1000),
      payload: {},
    })),
  });
}

async function persistRowWarnings(jobId: string, warnings: Array<{ rowIndex: number; message: string }>) {
  if (!warnings.length) return;
  await db.importJobLog.createMany({
    data: warnings.slice(0, 200).map((w) => ({
      jobId,
      level: "warning",
      rowIndex: w.rowIndex,
      message: w.message.slice(0, 1000),
      payload: {},
    })),
  });
}

interface CacheKeys {
  brands: Map<string, string>;
  categoriesTop: Map<string, string>;
  categoriesSub: Map<string, string>;
  merchants: Map<string, string>;
}

async function ensureBrand(name: string, cache: CacheKeys): Promise<string> {
  const key = name.trim().toLowerCase();
  if (cache.brands.has(key)) return cache.brands.get(key)!;
  const existing = await db.brand.findUnique({ where: { name: name.trim() }, select: { id: true } });
  if (existing) {
    cache.brands.set(key, existing.id);
    return existing.id;
  }
  const created = await db.brand.create({ data: { name: name.trim() }, select: { id: true } });
  cache.brands.set(key, created.id);
  return created.id;
}

async function ensureCategory(
  name: string,
  parentId: string | null,
  cache: CacheKeys,
): Promise<string> {
  const map = parentId ? cache.categoriesSub : cache.categoriesTop;
  const key = `${parentId ?? "root"}::${name.trim().toLowerCase()}`;
  if (map.has(key)) return map.get(key)!;
  const slug = slugify(name);
  const existing = await db.category.findFirst({
    where: { name: { equals: name.trim(), mode: "insensitive" }, parentId: parentId ?? null },
    select: { id: true },
  });
  if (existing) {
    map.set(key, existing.id);
    return existing.id;
  }
  const created = await db.category.create({
    data: { name: name.trim(), slug, parentId: parentId ?? null },
    select: { id: true },
  });
  map.set(key, created.id);
  return created.id;
}

async function ensureMerchant(name: string, cache: CacheKeys): Promise<string> {
  const key = name.trim().toLowerCase();
  if (cache.merchants.has(key)) return cache.merchants.get(key)!;
  const existing = await db.merchant.findFirst({
    where: { name: { equals: name.trim(), mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) {
    cache.merchants.set(key, existing.id);
    return existing.id;
  }
  const created = await db.merchant.create({ data: { name: name.trim() }, select: { id: true } });
  cache.merchants.set(key, created.id);
  return created.id;
}

async function importRow(
  row: ImportPayloadRow,
  cache: CacheKeys,
): Promise<{ created: boolean; updated: boolean; warning?: string }> {
  const brandId = await ensureBrand(row.brand_name, cache);
  const topCategoryId = await ensureCategory(row.category_name, null, cache);
  const categoryId = row.subcategory_name
    ? await ensureCategory(row.subcategory_name, topCategoryId, cache)
    : topCategoryId;
  const merchantId = await ensureMerchant(row.merchant_name, cache);

  // Locate existing product by name+brand. Slug stays stable per HARD RULE #2.
  const existing = await db.product.findFirst({
    where: { name: { equals: row.product_name, mode: "insensitive" }, brandId },
    select: { id: true },
  });

  const specs: Prisma.JsonObject = {
    slug: slugify(row.product_name),
    longDescription: row.long_description || row.description,
    tags: row.tags,
    sku: row.sku,
    ean: row.ean,
  };

  const productData = {
    name: row.product_name,
    brandId,
    categoryId,
    description: row.description || row.long_description || row.product_name,
    specs,
    isActive: true,
  };

  const product = existing
    ? await db.product.update({ where: { id: existing.id }, data: productData, select: { id: true } })
    : await db.product.create({ data: productData, select: { id: true } });

  // Image — rehost into R2; fall back to the source URL on failure.
  let warning: string | undefined;
  if (row.image_url) {
    const rehost = await rehostRemoteImage(row.image_url, "products");
    if (!rehost.rehosted && rehost.warning) {
      warning = `Imagen sin rehospedar (${rehost.warning}): ${row.image_url}`;
    }
    const imageExists = await db.productImage.findFirst({
      where: { productId: product.id, url: rehost.url },
      select: { id: true },
    });
    if (!imageExists) {
      const hasPrimary = await db.productImage.count({
        where: { productId: product.id, isPrimary: true },
      });
      await db.productImage.create({
        data: {
          productId: product.id,
          url: rehost.url,
          isPrimary: hasPrimary === 0,
          sortOrder: 0,
        },
      });
    }
  }

  // Offer (one per product+merchant)
  const existingOffer = await db.offer.findFirst({
    where: { productId: product.id, merchantId },
    select: { id: true },
  });
  const offerData = {
    productId: product.id,
    merchantId,
    price: new Prisma.Decimal(row.price),
    oldPrice: row.old_price ? new Prisma.Decimal(row.old_price) : null,
    currentPrice: new Prisma.Decimal(row.price),
    url: row.offer_url,
    stock: row.stock,
    isActive: true,
    sourceType: "manual",
    syncStatus: "ok",
    lastCheckedAt: new Date(),
  };
  if (existingOffer) {
    await db.offer.update({ where: { id: existingOffer.id }, data: offerData });
  } else {
    await db.offer.create({ data: offerData });
  }

  return { created: !existing, updated: Boolean(existing), warning };
}

/**
 * Process one chunk of a CSV import. Resumable: the first call (no jobId)
 * parses + validates the whole CSV and creates the job; each subsequent call
 * resumes at `startIndex`. Images are rehosted into R2 synchronously, so
 * chunks are kept small to stay within serverless function time limits. The
 * client loops until `done` is true.
 */
export async function runCsvImport(params: {
  csvText: string;
  mapping: ImportColumnMapping;
  sourceLabel?: string;
  jobId?: string;
  startIndex?: number;
  chunkSize?: number;
}): Promise<CsvImportResult> {
  const session = await requireAdmin();

  assertCsvLimits(params.csvText);
  const rows = parseCsv(params.csvText);
  assertCsvLimits(params.csvText, rows.length);
  if (!rows.length) throw new Error("El CSV no contiene filas para importar");

  const payloadRows = buildImportPayload(rows, params.mapping);
  const totalRows = payloadRows.length;
  const chunkSize = Math.max(1, Math.min(50, params.chunkSize ?? IMPORT_CHUNK_SIZE));
  const startIndex = Math.min(Math.max(0, params.startIndex ?? 0), totalRows);

  // ── First call: validate everything up front, then create the job. ──
  let jobId = params.jobId;
  if (!jobId) {
    const job = await db.importJob.create({
      data: {
        userId: session.user.id,
        source: params.sourceLabel?.slice(0, 60) || "admin_csv",
        status: "running",
        rowCount: totalRows,
        metadata: {
          mapping: params.mapping,
          batchSize: IMPORT_BATCH_SIZE,
          chunkSize,
          warningCount: 0,
        } as unknown as Prisma.InputJsonValue,
        startedAt: new Date(),
      },
      select: { id: true },
    });
    jobId = job.id;

    await logImportAudit(session.user.id, "import.csv.started", jobId, {
      rowCount: totalRows,
      chunkSize,
    });

    const preErrors = validateImportPayloadRows(payloadRows);
    if (preErrors.length) {
      await persistRowErrors(jobId, preErrors);
      await db.importJob.update({
        where: { id: jobId },
        data: { status: "failed", errorCount: preErrors.length, finishedAt: new Date() },
      });
      await logImportAudit(session.user.id, "import.csv.failed", jobId, {
        reason: "validation",
        errorCount: preErrors.length,
      });
      throw new Error(`Importacion bloqueada por seguridad. Filas con error: ${preErrors.length}`);
    }
  }

  const end = Math.min(startIndex + chunkSize, totalRows);
  const cache: CacheKeys = {
    brands: new Map(),
    categoriesTop: new Map(),
    categoriesSub: new Map(),
    merchants: new Map(),
  };

  let createdInChunk = 0;
  let updatedInChunk = 0;
  let errorInChunk = 0;
  const rowErrors: Array<{ rowIndex: number; message: string }> = [];
  const rowWarnings: Array<{ rowIndex: number; message: string }> = [];

  try {
    for (let index = startIndex; index < end; index += 1) {
      try {
        const result = await importRow(payloadRows[index], cache);
        if (result.created) createdInChunk += 1;
        if (result.updated) updatedInChunk += 1;
        if (result.warning) rowWarnings.push({ rowIndex: index, message: result.warning });
      } catch (error) {
        errorInChunk += 1;
        rowErrors.push({
          rowIndex: index,
          message: mapAdminErrorMessage(error, `Error desconocido en fila ${index}`),
        });
      }
    }

    if (rowErrors.length) await persistRowErrors(jobId, rowErrors);
    if (rowWarnings.length) await persistRowWarnings(jobId, rowWarnings);

    const accumulated = await db.importJob.update({
      where: { id: jobId },
      data: {
        createdCount: { increment: createdInChunk },
        updatedCount: { increment: updatedInChunk },
        errorCount: { increment: errorInChunk },
      },
      select: { createdCount: true, updatedCount: true, errorCount: true, metadata: true },
    });

    const baseMetadata =
      accumulated.metadata && typeof accumulated.metadata === "object" && !Array.isArray(accumulated.metadata)
        ? (accumulated.metadata as Record<string, unknown>)
        : {};
    const previousWarnings = Number(baseMetadata.warningCount);
    const warningCount = (Number.isFinite(previousWarnings) ? previousWarnings : 0) + rowWarnings.length;
    const nextIndex = end;
    const done = nextIndex >= totalRows;

    await db.importJob.update({
      where: { id: jobId },
      data: {
        status: done ? "completed" : "running",
        finishedAt: done ? new Date() : undefined,
        metadata: {
          ...baseMetadata,
          warningCount,
          processedRows: nextIndex,
        } as unknown as Prisma.InputJsonValue,
      },
    });

    if (done) {
      await logImportAudit(session.user.id, "import.csv", jobId, {
        rowCount: totalRows,
        createdCount: accumulated.createdCount,
        updatedCount: accumulated.updatedCount,
        errorCount: accumulated.errorCount,
        warningCount,
      });
      revalidateTag(CATALOG_CACHE_TAG, "default");
      revalidateTag(RANKING_SIGNALS_CACHE_TAG, "default");
    }

    return {
      jobId,
      createdCount: accumulated.createdCount,
      updatedCount: accumulated.updatedCount,
      errorCount: accumulated.errorCount,
      warningCount,
      processedRows: nextIndex,
      totalRows,
      nextIndex,
      done,
    };
  } catch (error) {
    await db.importJob.update({
      where: { id: jobId },
      data: { status: "failed", finishedAt: new Date() },
    });
    await logImportAudit(session.user.id, "import.csv.failed", jobId, {
      reason: error instanceof Error ? error.message : "unknown",
      startIndex,
    });
    throw error instanceof Error ? error : new Error("Importacion fallida");
  }
}
