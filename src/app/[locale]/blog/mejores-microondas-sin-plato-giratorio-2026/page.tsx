import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, BadgeEuro, ChefHat, ExternalLink, Microwave, Scale, Sparkles, Star } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBlogGuideSchemas } from "@/components/seo/blog-guide-schemas";
import { buildAlternates, toOpenGraphLocale } from "@/i18n/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";
const PATH = "/blog/mejores-microondas-sin-plato-giratorio-2026";

const PUBLISHED_AT = "2026-02-20";
const UPDATED_AT = "2026-02-20";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guides.mejores-microondas-sin-plato-giratorio-2026");
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

type MicrowaveProduct = {
  rank: number;
  name: string;
  brand: string;
  priceSeen: string;
  rating: string;
  capacity: string;
  power: string;
  affiliateUrl: string;
  imageUrl: string;
};

const products: MicrowaveProduct[] = [
  {
    rank: 1,
    name: "Severin MW 7770",
    brand: "Severin",
    priceSeen: "87,43 EUR",
    rating: "4,3/5 (2.000+ valoraciones)",
    capacity: "20 L",
    power: "800 W",
    affiliateUrl: "https://www.amazon.es/dp/B0B756WF4X?tag=ahorrhogar-21&linkCode=ll2&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/61H0pyEDpZL._AC_SL1000_.jpg",
  },
  {
    rank: 2,
    name: "Cecotec ProClean 4010 Flatbed",
    brand: "Cecotec",
    priceSeen: "63,90 EUR",
    rating: "4,1/5 (1.000+ valoraciones)",
    capacity: "20 L",
    power: "700 W",
    affiliateUrl: "https://www.amazon.es/dp/B0DLLH4GCW?tag=ahorrhogar-21&linkCode=ll2&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/61oUsEjtgAL._AC_SL1500_.jpg",
  },
  {
    rank: 3,
    name: "CASO MG20 Ecostyle Ceramic",
    brand: "CASO",
    priceSeen: "137,58 EUR",
    rating: "4,2/5 (700+ valoraciones)",
    capacity: "20 L",
    power: "800 W",
    affiliateUrl: "https://www.amazon.es/dp/B07KLT25G3?tag=ahorrhogar-21&linkCode=ll2&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/71LBVgSD58L._AC_SL1500_.jpg",
  },
  {
    rank: 4,
    name: "Toshiba MW2-AG23PF(BK)",
    brand: "Toshiba",
    priceSeen: "154,69 EUR",
    rating: "4,3/5 (500+ valoraciones)",
    capacity: "23 L",
    power: "900 W",
    affiliateUrl: "https://www.amazon.es/dp/B08CCF68C7?tag=ahorrhogar-21&linkCode=ll2&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/81gnnuwFv6L._AC_SL1500_.jpg",
  },
  {
    rank: 5,
    name: "Samsung MG23T5018CG/EC",
    brand: "Samsung",
    priceSeen: "135,15 EUR",
    rating: "4,5/5 (1.000+ valoraciones)",
    capacity: "23 L",
    power: "800 W",
    affiliateUrl: "https://www.amazon.es/dp/B08986KR5J?tag=ahorrhogar-21&linkCode=ll2&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/51HIR2oKxuL._AC_QL10_SX980_SY55_FMwebp_.jpg",
  },
  {
    rank: 6,
    name: "CASO MCG 30 Ceramic Chef",
    brand: "CASO",
    priceSeen: "211,90 EUR",
    rating: "4,2/5 (300+ valoraciones)",
    capacity: "30 L",
    power: "900 W",
    affiliateUrl: "https://www.amazon.es/dp/B01N63P2JK?tag=ahorrhogar-21&linkCode=ll2&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/61kcyMe3ecL._AC_SL1500_.jpg",
  },
  {
    rank: 7,
    name: "Cecotec ProClean 5110 Inox",
    brand: "Cecotec",
    priceSeen: "69,90 EUR",
    rating: "4,0/5 (2.000+ valoraciones)",
    capacity: "20 L",
    power: "800 W",
    affiliateUrl: "https://www.amazon.es/dp/B07HC8YWFX?tag=ahorrhogar-21&linkCode=ll2&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/61Oo+QqzBiL._AC_SL1500_.jpg",
  },
  {
    rank: 8,
    name: "Orbegozo MIG 2525",
    brand: "Orbegozo",
    priceSeen: "153,76 EUR",
    rating: "4,1/5 (1.500+ valoraciones)",
    capacity: "25 L",
    power: "900 W",
    affiliateUrl: "https://www.amazon.es/dp/B005G7L3PS?tag=ahorrhogar-21&linkCode=ll2&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/61rtdXWxjoL._AC_SL1417_.jpg",
  },
];

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guides.mejores-microondas-sin-plato-giratorio-2026");

  const title = t("title");
  const description = t("description");
  const category = t("category");
  const keywords = t.raw("keywords") as string[];

  const miniReviews = t.raw("miniReviews") as string[];
  const keyFeatures = t.raw("keyFeatures") as string[][];
  const prosList = t.raw("pros") as string[][];
  const consList = t.raw("cons") as string[][];
  const verdicts = t.raw("verdicts") as string[];

  const faqs = t.raw("faq") as Array<{ q: string; a: string }>;

  const { article, breadcrumb, faqPage, itemList } = buildBlogGuideSchemas({
    path: PATH,
    locale,
    title,
    description,
    publishedAt: PUBLISHED_AT,
    updatedAt: UPDATED_AT,
    category,
    keywords,
    image: products[0]?.imageUrl,
    rankedItems: products.map((p) => ({ name: p.name })),
    faqs: faqs.map((f) => ({ question: f.q, answer: f.a })),
    articleBody: products.map((p, i) => `${p.name}: ${miniReviews[i]}`).join(" "),
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
            <p className="mt-2 text-sm text-muted-foreground">
              {t("summaryIntro")}
            </p>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[1080px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-left">
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colFoto")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colModelo")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colCapacidad")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colPotencia")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colValoracion")}</th>
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
                      <td className="px-4 py-3 text-foreground">{product.capacity}</td>
                      <td className="px-4 py-3 text-foreground">{product.power}</td>
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
                          {t("ctaTable")} <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{t("quickTitle")}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {products.map((product, index) => (
                <div key={`quick-${product.rank}`} className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">{t("topLabel", { rank: product.rank })}</p>
                  <h3 className="mt-1 text-base font-semibold text-foreground">{product.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{miniReviews[index]}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <p className="rounded-md bg-secondary px-2 py-1 text-foreground">{t("precioLabel", { price: product.priceSeen })}</p>
                    <p className="rounded-md bg-secondary px-2 py-1 text-foreground">{product.rating}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12 space-y-10">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{t("analysisTitle")}</h2>

            {products.map((product, index) => (
              <article key={product.rank} className="rounded-3xl border border-border bg-card p-5 md:p-7">
                <div className="grid gap-6 md:grid-cols-[220px_1fr]">
                  <div className="rounded-2xl border border-border bg-background p-3">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                      className="h-48 w-full object-contain"
                    />
                  </div>

                  <div>
                    <p className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                      <Star className="h-3.5 w-3.5" /> {t("topLabel", { rank: product.rank })}
                    </p>

                    <h3 className="mt-3 font-display text-2xl font-bold text-foreground">{product.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{miniReviews[index]}</p>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-foreground">{t("marcaLabel", { brand: product.brand })}</p>
                      <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-foreground">{product.rating}</p>
                      <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-foreground">{product.capacity}</p>
                      <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-foreground">{product.power}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-border bg-background p-4">
                    <h4 className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      <ChefHat className="h-4 w-4 text-accent" /> {t("keyFeaturesTitle")}
                    </h4>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                      {keyFeatures[index].map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-xl border border-border bg-background p-4">
                      <h4 className="text-sm font-semibold text-foreground">{t("prosTitle")}</h4>
                      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                        {prosList[index].map((pro) => (
                          <li key={pro}>{pro}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl border border-border bg-background p-4">
                      <h4 className="text-sm font-semibold text-foreground">{t("consTitle")}</h4>
                      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                        {consList[index].map((con) => (
                          <li key={con}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-accent/35 bg-accent/10 p-4">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{t("verdictLabel")}</span> {verdicts[index]}
                  </p>
                  <a
                    href={product.affiliateUrl}
                    target="_blank"
                    rel="sponsored nofollow noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-accent/50 bg-background px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/15"
                  >
                    {t("ctaCard")} <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </article>
            ))}
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{t("buyTitle")}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">{t("buy1Title")}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("buy1Body")}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">{t("buy2Title")}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("buy2Body")}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">{t("buy3Title")}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("buy3Body")}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">{t("buy4Title")}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("buy4Body")}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{t("faqTitle")}</h2>
            <div className="mt-4 space-y-3">
              {faqs.map((item) => (
                <div key={item.q} className="rounded-xl border border-border bg-background p-4">
                  <h3 className="text-sm font-semibold text-foreground">{item.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{t("internalTitle")}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link
                href="/categoria/electrodomesticos"
                className="group rounded-xl border border-border bg-background p-4 hover:border-accent/40"
              >
                <p className="text-sm font-semibold text-foreground">{t("internal1Title")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("internal1Body")}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  {t("internal1Cta")} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              <Link
                href="/categoria/cocina"
                className="group rounded-xl border border-border bg-background p-4 hover:border-accent/40"
              >
                <p className="text-sm font-semibold text-foreground">{t("internal2Title")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("internal2Body")}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  {t("internal2Cta")} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              <Link
                href="/blog"
                className="group rounded-xl border border-border bg-background p-4 hover:border-accent/40"
              >
                <p className="text-sm font-semibold text-foreground">{t("internal3Title")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("internal3Body")}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  {t("internal3Cta")} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              <Link
                href="/asistente"
                className="group rounded-xl border border-border bg-background p-4 hover:border-accent/40"
              >
                <p className="text-sm font-semibold text-foreground">{t("internal4Title")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("internal4Body")}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  {t("internal4Cta")} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-accent/35 bg-accent/10 p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{t("conclusionTitle")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground md:text-base">
              {t("conclusionP1")}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground md:text-base">
              {t("conclusionP2")}
            </p>
          </section>

          <section className="mt-10 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{t("nextStepTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("nextStepBody")}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-lg border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/20"
              >
                {t("nextStepBlog")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/buscar"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary"
              >
                {t("nextStepBuscar")} <Scale className="h-4 w-4" />
              </Link>
              <Link
                href="/categoria/electrodomesticos"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary"
              >
                {t("nextStepElectro")} <Microwave className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
