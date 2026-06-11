import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, BadgeEuro, ExternalLink, Leaf, Search, Snowflake, Star } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBlogGuideSchemas } from "@/components/seo/blog-guide-schemas";
import { buildAlternates, toOpenGraphLocale } from "@/i18n/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";
const PATH = "/blog/mejores-frigorificos-combi-bajo-consumo-2026";

const PUBLISHED_AT = "2026-02-20";
const UPDATED_AT = "2026-02-20";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guides.mejores-frigorificos-combi-bajo-consumo-2026");
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

type FridgeModel = {
  rank: number;
  name: string;
  brand: string;
  priceSeen: string;
  rating: string;
  energyClass: string;
  capacity: string;
  size: string;
  affiliateUrl: string;
  imageUrl: string;
};

const products: FridgeModel[] = [
  {
    rank: 1,
    name: "Whirlpool WHK 26404 XP5E",
    brand: "Whirlpool",
    priceSeen: "599,00 EUR",
    rating: "4,1/5 (18 valoraciones)",
    energyClass: "A",
    capacity: "355 L",
    size: "203,5 x 59,5 x 66,3 cm",
    affiliateUrl:
      "https://www.amazon.es/Whirlpool-Frigor%C3%ADfico-libre-instalaci%C3%B3n-26404/dp/B0DXFMCB2G?__mk_es_ES=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2DP1U8GWHLUWF&dib=eyJ2IjoiMSJ9.8GqEeGgiMch4RrhcZi3h0ktV5EwJbjpYH03WGLKxyMLWYKj_LC44WwxHa-lDxe7UXCdLmnYRQ_X8-TgL9mWpxffW0vdSDvIM4Zuss8BBueZA0WpsU6oJhLKAfGFJ56VoTArRueDIVM8rajCZ_LQgQXT4Q0ZCsKrYHNW6iMfT20jr51HdvFkXyOzizahT7K0k-tLbJihEFJ8gxPVqjJieEU3VI9tovec6UPMBZulyCRUePzYtFUHexxr3k4OmuHV_7d2fng6vGJybMKbdYQUWVdzMvQXiFnzbhbtGc2ZXUu0.ZeskJvCAoCmC4Z3w_zIBpkxnxGchB4oU3Uf-GiYxClo&dib_tag=se&keywords=frigorifico+combi+bajo+consumo&qid=1776613215&sprefix=frigorifico+combi+bajo+consumo%2Caps%2C198&sr=8-18-spons&ufe=app_do%3Aamzn1.fos.6c35d95a-ceb8-4cab-b2da-8669f70f4878&aref=IsUzp1cUt9&sp_csd=d2lkZ2V0TmFtZT1zcF9tdGY&psc=1&linkCode=ll2&tag=ahorrhogar-21&linkId=d355e46b42dfb18ac7b971db547c0ed6&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/51ntIU8zQGL._AC_SX522_.jpg",
  },
  {
    rank: 2,
    name: "Hisense RB440N4CCB",
    brand: "Hisense",
    priceSeen: "619,00 EUR",
    rating: "4,3/5 (220 valoraciones)",
    energyClass: "B",
    capacity: "336 L",
    size: "202 x 59,5 x 57,9 cm",
    affiliateUrl:
      "https://www.amazon.es/Hisense-RB440N4CCB-Frigor%C3%ADfico-Congelamiento-Reversible/dp/B0CW35LJL6?__mk_es_ES=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2DP1U8GWHLUWF&dib=eyJ2IjoiMSJ9.8GqEeGgiMch4RrhcZi3h0ktV5EwJbjpYH03WGLKxyMLWYKj_LC44WwxHa-lDxe7UXCdLmnYRQ_X8-TgL9mWpxffW0vdSDvIM4Zuss8BBueZA0WpsU6oJhLKAfGFJ56VoTArRueDIVM8rajCZ_LQgQXT4Q0ZCsKrYHNW6iMfT20jr51HdvFkXyOzizahT7K0k-tLbJihEFJ8gxPVqjJieEU3VI9tovec6UPMBZulyCRUePzYtFUHexxr3k4OmuHV_7d2fng6vGJybMKbdYQUWVdzMvQXiFnzbhbtGc2ZXUu0.ZeskJvCAoCmC4Z3w_zIBpkxnxGchB4oU3Uf-GiYxClo&dib_tag=se&keywords=frigorifico%2Bcombi%2Bbajo%2Bconsumo&qid=1776613215&sprefix=frigorifico%2Bcombi%2Bbajo%2Bconsumo%2Caps%2C198&sr=8-44&ufe=app_do%3Aamzn1.fos.6c35d95a-ceb8-4cab-b2da-8669f70f4878&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=cc0526e19f21924766e495ea6b3fb728&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/61vKSabOZJL._AC_SX522_.jpg",
  },
  {
    rank: 3,
    name: "Haier 2D 60 Series 5 Pro HDPW5620ANPK",
    brand: "Haier",
    priceSeen: "759,00 EUR",
    rating: "4,2/5 (149 valoraciones)",
    energyClass: "A",
    capacity: "409 L",
    size: "205 x 59,5 x 66,7 cm",
    affiliateUrl:
      "https://www.amazon.es/Haier-HDPW5620ANPK-Frigor%C3%ADfico-Botellero-Inteligentes/dp/B0F66PXHXY?__mk_es_ES=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2DP1U8GWHLUWF&dib=eyJ2IjoiMSJ9.F3MijT8ARSUcKMWk-6V8NyaugpDVYCgRrAMrKsRZmlTAyc7hfB7vPmYDGwLM4nJ1qOg88YT4Seh-zxWgZvqIN3fklHJlEQImpjh_9Nn_Kc4.R2M6Wb0jR1xsiRjGwL_FO_SUWnQwbSFjc1eWVtq6T0M&dib_tag=se&keywords=frigorifico%2Bcombi%2Bbajo%2Bconsumo&qid=1776613334&sprefix=frigorifico%2Bcombi%2Bbajo%2Bconsumo%2Caps%2C198&sr=8-49-spons&ufe=app_do%3Aamzn1.fos.6c35d95a-ceb8-4cab-b2da-8669f70f4878&xpid=k6yzZ0F0ljfkj&aref=kOlQGLhD94&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGZfbmV4dA&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=91fa8d37805d7d0c4fc6d49c1c2bdb35&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/51TO56qLqzL._AC_SY550_.jpg",
  },
  {
    rank: 4,
    name: "Samsung Bespoke AI RB38C607AS9/EF",
    brand: "Samsung",
    priceSeen: "899,00 EUR",
    rating: "3,9/5 (20 valoraciones)",
    energyClass: "A",
    capacity: "387 L",
    size: "203 x 59,5 x 65,8 cm",
    affiliateUrl:
      "https://www.amazon.es/Samsung-Frigor%C3%ADfico-Bespoke-Cooling-RB38C607AS9/dp/B0C668JDL5?__mk_es_ES=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2DXS9WL0C3JXR&dib=eyJ2IjoiMSJ9.8FcUT1mxjy-JZS3SZzN7KMs_DjDWR-fqHTjlmnAPmeNBVKMbMCeZQOWbQmGXoCSfZcgSIrQ4JGvfP3rrYVD6SFBrdPlLEoJj4meXMAEik2qRKg8BLkTvKBUJ1q-hh-Awgzrig0OEsbOvza9SsehKa5C2XRrldzJxdGufdcTj_GnSNZuGrQlRsMDvleDYd559JzOD3aUgWfnNCoSa_joVGtaNECa0atzEEAsnlj0XNvKSYtlSqf95B_M8SnrMtvNUPs2fQ46fT19N5ua_eGbGVhEv6UkxMmmMpFPcGFxQOcQ.KKvdM5Z5iSlDfHk32Zs7bshQJ6zN70KC8640ZCh-TW0&dib_tag=se&keywords=frigorifico+combi+clase+a&qid=1776613465&sprefix=frigorifico+combi+clase+a+%2Caps%2C126&sr=8-10&ufe=app_do%3Aamzn1.fos.4c3f56c3-e485-4a35-9abc-6532b61c3b62&linkCode=ll2&tag=ahorrhogar-21&linkId=c4093e3d4f4fd64177f7ad287f24eda5&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/41+l9M-Oo7L._AC_SX522_.jpg",
  },
  {
    rank: 5,
    name: "Siemens KG39NAIAT",
    brand: "Siemens",
    priceSeen: "1.759,00 EUR",
    rating: "4,5/5 (263 valoraciones)",
    energyClass: "A",
    capacity: "363 L",
    size: "203 x 60 x 66,5 cm",
    affiliateUrl:
      "https://www.amazon.es/Siemens-Frigor%C3%ADfico-instalaci%C3%B3n-hyperFresh-Antihuellas/dp/B0BC963P5C?crid=2LE9K0DJK82UB&dib=eyJ2IjoiMSJ9.pRo_1w6llNEvjgX2FAxYDJlVTgk1RuN-OvMFgmW4LMEkK7HdwXnnuyO2pM0T3gjHVjuriW5-N5LLzlYUAECEuzgpKXj7UoTGaKez9YMGfUQk1rBwCzCt-iq9cPuKjYIc11FplFTkFaN0r6dS8HWk-md-QnAToFsuwQ75KZ0QQhqRUZCUE0O85B7q2CyOa5g6NjGbV92113XlEWlGUT8dcWI9oZrNJDet4Cpvj231y0jf8m39-M5CJI0M4fQ2fzN65PQDAveNgubTxYxAaohK8w9v6gdPPA5ltdJGoGJXzQk.HjAnhDtk-8c4KPqLCHcFUgmi4lVsYf9zbQisKlRVEiU&dib_tag=se&keywords=frigorifico+combi+clase+a%2B%2B&qid=1776613394&sprefix=frigorifico+combi+clase+%2Caps%2C260&sr=8-47&ufe=app_do%3Aamzn1.fos.4c3f56c3-e485-4a35-9abc-6532b61c3b62&linkCode=ll2&tag=ahorrhogar-21&linkId=81cf1deec9ba3c720bf254989382dd2e&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/61x6BM197OL._AC_SY879_.jpg",
  },
];

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guides.mejores-frigorificos-combi-bajo-consumo-2026");

  const title = t("title");
  const description = t("description");
  const category = t("category");
  const keywords = t.raw("keywords") as string[];
  const faqs = t.raw("faq") as Array<{ q: string; a: string }>;

  const strongPoints = t.raw("productStrongPoints") as string[];
  const idealFors = t.raw("productIdealFor") as string[];
  const miniReviews = t.raw("productMiniReviews") as string[];
  const keyFeaturesList = t.raw("productKeyFeatures") as string[][];
  const prosList = t.raw("productPros") as string[][];
  const consList = t.raw("productCons") as string[][];
  const verdicts = t.raw("productVerdicts") as string[];

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
          <Breadcrumb items={[{ label: "Blog", href: "/blog" }, { label: t("breadcrumbLabel") }]} />
        </div>

        <article className="pb-16">
          <header className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-accent/15 via-secondary/50 to-card p-6 md:p-10">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/20 blur-2xl" aria-hidden="true" />
            <div className="absolute -left-12 bottom-0 h-24 w-24 rounded-full bg-primary/15 blur-xl" aria-hidden="true" />

            <div className="relative max-w-4xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                <Leaf className="h-3.5 w-3.5" />
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
              <table className="w-full min-w-[1160px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-left">
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colFoto")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colModelo")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colPuntoFuerte")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colIdealPara")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colClase")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colCapacidad")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colPrecioVisto")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colCta")}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
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
                      <td className="px-4 py-3 text-foreground">{strongPoints[index]}</td>
                      <td className="px-4 py-3 text-foreground">{idealFors[index]}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-accent/10 px-2 py-1 text-xs font-semibold text-accent">
                          {product.energyClass}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground">{product.capacity}</td>
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

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{t("quickCompareTitle")}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {products.map((product, index) => (
                <div key={`quick-${product.rank}`} className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">{t("topLabel", { rank: product.rank })}</p>
                  <h3 className="mt-1 text-base font-semibold text-foreground">{product.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{miniReviews[index]}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <p className="rounded-md bg-secondary px-2 py-1 text-foreground">{t("precioLabel")}: {product.priceSeen}</p>
                    <p className="rounded-md bg-secondary px-2 py-1 text-foreground">{product.rating}</p>
                    <p className="rounded-md bg-secondary px-2 py-1 text-foreground">{t("claseLabel")}: {product.energyClass}</p>
                    <p className="rounded-md bg-secondary px-2 py-1 text-foreground">{t("capacidadLabel")}: {product.capacity}</p>
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
                      <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-foreground">{t("marcaLabel")}: {product.brand}</p>
                      <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-foreground">{product.rating}</p>
                      <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-foreground">{t("precioLabel")}: {product.priceSeen}</p>
                      <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-foreground">{t("tamanoLabel")}: {product.size}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-border bg-background p-4">
                    <h4 className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Snowflake className="h-4 w-4 text-accent" /> {t("keyFeaturesTitle")}
                    </h4>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                      {keyFeaturesList[index].map((feature) => (
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
                    <span className="font-semibold">{t("paraQuienLabel")}</span> {idealFors[index]}
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    <span className="font-semibold">{t("veredictoLabel")}</span> {verdicts[index]}
                  </p>
                  <a
                    href={product.affiliateUrl}
                    target="_blank"
                    rel="sponsored nofollow noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-accent/50 bg-background px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/15"
                  >
                    {t("ctaVerOfertaEnAmazon")} <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </article>
            ))}
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{t("beforeBuyTitle")}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">{t("beforeBuy1Title")}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("beforeBuy1Body")}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">{t("beforeBuy2Title")}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("beforeBuy2Body")}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">{t("beforeBuy3Title")}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("beforeBuy3Body")}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">{t("beforeBuy4Title")}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("beforeBuy4Body")}
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
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{t("internalRecsTitle")}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link
                href="/blog"
                className="group rounded-xl border border-border bg-background p-4 hover:border-accent/40"
              >
                <p className="text-sm font-semibold text-foreground">{t("rec1Title")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("rec1Body")}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  {t("rec1Cta")} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              <Link
                href="/categoria/electrodomesticos-y-cocina"
                className="group rounded-xl border border-border bg-background p-4 hover:border-accent/40"
              >
                <p className="text-sm font-semibold text-foreground">{t("rec2Title")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("rec2Body")}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  {t("rec2Cta")} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              <Link
                href="/blog/mejores-cafeteras-superautomaticas-amantes-del-cafe-2026"
                className="group rounded-xl border border-border bg-background p-4 hover:border-accent/40"
              >
                <p className="text-sm font-semibold text-foreground">{t("rec3Title")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("rec3Body")}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  {t("rec3Cta")} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              <Link
                href="/blog/mejores-robots-de-cocina-baratos-alternativas-thermomix-2026"
                className="group rounded-xl border border-border bg-background p-4 hover:border-accent/40"
              >
                <p className="text-sm font-semibold text-foreground">{t("rec4Title")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("rec4Body")}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  {t("rec4Cta")} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
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
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{t("ctaFinalTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("ctaFinalBody")}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-lg border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/20"
              >
                {t("ctaVerMasGuias")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/buscar"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary"
              >
                {t("ctaBuscarProductos")} <Search className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
