import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { CategoryView } from "@/components/category/CategoryView";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategories, getCategoryBySlug } from "@/data/catalog/categories";
import { getFilteredProducts, getProducts } from "@/data/catalog/products";
import { buildCategorySeoDocument } from "@/domain/catalog/category-seo";
import type { ProductSortBy } from "@/domain/catalog/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";

const VALID_SORTS: ProductSortBy[] = ["popular", "price-asc", "price-desc", "discount", "rating", "newest"];

function parseSort(value: string | string[] | undefined): ProductSortBy {
  const candidate = Array.isArray(value) ? value[0] : value;
  return VALID_SORTS.includes(candidate as ProductSortBy) ? (candidate as ProductSortBy) : "popular";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("category");
  const category = await getCategoryBySlug(slug, locale).catch(() => undefined);
  if (!category) {
    return { title: t("notFound"), robots: { index: false } };
  }

  const description = (
    category.description ||
    `Compara productos de ${category.name.toLowerCase()}: precios reales, datos editoriales y ofertas activas en las principales tiendas.`
  ).slice(0, 300);

  const heroImage = category.image || undefined;

  return {
    title: `${category.name} — Comparativa y precios`,
    description,
    alternates: { canonical: `/categoria/${category.slug}` },
    openGraph: {
      title: `${category.name} — Homara`,
      description,
      url: `${SITE_URL}/categoria/${category.slug}`,
      type: "website",
      images: heroImage ? [{ url: heroImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} — Homara`,
      description,
      images: heroImage ? [heroImage] : undefined,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ orden?: string }>;
}) {
  const [{ locale, slug }, { orden }] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const sortBy = parseSort(orden);

  const [category, allCategories, allProducts] = await Promise.all([
    getCategoryBySlug(slug, locale).catch(() => undefined),
    getCategories(locale).catch(() => []),
    getProducts(locale).catch(() => []),
  ]);

  if (!category) {
    notFound();
  }

  const products = await getFilteredProducts({ categoryId: category.id }, sortBy, locale).catch(
    () => [],
  );

  const seoProducts = products;
  const seoDocument = buildCategorySeoDocument({
    category,
    subcategory: undefined,
    categories: allCategories,
    products: seoProducts,
    allProducts,
  });

  const canonicalUrl = `${SITE_URL}${seoDocument.canonicalPath}`;
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: seoDocument.h1,
    description: seoDocument.schemaDescription,
    url: canonicalUrl,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: category.name, item: `${SITE_URL}/categoria/${category.slug}` },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: seoProducts.length,
      itemListElement: seoProducts.slice(0, 12).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: product.name,
        url: `${SITE_URL}/producto/${product.slug}`,
      })),
    },
  };

  return (
    <>
      <JsonLd data={collectionSchema} />
      <CategoryView category={category} products={products} seoDocument={seoDocument} />
    </>
  );
}
