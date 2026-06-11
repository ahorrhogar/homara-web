import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Star,
  Tag,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { ProductGrid } from "@/components/product/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { OfferRow } from "@/components/product/OfferRow";
import { OfferComparator } from "@/components/product/OfferComparator";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategories } from "@/data/catalog/categories";
import { getOffersForProduct, getPriceAnalysis } from "@/data/catalog/offers";
import { getProductBySlug, getRelatedProducts } from "@/data/catalog/products";
import { computeDiscountPercent } from "@/domain/catalog/product-logic";
import {
  extractDomainFromAffiliateUrl,
  isAffiliateUrlAllowed,
} from "@/infrastructure/security/affiliateUrl";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("productPage");
  const product = await getProductBySlug(slug).catch(() => undefined);
  if (!product) {
    return { title: t("notFound"), robots: { index: false } };
  }

  const description =
    (product.description || `Compara precios y ofertas reales de ${product.name}. Datos editoriales, especificaciones y enlaces a las tiendas con stock.`).slice(
      0,
      300,
    );

  return {
    title: `${product.name} — Precios, ofertas y opiniones`,
    description,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      url: `${SITE_URL}/producto/${product.slug}`,
      images: product.images.filter(Boolean).slice(0, 1).map((url) => ({ url })),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.images.filter(Boolean).slice(0, 1),
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("productPage");

  const product = await getProductBySlug(slug).catch(() => undefined);

  if (!product) {
    notFound();
  }

  const [categories, offers, priceAnalysis, related] = await Promise.all([
    getCategories().catch(() => []),
    getOffersForProduct(product.id).catch(() => []),
    getPriceAnalysis(product.id).catch(() => ({ label: "", type: "stable" as const })),
    getRelatedProducts(product, { limit: 4 }).catch(() => []),
  ]);

  const category = categories.find((c) => c.id === product.categoryId);
  const subcategory = category?.subcategories.find((s) => s.id === product.subcategoryId);

  const breadcrumbs = [
    { label: category?.name || "", href: category ? `/categoria/${category.slug}` : "/" },
    ...(subcategory
      ? [
          {
            label: subcategory.name,
            href: category ? `/categoria/${category.slug}/${subcategory.slug}` : undefined,
          },
        ]
      : []),
    { label: product.name },
  ];

  const realDiscount = computeDiscountPercent(product);
  const galleryImages = product.images.filter(Boolean);

  const productSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}/producto/${product.slug}#product`,
    name: product.name,
    description: product.description || undefined,
    sku: product.slug,
    brand: { "@type": "Brand", name: product.brand },
    image: galleryImages.slice(0, 6),
    url: `${SITE_URL}/producto/${product.slug}`,
  };

  if (product.rating && product.reviewCount) {
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (offers.length > 0) {
    productSchema.offers = {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: product.minPrice,
      highPrice: product.maxPrice,
      offerCount: offers.length,
      offers: offers.map((offer) => ({
        "@type": "Offer",
        url: `${SITE_URL}/api/redirect?offerId=${offer.id}&track=1`,
        priceCurrency: "EUR",
        price: offer.price,
        availability: offer.inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        seller: { "@type": "Organization", name: offer.merchant.name },
      })),
    };
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      ...(category
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: category.name,
              item: `${SITE_URL}/categoria/${category.slug}`,
            },
          ]
        : []),
      ...(category && subcategory
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: subcategory.name,
              item: `${SITE_URL}/categoria/${category.slug}/${subcategory.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: category && subcategory ? 4 : category ? 3 : 2,
        name: product.name,
        item: `${SITE_URL}/producto/${product.slug}`,
      },
    ],
  };

  // Build product FAQ from translated templates
  const productFaq: Array<{ question: string; answer: string }> = [];
  const specs = product.specs ?? [];
  const lookupSpec = (key: string) =>
    specs.find((s) => s.label?.toLowerCase().includes(key))?.value;

  const dimensions = lookupSpec("dimens") || lookupSpec("medid") || lookupSpec("tamaño");
  const material = lookupSpec("material");
  const warranty = lookupSpec("garant");
  const power = lookupSpec("potenc") || lookupSpec("consumo");

  if (dimensions) {
    productFaq.push({
      question: t("faqDimensionsQ", { name: product.name }),
      answer: t("faqDimensionsA", { dimensions }),
    });
  }
  if (material) {
    productFaq.push({
      question: t("faqMaterialQ"),
      answer: t("faqMaterialA", { material }),
    });
  }
  if (power) {
    productFaq.push({
      question: t("faqPowerQ"),
      answer: t("faqPowerA", { power }),
    });
  }
  if (warranty) {
    productFaq.push({
      question: t("faqWarrantyQ"),
      answer: t("faqWarrantyA", { warranty }),
    });
  }
  productFaq.push({
    question: t("faqBestPriceQ", { name: product.name }),
    answer:
      offers.length > 0
        ? t("faqBestPriceA", { count: String(offers.length) })
        : t("faqBestPriceNoOffersA", { brand: product.brand }),
  });

  const productFaqSlice = productFaq.slice(0, 6);

  const faqSchema =
    productFaqSlice.length >= 2
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: productFaqSlice.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  const sortedOffers = [...offers]
    .sort((a, b) => a.price + a.shippingCost - (b.price + b.shippingCost))
    .map((offer) => {
      const merchantDomain = extractDomainFromAffiliateUrl(offer.merchant.url);
      return {
        ...offer,
        isSafe: isAffiliateUrlAllowed(offer.url, merchantDomain || undefined),
      };
    });

  return (
    <>
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      {faqSchema ? <JsonLd data={faqSchema} /> : null}

      <main className="container mx-auto px-4">
        <Breadcrumb items={breadcrumbs} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <ProductGallery
            images={galleryImages}
            productName={product.name}
            badge={
              realDiscount && realDiscount > 0 && realDiscount <= 60
                ? { kind: "discount", value: realDiscount }
                : product.originalPrice && product.originalPrice > product.minPrice
                  ? { kind: "deal" }
                  : null
            }
          />

          <div className="min-w-0">
            <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3 break-words">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-border"}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-muted-foreground">
                {t("reviews", { count: String(product.reviewCount) })}
              </span>
            </div>

            <div className="mb-6 min-w-0 rounded-xl border border-border bg-card p-4">
              <span className="text-sm text-muted-foreground">{t("bestPriceFrom")}</span>
              <div className="mt-1 flex flex-wrap items-baseline gap-2 sm:gap-3">
                <span className="text-3xl font-bold text-foreground">
                  {product.minPrice.toFixed(2).replace(".", ",")} €
                </span>
                {product.originalPrice && product.originalPrice > product.minPrice ? (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {product.originalPrice.toFixed(2).replace(".", ",")} €
                    </span>
                    <span className="max-w-full break-words rounded-md bg-deal px-2 py-0.5 text-xs font-bold text-deal-foreground">
                      {t("saves", { amount: (product.originalPrice - product.minPrice).toFixed(2).replace(".", ",") })}
                    </span>
                  </>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> {t("offersCount", { count: String(offers.length) })}
              </p>

              {priceAnalysis?.label ? (
                <div
                  className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                    priceAnalysis.type === "low"
                      ? "bg-deal/10 text-deal"
                      : priceAnalysis.type === "high"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {priceAnalysis.type === "low" ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : priceAnalysis.type === "high" ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <Minus className="w-3 h-3" />
                  )}
                  {priceAnalysis.label}
                </div>
              ) : null}
            </div>

            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{product.description}</p>

            {product.specs.length > 0 ? <ProductSpecs specs={product.specs} /> : null}
          </div>
        </div>

        {sortedOffers.length > 0 ? (
          <OfferComparator
            product={{ id: product.id, name: product.name, brand: product.brand }}
            offers={sortedOffers}
          >
            <section className="mb-12">
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-5">
                {t("allOffersTitle", { count: String(sortedOffers.length) })}
              </h2>
              <div className="space-y-3">
                {sortedOffers.map((offer, index) => (
                  <OfferRow
                    key={offer.id}
                    offer={offer}
                    product={{ id: product.id, name: product.name, brand: product.brand }}
                    index={index}
                    isSafe={offer.isSafe}
                  />
                ))}
              </div>
            </section>
          </OfferComparator>
        ) : null}

        {productFaqSlice.length >= 2 ? (
          <section className="mb-12">
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-5">
              {t("faqTitle")}
            </h2>
            <dl className="divide-y divide-border rounded-2xl border border-border bg-card">
              {productFaqSlice.map((item) => (
                <div key={item.question} className="p-4">
                  <dt className="font-semibold text-foreground text-sm mb-1">{item.question}</dt>
                  <dd className="text-sm text-muted-foreground leading-relaxed">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {related.length > 0 ? (
          <ProductGrid
            products={related}
            title={t("relatedTitle")}
            subtitle={t("relatedSubtitle")}
            listName="related_products"
            listId={`related_${product.id}`}
            extraEventParams={{ source_product_id: product.id, source_product_slug: product.slug }}
          />
        ) : null}
      </main>
    </>
  );
}

export const dynamic = "force-static";
