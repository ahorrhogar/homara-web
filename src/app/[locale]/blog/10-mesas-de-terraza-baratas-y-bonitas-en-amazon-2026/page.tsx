import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, BadgeEuro, ChefHat, ExternalLink, Sparkles, Star, Zap } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBlogGuideSchemas } from "@/components/seo/blog-guide-schemas";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";
const PATH = "/blog/10-mesas-de-terraza-baratas-y-bonitas-en-amazon-2026";

const PUBLISHED_AT = "2026-04-08";
const UPDATED_AT = "2026-04-08";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guides.10-mesas-de-terraza-baratas-y-bonitas-en-amazon-2026");
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    keywords: t.raw("keywords") as string[],
    alternates: { canonical: PATH },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${SITE_URL}${PATH}`,
      publishedTime: PUBLISHED_AT,
      modifiedTime: UPDATED_AT,
      authors: ["Equipo editorial Homara"],
      section: t("category"),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

type TerraceTableProduct = {
  rank: number;
  name: string;
  brand: string;
  rating: string;
  priceSeen: string;
  affiliateUrl: string;
  imageUrl: string;
};

const terraceTableProducts: TerraceTableProduct[] = [
  {
    rank: 1,
    name: "Casaria mesa plegable acacia 46 x 46",
    brand: "Casaria",
    rating: "4,6/5 (4.542 valoraciones)",
    priceSeen: "35,99 EUR",
    affiliateUrl: "https://amzn.to/3Oo5BT9",
    imageUrl: "https://m.media-amazon.com/images/I/81mysC2tsNL._AC_SX522_.jpg",
  },
  {
    rank: 2,
    name: "IPAE Saturnia redonda 90 cm",
    brand: "IPAE",
    rating: "4,3/5 (460 valoraciones)",
    priceSeen: "39,99 EUR",
    affiliateUrl: "https://amzn.to/3Qs29r5",
    imageUrl: "https://m.media-amazon.com/images/I/31fAo7fasEL._AC_SX522_.jpg",
  },
  {
    rank: 3,
    name: "Casaria mesa auxiliar acacia 45 x 45",
    brand: "Casaria",
    rating: "4,3/5 (2.190 valoraciones)",
    priceSeen: "44,95 EUR",
    affiliateUrl: "https://amzn.to/4tVWAQd",
    imageUrl: "https://m.media-amazon.com/images/I/81egF+veYAL._AC_SX522_.jpg",
  },
  {
    rank: 4,
    name: "Devoko mesa extensible aluminio",
    brand: "Devoko",
    rating: "4,6/5 (313 valoraciones)",
    priceSeen: "199,00 EUR",
    affiliateUrl: "https://amzn.to/4dQppc9",
    imageUrl: "https://m.media-amazon.com/images/I/61I8vG8-fDL._AC_SX522_.jpg",
  },
  {
    rank: 5,
    name: "Keter Quartet 95",
    brand: "Keter",
    rating: "4,6/5 (411 valoraciones)",
    priceSeen: "76,95 EUR",
    affiliateUrl: "https://amzn.to/4tdA3OQ",
    imageUrl: "https://m.media-amazon.com/images/I/71U-SaOmJjL._AC_SX522_.jpg",
  },
  {
    rank: 6,
    name: "YOEVU mesa plegable 180 cm",
    brand: "YOEVU",
    rating: "4,5/5 (100 valoraciones)",
    priceSeen: "41,90 EUR",
    affiliateUrl: "https://amzn.to/4vH9d3q",
    imageUrl: "https://m.media-amazon.com/images/I/61RTpaKMh9L._AC_SX522_.jpg",
  },
  {
    rank: 7,
    name: "CASARIA mesa plegable acacia 160 x 85",
    brand: "CASARIA",
    rating: "4,1/5 (774 valoraciones)",
    priceSeen: "101,95 EUR",
    affiliateUrl: "https://amzn.to/4chjjjN",
    imageUrl: "https://m.media-amazon.com/images/I/51YhAf07OUL._AC_SX522_.jpg",
  },
  {
    rank: 8,
    name: "HollyHOME mesa auxiliar redonda metal",
    brand: "HollyHOME",
    rating: "4,6/5 (617 valoraciones)",
    priceSeen: "36,99 EUR",
    affiliateUrl: "https://amzn.to/3QgdvP6",
    imageUrl: "https://m.media-amazon.com/images/I/61T3YQY7H6L._AC_SX522_.jpg",
  },
  {
    rank: 9,
    name: "PHI VILLA mesa plegable cristal",
    brand: "PHI VILLA",
    rating: "4,4/5 (1.405 valoraciones)",
    priceSeen: "39,99 EUR",
    affiliateUrl: "https://amzn.to/42eiNx3",
    imageUrl: "https://m.media-amazon.com/images/I/71F9aghIMWL._AC_SX522_.jpg",
  },
  {
    rank: 10,
    name: "CASARIA set terraza mesa + 4 sillas",
    brand: "CASARIA",
    rating: "3,5/5 (1.126 valoraciones)",
    priceSeen: "218,99 EUR",
    affiliateUrl: "https://amzn.to/4tl9qYs",
    imageUrl: "https://m.media-amazon.com/images/I/81WQpAkvukL._AC_SX522_.jpg",
  },
];

type TerraceItemCopy = {
  tableType: string;
  dimensions: string;
  bestFor: string;
  notes: string[];
  pros: string[];
  cons: string[];
  miniReview: string;
};

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guides.10-mesas-de-terraza-baratas-y-bonitas-en-amazon-2026");

  const title = t("title");
  const description = t("description");
  const category = t("category");
  const keywords = t.raw("keywords") as string[];
  const faqs = t.raw("faq") as Array<{ q: string; a: string }>;
  const items = t.raw("items") as TerraceItemCopy[];

  const { article, breadcrumb, faqPage, itemList } = buildBlogGuideSchemas({
    path: PATH,
    title,
    description,
    publishedAt: PUBLISHED_AT,
    updatedAt: UPDATED_AT,
    category,
    keywords,
    image: terraceTableProducts[0]?.imageUrl,
    rankedItems: terraceTableProducts.map((p) => ({ name: p.name })),
    faqs: faqs.map((f) => ({ question: f.q, answer: f.a })),
    articleBody: terraceTableProducts.map((p, i) => `${p.name}: ${items[i].miniReview}`).join(" "),
  });

  return (
    <>
      <JsonLd data={article} />
      <JsonLd data={breadcrumb} />
      {faqPage ? <JsonLd data={faqPage} /> : null}
      {itemList ? <JsonLd data={itemList} /> : null}

      <main className="container mx-auto px-4 pb-16">
        <div className="py-2">
          <Breadcrumb items={[{ label: "Blog", href: "/blog" }, { label: title }]} />
        </div>

        <article className="pb-16">
          <header className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-accent/15 via-secondary/50 to-card p-6 md:p-10">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/20 blur-2xl" aria-hidden="true" />
            <div className="absolute -left-12 bottom-0 h-24 w-24 rounded-full bg-primary/15 blur-xl" aria-hidden="true" />

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
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">{t("metaTop")}</span>
              </div>
            </div>
          </header>

          <section className="mt-6 rounded-2xl border border-deal/30 bg-deal/5 p-4 text-sm text-muted-foreground">
            <p>
              {t("disclosure")}
            </p>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{t("summaryTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("summaryIntro")}</p>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[1080px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-left">
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colFoto")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colModelo")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colTipo")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colDimensiones")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colRating")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colPrecio")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colCta")}</th>
                  </tr>
                </thead>
                <tbody>
                  {terraceTableProducts.map((product, i) => (
                    <tr key={product.rank} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3">
                        <div className="h-14 w-14 overflow-hidden rounded-lg border border-border bg-background">
                          <img
                            src={product.imageUrl || "/placeholder.svg"}
                            alt={product.name}
                            loading="lazy"
                            className="h-full w-full object-contain p-1"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                      </td>
                      <td className="px-4 py-3 text-foreground">{items[i].tableType}</td>
                      <td className="px-4 py-3 text-foreground">{items[i].dimensions}</td>
                      <td className="px-4 py-3 text-foreground">{product.rating}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-1 font-semibold text-accent">
                          <BadgeEuro className="h-3.5 w-3.5" />
                          {product.priceSeen}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={product.affiliateUrl}
                          target="_blank"
                          rel="sponsored nofollow noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20"
                        >
                          {t("ctaVerEnAmazon")} <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{t("topTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("topIntro")}</p>

            <div className="mt-6 space-y-6">
              {terraceTableProducts.map((product, i) => (
                <section key={product.rank} className="rounded-2xl border border-border bg-card p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-accent">{t("topRank", { rank: product.rank })}</p>
                      <h3 className="mt-1 font-display text-xl font-bold text-foreground md:text-2xl">{product.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{t("bestForLabel")} {items[i].bestFor}</p>
                    </div>

                    <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-right text-sm">
                      <p className="font-semibold text-foreground">{product.priceSeen}</p>
                      <p className="text-xs text-muted-foreground">{t("priceSeenLabel")}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-5 lg:grid-cols-[220px_1fr]">
                    <a
                      href={product.affiliateUrl}
                      target="_blank"
                      rel="sponsored nofollow noopener noreferrer"
                      className="group block overflow-hidden rounded-xl border border-border bg-background"
                    >
                      <img
                        src={product.imageUrl || "/placeholder.svg"}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </a>

                    <div>
                      <div className="grid gap-3 text-sm md:grid-cols-3">
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">{t("colTipo")}</p>
                          <p className="font-semibold text-foreground">{items[i].tableType}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">{t("colDimensiones")}</p>
                          <p className="font-semibold text-foreground">{items[i].dimensions}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">{t("colRating")}</p>
                          <p className="font-semibold text-foreground">{product.rating}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border border-border bg-background p-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("porQueDestaca")}</p>
                          <ul className="space-y-1.5 text-sm text-foreground">
                            {items[i].notes.map((note) => (
                              <li key={note} className="flex items-start gap-2">
                                <Star className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-accent" />
                                <span>{note}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-lg border border-border bg-background p-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("prosLabel")}</p>
                          <ul className="space-y-1.5 text-sm text-foreground">
                            {items[i].pros.map((pro) => (
                              <li key={pro} className="flex items-start gap-2">
                                <Zap className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-deal" />
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-lg border border-border bg-background p-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("consLabel")}</p>
                          <ul className="space-y-1.5 text-sm text-foreground">
                            {items[i].cons.map((con) => (
                              <li key={con} className="flex items-start gap-2">
                                <span className="mt-[8px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground" />
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-4 rounded-lg border border-accent/30 bg-accent/5 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-accent">{t("miniReviewLabel")}</p>
                        <p className="mt-1 text-sm leading-relaxed text-foreground">{items[i].miniReview}</p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <a
                          href={product.affiliateUrl}
                          target="_blank"
                          rel="sponsored nofollow noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
                        >
                          {t("ctaVerOferta")} <ExternalLink className="h-4 w-4" />
                        </a>
                        <Link
                          href={`/buscar?q=${encodeURIComponent(`${product.brand} mesa terraza`)}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
                        >
                          {t("ctaCompararAlternativas")} <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">{t("buyGuideTitle")}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">{t("buyStep1Title")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t("buyStep1Body")}</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">{t("buyStep2Title")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t("buyStep2Body")}</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">{t("buyStep3Title")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t("buyStep3Body")}</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">{t("buyStep4Title")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t("buyStep4Body")}</p>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground">{t("faqTitle")}</h2>
            <div className="mt-4 space-y-3">
              {faqs.map((item) => (
                <details key={item.q} className="group rounded-xl border border-border bg-card p-4">
                  <summary className="cursor-pointer list-none font-semibold text-foreground">
                    <span className="inline-flex items-center gap-2">
                      <ChefHat className="h-4 w-4 text-accent" />
                      {item.q}
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-accent/20 bg-gradient-to-br from-card via-card to-accent/10 p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">{t("editorialTitle")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("editorialBody")}
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <a href="https://amzn.to/3Oo5BT9" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">{t("editorialLink1")}</a>
              <a href="https://amzn.to/4tdA3OQ" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">{t("editorialLink2")}</a>
              <a href="https://amzn.to/4dQppc9" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">{t("editorialLink3")}</a>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">{t("keepBrowsingTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("keepBrowsingIntro")}</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link href="/buscar?q=mesa%20de%20terraza" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkBuscarTerraza")}</Link>
              <Link href="/buscar?q=mesa%20de%20jardin" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkBuscarJardin")}</Link>
              <Link href="/buscar?q=mesa%20plegable%20exterior" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkBuscarPlegable")}</Link>
              <Link href="/buscar?q=set%20mesa%20sillas%20terraza" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkBuscarSet")}</Link>
              <Link href="/blog" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkBlog")}</Link>
              <Link href="/asistente" className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm font-semibold text-accent hover:bg-accent/20">{t("linkAsistente")}</Link>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
