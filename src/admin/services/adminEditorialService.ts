"use server";

import { revalidateTag } from "next/cache";
import type { Prisma } from "@prisma/client";

import { mapAdminErrorMessage } from "@/admin/services/admin-helpers";
import type { AdminEditorialArticleRecord, AdminListQuery } from "@/admin/types";
import { ARTICLES_CACHE_TAG } from "@/data/catalog/snapshot";
import { sanitizeNumber, sanitizeText } from "@/infrastructure/security/sanitize";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { invalidateEditorialLiveCache } from "@/services/editorialService";

export interface AdminEditorialListFilters extends AdminListQuery {
  status?: "draft" | "published" | "inactive";
  categorySlug?: string;
  isFeatured?: boolean;
}

export interface AdminEditorialListResult {
  rows: AdminEditorialArticleRecord[];
  total: number;
}

export interface AdminEditorialMutationInput {
  id?: string;
  slug?: string;
  path?: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  coverImageAlt?: string;
  coverTone?: "warm" | "fresh" | "calm" | "contrast";
  categorySlug: string;
  categoryName: string;
  intent: "comparativa" | "calidad-precio" | "ahorro" | "premium" | "guia-practica";
  tags?: string[];
  readMinutes?: number;
  averageBudget?: number;
  relatedCategorySlugs?: string[];
  relatedProductSlugs?: string[];
  publishedAt?: string;
  status: "draft" | "published" | "inactive";
  isFeatured: boolean;
  sections?: Array<{ heading: string; body: string }>;
}

function normalizeSlug(value: string): string {
  const normalized = sanitizeText(value, 160)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return normalized || `articulo-${Date.now()}`;
}

function sanitizeArray(input: string[] | undefined, itemLimit = 64, maxItems = 20): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => sanitizeText(String(item || ""), itemLimit))
    .filter(Boolean)
    .slice(0, maxItems);
}

function sanitizeSections(
  input: AdminEditorialMutationInput["sections"],
): Array<{ heading: string; body: string }> {
  if (!Array.isArray(input)) return [];
  return input
    .map((section) => ({
      heading: sanitizeText(String(section?.heading || ""), 160),
      body: sanitizeText(String(section?.body || ""), 4000),
    }))
    .filter((section) => Boolean(section.heading) && Boolean(section.body))
    .slice(0, 30);
}

type EditorialRow = Prisma.EditorialArticleGetPayload<Record<string, never>>;

function mapRow(row: EditorialRow): AdminEditorialArticleRecord {
  return {
    id: row.id,
    slug: row.slug,
    path: row.path,
    title: row.title,
    excerpt: row.excerpt,
    coverImage: row.coverImage ?? undefined,
    coverImageAlt: row.coverImageAlt ?? undefined,
    coverTone: row.coverTone as AdminEditorialArticleRecord["coverTone"],
    categorySlug: row.categorySlug,
    categoryName: row.categoryName,
    intent: row.intent as AdminEditorialArticleRecord["intent"],
    tags: row.tags,
    readMinutes: Math.max(1, row.readMinutes),
    averageBudget: row.averageBudget ? Number(row.averageBudget) : undefined,
    relatedCategorySlugs: row.relatedCategorySlugs,
    relatedProductSlugs: row.relatedProductSlugs,
    publishedAt: row.publishedAt?.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    views: row.viewsCount,
    isFeatured: row.isFeatured,
    status: row.status as AdminEditorialArticleRecord["status"],
    sections: Array.isArray(row.sections)
      ? (row.sections as Array<{ heading?: string; body?: string }>)
          .map((s) => ({
            heading: String(s.heading || "").trim(),
            body: String(s.body || "").trim(),
          }))
          .filter((s) => s.heading && s.body)
      : [],
  };
}

async function logEditorialAudit(
  userId: string,
  action: string,
  entityId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  try {
    await db.adminAction.create({
      data: {
        userId,
        action: sanitizeText(action, 80),
        entityType: "editorial_article",
        entityId,
        payload: { source: "adminEditorialService", ...payload },
      },
    });
  } catch {
    // Audit failures must never block admin actions.
  }
}

function invalidateArticles() {
  revalidateTag(ARTICLES_CACHE_TAG, "default");
  invalidateEditorialLiveCache();
}

export async function listEditorialArticles(
  filters: AdminEditorialListFilters,
): Promise<AdminEditorialListResult> {
  await requireAdmin();
  const page = Math.max(1, Math.floor(filters.page || 1));
  const pageSize = Math.max(1, Math.min(100, Math.floor(filters.pageSize || 25)));

  const where: Prisma.EditorialArticleWhereInput = {};
  const safeSearch = sanitizeText(filters.search || "", 80);
  if (safeSearch) {
    where.OR = [
      { title: { contains: safeSearch, mode: "insensitive" } },
      { slug: { contains: safeSearch, mode: "insensitive" } },
      { categoryName: { contains: safeSearch, mode: "insensitive" } },
    ];
  }
  if (filters.status) where.status = filters.status;
  if (typeof filters.isFeatured === "boolean") where.isFeatured = filters.isFeatured;
  if (filters.categorySlug)
    where.categorySlug = sanitizeText(filters.categorySlug, 80).toLowerCase();

  try {
    const [rows, total] = await Promise.all([
      db.editorialArticle.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.editorialArticle.count({ where }),
    ]);
    return { rows: rows.map(mapRow), total };
  } catch (error) {
    throw new Error(mapAdminErrorMessage(error, "No se pudieron cargar los articulos"));
  }
}

export async function upsertEditorialArticle(
  input: AdminEditorialMutationInput,
): Promise<AdminEditorialArticleRecord> {
  const session = await requireAdmin();

  const slug = normalizeSlug(input.slug || input.title);
  const safePath = sanitizeText(input.path || `/blog/${slug}`, 200) || `/blog/${slug}`;
  const safeTitle = sanitizeText(input.title, 180);
  const safeExcerpt = sanitizeText(input.excerpt, 600);
  if (!safeTitle || !safeExcerpt) throw new Error("Titulo y extracto son obligatorios");

  const nowIso = new Date();
  const readMinutes = Math.max(1, Math.min(240, Math.floor(sanitizeNumber(input.readMinutes || 8, 1, 240))));
  const averageBudget =
    typeof input.averageBudget === "number"
      ? sanitizeNumber(input.averageBudget, 0, 1_000_000)
      : null;

  const sections = sanitizeSections(input.sections);
  const shouldPublish = input.status === "published";
  const publishedAt = shouldPublish
    ? input.publishedAt
      ? new Date(input.publishedAt)
      : nowIso
    : null;

  const data: Prisma.EditorialArticleCreateInput = {
    slug,
    path: safePath.startsWith("/") ? safePath : `/${safePath}`,
    title: safeTitle,
    excerpt: safeExcerpt,
    coverImage: input.coverImage ? sanitizeText(input.coverImage, 400) : null,
    coverImageAlt: input.coverImageAlt ? sanitizeText(input.coverImageAlt, 200) : null,
    coverTone: input.coverTone || "fresh",
    categorySlug: sanitizeText(input.categorySlug, 80).toLowerCase(),
    categoryName: sanitizeText(input.categoryName, 120),
    intent: input.intent,
    tags: sanitizeArray(input.tags, 64, 20),
    readMinutes,
    averageBudget: averageBudget ?? undefined,
    relatedCategorySlugs: sanitizeArray(input.relatedCategorySlugs, 80, 20).map((s) => s.toLowerCase()),
    relatedProductSlugs: sanitizeArray(input.relatedProductSlugs, 120, 20).map((s) => s.toLowerCase()),
    status: input.status,
    isFeatured: Boolean(input.isFeatured),
    sections: sections as unknown as Prisma.InputJsonValue,
    publishedAt,
  };

  try {
    const row = input.id
      ? await db.editorialArticle.update({ where: { id: input.id }, data })
      : await db.editorialArticle.create({ data });
    const record = mapRow(row);
    await logEditorialAudit(
      session.user.id,
      input.id ? "editorial.article.update" : "editorial.article.create",
      record.id,
      { slug: record.slug, status: record.status, featured: record.isFeatured },
    );
    invalidateArticles();
    return record;
  } catch (error) {
    throw new Error(mapAdminErrorMessage(error, "No se pudo guardar el articulo"));
  }
}

export async function deleteEditorialArticle(id: string): Promise<void> {
  const session = await requireAdmin();
  const safeId = sanitizeText(id, 64);
  if (!safeId) throw new Error("ID de articulo invalido");

  try {
    await db.editorialArticle.delete({ where: { id: safeId } });
  } catch (error) {
    throw new Error(mapAdminErrorMessage(error, "No se pudo eliminar el articulo"));
  }

  await logEditorialAudit(session.user.id, "editorial.article.delete", safeId, {});
  invalidateArticles();
}
