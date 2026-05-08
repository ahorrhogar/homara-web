import type { MetadataRoute } from "next";
import { createAnonymousServerSupabaseClient } from "@/integrations/supabase/server";

export const revalidate = 3600;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es").replace(/\/$/, "");

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1.0 },
  { path: "/blog", changeFrequency: "daily", priority: 0.9 },
  { path: "/asistente", changeFrequency: "weekly", priority: 0.8 },
  { path: "/buscar", changeFrequency: "weekly", priority: 0.6 },
  { path: "/acerca-de", changeFrequency: "monthly", priority: 0.7 },
  { path: "/cookies", changeFrequency: "monthly", priority: 0.4 },
  { path: "/politica-privacidad", changeFrequency: "monthly", priority: 0.4 },
  { path: "/aviso-legal", changeFrequency: "monthly", priority: 0.4 },
  // Hardcoded blog guides — kept here so they're always indexed even before the dynamic
  // article fallback ports them. Slug list mirrors src/_pages_legacy/blog/* (HARD RULE #2).
  { path: "/blog/mejores-freidoras-aire-amazon-2026-menos-100-euros", changeFrequency: "weekly", priority: 0.6 },
  { path: "/blog/mejores-sofas-calidad-precio-2026", changeFrequency: "weekly", priority: 0.6 },
  { path: "/blog/mejores-ventiladores-de-pie-para-este-verano-2026", changeFrequency: "weekly", priority: 0.6 },
  { path: "/blog/los-7-mejores-ventiladores-amazon-calor-verano-2026", changeFrequency: "weekly", priority: 0.6 },
  { path: "/blog/10-mesas-de-terraza-baratas-y-bonitas-en-amazon-2026", changeFrequency: "weekly", priority: 0.6 },
  { path: "/blog/review-cosori-5-7l-freidora-aire-calidad-precio-menos-100-euros", changeFrequency: "weekly", priority: 0.6 },
  { path: "/blog/mejores-cafeteras-superautomaticas-amantes-del-cafe-2026", changeFrequency: "weekly", priority: 0.6 },
  { path: "/blog/mejores-robots-de-cocina-baratos-alternativas-thermomix-2026", changeFrequency: "weekly", priority: 0.6 },
  { path: "/blog/mejores-frigorificos-combi-bajo-consumo-2026", changeFrequency: "weekly", priority: 0.6 },
  { path: "/blog/mejores-microondas-sin-plato-giratorio-2026", changeFrequency: "weekly", priority: 0.6 },
  { path: "/blog/mejores-sombrillas-resistentes-amazon-2026", changeFrequency: "weekly", priority: 0.6 },
  { path: "/blog/mejores-piscinas-desmontables-baratas-amazon-2026", changeFrequency: "weekly", priority: 0.6 },
];

interface CategoryRow {
  slug: string;
  parent_id: string | null;
  parent: { slug: string } | null;
  updated_at: string | null;
  is_active: boolean;
}

interface ArticleRow {
  slug: string | null;
  path: string | null;
  status: string | null;
  published_at: string | null;
  updated_at: string | null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const generatedAt = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: generatedAt,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const dynamicEntries = await fetchDynamicEntries();
  const deduped = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const entry of [...staticEntries, ...dynamicEntries]) {
    deduped.set(entry.url, entry);
  }

  return Array.from(deduped.values());
}

async function fetchDynamicEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = await createAnonymousServerSupabaseClient();

    const [categoriesResult, articlesResult] = await Promise.all([
      supabase
        .from("categories")
        .select("slug,parent_id,updated_at,is_active,parent:categories!parent_id(slug)")
        .eq("is_active", true),
      supabase
        .from("editorial_articles")
        .select("slug,path,status,published_at,updated_at")
        .eq("status", "published"),
    ]);

    const entries: MetadataRoute.Sitemap = [];

    if (categoriesResult.data) {
      for (const row of categoriesResult.data as unknown as CategoryRow[]) {
        if (!row.slug) continue;
        const parentSlug = Array.isArray(row.parent) ? row.parent[0]?.slug : row.parent?.slug;
        const path = row.parent_id && parentSlug ? `/categoria/${parentSlug}/${row.slug}` : `/categoria/${row.slug}`;
        entries.push({
          url: `${SITE_URL}${path}`,
          lastModified: row.updated_at ? new Date(row.updated_at) : undefined,
          changeFrequency: row.parent_id ? "weekly" : "weekly",
          priority: row.parent_id ? 0.7 : 0.8,
        });
      }
    }

    if (articlesResult.data) {
      for (const row of articlesResult.data as ArticleRow[]) {
        const articlePath = row.path || (row.slug ? `/blog/${row.slug}` : "");
        if (!articlePath) continue;
        entries.push({
          url: `${SITE_URL}${articlePath}`,
          lastModified: row.updated_at || row.published_at ? new Date(row.updated_at || row.published_at!) : undefined,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }

    return entries;
  } catch {
    // Sitemap should never fail the deploy — fall back to static-only.
    return [];
  }
}
