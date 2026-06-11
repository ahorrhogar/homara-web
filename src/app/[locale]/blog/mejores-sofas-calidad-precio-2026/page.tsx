import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, BadgeEuro, ChefHat, ExternalLink, Sparkles, Star, Zap } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBlogGuideSchemas } from "@/components/seo/blog-guide-schemas";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";
const PATH = "/blog/mejores-sofas-calidad-precio-2026";

const PUBLISHED_AT = "2026-03-18";
const UPDATED_AT = "2026-03-18";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guides.mejores-sofas-calidad-precio-2026");
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

type SofaProduct = {
  rank: number;
  name: string;
  brand: string;
  capacity: string;
  format: string;
  dimensions: string;
  rating: string;
  priceSeen: string;
  affiliateUrl: string;
  imageUrl: string;
};

const sofaProducts: SofaProduct[] = [
  {
    rank: 1,
    name: "Yaheetech Loveseat 2 plazas",
    brand: "Yaheetech",
    capacity: "2 plazas",
    format: "2 plazas compacto",
    dimensions: "Aprox. 145 x 77 x 77 cm",
    rating: "4,4/5 (157 valoraciones)",
    priceSeen: "128,74 EUR",
    affiliateUrl: "https://amzn.to/4dTBjC7",
    imageUrl: "https://m.media-amazon.com/images/I/61MNGyTX5FL._AC_SX425_.jpg",
  },
  {
    rank: 2,
    name: "SHIITO Versailles",
    brand: "SHIITO",
    capacity: "3 plazas",
    format: "3 plazas click-clack",
    dimensions: "Aprox. 189 x 88 x 89 cm",
    rating: "4,0/5 (179 valoraciones)",
    priceSeen: "170,99 EUR",
    affiliateUrl: "https://amzn.to/4crrybS",
    imageUrl: "https://m.media-amazon.com/images/I/41L0EF+7mmL._AC_SX425_.jpg",
  },
  {
    rank: 3,
    name: "Xbro 3 en 1 convertible",
    brand: "Xbro",
    capacity: "2-3 plazas",
    format: "Convertible 3 en 1",
    dimensions: "Aprox. 147 x 196 x 87 cm abierto",
    rating: "5,0/5 (1 valoracion)",
    priceSeen: "209,99 EUR",
    affiliateUrl: "https://amzn.to/4edkfqX",
    imageUrl: "https://m.media-amazon.com/images/I/81erPad-L8L._AC_SX425_.jpg",
  },
  {
    rank: 4,
    name: "Nalui Haven chaise bed",
    brand: "Nalui",
    capacity: "3 plazas",
    format: "Chaise longue convertible",
    dimensions: "Aprox. 203 x 82 x 78 cm",
    rating: "3,2/5 (46 valoraciones)",
    priceSeen: "549,00 EUR",
    affiliateUrl: "https://amzn.to/4sZTM3T",
    imageUrl: "https://m.media-amazon.com/images/I/51ss8eHW98L._AC_SX425_.jpg",
  },
  {
    rank: 5,
    name: "Litbird Cloud modular",
    brand: "Litbird",
    capacity: "3 plazas",
    format: "Modular cloud",
    dimensions: "Variable segun configuracion",
    rating: "Datos de rating no visibles en extracto",
    priceSeen: "Consultar en ficha",
    affiliateUrl: "https://amzn.to/4sBIMt3",
    imageUrl: "https://m.media-amazon.com/images/I/71cKS77+S+L._AC_SX425_.jpg",
  },
  {
    rank: 6,
    name: "Devoko Chaise longue con arcon",
    brand: "Devoko",
    capacity: "3 plazas",
    format: "L-shape con almacenaje",
    dimensions: "Aprox. 186 x 130 x 84 cm",
    rating: "Consultar valoraciones en ficha",
    priceSeen: "Consultar en ficha",
    affiliateUrl: "https://amzn.to/4myyuIG",
    imageUrl: "/placeholder.svg",
  },
  {
    rank: 7,
    name: "MUEBLIX.COM Juan 3 seater",
    brand: "MUEBLIX.COM",
    capacity: "3 plazas",
    format: "Sofa clasico",
    dimensions: "Aprox. 185-190 cm de largo",
    rating: "Consultar valoraciones en ficha",
    priceSeen: "Consultar en ficha",
    affiliateUrl: "https://amzn.to/4dOBTB0",
    imageUrl: "/placeholder.svg",
  },
  {
    rank: 8,
    name: "Welzona 211 cm 3 seater",
    brand: "Welzona",
    capacity: "3 plazas amplias",
    format: "3 plazas amplio",
    dimensions: "211 cm de largo",
    rating: "Consultar valoraciones en ficha",
    priceSeen: "Consultar en ficha",
    affiliateUrl: "https://amzn.to/4tdnkf2",
    imageUrl: "/placeholder.svg",
  },
  {
    rank: 9,
    name: "Don Rest Sofa cama click-clack",
    brand: "Don Rest",
    capacity: "3 plazas",
    format: "Sofa cama click-clack",
    dimensions: "Sofa 206 x 73 x 80 cm",
    rating: "Consultar valoraciones en ficha",
    priceSeen: "Consultar en ficha",
    affiliateUrl: "https://amzn.to/4vs7gaO",
    imageUrl: "/placeholder.svg",
  },
  {
    rank: 10,
    name: "SHIITO Kingston",
    brand: "SHIITO",
    capacity: "3 plazas",
    format: "3 plazas confort",
    dimensions: "185 x 100 x 95 cm",
    rating: "Consultar valoraciones en ficha",
    priceSeen: "Consultar en ficha",
    affiliateUrl: "https://amzn.to/4cyATi0",
    imageUrl: "/placeholder.svg",
  },
];

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guides.mejores-sofas-calidad-precio-2026");

  const title = t("title");
  const description = t("description");
  const category = t("category");
  const keywords = t.raw("keywords") as string[];

  const bestFor = t.raw("bestFor") as string[];
  const notes = t.raw("notes") as string[][];
  const prosList = t.raw("pros") as string[][];
  const consList = t.raw("cons") as string[][];
  const miniReviews = t.raw("miniReview") as string[];
  const faqs = t.raw("faq") as Array<{ q: string; a: string }>;
  const suggested = t.raw("suggested") as string[];

  const products = sofaProducts.map((p, i) => ({
    ...p,
    bestFor: bestFor[i],
    notes: notes[i],
    pros: prosList[i],
    cons: consList[i],
    miniReview: miniReviews[i],
  }));

  const { article, breadcrumb, faqPage, itemList } = buildBlogGuideSchemas({
    path: PATH,
    title,
    description,
    publishedAt: PUBLISHED_AT,
    updatedAt: UPDATED_AT,
    category,
    keywords,
    image: products[0]?.imageUrl,
    rankedItems: products.map((p) => ({ name: p.name })),
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
          <Breadcrumb items={[{ label: "Blog", href: "/blog" }, { label: t("breadcrumbLabel") }]} />
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
              <table className="w-full min-w-[1040px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-left">
                    <th className="px-4 py-3 font-semibold text-foreground">{t("thFoto")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("thModelo")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("thCapacidad")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("thFormato")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("thDimensiones")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("thRating")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("thPrecioVisto")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("thCta")}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
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
                      <td className="px-4 py-3 text-foreground">{product.capacity}</td>
                      <td className="px-4 py-3 text-foreground">{product.format}</td>
                      <td className="px-4 py-3 text-foreground">{product.dimensions}</td>
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
                          {t("ctaVerAmazon")} <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{t("rankingTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("rankingIntro")}</p>

            <div className="mt-6 space-y-6">
              {products.map((product) => (
                <section key={product.rank} className="rounded-2xl border border-border bg-card p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-accent">{t("topLabel")} {product.rank}</p>
                      <h3 className="mt-1 font-display text-xl font-bold text-foreground md:text-2xl">{product.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{t("bestForLabel")} {product.bestFor}</p>
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
                          <p className="text-xs text-muted-foreground">{t("thCapacidad")}</p>
                          <p className="font-semibold text-foreground">{product.capacity}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">{t("thFormato")}</p>
                          <p className="font-semibold text-foreground">{product.format}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">{t("thDimensiones")}</p>
                          <p className="font-semibold text-foreground">{product.dimensions}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">{t("thRating")}</p>
                          <p className="font-semibold text-foreground">{product.rating}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border border-border bg-background p-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("porQueDestacaLabel")}</p>
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
                          href={`/buscar?q=${encodeURIComponent(`${product.brand} sofa`)}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
                        >
                          {t("compareAlternativas")} <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">{t("considerTitle")}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">{t("consider1Title")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t("consider1Body")}</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">{t("consider2Title")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t("consider2Body")}</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">{t("consider3Title")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t("consider3Body")}</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">{t("consider4Title")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t("consider4Body")}</p>
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
              <a href="https://amzn.to/4dTBjC7" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">Yaheetech Loveseat 2 plazas</a>
              <a href="https://amzn.to/4crrybS" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">SHIITO Versailles</a>
              <a href="https://amzn.to/4edkfqX" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">Xbro 3 en 1 convertible</a>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">{t("keepBrowsingTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("keepBrowsingIntro")}</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link href="/buscar?q=sofa" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkBuscarSofa")}</Link>
              <Link href="/buscar?q=sofa%20chaise%20longue" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkChaise")}</Link>
              <Link href="/buscar?q=sofa%20cama" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkSofaCama")}</Link>
              <Link href="/buscar?q=sofa%203%20plazas" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkSofa3")}</Link>
              <Link href="/blog" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkMasGuias")}</Link>
              <Link href="/asistente" className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm font-semibold text-accent hover:bg-accent/20">{t("linkAsistente")}</Link>
            </div>

            <div className="mt-6 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              {t("suggestedIntro")}
              <ul className="mt-2 space-y-1 text-foreground">
                {suggested.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
