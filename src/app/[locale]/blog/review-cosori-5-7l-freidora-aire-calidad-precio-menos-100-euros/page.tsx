import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, ExternalLink, Flame, Sparkles, Star, ThumbsUp } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildAlternates, toOpenGraphLocale } from "@/i18n/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";
const REVIEW_PATH = "/blog/review-cosori-5-7l-freidora-aire-calidad-precio-menos-100-euros";
const AFFILIATE_URL = "https://amzn.to/41DW3q9";

const PUBLISHED_AT = "2026-03-02";
const UPDATED_AT = "2026-03-02";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guides.review-cosori-5-7l-freidora-aire-calidad-precio-menos-100-euros");
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    keywords: t.raw("keywords") as string[],
    alternates: buildAlternates(REVIEW_PATH, locale),
    openGraph: {
      type: "article",
      locale: toOpenGraphLocale(locale),
      title,
      description,
      url: `${SITE_URL}${REVIEW_PATH}`,
      publishedTime: PUBLISHED_AT,
      modifiedTime: UPDATED_AT,
      authors: ["Equipo editorial Homara"],
      section: t("category"),
      images: [{ url: "https://m.media-amazon.com/images/I/81HDt6NDs7L._AC_SX522_.jpg" }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

const product = {
  name: "COSORI Air Fryer Real Metallic Interior 5.7L",
  priceSeen: "84,99 EUR",
  rating: "4,7/5",
  reviews: "103.776 valoraciones",
  capacity: "5,7 L",
  power: "1700 W",
  programs: "13 programas de un toque",
  recipes: "40 recetas",
  warranty: "3 años",
  mainImage: "https://m.media-amazon.com/images/I/81HDt6NDs7L._AC_SX522_.jpg",
  extraImages: [
    "https://m.media-amazon.com/images/I/51Hz0BEs8-L._AC_US100_.jpg",
    "https://m.media-amazon.com/images/I/519eb9UfuxL._AC_US100_.jpg",
    "https://m.media-amazon.com/images/I/514hF8Z02sL._AC_US100_.jpg",
  ],
};

export default async function CosoriReviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guides.review-cosori-5-7l-freidora-aire-calidad-precio-menos-100-euros");

  const title = t("title");
  const description = t("description");
  const category = t("category");
  const faqs = t.raw("faq") as Array<{ q: string; a: string }>;
  const likes = t.raw("likes") as string[];
  const dislikes = t.raw("dislikes") as string[];
  const pros = t.raw("pros") as string[];
  const cons = t.raw("cons") as string[];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}${REVIEW_PATH}#product`,
    name: product.name,
    image: [product.mainImage, ...product.extraImages],
    description,
    brand: { "@type": "Brand", name: "Cosori" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: 4.7,
      reviewCount: 103776,
      bestRating: 5,
      worstRating: 1,
    },
    review: {
      "@type": "Review",
      author: { "@type": "Organization", name: "Equipo editorial Homara", url: SITE_URL },
      reviewRating: { "@type": "Rating", ratingValue: 4.7, bestRating: 5 },
      datePublished: PUBLISHED_AT,
      reviewBody: description,
    },
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "ReviewArticle",
    headline: title,
    description,
    inLanguage: locale,
    articleSection: category,
    datePublished: PUBLISHED_AT,
    dateModified: UPDATED_AT,
    author: { "@type": "Organization", name: "Equipo editorial Homara", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "Homara",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/homara-logo.svg` },
    },
    mainEntityOfPage: `${SITE_URL}${REVIEW_PATH}`,
    image: [product.mainImage],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: title, item: `${SITE_URL}${REVIEW_PATH}` },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <JsonLd data={productSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <main className="container mx-auto px-4 pb-16">
        <div className="py-2">
          <Breadcrumb items={[{ label: "Blog", href: "/blog" }, { label: t("breadcrumbLabel") }]} />
        </div>

        <article>
          <header className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-accent/15 via-secondary/50 to-card p-6 md:p-10">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/20 blur-2xl" aria-hidden />
            <div className="absolute -left-12 bottom-0 h-24 w-24 rounded-full bg-primary/15 blur-xl" aria-hidden />

            <div className="relative max-w-4xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                <Sparkles className="h-3.5 w-3.5" />
                {t("badge")}
              </p>

              <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-5xl">
                {t("h1")}
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {t("intro")}
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">{t("metaUpdated")}</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">{t("metaIntent")}</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">{t("metaProduct")}</span>
              </div>
            </div>
          </header>

          <section className="mt-6 rounded-2xl border border-deal/30 bg-deal/5 p-4 text-sm text-muted-foreground">
            <p>{t("disclosure")}</p>
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                {t("opinionTitle")}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                {t("opinionP1")}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                {t("opinionP2")}
              </p>

              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="font-display text-xl font-bold text-foreground">{t("likesTitle")}</h3>
                <ul className="mt-3 space-y-2 text-sm text-foreground">
                  {likes.map((item) => (
                    <li key={item} className="flex items-start gap-2"><ThumbsUp className="mt-0.5 h-4 w-4 text-deal" />{item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="font-display text-xl font-bold text-foreground">{t("dislikesTitle")}</h3>
                <ul className="mt-3 space-y-2 text-sm text-foreground">
                  {dislikes.map((item) => (
                    <li key={item} className="flex items-start gap-2"><span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-muted-foreground" />{item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="font-display text-xl font-bold text-foreground">{t("recommendTitle")}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("recommendBody")}
                </p>
              </div>
            </div>

            <aside className="space-y-4">
              <a href={AFFILIATE_URL} target="_blank" rel="sponsored nofollow noopener noreferrer" className="group block overflow-hidden rounded-2xl border border-border bg-card">
                <img
                  src={product.mainImage}
                  alt={product.name}
                  loading="lazy"
                  className="h-64 w-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </a>

              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("priceSeenLabel")}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{product.priceSeen}</p>
                <p className="mt-2 text-xs text-muted-foreground">{t("ratingLine", { rating: product.rating, reviews: product.reviews })}</p>
                <a
                  href={AFFILIATE_URL}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
                >
                  {t("ctaAmazon")} <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </aside>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{t("specsTitle")}</h2>
            <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[760px] text-sm">
                <tbody>
                  <SpecRow label={t("specLabelModelo")} value={product.name} />
                  <SpecRow label={t("specLabelCapacidad")} value={product.capacity} />
                  <SpecRow label={t("specLabelPotencia")} value={product.power} />
                  <SpecRow label={t("specLabelProgramas")} value={product.programs} />
                  <SpecRow label={t("specLabelRecetas")} value={product.recipes} />
                  <SpecRow label={t("specLabelGarantia")} value={product.warranty} />
                  <SpecRow label={t("specLabelPrecioVisto")} value={product.priceSeen} last />
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{t("imagesTitle")}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {product.extraImages.map((imageUrl) => (
                <a
                  key={imageUrl}
                  href={AFFILIATE_URL}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  className="overflow-hidden rounded-xl border border-border bg-card p-3"
                >
                  <img src={imageUrl} alt={t("imageAlt")} loading="lazy" className="h-24 w-full object-contain" />
                </a>
              ))}
            </div>
          </section>

          <section className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-2xl font-bold text-foreground">{t("prosTitle")}</h2>
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                {pros.map((item) => (
                  <li key={item} className="flex items-start gap-2"><Star className="mt-0.5 h-4 w-4 text-accent" />{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-2xl font-bold text-foreground">{t("consTitle")}</h2>
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                {cons.map((item) => (
                  <li key={item} className="flex items-start gap-2"><span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-muted-foreground" />{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">{t("analysisTitle")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              {t("analysisP1")}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              {t("analysisP2")}
            </p>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground">{t("faqTitle")}</h2>
            <div className="mt-4 space-y-3">
              {faqs.map((item) => (
                <details key={item.q} className="group rounded-xl border border-border bg-card p-4">
                  <summary className="cursor-pointer list-none font-semibold text-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Flame className="h-4 w-4 text-accent" />
                      {item.q}
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-accent/20 bg-gradient-to-br from-card via-card to-accent/10 p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">{t("verdictTitle")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("verdictBody")}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={AFFILIATE_URL}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
              >
                {t("ctaVerdict")} <ExternalLink className="h-4 w-4" />
              </a>
              <Link
                href="/blog/mejores-freidoras-aire-amazon-2026-menos-100-euros"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
              >
                {t("compareLink")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">{t("keepBrowsingTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("keepBrowsingIntro")}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link href="/categoria/cocina" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">
                {t("linkCocina")}
              </Link>
              <Link href="/categoria/electrodomesticos" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">
                {t("linkElectro")}
              </Link>
              <Link href="/buscar?q=freidora%20aire" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">
                {t("linkBuscar")}
              </Link>
              <Link href="/asistente" className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm font-semibold text-accent hover:bg-accent/20">
                {t("linkAsistente")}
              </Link>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}

function SpecRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <tr className={last ? "" : "border-b border-border"}>
      <th className="w-1/3 bg-secondary/50 px-4 py-3 text-left font-semibold text-foreground">{label}</th>
      <td className="px-4 py-3 text-foreground">{value}</td>
    </tr>
  );
}
