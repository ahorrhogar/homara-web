import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, BadgeEuro, Coffee, ExternalLink, Sparkles, Star, Zap } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBlogGuideSchemas } from "@/components/seo/blog-guide-schemas";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";
const PATH = "/blog/mejores-cafeteras-superautomaticas-amantes-del-cafe-2026";

const PUBLISHED_AT = "2026-03-26";
const UPDATED_AT = "2026-03-26";

const NS = "guides.mejores-cafeteras-superautomaticas-amantes-del-cafe-2026";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations(NS);
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

type CoffeeMachine = {
  rank: number;
  name: string;
  brand: string;
  priceSeen: string;
  rating: string;
  affiliateUrl: string;
  imageUrl: string;
};

type CoffeeMachineCopy = {
  strongPoint: string;
  idealFor: string;
  keyFeatures: string[];
  pros: string[];
  cons: string[];
  miniReview: string;
  verdict: string;
};

const coffeeMachines: CoffeeMachine[] = [
  {
    rank: 1,
    name: "Philips Serie 5500 EP5544/50",
    brand: "Philips",
    priceSeen: "589,00 EUR",
    rating: "4,4/5 (1.651 valoraciones)",
    affiliateUrl:
      "https://www.amazon.es/Totalmente-Autom%C3%A1tica-Silenciosa-SilentBrew-EP5544/dp/B0CTCQKJ1B?crid=B4EMS01J3LXT&dib=eyJ2IjoiMSJ9.SgI8yF0EUeQiXOy0lfRX-JkxWXiL3YlSZNdd-xQZolctRQn3mJ3p41pK9cufSyLT2DBQgG6llEiSZzyuqHTRTaip2nfsZGtoz7KWujlmNn-Qyy3LV7HZatQlnq76pkhE6VOOfwhX8EmIDJ13yASpmI2V2w0EvjvyBXMqRWt-lWMUNy8e_uckRVPvHw59TpBsOPv_FAWr0m3Sx5kS5j2t8fKTXdWLi5nnCGpX9N41s2rqvziKdJ2ld2LEDA2ri4McLAofodX16gv7wXqx1Ux8vpp293RxslreIf-yB-sZL-k.9UnHCVbDYl8Wxyl9NDHVMA1ehgOQwdeemoregwdW6EA&dib_tag=se&keywords=cafetera%2Bsuperautom%C3%A1tica&qid=1776612843&sprefix=cafetera%2Caps%2C221&sr=8-1-spons&ufe=app_do%3Aamzn1.fos.4c3f56c3-e485-4a35-9abc-6532b61c3b62&aref=983c4bNxKw&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=79f3f1bf85fc66ffa04ca5e16adefdce&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/61wUUgUQYoL._AC_SX522_.jpg",
  },
  {
    rank: 2,
    name: "Philips Serie 2300 EP2330/10",
    brand: "Philips",
    priceSeen: "359,99 EUR",
    rating: "4,2/5 (3.795 valoraciones)",
    affiliateUrl:
      "https://www.amazon.es/Philips-Serie-2300-Cafetera-Superautom%C3%A1tica/dp/B0CDCCZ9K8?crid=B4EMS01J3LXT&dib=eyJ2IjoiMSJ9.SgI8yF0EUeQiXOy0lfRX-JkxWXiL3YlSZNdd-xQZolctRQn3mJ3p41pK9cufSyLT2DBQgG6llEiSZzyuqHTRTaip2nfsZGtoz7KWujlmNn-Qyy3LV7HZatQlnq76pkhE6VOOfwhX8EmIDJ13yASpmI2V2w0EvjvyBXMqRWt-lWMUNy8e_uckRVPvHw59TpBsOPv_FAWr0m3Sx5kS5j2t8fKTXdWLi5nnCGpX9N41s2rqvziKdJ2ld2LEDA2ri4McLAofodX16gv7wXqx1Ux8vpp293RxslreIf-yB-sZL-k.9UnHCVbDYl8Wxyl9NDHVMA1ehgOQwdeemoregwdW6EA&dib_tag=se&keywords=cafetera%2Bsuperautom%C3%A1tica&qid=1776612843&sprefix=cafetera%2Caps%2C221&sr=8-2-spons&ufe=app_do%3Aamzn1.fos.4c3f56c3-e485-4a35-9abc-6532b61c3b62&aref=wG3hAlinPE&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=abae5f8b63d1ff93e1a897072827e8c4&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/71qbGYx5YDL._AC_SX522_.jpg",
  },
  {
    rank: 3,
    name: "DeLonghi Magnifica S ECAM11.112.B",
    brand: "DeLonghi",
    priceSeen: "299,99 EUR",
    rating: "4,2/5 (57.419 valoraciones)",
    affiliateUrl:
      "https://www.amazon.es/DeLonghi-Magnifica-ECAM11-112-B-Superautom%C3%A1tica-Soft-Touch/dp/B0BWSFGQ49?crid=B4EMS01J3LXT&dib=eyJ2IjoiMSJ9.SgI8yF0EUeQiXOy0lfRX-JkxWXiL3YlSZNdd-xQZolctRQn3mJ3p41pK9cufSyLT2DBQgG6llEiSZzyuqHTRTaip2nfsZGtoz7KWujlmNn-Qyy3LV7HZatQlnq76pkhE6VOOfwhX8EmIDJ13yASpmI2V2w0EvjvyBXMqRWt-lWMUNy8e_uckRVPvHw59TpBsOPv_FAWr0m3Sx5kS5j2t8fKTXdWLi5nnCGpX9N41s2rqvziKdJ2ld2LEDA2ri4McLAofodX16gv7wXqx1Ux8vpp293RxslreIf-yB-sZL-k.9UnHCVbDYl8Wxyl9NDHVMA1ehgOQwdeemoregwdW6EA&dib_tag=se&keywords=cafetera%2Bsuperautom%C3%A1tica&qid=1776612843&sprefix=cafetera%2Caps%2C221&sr=8-8&ufe=app_do%3Aamzn1.fos.6c35d95a-ceb8-4cab-b2da-8669f70f4878&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=b6a1bce24c01b94a7a558b596e93b3fc&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/617bJwLkEhL._AC_SX522_.jpg",
  },
  {
    rank: 4,
    name: "Cecotec Cremmaet Cube Compact",
    brand: "Cecotec",
    priceSeen: "179,00 EUR",
    rating: "4,0/5 (403 valoraciones)",
    affiliateUrl:
      "https://www.amazon.es/Cecotec-Cafetera-Superautom%C3%A1tica-Pre-Infusi%C3%B3n-Thermoblock/dp/B0FP2HTVYR?crid=B4EMS01J3LXT&dib=eyJ2IjoiMSJ9.SgI8yF0EUeQiXOy0lfRX-JkxWXiL3YlSZNdd-xQZolctRQn3mJ3p41pK9cufSyLT2DBQgG6llEiSZzyuqHTRTaip2nfsZGtoz7KWujlmNn-Qyy3LV7HZatQlnq76pkhE6VOOfwhX8EmIDJ13yASpmI2V2w0EvjvyBXMqRWt-lWMUNy8e_uckRVPvHw59TpBsOPv_FAWr0m3Sx5kS5j2t8fKTXdWLi5nnCGpX9N41s2rqvziKdJ2ld2LEDA2ri4McLAofodX16gv7wXqx1Ux8vpp293RxslreIf-yB-sZL-k.9UnHCVbDYl8Wxyl9NDHVMA1ehgOQwdeemoregwdW6EA&dib_tag=se&keywords=cafetera%2Bsuperautom%C3%A1tica&qid=1776612843&sprefix=cafetera%2Caps%2C221&sr=8-4-spons&ufe=app_do%3Aamzn1.fos.4c3f56c3-e485-4a35-9abc-6532b61c3b62&aref=NsR0KzN3VZ&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=aa0591bd75841817a886dde6fb503413&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/71UAkdsAiwL._AC_SX522_.jpg",
  },
  {
    rank: 5,
    name: "Melitta Solo E950-222",
    brand: "Melitta",
    priceSeen: "249,99 EUR",
    rating: "4,2/5 (2.807 valoraciones)",
    affiliateUrl:
      "https://www.amazon.es/Melitta-950-222-automatic%C3%A1-molinillo-integrado/dp/B00I3YL5T0?content-id=amzn1.sym.bf7fd619-13de-4d86-8675-08fc9f414f76%3Aamzn1.sym.bf7fd619-13de-4d86-8675-08fc9f414f76&crid=B4EMS01J3LXT&cv_ct_cx=cafetera%2Bsuperautom%C3%A1tica&keywords=cafetera%2Bsuperautom%C3%A1tica&pd_rd_i=B00I3YL5T0&pd_rd_r=03a85da9-6254-4aa4-b386-c6fcd50200f2&pd_rd_w=z6ura&pd_rd_wg=C3qFX&pf_rd_p=bf7fd619-13de-4d86-8675-08fc9f414f76&pf_rd_r=SCYK852R67968J644PR1&qid=1776612843&sbo=RZvfv%2F%2FHxDF%2BO5021pAnSA%3D%3D&sprefix=cafetera%2Caps%2C221&sr=1-5-9ac51240-4b88-4e0c-aad1-ad3578b6cab1-spons&ufe=app_do%3Aamzn1.fos.6c35d95a-ceb8-4cab-b2da-8669f70f4878&aref=hKrTslJjTe&sp_csd=d2lkZ2V0TmFtZT1zcF9zZWFyY2hfdGhlbWF0aWM&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=2e6abdbf5e03c354b7414446d0c6d9c2&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/51DTj6lXb5L._AC_SX522_.jpg",
  },
];

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations(NS);

  const title = t("title");
  const description = t("description");
  const category = t("category");
  const keywords = t.raw("keywords") as string[];
  const items = t.raw("items") as CoffeeMachineCopy[];
  const faqs = t.raw("faq") as Array<{ q: string; a: string }>;

  const { article, breadcrumb, faqPage, itemList } = buildBlogGuideSchemas({
    path: PATH,
    title,
    description,
    publishedAt: PUBLISHED_AT,
    updatedAt: UPDATED_AT,
    category,
    keywords,
    image: coffeeMachines[0]?.imageUrl,
    rankedItems: coffeeMachines.map((p) => ({ name: p.name })),
    faqs: faqs.map((f) => ({ question: f.q, answer: f.a })),
    articleBody: coffeeMachines.map((p, i) => `${p.name}: ${items[i].miniReview}`).join(" "),
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
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colPuntoFuerte")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colIdealPara")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colPrecioAprox")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colCta")}</th>
                  </tr>
                </thead>
                <tbody>
                  {coffeeMachines.map((product, i) => (
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
                      <td className="px-4 py-3 text-foreground">{items[i].strongPoint}</td>
                      <td className="px-4 py-3 text-foreground">{items[i].idealFor}</td>
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

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{t("quickTitle")}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {coffeeMachines.map((product, i) => (
                <div key={`quick-${product.rank}`} className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">{t("topLabel", { rank: product.rank })}</p>
                  <h3 className="mt-1 font-semibold text-foreground">{product.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{product.rating}</p>
                  <p className="mt-1 text-sm text-foreground">{t("mejorPara", { value: items[i].idealFor })}</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{t("precioAprox", { value: product.priceSeen })}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{t("analysisTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("analysisIntro")}</p>

            <div className="mt-6 space-y-6">
              {coffeeMachines.map((product, i) => (
                <section key={`full-${product.rank}`} className="rounded-2xl border border-border bg-card p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-accent">{t("topLabel", { rank: product.rank })}</p>
                      <h3 className="mt-1 font-display text-xl font-bold text-foreground md:text-2xl">{product.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{t("mejorPara", { value: items[i].idealFor })}</p>
                    </div>

                    <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-right text-sm">
                      <p className="font-semibold text-foreground">{product.priceSeen}</p>
                      <p className="text-xs text-muted-foreground">{t("precioVisto")}</p>
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
                          <p className="text-xs text-muted-foreground">{t("ratingLabel")}</p>
                          <p className="font-semibold text-foreground">{product.rating}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">{t("puntoFuerteLabel")}</p>
                          <p className="font-semibold text-foreground">{items[i].strongPoint}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">{t("idealParaLabel")}</p>
                          <p className="font-semibold text-foreground">{items[i].idealFor}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border border-border bg-background p-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("caracteristicasClave")}</p>
                          <ul className="space-y-1.5 text-sm text-foreground">
                            {items[i].keyFeatures.map((feature) => (
                              <li key={feature} className="flex items-start gap-2">
                                <Star className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-accent" />
                                <span>{feature}</span>
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

                      <div className="mt-3 rounded-lg border border-border bg-background p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("veredictoRapido")}</p>
                        <p className="mt-1 text-sm text-foreground">
                          {items[i].verdict}
                        </p>
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
                          href={`/buscar?q=${encodeURIComponent(`${product.brand} cafetera superautomatica`)}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
                        >
                          {t("compararAlternativas")} <ArrowRight className="h-4 w-4" />
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
                      <Coffee className="h-4 w-4 text-accent" />
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
            <h2 className="font-display text-2xl font-bold text-foreground">{t("internalTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("internalIntro")}</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link href="/blog" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkBlog")}</Link>
              <Link href="/categoria/cocina" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkCocina")}</Link>
              <Link href="/categoria/electrodomesticos" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkElectro")}</Link>
              <Link href="/buscar?q=cafetera%20superautomatica" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkBuscar")}</Link>
              <Link href="/blog/mejores-freidoras-aire-amazon-2026-menos-100-euros" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">{t("linkOtraComparativa")}</Link>
              <Link href="/asistente" className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm font-semibold text-accent hover:bg-accent/20">{t("linkAsistente")}</Link>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">{t("conclusionTitle")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              {t("conclusionBody")}
            </p>

            <div className="mt-5">
              <Link
                href="/buscar?q=cafetera%20superautomatica"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
              >
                {t("conclusionCta")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
