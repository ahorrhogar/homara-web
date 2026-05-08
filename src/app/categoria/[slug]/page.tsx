import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug).catch(() => undefined);
  if (!category) {
    return { title: "Categoría no encontrada", robots: { index: false } };
  }

  return {
    title: `${category.name} — Compara precios y ofertas`,
    description:
      category.description ||
      `Compara productos de ${category.name.toLowerCase()} entre las mejores tiendas de España.`,
    alternates: { canonical: `/categoria/${category.slug}` },
    openGraph: {
      title: `${category.name} — Homara`,
      description: category.description || undefined,
      url: `${SITE_URL}/categoria/${category.slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ orden?: string }>;
}) {
  const [{ slug }, { orden }] = await Promise.all([params, searchParams]);
  const sortBy = parseSort(orden);

  const [category, allCategories, allProducts] = await Promise.all([
    getCategoryBySlug(slug).catch(() => undefined),
    getCategories().catch(() => []),
    getProducts().catch(() => []),
  ]);

  if (!category) {
    notFound();
  }

  const products = await getFilteredProducts({ categoryId: category.id }, sortBy).catch(() => []);

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
