import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { CategoryView } from "@/components/category/CategoryView";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategories, getCategoryBySlug, findSubcategoryBySlug } from "@/data/catalog/categories";
import { getFilteredProducts, getProducts } from "@/data/catalog/products";
import { buildCategorySeoDocument } from "@/domain/catalog/category-seo";
import type { ProductSortBy } from "@/domain/catalog/types";
import { buildAlternates, toOpenGraphLocale } from "@/i18n/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";
const VALID_SORTS: ProductSortBy[] = ["popular", "price-asc", "price-desc", "discount", "rating", "newest"];

function parseSort(value: string | string[] | undefined): ProductSortBy {
  const candidate = Array.isArray(value) ? value[0] : value;
  return VALID_SORTS.includes(candidate as ProductSortBy) ? (candidate as ProductSortBy) : "popular";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string; subSlug: string }>;
}): Promise<Metadata> {
  const { locale, slug, subSlug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("category");
  const category = await getCategoryBySlug(slug, locale).catch(() => undefined);
  const subcategory = category ? findSubcategoryBySlug(category, subSlug) : undefined;
  if (!category || !subcategory) {
    return { title: t("notFound"), robots: { index: false } };
  }

  const description = `Compara ${subcategory.name.toLowerCase()} dentro de ${category.name}: precios reales, datos editoriales y enlaces a tiendas con stock.`;
  const heroImage = subcategory.image || category.image || undefined;

  return {
    title: `${subcategory.name} — ${category.name}`,
    description,
    alternates: buildAlternates(`/categoria/${category.slug}/${subcategory.slug}`, locale),
    openGraph: {
      locale: toOpenGraphLocale(locale),
      title: `${subcategory.name} — ${category.name}`,
      description,
      url: `${SITE_URL}/categoria/${category.slug}/${subcategory.slug}`,
      type: "website",
      images: heroImage ? [{ url: heroImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${subcategory.name} — ${category.name}`,
      description,
      images: heroImage ? [heroImage] : undefined,
    },
  };
}

export default async function SubcategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string; subSlug: string }>;
  searchParams: Promise<{ orden?: string }>;
}) {
  const [{ locale, slug, subSlug }, { orden }] = await Promise.all([params, searchParams]);
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

  const subcategory = findSubcategoryBySlug(category, subSlug);
  if (!subcategory) {
    notFound();
  }

  const products = await getFilteredProducts(
    { categoryId: category.id, subcategoryId: subcategory.id },
    sortBy,
    locale,
  ).catch(() => []);

  const seoProducts = products;
  const seoDocument = buildCategorySeoDocument({
    category,
    subcategory,
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
        { "@type": "ListItem", position: 3, name: subcategory.name, item: canonicalUrl },
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
      <CategoryView
        category={category}
        subcategory={subcategory}
        products={products}
        seoDocument={seoDocument}
      />
    </>
  );
}
