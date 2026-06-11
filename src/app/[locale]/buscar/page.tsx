import type { Metadata } from "next";
import { Search } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { SearchResultsBeacon } from "@/components/search/SearchResultsBeacon";
import { searchProducts } from "@/data/catalog/products";
import { normalizeSearchTerm } from "@/domain/catalog/search-normalize";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Buscar productos",
  description: "Encuentra productos para tu hogar comparando precios entre las mejores tiendas de España.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const t = await getTranslations("search");
  const query = (q || "").trim();
  const normalizedTerm = normalizeSearchTerm(query);
  const results = query ? await searchProducts(query, 72).catch(() => []) : [];
  const topProductId = results[0]?.id ?? null;
  const listId = normalizedTerm ? `search_${normalizedTerm}` : "search";
  const extraEventParams = { search_term: query, normalized_term: normalizedTerm };

  return (
    <main className="container mx-auto px-4 py-8 md:py-10">
      {query ? (
        <SearchResultsBeacon
          query={query}
          normalizedTerm={normalizedTerm}
          resultCount={results.length}
          topProductId={topProductId}
        />
      ) : null}

      <div className="mb-6">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Search className="w-4 h-4" />
          <span>{t("label")}</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">
          {query ? t("resultsFor", { query }) : t("prompt")}
        </h1>
      </div>

      {!query ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-foreground font-medium">{t("emptyTitle")}</p>
          <p className="text-muted-foreground text-sm mt-1">{t("emptyHint")}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-foreground font-medium">{t("noResults", { query })}</p>
          <p className="text-muted-foreground text-sm mt-1">{t("noResultsHint")}</p>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
            <span className="text-sm text-muted-foreground">{t("resultsCount", { count: results.length })}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {results.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                listName="search_results"
                listId={listId}
                index={index}
                extraEventParams={extraEventParams}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
