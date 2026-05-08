"use server";

import { revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";

import { mapAdminErrorMessage } from "@/admin/services/admin-helpers";
import {
  IMPORT_BATCH_SIZE,
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
import { RATE_LIMITS } from "@/lib/redis";

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
): Promise<{ created: boolean; updated: boolean }> {
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

  // Image
  if (row.image_url) {
    const imageExists = await db.productImage.findFirst({
      where: { productId: product.id, url: row.image_url },
      select: { id: true },
    });
    if (!imageExists) {
      const hasPrimary = await db.productImage.count({
        where: { productId: product.id, isPrimary: true },
      });
      await db.productImage.create({
        data: {
          productId: product.id,
          url: row.image_url,
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

  return { created: !existing, updated: Boolean(existing) };
}

export async function runCsvImport(params: {
  csvText: string;
  mapping: ImportColumnMapping;
  sourceLabel?: string;
}): Promise<CsvImportResult> {
  const session = await requireAdmin();
  const limit = await RATE_LIMITS.adminWrite(`csvImport:${session.user.id}`);
  if (!limit.success) {
    throw new Error("Has alcanzado el limite temporal de operaciones. Espera unos segundos.");
  }

  assertCsvLimits(params.csvText);
  const rows = parseCsv(params.csvText);
  assertCsvLimits(params.csvText, rows.length);
  if (!rows.length) throw new Error("El CSV no contiene filas para importar");

  const job = await db.importJob.create({
    data: {
      userId: session.user.id,
      source: params.sourceLabel?.slice(0, 60) || "admin_csv",
      status: "running",
      rowCount: rows.length,
      metadata: { mapping: params.mapping, batchSize: IMPORT_BATCH_SIZE } as unknown as Prisma.InputJsonValue,
      startedAt: new Date(),
    },
    select: { id: true },
  });

  await logImportAudit(session.user.id, "import.csv.started", job.id, {
    rowCount: rows.length,
    batchSize: IMPORT_BATCH_SIZE,
  });

  try {
    const payloadRows = buildImportPayload(rows, params.mapping);
    const preErrors = validateImportPayloadRows(payloadRows);
    if (preErrors.length) {
      await persistRowErrors(job.id, preErrors);
      throw new Error(
        `Importacion bloqueada por seguridad. Filas con error: ${preErrors.length}`,
      );
    }

    const cache: CacheKeys = {
      brands: new Map(),
      categoriesTop: new Map(),
      categoriesSub: new Map(),
      merchants: new Map(),
    };

    let createdCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    const rowErrors: Array<{ rowIndex: number; message: string }> = [];

    for (let index = 0; index < payloadRows.length; index += 1) {
      try {
        const result = await importRow(payloadRows[index], cache);
        if (result.created) createdCount += 1;
        if (result.updated) updatedCount += 1;
      } catch (error) {
        errorCount += 1;
        rowErrors.push({
          rowIndex: index,
          message: mapAdminErrorMessage(error, `Error desconocido en fila ${index}`),
        });
      }
    }

    if (rowErrors.length) await persistRowErrors(job.id, rowErrors);

    await db.importJob.update({
      where: { id: job.id },
      data: {
        status: errorCount > 0 ? "completed" : "completed",
        createdCount,
        updatedCount,
        errorCount,
        finishedAt: new Date(),
        metadata: {
          mapping: params.mapping,
          batchSize: IMPORT_BATCH_SIZE,
          processedRows: payloadRows.length,
        } as unknown as Prisma.InputJsonValue,
      },
    });

    await logImportAudit(session.user.id, "import.csv", job.id, {
      rowCount: payloadRows.length,
      createdCount,
      updatedCount,
      errorCount,
    });

    revalidateTag(CATALOG_CACHE_TAG, "default");
    revalidateTag(RANKING_SIGNALS_CACHE_TAG, "default");

    return {
      jobId: job.id,
      createdCount,
      updatedCount,
      errorCount,
      warningCount: 0,
      processedRows: payloadRows.length,
    };
  } catch (error) {
    await db.importJob.update({
      where: { id: job.id },
      data: {
        status: "failed",
        errorCount: 1,
        finishedAt: new Date(),
        metadata: {
          mapping: params.mapping,
          batchSize: IMPORT_BATCH_SIZE,
          rollback: true,
        } as unknown as Prisma.InputJsonValue,
      },
    });

    await logImportAudit(session.user.id, "import.csv.failed", job.id, {
      reason: error instanceof Error ? error.message : "unknown",
    });

    throw error instanceof Error ? error : new Error("Importacion fallida");
  }
}
