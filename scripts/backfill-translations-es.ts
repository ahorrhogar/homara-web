/**
 * Idempotent backfill of the `es` (default-locale) rows in the sidecar
 * translation tables. Copies the current Spanish display values from the base
 * rows into product_translations / category_translations /
 * editorial_article_translations so the locale-aware data layer renders the
 * default locale byte-identically.
 *
 * Slugs, specs, offers, prices, paths and related slugs are NEVER copied here —
 * they stay canonical on the base rows.
 *
 * Usage: npm run db:backfill-translations
 * Re-runs are safe: every write is an upsert keyed by (entityId, locale).
 */
import { db } from "../src/lib/db";

const LOCALE = "es";

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

async function backfillProducts(): Promise<number> {
  const products = await db.product.findMany({
    select: { id: true, name: true, description: true, specs: true },
  });

  let count = 0;
  for (const product of products) {
    const specs = (product.specs ?? {}) as Record<string, unknown>;
    const longDescription = asString(specs.longDescription);

    await db.productTranslation.upsert({
      where: { productId_locale: { productId: product.id, locale: LOCALE } },
      create: {
        productId: product.id,
        locale: LOCALE,
        name: product.name,
        description: product.description,
        longDescription,
      },
      update: {
        name: product.name,
        description: product.description,
        longDescription,
      },
    });
    count += 1;
  }
  return count;
}

async function backfillCategories(): Promise<number> {
  const categories = await db.category.findMany({
    select: { id: true, name: true, description: true },
  });

  // NOTE: `description` is seeded for future use but is NOT currently rendered —
  // category descriptions are meta-derived in buildCategories (categoryMetaBySlug),
  // and the snapshot overlay applies only `name`. Editing this column will not
  // change the page until that overlay is wired through. See applyCategoryTranslations.
  let count = 0;
  for (const category of categories) {
    await db.categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId: category.id, locale: LOCALE } },
      create: {
        categoryId: category.id,
        locale: LOCALE,
        name: category.name,
        description: category.description,
      },
      update: {
        name: category.name,
        description: category.description,
      },
    });
    count += 1;
  }
  return count;
}

async function backfillArticles(): Promise<number> {
  const articles = await db.editorialArticle.findMany({
    select: {
      id: true,
      title: true,
      excerpt: true,
      coverImageAlt: true,
      categoryName: true,
      sections: true,
      tags: true,
    },
  });

  let count = 0;
  for (const article of articles) {
    const sections = article.sections ?? [];
    await db.editorialArticleTranslation.upsert({
      where: { articleId_locale: { articleId: article.id, locale: LOCALE } },
      create: {
        articleId: article.id,
        locale: LOCALE,
        title: article.title,
        excerpt: article.excerpt,
        coverImageAlt: article.coverImageAlt,
        categoryName: article.categoryName,
        sections: sections as object,
        tags: article.tags,
      },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        coverImageAlt: article.coverImageAlt,
        categoryName: article.categoryName,
        sections: sections as object,
        tags: article.tags,
      },
    });
    count += 1;
  }
  return count;
}

async function main(): Promise<void> {
  console.log(`Backfilling "${LOCALE}" translation rows from base tables…`);
  // Sequential by design: a one-shot migration over tiny row counts, kept serial
  // to keep DB load trivial and the failure point obvious.
  const products = await backfillProducts();
  const categories = await backfillCategories();
  const articles = await backfillArticles();
  console.log(`  product_translations:           ${products}`);
  console.log(`  category_translations:          ${categories}`);
  console.log(`  editorial_article_translations: ${articles}`);
  console.log("Done.");
}

main()
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
