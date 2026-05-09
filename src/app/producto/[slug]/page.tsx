import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  Tag,
  TrendingDown,
  Truck,
  ShieldCheck,
  ExternalLink,
  TrendingUp,
  Minus,
} from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { ProductGrid } from "@/components/product/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategories } from "@/data/catalog/categories";
import { getOffersForProduct, getPriceAnalysis } from "@/data/catalog/offers";
import { getProductBySlug, getRelatedProducts } from "@/data/catalog/products";
import { computeDiscountPercent } from "@/domain/catalog/product-logic";
import {
  extractDomainFromAffiliateUrl,
  isAffiliateUrlAllowed,
} from "@/infrastructure/security/affiliateUrl";
import { PRODUCT_IMAGE_FALLBACK } from "@/lib/productImage";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => undefined);
  if (!product) {
    return { title: "Producto no encontrado", robots: { index: false } };
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

function buildProductFaq(
  product: { name: string; brand: string; specs?: ReadonlyArray<{ name: string; value: string }> },
  offerCount: number,
): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [];
  const specs = product.specs ?? [];
  const lookup = (key: string) =>
    specs.find((s) => s.name?.toLowerCase().includes(key))?.value;

  const dimensions = lookup("dimens") || lookup("medid") || lookup("tamaño");
  const material = lookup("material");
  const warranty = lookup("garant");
  const power = lookup("potenc") || lookup("consumo");

  if (dimensions) {
    faqs.push({
      question: `¿Qué medidas tiene el ${product.name}?`,
      answer: `Según las especificaciones del fabricante, sus dimensiones son ${dimensions}.`,
    });
  }
  if (material) {
    faqs.push({
      question: `¿De qué material está fabricado?`,
      answer: `Está fabricado con ${material}.`,
    });
  }
  if (power) {
    faqs.push({
      question: `¿Cuál es su potencia o consumo?`,
      answer: `El fabricante indica un valor de ${power}.`,
    });
  }
  if (warranty) {
    faqs.push({
      question: `¿Qué garantía incluye?`,
      answer: `La garantía declarada por el fabricante es de ${warranty}.`,
    });
  }

  faqs.push({
    question: `¿Dónde puedo comprar el ${product.name} al mejor precio?`,
    answer:
      offerCount > 0
        ? `Comparamos ${offerCount} ofertas activas para este producto en distintas tiendas. La página muestra el precio más bajo y enlaza a la tienda con stock.`
        : `Actualmente no hay ofertas activas verificadas para este producto. Consulta las páginas de ${product.brand} en las tiendas oficiales.`,
  });

  return faqs.slice(0, 6);
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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

  const productFaq = buildProductFaq(product, offers.length);
  const faqSchema =
    productFaq.length >= 2
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: productFaq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  const sortedOffers = [...offers].sort((a, b) => a.price + a.shippingCost - (b.price + b.shippingCost));

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
              <span className="text-sm text-muted-foreground">({product.reviewCount} opiniones)</span>
            </div>

            <div className="mb-6 min-w-0 rounded-xl border border-border bg-card p-4">
              <span className="text-sm text-muted-foreground">Mejor precio desde</span>
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
                      Ahorras {(product.originalPrice - product.minPrice).toFixed(2).replace(".", ",")} €
                    </span>
                  </>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> {offers.length} ofertas disponibles
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
          <section className="mb-12">
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-5">
              Todas las ofertas ({sortedOffers.length})
            </h2>
            <div className="space-y-3">
              {sortedOffers.map((offer) => {
                const merchantDomain = extractDomainFromAffiliateUrl(offer.merchant.url);
                const isSafe = isAffiliateUrlAllowed(offer.url, merchantDomain || undefined);
                const total = offer.price + offer.shippingCost;
                return (
                  <div
                    key={offer.id}
                    className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-secondary/80 border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                        {offer.merchant.logo ? (
                          <Image
                            src={offer.merchant.logo}
                            alt={offer.merchant.name}
                            width={28}
                            height={28}
                            sizes="28px"
                            className="w-7 h-7 object-contain"
                          />
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground">
                            {offer.merchant.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{offer.merchant.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="inline-flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            {offer.freeShipping ? "Envío gratis" : `+${offer.shippingCost.toFixed(2).replace(".", ",")} € envío`}
                          </span>
                          {offer.merchant.trusted ? (
                            <span className="inline-flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Tienda verificada
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:flex-shrink-0">
                      <div className="text-right">
                        <p className="font-bold text-foreground">
                          {offer.price.toFixed(2).replace(".", ",")} €
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total {total.toFixed(2).replace(".", ",")} €
                        </p>
                      </div>
                      {isSafe ? (
                        <Link
                          href={`/api/redirect?offerId=${offer.id}&track=1`}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
                        >
                          Ver oferta <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No disponible</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {productFaq.length >= 2 ? (
          <section className="mb-12">
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-5">
              Preguntas frecuentes
            </h2>
            <dl className="divide-y divide-border rounded-2xl border border-border bg-card">
              {productFaq.map((item) => (
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
            title="Productos relacionados"
            subtitle="Otros productos que podrían interesarte"
          />
        ) : null}
      </main>
    </>
  );
}

// Helper for the ProductPage when product is not found — used by app/not-found.tsx
export const dynamic = "force-static";
