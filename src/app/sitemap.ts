import type { MetadataRoute } from "next";

import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { hreflangMap } from "@/i18n/seo";
import { db } from "@/lib/db";

export const revalidate = 3600;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es").replace(/\/$/, "");

/**
 * Expands one locale-agnostic path into one sitemap entry per active locale,
 * each carrying the shared hreflang alternates map (the same map page `<link>`
 * tags use, via `@/i18n/seo`). For `es`-only this yields a single row at the
 * unchanged URL (now with its hreflang links).
 */
function localizedEntries(
  href: string,
  fields: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">,
): MetadataRoute.Sitemap {
  const languages = hreflangMap(href);
  return routing.locales.map((locale) => ({
    url: `${SITE_URL}${getPathname({ href, locale })}`,
    ...fields,
    alternates: { languages },
  }));
}

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1.0 },
  { path: "/blog", changeFrequency: "daily", priority: 0.9 },
  { path: "/asistente", changeFrequency: "weekly", priority: 0.8 },
  { path: "/acerca-de", changeFrequency: "monthly", priority: 0.6 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.2 },
  { path: "/politica-privacidad", changeFrequency: "yearly", priority: 0.2 },
  { path: "/aviso-legal", changeFrequency: "yearly", priority: 0.2 },
];

// Last reviewed/refreshed dates for the hand-built blog guides.
// Update the value when the guide is meaningfully refreshed; sitemap consumers
// (Google, Bing, AI crawlers) treat this as a freshness signal.
const HARDCODED_BLOG_GUIDES: Array<{ slug: string; lastModified: string }> = [
  { slug: "mejores-freidoras-aire-amazon-2026-menos-100-euros", lastModified: "2026-04-12" },
  { slug: "mejores-sofas-calidad-precio-2026", lastModified: "2026-03-18" },
  { slug: "mejores-ventiladores-de-pie-para-este-verano-2026", lastModified: "2026-04-22" },
  { slug: "los-7-mejores-ventiladores-amazon-calor-verano-2026", lastModified: "2026-04-22" },
  { slug: "10-mesas-de-terraza-baratas-y-bonitas-en-amazon-2026", lastModified: "2026-04-08" },
  { slug: "review-cosori-5-7l-freidora-aire-calidad-precio-menos-100-euros", lastModified: "2026-03-02" },
  { slug: "mejores-cafeteras-superautomaticas-amantes-del-cafe-2026", lastModified: "2026-03-26" },
  { slug: "mejores-robots-de-cocina-baratos-alternativas-thermomix-2026", lastModified: "2026-03-26" },
  { slug: "mejores-frigorificos-combi-bajo-consumo-2026", lastModified: "2026-02-20" },
  { slug: "mejores-microondas-sin-plato-giratorio-2026", lastModified: "2026-02-20" },
  { slug: "mejores-sombrillas-resistentes-amazon-2026", lastModified: "2026-04-30" },
  { slug: "mejores-piscinas-desmontables-baratas-amazon-2026", lastModified: "2026-04-30" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const generatedAt = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.flatMap((route) =>
    localizedEntries(route.path, {
      lastModified: generatedAt,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }),
  );

  const blogGuideEntries: MetadataRoute.Sitemap = HARDCODED_BLOG_GUIDES.flatMap((guide) =>
    localizedEntries(`/blog/${guide.slug}`, {
      lastModified: new Date(guide.lastModified),
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  );

  const dynamicEntries = await fetchDynamicEntries();
  const deduped = new Map<string, MetadataRoute.Sitemap[number]>();
  // Order matters: dynamic editorial entries can override the hardcoded fallback.
  for (const entry of [...staticEntries, ...blogGuideEntries, ...dynamicEntries]) {
    deduped.set(entry.url, entry);
  }

  return Array.from(deduped.values());
}

async function fetchDynamicEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const [categories, articles] = await Promise.all([
      db.category.findMany({
        select: {
          slug: true,
          parentId: true,
          parent: { select: { slug: true } },
        },
      }),
      db.editorialArticle.findMany({
        where: { status: "published" },
        select: { slug: true, path: true, publishedAt: true, updatedAt: true },
      }),
    ]);

    const entries: MetadataRoute.Sitemap = [];

    for (const row of categories) {
      if (!row.slug) continue;
      const parentSlug = row.parent?.slug;
      const path =
        row.parentId && parentSlug ? `/categoria/${parentSlug}/${row.slug}` : `/categoria/${row.slug}`;
      entries.push(
        ...localizedEntries(path, {
          changeFrequency: "weekly",
          priority: row.parentId ? 0.7 : 0.8,
        }),
      );
    }

    for (const row of articles) {
      const articlePath = row.path || (row.slug ? `/blog/${row.slug}` : "");
      if (!articlePath) continue;
      const lastModified = row.updatedAt || row.publishedAt;
      entries.push(
        ...localizedEntries(articlePath, {
          lastModified: lastModified || undefined,
          changeFrequency: "weekly",
          priority: 0.6,
        }),
      );
    }

    return entries;
  } catch {
    return [];
  }
}
