import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, BadgeEuro, ExternalLink, Sparkles, Star, Zap } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBlogGuideSchemas } from "@/components/seo/blog-guide-schemas";
import { buildAlternates, toOpenGraphLocale } from "@/i18n/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";
const PATH = "/blog/mejores-piscinas-desmontables-baratas-amazon-2026";

const PUBLISHED_AT = "2026-04-30";
const UPDATED_AT = "2026-04-30";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guides.mejores-piscinas-desmontables-baratas-amazon-2026");
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    keywords: t.raw("keywords") as string[],
    alternates: buildAlternates(PATH, locale),
    openGraph: {
      type: "article",
      locale: toOpenGraphLocale(locale),
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

type PoolProduct = {
  rank: number;
  name: string;
  brand: string;
  rating: string;
  priceSeen: string;
  affiliateUrl: string;
  imageUrl: string;
};

const affiliateProducts: PoolProduct[] = [
  {
    rank: 1,
    name: "Intex 28272NP Small Frame – Detachable Swimming Pool, 300 x 200 x 75 cm, 3.834 Litres, Blue",
    brand: "Intex",
    rating: "4,5/5 (48.084 valoraciones)",
    priceSeen: "99,00 EUR",
    affiliateUrl: "https://amzn.to/4u4lMEf",
    imageUrl: "https://m.media-amazon.com/images/I/61Yj7vQtbAL._AC_SX569_.jpg",
  },
  {
    rank: 2,
    name: "BESTWAY 56406 – Steel Pro MAX Tubular Detachable Swimming Pool, 305 x 76 cm, Multicoloured",
    brand: "Bestway",
    rating: "4,4/5 (2.555 valoraciones)",
    priceSeen: "89,99 EUR",
    affiliateUrl: "https://amzn.to/4cvKozO",
    imageUrl: "https://m.media-amazon.com/images/I/81i97asQzML._AC_SX569_.jpg",
  },
  {
    rank: 3,
    name: "Intex ¡¡¡28212-POOL Metal Frame 366X76CM 6503L C/DEPURATOR",
    brand: "Intex",
    rating: "4,3/5 (5.169 valoraciones)",
    priceSeen: "114,99 EUR",
    affiliateUrl: "https://amzn.to/4cZY4TQ",
    imageUrl: "https://m.media-amazon.com/images/I/51m14kNojZL._AC_SX569_.jpg",
  },
  {
    rank: 4,
    name: "Bestway Fast Set Self-Standing Detachable Pool, 244 x 66 cm",
    brand: "Bestway",
    rating: "3,9/5 (4.037 valoraciones)",
    priceSeen: "41,99 EUR",
    affiliateUrl: "https://amzn.to/4u4hBZ1",
    imageUrl: "https://m.media-amazon.com/images/I/51-glVV9EwL._AC_SX569_.jpg",
  },
  {
    rank: 5,
    name: "Intex 26700NP – Round Prisma Frame Raised Pool 305 x 76 cm",
    brand: "Intex",
    rating: "4,1/5 (1.186 valoraciones)",
    priceSeen: "89,95 EUR",
    affiliateUrl: "https://amzn.to/498sukr",
    imageUrl: "https://m.media-amazon.com/images/I/61o2sQfnLvL._AC_SX425_.jpg",
  },
];

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guides.mejores-piscinas-desmontables-baratas-amazon-2026");

  const title = t("title");
  const description = t("description");
  const category = t("category");
  const keywords = t.raw("keywords") as string[];

  const faqs = t.raw("faq") as Array<{ q: string; a: string }>;
  const productProse = t.raw("products") as Array<{
    structure: string;
    size: string;
    bestFor: string;
    notes: string[];
    pros: string[];
    cons: string[];
    miniReview: string;
  }>;

  const products = affiliateProducts.map((product, index) => ({
    ...product,
    ...productProse[index],
  }));

  const { article, breadcrumb, faqPage, itemList } = buildBlogGuideSchemas({
    path: PATH,
    locale,
    title,
    description,
    publishedAt: PUBLISHED_AT,
    updatedAt: UPDATED_AT,
    category,
    keywords,
    image: affiliateProducts[0]?.imageUrl,
    rankedItems: affiliateProducts.map((p) => ({ name: p.name })),
    faqs: faqs.map((f) => ({ question: f.q, answer: f.a })),
    articleBody: products.map((p) => `${p.name}: ${p.miniReview}`).join(" "),
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
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">{t("metaRange")}</span>
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
              <table className="w-full min-w-[1040px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-left">
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colFoto")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colModelo")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colEstructura")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colTamano")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colIdealPara")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colPrecioVisto")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colCta")}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.rank} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3">
                        <div className="h-14 w-14 overflow-hidden rounded-lg border border-border bg-background">
                          <img
                            src={product.imageUrl}
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
                      <td className="px-4 py-3 text-foreground">{product.structure}</td>
                      <td className="px-4 py-3 text-foreground">{product.size}</td>
                      <td className="px-4 py-3 text-foreground">{product.bestFor}</td>
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
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{t("compareTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("compareIntro")}
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {products.map((product) => (
                <div key={product.rank} className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">{t("topLabel", { rank: product.rank })}</p>
                  <h3 className="mt-1 font-display text-lg font-bold text-foreground">{product.name}</h3>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p><span className="font-semibold text-foreground">{t("labelEstructura")}</span> {product.structure}</p>
                    <p><span className="font-semibold text-foreground">{t("labelTamano")}</span> {product.size}</p>
                    <p><span className="font-semibold text-foreground">{t("labelMejorPara")}</span> {product.bestFor}</p>
                    <p><span className="font-semibold text-foreground">{t("labelPrecio")}</span> {product.priceSeen}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{t("topListTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("topListIntro")}
            </p>

            <div className="mt-6 space-y-6">
              {products.map((product) => (
                <section key={product.rank} className="rounded-2xl border border-border bg-card p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-accent">{t("topLabel", { rank: product.rank })}</p>
                      <h3 className="mt-1 font-display text-xl font-bold text-foreground md:text-2xl">{product.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{t("mejorParaPrefix")} {product.bestFor}</p>
                    </div>

                    <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-right text-sm">
                      <p className="font-semibold text-foreground">{product.priceSeen}</p>
                      <p className="text-xs text-muted-foreground">{t("precioVistoLabel")}</p>
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
                      <div className="grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">{t("statEstructura")}</p>
                          <p className="font-semibold text-foreground">{product.structure}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">{t("statTamano")}</p>
                          <p className="font-semibold text-foreground">{product.size}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">{t("statValoraciones")}</p>
                          <p className="font-semibold text-foreground">{product.rating}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">{t("statPrecioVisto")}</p>
                          <p className="font-semibold text-foreground">{product.priceSeen}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border border-border bg-background p-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("porQueDestaca")}</p>
                          <ul className="space-y-1.5 text-sm text-foreground">
                            {product.notes.map((note) => (
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
                            {product.pros.map((pro) => (
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
                            {product.cons.map((con) => (
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
                        <p className="mt-1 text-sm leading-relaxed text-foreground">{product.miniReview}</p>
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
                          href={`/buscar?q=${encodeURIComponent(`${product.brand} piscina desmontable`)}`}
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
            <h2 className="font-display text-2xl font-bold text-foreground">{t("buyingTitle")}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">{t("buying1Title")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t("buying1Body")}</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">{t("buying2Title")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t("buying2Body")}</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">{t("buying3Title")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t("buying3Body")}</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">{t("buying4Title")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t("buying4Body")}</p>
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
                      <Sparkles className="h-4 w-4 text-accent" />
                      {item.q}
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-accent/20 bg-gradient-to-br from-card via-card to-accent/10 p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">{t("recoTitle")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("recoBody")}
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <a href="https://amzn.to/4u4lMEf" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">{t("recoLinkSmallFrame")}</a>
              <a href="https://amzn.to/4cZY4TQ" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">{t("recoLinkMetalFrame")}</a>
              <a href="https://amzn.to/498sukr" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">{t("recoLinkPrismFrame")}</a>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">{t("keepBrowsingTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("keepBrowsingIntro")}</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link href="/categoria/jardin-y-exterior" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkJardin")}</Link>
              <Link href="/categoria/jardin-y-exterior/mobiliario-de-exterior" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkMobiliario")}</Link>
              <Link href="/categoria/jardin-y-exterior/mesas-de-exterior" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkMesas")}</Link>
              <Link href="/buscar?q=piscina%20desmontable" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkBuscarPiscinas")}</Link>
              <Link href="/buscar?q=intex" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkIntex")}</Link>
              <Link href="/buscar?q=bestway" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkBestway")}</Link>
              <Link href="/asistente" className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm font-semibold text-accent hover:bg-accent/20">{t("linkAsistente")}</Link>
            </div>

            <div className="mt-6 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              {t("suggestedIntro")}
              <ul className="mt-2 space-y-1 text-foreground">
                <li>{t("suggested1")}</li>
                <li>{t("suggested2")}</li>
                <li>{t("suggested3")}</li>
              </ul>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
