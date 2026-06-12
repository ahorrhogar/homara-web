"use server";

import { revalidateTag } from "next/cache";
import type { Prisma } from "@prisma/client";

import {
  ARTICLES_CACHE_TAG,
  CATALOG_CACHE_TAG,
  CATEGORIES_CACHE_TAG,
  RANKING_SIGNALS_CACHE_TAG,
} from "@/data/catalog/snapshot";
import { slugify } from "@/data/catalog/_helpers";
import type {
  AdminActionRecord,
  AdminBrandRecord,
  AdminCategoryRecord,
  AdminClickRecord,
  AdminImportJobLogRecord,
  AdminImportJobRecord,
  AdminListQuery,
  AdminMerchantRecord,
  AdminOfferPriceHistoryRecord,
  AdminOfferRecord,
  AdminProductImageRecord,
  AdminProductRecord,
  DashboardMetrics,
  OfferSourceType,
  OfferSyncStatus,
  OfferUpdateMode,
  SyncStatusRecord,
} from "@/admin/types";
import { requireAdmin } from "@/lib/admin-guard";
import { cleanupReplacedImage, deleteR2ImageIfUnreferenced } from "@/lib/image-cleanup";
import { isAffiliateUrlAllowed } from "@/infrastructure/security/affiliateUrl";
import { normalizeExternalImageUrl, uploadToR2, type R2Folder } from "@/lib/r2";
import { db } from "@/lib/db";

// ─── Filters ──────────────────────────────────────────────────────────────

export interface ProductListFilters extends AdminListQuery {
  brandId?: string;
  categoryId?: string;
  isActive?: boolean;
}

export interface OfferListFilters extends AdminListQuery {
  productId?: string;
  categoryId?: string;
  merchantId?: string;
  sourceType?: OfferSourceType;
  syncStatus?: OfferSyncStatus;
  isActive?: boolean;
  reviewQueueFirst?: boolean;
}

export interface ProductMutationInput {
  id?: string;
  name: string;
  slug?: string;
  brandId: string;
  categoryId: string;
  shortDescription?: string;
  longDescription?: string;
  technicalSpecs?: Array<{ label: string; value: string }>;
  tags?: string[];
  attributes?: Record<string, unknown>;
  isActive: boolean;
  featured?: boolean;
  teamRecommended?: boolean;
  editorialPriority?: number;
  sku?: string;
  ean?: string;
}

export interface OfferMutationInput {
  id?: string;
  productId: string;
  merchantId: string;
  price: number;
  oldPrice?: number;
  url: string;
  stock: boolean;
  isActive: boolean;
  isFeatured: boolean;
  sourceType?: OfferSourceType;
  updateMode?: OfferUpdateMode;
  syncStatus?: OfferSyncStatus;
  nextCheckAt?: string;
  lastSyncError?: string;
  priorityScore?: number;
  freshnessScore?: number;
}

export interface ProductWithOfferInput {
  productId?: string;
  name: string;
  slug: string;
  brandId: string;
  categoryId: string;
  shortDescription: string;
  longDescription: string;
  technicalSpecs?: Array<{ label: string; value: string }>;
  tags?: string[];
  sku?: string;
  ean?: string;
  material?: string;
  color?: string;
  style?: string;
  dimensions?: string;
  weight?: string;
  rating?: number;
  reviewCount?: number;
  isActive: boolean;
  featured: boolean;
  teamRecommended: boolean;
  editorialPriority: number;
  primaryImageUrl?: string;
  offer: {
    merchantId: string;
    price: number;
    oldPrice?: number;
    url: string;
    stock: boolean;
    isActive: boolean;
    sourceType: OfferSourceType;
  };
}

export interface BrandMutationInput {
  id?: string;
  name: string;
  logoUrl?: string;
  isActive?: boolean;
}

export interface MerchantMutationInput {
  id?: string;
  name: string;
  logoUrl?: string;
  domain?: string;
  country?: string;
  isActive?: boolean;
  brandColor?: string;
}

export interface CategoryMutationInput {
  id?: string;
  name: string;
  slug?: string;
  parentId?: string | null;
  icon?: string;
  imageUrl?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

// ─── Audit helpers ────────────────────────────────────────────────────────

async function logAudit(
  userId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  payload: Record<string, unknown> = {},
): Promise<void> {
  try {
    await db.adminAction.create({
      data: {
        userId,
        action,
        entityType,
        entityId: entityId ?? null,
        payload: payload as unknown as Prisma.InputJsonValue,
      },
    });
  } catch {
    // Audit failures must never block operations.
  }
}

function invalidateCatalog() {
  revalidateTag(CATALOG_CACHE_TAG, "default");
  revalidateTag(CATEGORIES_CACHE_TAG, "default");
  revalidateTag(RANKING_SIGNALS_CACHE_TAG, "default");
}

function resolveImageUrlOrThrow(input: string): string {
  const { url, warning } = normalizeExternalImageUrl(input);
  if (warning) throw new Error(warning);
  return url;
}

// ─── Mappers ──────────────────────────────────────────────────────────────

type BrandRow = Prisma.BrandGetPayload<{ include: { _count: { select: { products: true } } } }>;
function mapBrand(row: BrandRow): AdminBrandRecord {
  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logoUrl ?? undefined,
    isActive: row.isActive,
    updatedAt: row.updatedAt.toISOString(),
    productCount: row._count?.products ?? 0,
  };
}

type MerchantRow = Prisma.MerchantGetPayload<{
  include: { _count: { select: { offers: true; clicks: true } } };
}>;
function mapMerchant(row: MerchantRow): AdminMerchantRecord {
  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logoUrl ?? undefined,
    domain: row.domain ?? undefined,
    country: row.country,
    isActive: row.isActive,
    brandColor: row.brandColor ?? undefined,
    updatedAt: row.updatedAt.toISOString(),
    offerCount: row._count?.offers ?? 0,
    clicks: row._count?.clicks ?? 0,
  };
}

type CategoryRow = Prisma.CategoryGetPayload<{
  include: { parent: { select: { name: true } }; _count: { select: { products: true } } };
}>;
function mapCategory(row: CategoryRow): AdminCategoryRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug ?? undefined,
    parentId: row.parentId,
    parentName: row.parent?.name,
    icon: row.icon ?? undefined,
    imageUrl: row.imageUrl ?? undefined,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    productCount: row._count?.products ?? 0,
    updatedAt: row.updatedAt.toISOString(),
  };
}

type ProductRow = Prisma.ProductGetPayload<{
  include: {
    brand: { select: { name: true } };
    category: { select: { name: true; parent: { select: { name: true } } } };
    images: { take: 1; orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] };
    offers: { where: { isActive: true }; select: { price: true } };
    _count: { select: { offers: true } };
  };
}>;
function readSpecs(specs: unknown): Record<string, unknown> {
  if (!specs || typeof specs !== "object" || Array.isArray(specs)) return {};
  return specs as Record<string, unknown>;
}
function mapProduct(row: ProductRow): AdminProductRecord {
  const specs = readSpecs(row.specs);
  const attributes = readSpecs(row.attributes);
  const techSpecs = Array.isArray(specs.attributes)
    ? (specs.attributes as Array<{ label?: string; value?: string }>).filter(
        (s) => s && typeof s.label === "string" && typeof s.value === "string",
      ).map((s) => ({ label: String(s.label), value: String(s.value) }))
    : [];
  const tags = Array.isArray(specs.tags) ? (specs.tags as unknown[]).filter((t) => typeof t === "string").map(String) : [];
  const minPrice = row.offers.length > 0 ? Math.min(...row.offers.map((o) => Number(o.price))) : 0;
  const primaryImage = row.images[0]?.url;
  return {
    id: row.id,
    name: row.name,
    slug: typeof specs.slug === "string" ? specs.slug : slugify(row.name),
    brandId: row.brandId,
    brandName: row.brand.name,
    categoryId: row.categoryId,
    categoryName: row.category.parent?.name ?? row.category.name,
    subcategoryName: row.category.parent ? row.category.name : undefined,
    shortDescription: row.description,
    longDescription: typeof specs.longDescription === "string" ? specs.longDescription : row.description,
    technicalSpecs: techSpecs,
    tags,
    attributes,
    isActive: row.isActive,
    featured: Boolean(specs.featured ?? attributes.featured),
    teamRecommended: Boolean(specs.teamRecommended ?? attributes.teamRecommended),
    editorialPriority: Number(specs.editorialPriority ?? attributes.editorialPriority ?? 0),
    sku: typeof specs.sku === "string" ? specs.sku : undefined,
    ean: typeof specs.ean === "string" ? specs.ean : undefined,
    material: typeof specs.material === "string" ? specs.material : undefined,
    color: typeof specs.color === "string" ? specs.color : undefined,
    style: typeof specs.style === "string" ? specs.style : undefined,
    dimensions: typeof specs.dimensions === "string" ? specs.dimensions : undefined,
    weight: typeof specs.weight === "string" ? specs.weight : undefined,
    rating: typeof specs.rating === "number" ? specs.rating : undefined,
    reviewCount: typeof specs.reviewCount === "number" ? specs.reviewCount : undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.createdAt.toISOString(),
    primaryImageUrl: primaryImage,
    offerCount: row._count?.offers ?? 0,
    minPrice,
  };
}

type OfferRow = Prisma.OfferGetPayload<{
  include: {
    product: { select: { name: true; categoryId: true; category: { select: { name: true } } } };
    merchant: { select: { name: true } };
  };
}>;
function mapOffer(row: OfferRow): AdminOfferRecord {
  const price = Number(row.price);
  const oldPrice = row.oldPrice ? Number(row.oldPrice) : undefined;
  const discount = oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : undefined;
  return {
    id: row.id,
    productId: row.productId,
    productName: row.product.name,
    categoryId: row.product.categoryId,
    categoryName: row.product.category.name,
    merchantId: row.merchantId,
    merchantName: row.merchant.name,
    sourceType: row.sourceType as OfferSourceType,
    updateMode: row.updateMode as OfferUpdateMode,
    syncStatus: row.syncStatus as OfferSyncStatus,
    currentPrice: row.currentPrice ? Number(row.currentPrice) : price,
    price,
    oldPrice,
    discountPercent: discount,
    url: row.url,
    stock: row.stock,
    isActive: row.isActive,
    isFeatured: row.isFeatured,
    lastCheckedAt: row.lastCheckedAt?.toISOString(),
    lastUpdatedBy: row.lastUpdatedBy ?? undefined,
    lastSyncError: row.lastSyncError ?? undefined,
    nextCheckAt: row.nextCheckAt?.toISOString(),
    priorityScore: Number(row.priorityScore),
    freshnessScore: Number(row.freshnessScore),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// ─── Brands ───────────────────────────────────────────────────────────────

export async function listBrands(): Promise<AdminBrandRecord[]> {
  await requireAdmin();
  const rows = await db.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return rows.map(mapBrand);
}

export async function upsertBrand(input: BrandMutationInput): Promise<AdminBrandRecord> {
  const session = await requireAdmin();
  const previous = input.id
    ? await db.brand.findUnique({ where: { id: input.id }, select: { logoUrl: true } })
    : null;
  const candidate = input.logoUrl?.trim();
  const logoUrl = candidate ? resolveImageUrlOrThrow(candidate) : null;
  const data = {
    name: input.name.trim(),
    logoUrl,
    isActive: input.isActive ?? true,
  };
  const row = input.id
    ? await db.brand.update({
        where: { id: input.id },
        data,
        include: { _count: { select: { products: true } } },
      })
    : await db.brand.create({
        data,
        include: { _count: { select: { products: true } } },
      });
  await cleanupReplacedImage(previous?.logoUrl, logoUrl);
  await logAudit(session.user.id, input.id ? "brand.update" : "brand.create", "brand", row.id, { name: data.name });
  invalidateCatalog();
  return mapBrand(row);
}

export async function deleteBrand(id: string): Promise<void> {
  const session = await requireAdmin();
  const used = await db.product.count({ where: { brandId: id } });
  if (used > 0) throw new Error("No se puede eliminar la marca: tiene productos asociados.");
  await db.brand.delete({ where: { id } });
  await logAudit(session.user.id, "brand.delete", "brand", id, {});
  invalidateCatalog();
}

// ─── Merchants ────────────────────────────────────────────────────────────

export async function listMerchants(): Promise<AdminMerchantRecord[]> {
  await requireAdmin();
  const rows = await db.merchant.findMany({
    include: { _count: { select: { offers: true, clicks: true } } },
    orderBy: { name: "asc" },
  });
  return rows.map(mapMerchant);
}

export async function upsertMerchant(input: MerchantMutationInput): Promise<AdminMerchantRecord> {
  const session = await requireAdmin();
  const previous = input.id
    ? await db.merchant.findUnique({ where: { id: input.id }, select: { logoUrl: true } })
    : null;
  const candidate = input.logoUrl?.trim();
  const logoUrl = candidate ? resolveImageUrlOrThrow(candidate) : null;
  const data = {
    name: input.name.trim(),
    logoUrl,
    domain: input.domain?.trim() || null,
    country: input.country?.trim() || "ES",
    brandColor: input.brandColor?.trim() || null,
    isActive: input.isActive ?? true,
  };
  const row = input.id
    ? await db.merchant.update({
        where: { id: input.id },
        data,
        include: { _count: { select: { offers: true, clicks: true } } },
      })
    : await db.merchant.create({
        data,
        include: { _count: { select: { offers: true, clicks: true } } },
      });
  await cleanupReplacedImage(previous?.logoUrl, logoUrl);
  await logAudit(session.user.id, input.id ? "merchant.update" : "merchant.create", "merchant", row.id, { name: data.name });
  invalidateCatalog();
  return mapMerchant(row);
}

export async function deleteMerchant(id: string): Promise<void> {
  const session = await requireAdmin();
  const used = await db.offer.count({ where: { merchantId: id } });
  if (used > 0) throw new Error("No se puede eliminar la tienda: tiene ofertas asociadas.");
  await db.merchant.delete({ where: { id } });
  await logAudit(session.user.id, "merchant.delete", "merchant", id, {});
  invalidateCatalog();
}

// ─── Categories ───────────────────────────────────────────────────────────

export async function listCategories(): Promise<AdminCategoryRecord[]> {
  await requireAdmin();
  const rows = await db.category.findMany({
    include: {
      parent: { select: { name: true } },
      _count: { select: { products: true } },
    },
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
  return rows.map(mapCategory);
}

async function wouldCreateCategoryCycle(categoryId: string, candidateParentId: string): Promise<boolean> {
  if (categoryId === candidateParentId) return true;
  let current: string | null = candidateParentId;
  const seen = new Set<string>();
  while (current) {
    if (seen.has(current)) return true;
    if (current === categoryId) return true;
    seen.add(current);
    const parent: { parentId: string | null } | null = await db.category.findUnique({
      where: { id: current },
      select: { parentId: true },
    });
    current = parent?.parentId ?? null;
  }
  return false;
}

export async function upsertCategory(input: CategoryMutationInput): Promise<AdminCategoryRecord> {
  const session = await requireAdmin();
  if (input.id && input.parentId && (await wouldCreateCategoryCycle(input.id, input.parentId))) {
    throw new Error("La jerarquía resultante crearía un ciclo. Elige otro padre.");
  }
  const previous = input.id
    ? await db.category.findUnique({ where: { id: input.id }, select: { imageUrl: true } })
    : null;
  const candidateImage = input.imageUrl?.trim();
  const imageUrl = candidateImage ? resolveImageUrlOrThrow(candidateImage) : null;
  const slug = input.slug?.trim() || (input.name ? slugify(input.name) : null);
  const data = {
    name: input.name.trim(),
    slug,
    parentId: input.parentId || null,
    icon: input.icon?.trim() || null,
    imageUrl,
    description: input.description?.trim() || null,
    sortOrder: typeof input.sortOrder === "number" ? input.sortOrder : 0,
    isActive: input.isActive ?? true,
  };
  const row = input.id
    ? await db.category.update({
        where: { id: input.id },
        data,
        include: { parent: { select: { name: true } }, _count: { select: { products: true } } },
      })
    : await db.category.create({
        data,
        include: { parent: { select: { name: true } }, _count: { select: { products: true } } },
      });
  await cleanupReplacedImage(previous?.imageUrl, imageUrl);
  await logAudit(session.user.id, input.id ? "category.update" : "category.create", "category", row.id, { name: data.name });
  invalidateCatalog();
  return mapCategory(row);
}

export async function deleteCategory(id: string): Promise<void> {
  const session = await requireAdmin();
  const products = await db.product.count({ where: { categoryId: id } });
  if (products > 0) throw new Error("No se puede eliminar: hay productos en esta categoría.");
  const children = await db.category.count({ where: { parentId: id } });
  if (children > 0) throw new Error("No se puede eliminar: tiene subcategorías. Elimínalas primero.");
  await db.category.delete({ where: { id } });
  await logAudit(session.user.id, "category.delete", "category", id, {});
  invalidateCatalog();
}

// ─── Products ─────────────────────────────────────────────────────────────

const PRODUCT_INCLUDE = {
  brand: { select: { name: true } },
  category: { select: { name: true, parent: { select: { name: true } } } },
  images: { take: 1, orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }] },
  offers: { where: { isActive: true }, select: { price: true } },
  _count: { select: { offers: true } },
};

export async function listProducts(filters: ProductListFilters): Promise<{ rows: AdminProductRecord[]; total: number }> {
  await requireAdmin();
  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.max(1, Math.min(100, filters.pageSize || 25));
  const where: Prisma.ProductWhereInput = {};
  if (filters.brandId) where.brandId = filters.brandId;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (typeof filters.isActive === "boolean") where.isActive = filters.isActive;
  if (filters.search?.trim()) {
    where.OR = [
      { name: { contains: filters.search.trim(), mode: "insensitive" } },
      { description: { contains: filters.search.trim(), mode: "insensitive" } },
    ];
  }
  const [rows, total] = await Promise.all([
    db.product.findMany({
      where,
      include: PRODUCT_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.product.count({ where }),
  ]);
  return { rows: rows.map(mapProduct), total };
}

export async function getProductById(id: string): Promise<AdminProductRecord | null> {
  await requireAdmin();
  const row = await db.product.findUnique({ where: { id }, include: PRODUCT_INCLUDE });
  return row ? mapProduct(row) : null;
}

function buildProductSpecsBlob(input: ProductMutationInput): Prisma.JsonObject {
  const specs: Prisma.JsonObject = {};
  if (input.slug) specs.slug = input.slug;
  if (input.longDescription) specs.longDescription = input.longDescription;
  if (input.tags?.length) specs.tags = input.tags;
  if (typeof input.featured === "boolean") specs.featured = input.featured;
  if (typeof input.teamRecommended === "boolean") specs.teamRecommended = input.teamRecommended;
  if (typeof input.editorialPriority === "number") specs.editorialPriority = input.editorialPriority;
  if (input.sku) specs.sku = input.sku;
  if (input.ean) specs.ean = input.ean;
  if (input.technicalSpecs?.length) specs.attributes = input.technicalSpecs as unknown as Prisma.JsonArray;
  return specs;
}

export async function upsertProduct(input: ProductMutationInput): Promise<AdminProductRecord> {
  const session = await requireAdmin();
  const data = {
    name: input.name.trim(),
    brandId: input.brandId,
    categoryId: input.categoryId,
    description: input.shortDescription?.trim() || "",
    specs: buildProductSpecsBlob(input),
    attributes: (input.attributes ?? {}) as unknown as Prisma.InputJsonValue,
    isActive: input.isActive,
  };
  const row = input.id
    ? await db.product.update({ where: { id: input.id }, data, include: PRODUCT_INCLUDE })
    : await db.product.create({ data, include: PRODUCT_INCLUDE });
  await logAudit(session.user.id, input.id ? "product.update" : "product.create", "product", row.id, { name: data.name });
  invalidateCatalog();
  return mapProduct(row);
}

export async function upsertProductWithOffer(input: ProductWithOfferInput): Promise<{ productId: string; offerId: string }> {
  const session = await requireAdmin();
  if (input.offer.price <= 0) throw new Error("El precio debe ser mayor que 0.");

  const merchant = await db.merchant.findUnique({
    where: { id: input.offer.merchantId },
    select: { domain: true },
  });
  if (!merchant) throw new Error("Tienda no encontrada.");
  if (!isAffiliateUrlAllowed(input.offer.url.trim(), merchant.domain)) {
    throw new Error("La URL de oferta no es válida.");
  }

  const trimmedImageUrl = input.primaryImageUrl?.trim();
  const resolvedImageUrl = trimmedImageUrl ? resolveImageUrlOrThrow(trimmedImageUrl) : null;

  const PrismaNS = (await import("@prisma/client")).Prisma;

  // The slug is a structural identifier — collisions on create would silently
  // overwrite a foreign product (HARD RULE #2). We surface them as errors and
  // let the admin pick a different name. In edit mode the slug stays whatever
  // was previously saved and is not re-validated for collisions against itself.
  let collisionImage: string | null = null;
  if (!input.productId) {
    const colliding = await db.product.findFirst({
      where: { specs: { path: ["slug"], equals: input.slug } },
      select: { id: true, name: true },
    });
    if (colliding) {
      throw new Error(`Ya existe un producto con el slug «${input.slug}» («${colliding.name}»). Cambia el nombre o slug.`);
    }
  } else {
    const previousImage = await db.productImage.findFirst({
      where: { productId: input.productId, isPrimary: true },
      select: { url: true },
    });
    collisionImage = previousImage?.url ?? null;
  }

  const result = await db.$transaction(async (tx) => {
    // Read-then-merge so we never wipe spec keys the form doesn't expose
    // (bestseller, isNew, future fields) on save.
    const existingProductRow = input.productId
      ? await tx.product.findUnique({
          where: { id: input.productId },
          select: { specs: true },
        })
      : null;
    const existingSpecs = existingProductRow?.specs && typeof existingProductRow.specs === "object" && !Array.isArray(existingProductRow.specs)
      ? (existingProductRow.specs as Record<string, unknown>)
      : {};

    const specs: Prisma.JsonObject = {
      ...existingSpecs,
      slug: input.slug,
      longDescription: input.longDescription,
      featured: input.featured,
      teamRecommended: input.teamRecommended,
      editorialPriority: input.editorialPriority,
      // technicalSpecs is the canonical source — always overwrite (allows
      // intentional clearing by the admin via the textarea).
      attributes: (input.technicalSpecs ?? []) as unknown as Prisma.JsonArray,
      tags: input.tags ?? [],
      sku: input.sku ?? null,
      ean: input.ean ?? null,
      material: input.material ?? null,
      color: input.color ?? null,
      style: input.style ?? null,
      dimensions: input.dimensions ?? null,
      weight: input.weight ?? null,
      rating: typeof input.rating === "number" ? input.rating : null,
      reviewCount: typeof input.reviewCount === "number" ? input.reviewCount : null,
    };

    const productData = {
      name: input.name.trim(),
      brandId: input.brandId,
      categoryId: input.categoryId,
      description: input.shortDescription.trim(),
      specs: specs as Prisma.InputJsonValue,
      isActive: input.isActive,
    };

    let productId: string;
    if (input.productId) {
      await tx.product.update({ where: { id: input.productId }, data: productData });
      productId = input.productId;
    } else {
      const created = await tx.product.create({ data: productData, select: { id: true } });
      productId = created.id;
    }

    if (resolvedImageUrl) {
      const primary = await tx.productImage.findFirst({
        where: { productId, isPrimary: true },
        select: { id: true, url: true },
      });
      if (primary) {
        if (primary.url !== resolvedImageUrl) {
          await tx.productImage.update({ where: { id: primary.id }, data: { url: resolvedImageUrl } });
        }
      } else {
        await tx.productImage.create({
          data: { productId, url: resolvedImageUrl, isPrimary: true, sortOrder: 0 },
        });
      }
    }

    const existingOffer = await tx.offer.findFirst({
      where: { productId, merchantId: input.offer.merchantId },
      select: { id: true, price: true, isFeatured: true },
    });
    const priceDecimal = new PrismaNS.Decimal(input.offer.price);
    const oldPriceDecimal = input.offer.oldPrice ? new PrismaNS.Decimal(input.offer.oldPrice) : null;
    const offerData = {
      productId,
      merchantId: input.offer.merchantId,
      price: priceDecimal,
      oldPrice: oldPriceDecimal,
      currentPrice: priceDecimal,
      url: input.offer.url.trim(),
      stock: input.offer.stock,
      isActive: input.offer.isActive,
      // Preserve the existing isFeatured flag — the new sheet doesn't expose
      // it, so hardcoding false would silently clear a flag set elsewhere.
      isFeatured: existingOffer?.isFeatured ?? false,
      sourceType: input.offer.sourceType,
      updateMode: "manual" as const,
      syncStatus: "ok" as const,
      lastCheckedAt: new Date(),
      lastUpdatedBy: session.user.id,
    };

    let offerId: string;
    if (existingOffer) {
      await tx.offer.update({ where: { id: existingOffer.id }, data: offerData });
      offerId = existingOffer.id;
    } else {
      const created = await tx.offer.create({ data: offerData, select: { id: true } });
      offerId = created.id;
    }

    await tx.priceHistory.create({
      data: {
        productId,
        offerId,
        merchantId: input.offer.merchantId,
        price: priceDecimal,
        oldPrice: existingOffer?.price ?? oldPriceDecimal,
        sourceType: input.offer.sourceType,
        updateMode: "manual",
        syncStatus: "ok",
        changedBy: session.user.id,
        changeReason: input.productId ? "admin-edit" : "admin-create",
      },
    });

    return { productId, offerId };
  });

  // If the admin replaced the primary image with a different URL, clean up the
  // previous R2 blob (mirrors upsertBrand / upsertMerchant / upsertCategory).
  if (collisionImage && resolvedImageUrl && collisionImage !== resolvedImageUrl) {
    await cleanupReplacedImage(collisionImage, resolvedImageUrl);
  }

  await logAudit(
    session.user.id,
    input.productId ? "product.upsert_with_offer" : "product.create_with_offer",
    "product",
    result.productId,
    { offerId: result.offerId },
  );
  invalidateCatalog();
  return result;
}

export async function duplicateProduct(productId: string): Promise<AdminProductRecord> {
  const session = await requireAdmin();
  const original = await db.product.findUnique({ where: { id: productId }, include: { images: true } });
  if (!original) throw new Error("Producto no encontrado");
  const clone = await db.product.create({
    data: {
      name: `${original.name} (copia)`,
      brandId: original.brandId,
      categoryId: original.categoryId,
      description: original.description,
      specs: original.specs as Prisma.InputJsonValue,
      attributes: original.attributes as Prisma.InputJsonValue,
      isActive: false,
      images: {
        create: original.images.map((img, idx) => ({
          url: img.url,
          isPrimary: idx === 0,
          sortOrder: img.sortOrder,
        })),
      },
    },
    include: PRODUCT_INCLUDE,
  });
  await logAudit(session.user.id, "product.duplicate", "product", clone.id, { sourceId: productId });
  invalidateCatalog();
  return mapProduct(clone);
}

export async function deleteProduct(id: string): Promise<void> {
  const session = await requireAdmin();
  const images = await db.productImage.findMany({ where: { productId: id }, select: { url: true } });
  await db.product.delete({ where: { id } });
  for (const image of images) await deleteR2ImageIfUnreferenced(image.url);
  await logAudit(session.user.id, "product.delete", "product", id, {});
  invalidateCatalog();
}

export async function listProductsForSelect(search: string, limit = 25): Promise<Array<{ id: string; name: string }>> {
  await requireAdmin();
  const term = search.trim();
  const rows = await db.product.findMany({
    where: term ? { name: { contains: term, mode: "insensitive" } } : {},
    select: { id: true, name: true },
    take: Math.max(1, Math.min(100, limit)),
    orderBy: { name: "asc" },
  });
  return rows;
}

// ─── Product images ───────────────────────────────────────────────────────

function mapProductImage(row: { id: string; productId: string; url: string; isPrimary: boolean; sortOrder: number }): AdminProductImageRecord {
  return {
    id: row.id,
    productId: row.productId,
    url: row.url,
    isPrimary: row.isPrimary,
    sortOrder: row.sortOrder,
  };
}

export async function listProductImages(productId: string): Promise<AdminProductImageRecord[]> {
  await requireAdmin();
  const rows = await db.productImage.findMany({
    where: { productId },
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
  });
  return rows.map(mapProductImage);
}

export async function addProductImage(productId: string, url: string, isPrimary: boolean): Promise<AdminProductImageRecord> {
  const session = await requireAdmin();
  const finalUrl = resolveImageUrlOrThrow(url);
  if (isPrimary) {
    await db.productImage.updateMany({ where: { productId }, data: { isPrimary: false } });
  }
  const max = await db.productImage.aggregate({ where: { productId }, _max: { sortOrder: true } });
  const row = await db.productImage.create({
    data: { productId, url: finalUrl, isPrimary, sortOrder: (max._max.sortOrder ?? -1) + 1 },
  });
  await logAudit(session.user.id, "product_image.add", "product", productId, { imageId: row.id });
  invalidateCatalog();
  return mapProductImage(row);
}

export async function reorderProductImages(productId: string, imageIdsInOrder: string[]): Promise<void> {
  const session = await requireAdmin();
  await db.$transaction(
    imageIdsInOrder.map((id, idx) =>
      db.productImage.updateMany({ where: { id, productId }, data: { sortOrder: idx } }),
    ),
  );
  await logAudit(session.user.id, "product_image.reorder", "product", productId, { count: imageIdsInOrder.length });
  invalidateCatalog();
}

export async function setPrimaryProductImage(productId: string, imageId: string): Promise<void> {
  const session = await requireAdmin();
  await db.$transaction([
    db.productImage.updateMany({ where: { productId }, data: { isPrimary: false } }),
    db.productImage.updateMany({ where: { id: imageId, productId }, data: { isPrimary: true } }),
  ]);
  await logAudit(session.user.id, "product_image.set_primary", "product", productId, { imageId });
  invalidateCatalog();
}

export async function deleteProductImage(imageId: string): Promise<void> {
  const session = await requireAdmin();
  const img = await db.productImage.findUnique({ where: { id: imageId } });
  if (!img) return;
  await db.productImage.delete({ where: { id: imageId } });
  await deleteR2ImageIfUnreferenced(img.url);
  await logAudit(session.user.id, "product_image.delete", "product", img.productId, { imageId });
  invalidateCatalog();
}

async function uploadFile(folder: R2Folder, file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  return uploadToR2(folder, Buffer.from(arrayBuffer), file.type || "application/octet-stream");
}

export async function uploadProductImage(productId: string, file: File, isPrimary: boolean): Promise<AdminProductImageRecord> {
  const url = await uploadFile("products", file);
  return addProductImage(productId, url, isPrimary);
}

export async function uploadBrandLogoImage(file: File): Promise<string> {
  return uploadFile("brands", file);
}

export async function uploadCategoryImageFile(file: File): Promise<string> {
  return uploadFile("categories", file);
}

export async function uploadMerchantLogoImage(file: File): Promise<string> {
  return uploadFile("merchants", file);
}

// ─── Offers ───────────────────────────────────────────────────────────────

const OFFER_INCLUDE = {
  product: { select: { name: true, categoryId: true, category: { select: { name: true } } } },
  merchant: { select: { name: true } },
};

export async function listOffers(filters: OfferListFilters): Promise<{ rows: AdminOfferRecord[]; total: number }> {
  await requireAdmin();
  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.max(1, Math.min(100, filters.pageSize || 25));
  const where: Prisma.OfferWhereInput = {};
  if (filters.productId) where.productId = filters.productId;
  if (filters.merchantId) where.merchantId = filters.merchantId;
  if (filters.sourceType) where.sourceType = filters.sourceType;
  if (filters.syncStatus) where.syncStatus = filters.syncStatus;
  if (typeof filters.isActive === "boolean") where.isActive = filters.isActive;
  if (filters.categoryId) where.product = { categoryId: filters.categoryId };
  if (filters.search?.trim()) {
    where.OR = [
      { product: { name: { contains: filters.search.trim(), mode: "insensitive" } } },
      { merchant: { name: { contains: filters.search.trim(), mode: "insensitive" } } },
    ];
  }
  const orderBy: Prisma.OfferOrderByWithRelationInput[] = filters.reviewQueueFirst
    ? [{ syncStatus: "asc" }, { freshnessScore: "asc" }, { updatedAt: "desc" }]
    : [{ updatedAt: "desc" }];
  const [rows, total] = await Promise.all([
    db.offer.findMany({ where, include: OFFER_INCLUDE, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
    db.offer.count({ where }),
  ]);
  return { rows: rows.map(mapOffer), total };
}

export async function upsertOffer(input: OfferMutationInput): Promise<AdminOfferRecord> {
  const session = await requireAdmin();
  if (input.price <= 0) throw new Error("El precio debe ser mayor que 0.");
  const data = {
    productId: input.productId,
    merchantId: input.merchantId,
    price: new (await import("@prisma/client")).Prisma.Decimal(input.price),
    oldPrice: input.oldPrice ? new (await import("@prisma/client")).Prisma.Decimal(input.oldPrice) : null,
    currentPrice: new (await import("@prisma/client")).Prisma.Decimal(input.price),
    url: input.url.trim(),
    stock: input.stock,
    isActive: input.isActive,
    isFeatured: input.isFeatured,
    sourceType: input.sourceType ?? "manual",
    updateMode: input.updateMode ?? "manual",
    syncStatus: input.syncStatus ?? "ok",
    nextCheckAt: input.nextCheckAt ? new Date(input.nextCheckAt) : null,
    lastSyncError: input.lastSyncError?.trim() || null,
    priorityScore: typeof input.priorityScore === "number" ? input.priorityScore : 0,
    freshnessScore: typeof input.freshnessScore === "number" ? input.freshnessScore : 100,
    lastUpdatedBy: session.user.id,
  };
  const row = input.id
    ? await db.offer.update({ where: { id: input.id }, data, include: OFFER_INCLUDE })
    : await db.offer.create({ data, include: OFFER_INCLUDE });
  await logAudit(session.user.id, input.id ? "offer.update" : "offer.create", "offer", row.id, { productId: row.productId });
  invalidateCatalog();
  return mapOffer(row);
}

export async function deleteOffer(id: string): Promise<void> {
  const session = await requireAdmin();
  await db.offer.delete({ where: { id } });
  await logAudit(session.user.id, "offer.delete", "offer", id, {});
  invalidateCatalog();
}

export async function deactivateOffer(id: string): Promise<void> {
  const session = await requireAdmin();
  await db.offer.update({ where: { id }, data: { isActive: false } });
  await logAudit(session.user.id, "offer.deactivate", "offer", id, {});
  invalidateCatalog();
}

export async function markOfferReviewed(offerId: string): Promise<void> {
  const session = await requireAdmin();
  await db.offer.update({
    where: { id: offerId },
    data: { syncStatus: "ok", freshnessScore: 100, lastCheckedAt: new Date(), lastSyncError: null },
  });
  await logAudit(session.user.id, "offer.reviewed", "offer", offerId, {});
  invalidateCatalog();
}

export async function markOfferAsStale(offerId: string, reason = "manual_stale"): Promise<void> {
  const session = await requireAdmin();
  await db.offer.update({
    where: { id: offerId },
    data: { syncStatus: "stale", freshnessScore: 0, lastSyncError: reason.slice(0, 240) },
  });
  await logAudit(session.user.id, "offer.mark_stale", "offer", offerId, { reason });
  invalidateCatalog();
}

export async function requestOfferSync(offerId: string): Promise<void> {
  const session = await requireAdmin();
  await db.offer.update({ where: { id: offerId }, data: { nextCheckAt: new Date() } });
  await logAudit(session.user.id, "offer.sync.requested", "offer", offerId, {});
}

export async function runOffersSyncBatch(limit = 50): Promise<number> {
  const session = await requireAdmin();
  const safeLimit = Math.max(1, Math.min(200, limit));
  const due = await db.offer.findMany({
    where: { isActive: true, OR: [{ nextCheckAt: null }, { nextCheckAt: { lte: new Date() } }] },
    orderBy: [{ priorityScore: "desc" }, { nextCheckAt: "asc" }],
    take: safeLimit,
    select: { id: true },
  });
  await logAudit(session.user.id, "offer.sync.batch", "batch", null, { count: due.length });
  return due.length;
}

export async function saveOfferPriceChange(input: {
  offerId: string;
  newPrice: number;
  oldPrice?: number;
  reason?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const session = await requireAdmin();
  const offer = await db.offer.findUnique({ where: { id: input.offerId } });
  if (!offer) throw new Error("Oferta no encontrada");
  const PrismaNS = (await import("@prisma/client")).Prisma;
  await db.$transaction([
    db.priceHistory.create({
      data: {
        productId: offer.productId,
        offerId: offer.id,
        merchantId: offer.merchantId,
        price: new PrismaNS.Decimal(input.newPrice),
        oldPrice: input.oldPrice ? new PrismaNS.Decimal(input.oldPrice) : new PrismaNS.Decimal(offer.price),
        sourceType: offer.sourceType,
        updateMode: offer.updateMode,
        syncStatus: offer.syncStatus,
        changedBy: session.user.id,
        changeReason: input.reason?.slice(0, 240) ?? null,
      },
    }),
    db.offer.update({
      where: { id: offer.id },
      data: {
        price: new PrismaNS.Decimal(input.newPrice),
        currentPrice: new PrismaNS.Decimal(input.newPrice),
        oldPrice: input.oldPrice ? new PrismaNS.Decimal(input.oldPrice) : offer.price,
        lastCheckedAt: new Date(),
        lastUpdatedBy: session.user.id,
      },
    }),
  ]);
  await logAudit(session.user.id, "offer.price_change", "offer", offer.id, {
    newPrice: input.newPrice,
    reason: input.reason ?? null,
    metadata: input.metadata ?? {},
  });
  invalidateCatalog();
}

export async function registerOfferPriceHistorySnapshot(
  offerId: string,
  reason = "manual_review",
  metadata: Record<string, unknown> = {},
): Promise<void> {
  await saveOfferPriceChange({ offerId, newPrice: 0, reason, metadata }).catch(() => {
    // Snapshot failures should never block the caller.
  });
}

export async function listOfferPriceHistory(offerId: string, limit = 120): Promise<AdminOfferPriceHistoryRecord[]> {
  await requireAdmin();
  const rows = await db.priceHistory.findMany({
    where: { offerId },
    orderBy: { createdAt: "desc" },
    take: Math.max(1, Math.min(500, limit)),
  });
  return rows.map((row) => ({
    id: row.id,
    offerId: row.offerId ?? offerId,
    productId: row.productId,
    merchantId: row.merchantId ?? "",
    price: Number(row.price),
    oldPrice: row.oldPrice ? Number(row.oldPrice) : undefined,
    sourceType: row.sourceType as OfferSourceType,
    updateMode: row.updateMode as OfferUpdateMode,
    syncStatus: row.syncStatus as OfferSyncStatus,
    changedBy: row.changedBy ?? undefined,
    changeReason: row.changeReason ?? undefined,
    checkedAt: row.checkedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  }));
}

// ─── Tracking / audit ─────────────────────────────────────────────────────

export async function listClicks(limit = 100): Promise<AdminClickRecord[]> {
  await requireAdmin();
  const rows = await db.click.findMany({
    include: { product: { select: { name: true } }, merchant: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: Math.max(1, Math.min(500, limit)),
  });
  return rows.map((row) => ({
    id: row.id,
    productId: row.productId,
    productName: row.product.name,
    merchantId: row.merchantId,
    merchantName: row.merchant.name,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function listAdminActions(limit = 200): Promise<AdminActionRecord[]> {
  await requireAdmin();
  const rows = await db.adminAction.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.max(1, Math.min(1000, limit)),
  });
  return rows.map((row) => ({
    id: row.id,
    userId: row.userId ?? "",
    action: row.action,
    entityType: row.entityType ?? "",
    entityId: row.entityId ?? undefined,
    payload: row.payload as Record<string, unknown>,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function logAdminAction(input: {
  action: string;
  entityType: string;
  entityId?: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  const session = await requireAdmin();
  await logAudit(session.user.id, input.action, input.entityType, input.entityId ?? null, input.payload ?? {});
}

// ─── Import jobs ──────────────────────────────────────────────────────────

export async function createImportJob(input: {
  source: string;
  rowCount?: number;
  metadata?: Record<string, unknown>;
}): Promise<{ id: string }> {
  const session = await requireAdmin();
  const job = await db.importJob.create({
    data: {
      userId: session.user.id,
      source: input.source.slice(0, 60),
      rowCount: input.rowCount ?? 0,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      startedAt: new Date(),
    },
  });
  await logAudit(session.user.id, "import.create", "import_job", job.id, { source: input.source });
  return { id: job.id };
}

export async function updateImportJob(
  id: string,
  patch: Partial<{
    status: AdminImportJobRecord["status"];
    rowCount: number;
    createdCount: number;
    updatedCount: number;
    errorCount: number;
    metadata: Record<string, unknown>;
    finishedAt: string;
  }>,
): Promise<void> {
  await requireAdmin();
  const data: Prisma.ImportJobUpdateInput = {};
  if (patch.status) data.status = patch.status;
  if (typeof patch.rowCount === "number") data.rowCount = patch.rowCount;
  if (typeof patch.createdCount === "number") data.createdCount = patch.createdCount;
  if (typeof patch.updatedCount === "number") data.updatedCount = patch.updatedCount;
  if (typeof patch.errorCount === "number") data.errorCount = patch.errorCount;
  if (patch.metadata) data.metadata = patch.metadata as Prisma.InputJsonValue;
  if (patch.finishedAt) data.finishedAt = new Date(patch.finishedAt);
  await db.importJob.update({ where: { id }, data });
}

export async function listImportJobs(limit = 100): Promise<AdminImportJobRecord[]> {
  await requireAdmin();
  const rows = await db.importJob.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.max(1, Math.min(500, limit)),
  });
  return rows.map((row) => ({
    id: row.id,
    userId: row.userId ?? "",
    source: row.source,
    status: row.status as AdminImportJobRecord["status"],
    rowCount: row.rowCount,
    createdCount: row.createdCount,
    updatedCount: row.updatedCount,
    errorCount: row.errorCount,
    metadata: row.metadata as Record<string, unknown>,
    startedAt: row.startedAt?.toISOString(),
    finishedAt: row.finishedAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function addImportJobLog(input: {
  jobId: string;
  level: AdminImportJobLogRecord["level"];
  message: string;
  rowIndex?: number;
  payload?: Record<string, unknown>;
}): Promise<void> {
  await requireAdmin();
  await db.importJobLog.create({
    data: {
      jobId: input.jobId,
      level: input.level,
      message: input.message.slice(0, 1000),
      rowIndex: input.rowIndex ?? null,
      payload: (input.payload ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export async function listImportJobLogs(jobId: string): Promise<AdminImportJobLogRecord[]> {
  await requireAdmin();
  const rows = await db.importJobLog.findMany({
    where: { jobId },
    orderBy: { createdAt: "asc" },
    take: 1000,
  });
  return rows.map((row) => ({
    id: row.id,
    jobId: row.jobId,
    level: row.level as AdminImportJobLogRecord["level"],
    message: row.message,
    rowIndex: row.rowIndex ?? undefined,
    payload: row.payload as Record<string, unknown>,
    createdAt: row.createdAt.toISOString(),
  }));
}

// ─── Sync status ──────────────────────────────────────────────────────────

export async function listSyncStatus(): Promise<SyncStatusRecord[]> {
  await requireAdmin();
  const rows = await db.syncStatus.findMany({ orderBy: { source: "asc" } });
  return rows.map((row) => ({
    id: row.id,
    source: row.source,
    status: row.status as SyncStatusRecord["status"],
    lastSuccessAt: row.lastSuccessAt?.toISOString(),
    lastErrorAt: row.lastErrorAt?.toISOString(),
    message: row.message ?? undefined,
    metadata: row.metadata as Record<string, unknown>,
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function updateSyncStatus(input: {
  source: string;
  status: SyncStatusRecord["status"];
  message?: string;
  metadata?: Record<string, unknown>;
  lastSuccessAt?: string;
  lastErrorAt?: string;
}): Promise<void> {
  const session = await requireAdmin();
  await db.syncStatus.upsert({
    where: { source: input.source },
    create: {
      source: input.source,
      status: input.status,
      message: input.message ?? null,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      lastSuccessAt: input.lastSuccessAt ? new Date(input.lastSuccessAt) : null,
      lastErrorAt: input.lastErrorAt ? new Date(input.lastErrorAt) : null,
    },
    update: {
      status: input.status,
      message: input.message ?? null,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      lastSuccessAt: input.lastSuccessAt ? new Date(input.lastSuccessAt) : undefined,
      lastErrorAt: input.lastErrorAt ? new Date(input.lastErrorAt) : undefined,
    },
  });
  await logAudit(session.user.id, "sync.update", "sync_status", input.source, { status: input.status });
}

// ─── Dashboard ────────────────────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  await requireAdmin();
  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * DAY_MS);

  const [
    totalProducts,
    activeOffers,
    activeMerchants,
    totalClicks,
    clicksLast30,
    clickProductGroup,
    clickMerchantGroup,
    clickPairGroup,
    searchTerms,
    noResultTerms,
    recentActions,
    syncStatus,
    editorialTotals,
    articleViewsTotal,
    articleSessionsTotal,
    topViewedArticles,
    productsWithoutOffers,
    staleOffers,
    incompleteCount,
  ] = await Promise.all([
    db.product.count(),
    db.offer.count({ where: { isActive: true } }),
    db.merchant.count({ where: { isActive: true } }),
    db.click.count(),
    db.click.count({ where: { createdAt: { gte: since30 } } }),
    db.click.groupBy({
      by: ["productId"],
      _count: { _all: true },
      orderBy: { _count: { productId: "desc" } },
      take: 10,
    }),
    db.click.groupBy({
      by: ["merchantId"],
      _count: { _all: true },
      orderBy: { _count: { merchantId: "desc" } },
      take: 10,
    }),
    db.click.groupBy({
      by: ["productId", "merchantId"],
      _count: { _all: true },
      orderBy: { _count: { productId: "desc" } },
      take: 10,
    }),
    db.searchEvent.groupBy({
      by: ["normalizedTerm"],
      _count: { _all: true },
      orderBy: { _count: { normalizedTerm: "desc" } },
      take: 10,
    }),
    db.searchEvent.groupBy({
      by: ["normalizedTerm"],
      where: { resultCount: 0 },
      _count: { _all: true },
      orderBy: { _count: { normalizedTerm: "desc" } },
      take: 10,
    }),
    db.adminAction.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    db.syncStatus.findMany({ orderBy: { source: "asc" } }),
    db.editorialArticle.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    db.articleViewEvent.count({ where: { createdAt: { gte: since30 } } }),
    db.articleViewEvent
      .groupBy({ by: ["sessionId"], where: { createdAt: { gte: since30 } } })
      .then((g) => g.length),
    db.editorialArticle.findMany({
      orderBy: { viewsCount: "desc" },
      take: 10,
      select: { id: true, slug: true, title: true, viewsCount: true },
    }),
    db.product.count({ where: { offers: { none: { isActive: true } }, isActive: true } }),
    db.offer.count({ where: { syncStatus: "stale", isActive: true } }),
    db.product.count({ where: { OR: [{ description: "" }, { specs: { equals: {} } }] } }),
  ]);

  const productIdMap = new Map<string, string>();
  const merchantIdMap = new Map<string, string>();
  if (clickProductGroup.length || clickPairGroup.length) {
    const ids = new Set([
      ...clickProductGroup.map((g) => g.productId),
      ...clickPairGroup.map((g) => g.productId),
    ]);
    const products = await db.product.findMany({
      where: { id: { in: Array.from(ids) } },
      select: { id: true, name: true },
    });
    products.forEach((p) => productIdMap.set(p.id, p.name));
  }
  if (clickMerchantGroup.length || clickPairGroup.length) {
    const ids = new Set([
      ...clickMerchantGroup.map((g) => g.merchantId),
      ...clickPairGroup.map((g) => g.merchantId),
    ]);
    const merchants = await db.merchant.findMany({
      where: { id: { in: Array.from(ids) } },
      select: { id: true, name: true },
    });
    merchants.forEach((m) => merchantIdMap.set(m.id, m.name));
  }

  const editorialByStatus = new Map(editorialTotals.map((g) => [g.status, g._count._all]));

  return {
    totalProducts,
    activeOffers,
    activeMerchants,
    totalClicks,
    clicksLast30Days: clicksLast30,
    topClickedProducts: clickProductGroup.map((g) => ({
      productId: g.productId,
      productName: productIdMap.get(g.productId) ?? "—",
      clicks: g._count._all,
    })),
    topClickedMerchants: clickMerchantGroup.map((g) => ({
      merchantId: g.merchantId,
      merchantName: merchantIdMap.get(g.merchantId) ?? "—",
      clicks: g._count._all,
    })),
    topOfferPairs: clickPairGroup.map((g) => ({
      productId: g.productId,
      productName: productIdMap.get(g.productId) ?? "—",
      merchantId: g.merchantId,
      merchantName: merchantIdMap.get(g.merchantId) ?? "—",
      clicks: g._count._all,
    })),
    topSearchTerms: searchTerms.map((g) => ({ term: g.normalizedTerm, count: g._count._all })),
    noResultSearchTerms: noResultTerms.map((g) => ({ term: g.normalizedTerm, count: g._count._all })),
    topViewedProducts: [],
    topSearchedProducts: [],
    topCategoriesByClicks: [],
    topCategoriesByPerformance: [],
    searchesWithoutResults: noResultTerms.reduce((acc, g) => acc + g._count._all, 0),
    failedImportJobs: await db.importJob.count({ where: { status: "failed" } }),
    productsWithoutActiveOffers: productsWithoutOffers,
    staleActiveOffers: staleOffers,
    highClicksLowViews: [],
    highViewsLowClicks: [],
    underFeaturedTopPerformers: [],
    featuredTopPerformers: [],
    favoritesTotal: null,
    recentAdminActions: recentActions.map((row) => ({
      id: row.id,
      userId: row.userId ?? "",
      action: row.action,
      entityType: row.entityType ?? "",
      entityId: row.entityId ?? undefined,
      payload: row.payload as Record<string, unknown>,
      createdAt: row.createdAt.toISOString(),
    })),
    editorial: {
      totalArticles: editorialTotals.reduce((acc, g) => acc + g._count._all, 0),
      publishedArticles: editorialByStatus.get("published") ?? 0,
      draftArticles: editorialByStatus.get("draft") ?? 0,
      inactiveArticles: editorialByStatus.get("inactive") ?? 0,
      featuredArticles: await db.editorialArticle.count({ where: { isFeatured: true, status: "published" } }),
      viewsLast30Days: articleViewsTotal,
      uniqueSessionsLast30Days: articleSessionsTotal,
      searchesLeadingToBlogViews: 0,
      topViewedArticles: topViewedArticles.map((a) => ({
        articleId: a.id,
        slug: a.slug,
        title: a.title,
        views: a.viewsCount,
      })),
      dailyArticleViews: [],
      topBlogSearchTerms: [],
    },
    freshness: {
      lastClickAt: undefined,
      lastSearchAt: undefined,
      lastImportAt: undefined,
      lastSyncAt: undefined,
      stale: staleOffers > 0,
      staleSources: syncStatus.filter((s) => s.status !== "healthy").length,
    },
    dailyClicks: [],
    incompleteProducts: incompleteCount,
    syncStatus: syncStatus.map((row) => ({
      id: row.id,
      source: row.source,
      status: row.status as SyncStatusRecord["status"],
      lastSuccessAt: row.lastSuccessAt?.toISOString(),
      lastErrorAt: row.lastErrorAt?.toISOString(),
      message: row.message ?? undefined,
      metadata: row.metadata as Record<string, unknown>,
      updatedAt: row.updatedAt.toISOString(),
    })),
  };
}

// ─── Article cache invalidation (used by editorial actions) ──────────────

export async function invalidateArticlesCacheTag(): Promise<void> {
  revalidateTag(ARTICLES_CACHE_TAG, "default");
}
