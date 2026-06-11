import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, BadgeEuro, ChefHat, ExternalLink, Sparkles, Star, Zap } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBlogGuideSchemas } from "@/components/seo/blog-guide-schemas";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";
const PATH = "/blog/mejores-freidoras-aire-amazon-2026-menos-100-euros";
const PUBLISHED_AT = "2026-04-12";
const UPDATED_AT = "2026-04-12";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guides.mejores-freidoras-aire-amazon-2026-menos-100-euros");
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

type AffiliateProduct = {
  rank: number;
  name: string;
  brand: string;
  capacity: string;
  power: string;
  temperature: string;
  programs: string;
  rating: string;
  priceSeen: string;
  affiliateUrl: string;
  imageUrl: string;
};

const affiliateProducts: AffiliateProduct[] = [
  {
    rank: 1,
    name: "Cecofry Fantastik Window 4000",
    brand: "Cecotec",
    capacity: "4 L",
    power: "1400 W",
    temperature: "80-200 °C",
    programs: "9 menús",
    rating: "4,4/5 (1322 valoraciones)",
    priceSeen: "39,90 EUR",
    affiliateUrl: "https://amzn.to/4ezmAMG",
    imageUrl: "https://m.media-amazon.com/images/I/51SmikZCEcL._AC_SX425_.jpg",
  },
  {
    rank: 2,
    name: "Cecofry Supreme 8000",
    brand: "Cecotec",
    capacity: "8 L",
    power: "1800 W",
    temperature: "30-200 °C",
    programs: "10 menús",
    rating: "4,5/5 (1613 valoraciones)",
    priceSeen: "59,90 EUR",
    affiliateUrl: "https://amzn.to/4tjXWVa",
    imageUrl: "https://m.media-amazon.com/images/I/5177g+9MCDL._AC_SX425_.jpg",
  },
  {
    rank: 3,
    name: "Cecofry Full InoxBlack 5500 Pro",
    brand: "Cecotec",
    capacity: "5,5 L",
    power: "1700 W",
    temperature: "80-200 °C",
    programs: "8 modos",
    rating: "4,4/5 (4736 valoraciones)",
    priceSeen: "43,90 EUR",
    affiliateUrl: "https://amzn.to/4mCSWbE",
    imageUrl: "https://m.media-amazon.com/images/I/519AN1zQmbL._AC_SX425_.jpg",
  },
  {
    rank: 4,
    name: "COSORI Air Fryer Real Metallic Interior 5.7L",
    brand: "COSORI",
    capacity: "5,7 L",
    power: "1700 W",
    temperature: "No visible de forma explícita en extracto",
    programs: "Programas automáticos (incluye presets visibles en ficha)",
    rating: "4,7/5 (103765 valoraciones)",
    priceSeen: "99,99 EUR",
    affiliateUrl: "https://amzn.to/4cv0gBv",
    imageUrl: "https://m.media-amazon.com/images/I/81HDt6NDs7L._AC_SX425_.jpg",
  },
  {
    rank: 5,
    name: "Cecofry&Grill Duoheat 6500 Plus",
    brand: "Cecotec",
    capacity: "6,5 L",
    power: "2200 W",
    temperature: "40-200 °C",
    programs: "12 menús",
    rating: "4,3/5 (591 valoraciones)",
    priceSeen: "57,90 EUR",
    affiliateUrl: "https://amzn.to/4dPJC1G",
    imageUrl: "https://m.media-amazon.com/images/I/71qEef7KxUL._AC_SX425_.jpg",
  },
];

export default async function AirFryersUnder100GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guides.mejores-freidoras-aire-amazon-2026-menos-100-euros");

  const title = t("title");
  const description = t("description");
  const category = t("category");
  const keywords = t.raw("keywords") as string[];

  const bestFor = t.raw("bestFor") as string[];
  const notes = t.raw("notes") as string[][];
  const prosByProduct = t.raw("pros") as string[][];
  const consByProduct = t.raw("cons") as string[][];
  const miniReviews = t.raw("miniReviews") as string[];
  const faqs = t.raw("faq") as Array<{ q: string; a: string }>;

  const products = affiliateProducts.map((product, index) => ({
    ...product,
    bestFor: bestFor[index],
    notes: notes[index],
    pros: prosByProduct[index],
    cons: consByProduct[index],
    miniReview: miniReviews[index],
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
    articleBody: products
      .map((p) => `${p.name}: ${p.miniReview} ${p.notes.join(". ")}`)
      .join(" "),
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

        <article>
          <header className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-accent/15 via-secondary/50 to-card p-6 md:p-10">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/20 blur-2xl" aria-hidden />
            <div className="absolute -left-12 bottom-0 h-24 w-24 rounded-full bg-primary/15 blur-xl" aria-hidden />
            <div className="relative max-w-4xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                <Sparkles className="h-3.5 w-3.5" /> {t("badge")}
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
                    <th className="px-4 py-3 font-semibold text-foreground">{t("thFoto")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("thModelo")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("thCapacidad")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("thPotencia")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("thTemperatura")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("thProgramas")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("thPrecioVisto")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("thCta")}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.rank} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3">
                        <div className="h-14 w-14 overflow-hidden rounded-lg border border-border bg-background">
                          <img src={product.imageUrl} alt={product.name} loading="lazy" className="h-full w-full object-contain p-1" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                      </td>
                      <td className="px-4 py-3 text-foreground">{product.capacity}</td>
                      <td className="px-4 py-3 text-foreground">{product.power}</td>
                      <td className="px-4 py-3 text-foreground">{product.temperature}</td>
                      <td className="px-4 py-3 text-foreground">{product.programs}</td>
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
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{t("rankingTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("rankingIntro")}</p>

            <div className="mt-6 space-y-6">
              {products.map((product) => (
                <section key={product.rank} className="rounded-2xl border border-border bg-card p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-accent">{t("topLabel", { rank: product.rank })}</p>
                      <h3 className="mt-1 font-display text-xl font-bold text-foreground md:text-2xl">{product.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{t("bestForLabel")} {product.bestFor}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-right text-sm">
                      <p className="font-semibold text-foreground">{product.priceSeen}</p>
                      <p className="text-xs text-muted-foreground">{t("precioVistoLabel")}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-5 lg:grid-cols-[220px_1fr]">
                    <a href={product.affiliateUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className="group block overflow-hidden rounded-xl border border-border bg-background">
                      <img src={product.imageUrl} alt={product.name} loading="lazy" className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]" />
                    </a>

                    <div>
                      <div className="grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
                        <SpecCell label={t("specCapacidad")} value={product.capacity} />
                        <SpecCell label={t("specPotencia")} value={product.power} />
                        <SpecCell label={t("specTemperatura")} value={product.temperature} />
                        <SpecCell label={t("specProgramas")} value={product.programs} />
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <BulletList title={t("porQueDestaca")} items={product.notes} icon={<Star className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-accent" />} />
                        <BulletList title={t("prosTitle")} items={product.pros} icon={<Zap className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-deal" />} />
                        <BulletList title={t("consTitle")} items={product.cons} icon={<span className="mt-[8px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground" />} />
                      </div>

                      <div className="mt-4 rounded-lg border border-accent/30 bg-accent/5 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-accent">{t("miniReviewLabel")}</p>
                        <p className="mt-1 text-sm leading-relaxed text-foreground">{product.miniReview}</p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <a href={product.affiliateUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90">
                          {t("ctaVerOferta")} <ExternalLink className="h-4 w-4" />
                        </a>
                        <Link
                          href={`/buscar?q=${encodeURIComponent(`${product.brand} freidora aire`)}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
                        >
                          {t("ctaComparar")} <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">{t("buyingGuideTitle")}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Tip title={t("tip1Title")} body={t("tip1Body")} />
              <Tip title={t("tip2Title")} body={t("tip2Body")} />
              <Tip title={t("tip3Title")} body={t("tip3Body")} />
              <Tip title={t("tip4Title")} body={t("tip4Body")} />
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
            <h2 className="font-display text-2xl font-bold text-foreground">{t("recommendTitle")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("recommendBody")}
            </p>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">{t("keepBrowsingTitle")}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link href="/categoria/cocina" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkCocina")}</Link>
              <Link href="/categoria/electrodomesticos" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkElectro")}</Link>
              <Link href="/buscar?q=freidora%20aire" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkBuscar")}</Link>
              <Link href="/blog/review-cosori-5-7l-freidora-aire-calidad-precio-menos-100-euros" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkReview")}</Link>
              <Link href="/asistente" className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm font-semibold text-accent hover:bg-accent/20">{t("linkAsistente")}</Link>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}

function SpecCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">{value}</p>
    </div>
  );
}

function BulletList({ title, items, icon }: { title: string; items: string[]; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="space-y-1.5 text-sm text-foreground">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            {icon}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Tip({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg bg-secondary/40 p-4">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
