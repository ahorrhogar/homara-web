import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, BadgeEuro, ChefHat, ExternalLink, Scale, Sparkles, Star } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBlogGuideSchemas } from "@/components/seo/blog-guide-schemas";
import { buildAlternates, toOpenGraphLocale } from "@/i18n/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";
const PATH = "/blog/mejores-robots-de-cocina-baratos-alternativas-thermomix-2026";

const PUBLISHED_AT = "2026-03-26";
const UPDATED_AT = "2026-03-26";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guides.mejores-robots-de-cocina-baratos-alternativas-thermomix-2026");
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

type KitchenRobot = {
  rank: number;
  name: string;
  brand: string;
  priceSeen: string;
  rating: string;
  affiliateUrl: string;
  imageUrl: string;
};

const robots: KitchenRobot[] = [
  {
    rank: 1,
    name: "Cecotec Mambo 11090",
    brand: "Cecotec",
    priceSeen: "219,00 EUR",
    rating: "4,1/5 (346 valoraciones)",
    affiliateUrl:
      "https://www.amazon.es/Cecotec-Multifunci%C3%B3n-inoxidable-Lavavajillas-Accesorios/dp/B0BJQQ78BY?crid=1628EY8EP9YAC&dib=eyJ2IjoiMSJ9.13pWktvSSVlyu6AH2h6cRIytR1GDMKCNihFzPMOGOYaGQgrPoCKQ-KaFsWzw4ZiwZ96jGr0pU43Ujp5ZczbdIXJMQpOh5l4-IlQRPJwVutwDRDmAYebg3ZHy-UNTdD3fqDnp9K_fOujAEjU44C0mc3uPQXT-Pkbzr30ATN3bxmiGpsaULxn9lmKbxkJdHYnWBPcRDpQm5qg43eB-uIA71Rz3PPvunxoAhEGeg0gHOKWSXUHtOBxe1lZoD7aTG1P93MRdLDR9Zp78ENWNAnyinkMBj8pJ0DnYEtatNPzdks0.JUoAiRJzDUYwASpE53V25T-vNWHLdPAHRWEPbWlAVnk&dib_tag=se&keywords=robot%2Bde%2Bcocina&qid=1776613042&sprefix=robo%2Caps%2C145&sr=8-1-spons&ufe=app_do%3Aamzn1.fos.4c3f56c3-e485-4a35-9abc-6532b61c3b62&aref=y3WD7Mfc1I&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=e51abc2d9c020551da432a290d775932&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/51sB4hpk8OL._AC_SX425_.jpg",
  },
  {
    rank: 2,
    name: "Cecotec Mambo Touch Habana",
    brand: "Cecotec",
    priceSeen: "403,90 EUR",
    rating: "4,5/5 (36 valoraciones)",
    affiliateUrl:
      "https://www.amazon.es/Cecotec-Multifunci%C3%B3n-Funciones-Revestimiento-Antiadherencia/dp/B0BMLJF3XC?crid=1628EY8EP9YAC&dib=eyJ2IjoiMSJ9.13pWktvSSVlyu6AH2h6cRIytR1GDMKCNihFzPMOGOYaGQgrPoCKQ-KaFsWzw4ZiwZ96jGr0pU43Ujp5ZczbdIXJMQpOh5l4-IlQRPJwVutwDRDmAYebg3ZHy-UNTdD3fqDnp9K_fOujAEjU44C0mc3uPQXT-Pkbzr30ATN3bxmiGpsaULxn9lmKbxkJdHYnWBPcRDpQm5qg43eB-uIA71Rz3PPvunxoAhEGeg0gHOKWSXUHtOBxe1lZoD7aTG1P93MRdLDR9Zp78ENWNAnyinkMBj8pJ0DnYEtatNPzdks0.JUoAiRJzDUYwASpE53V25T-vNWHLdPAHRWEPbWlAVnk&dib_tag=se&keywords=robot+de+cocina&qid=1776613042&sprefix=robo%2Caps%2C145&sr=8-2-spons&aref=1EgGftmZqa&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1&linkCode=ll2&tag=ahorrhogar-21&linkId=61a86667de6dd5951e4c03cb5acf6493&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/619fmVfB89L._AC_SX425_.jpg",
  },
  {
    rank: 3,
    name: "Ufesa TotalChef RK7",
    brand: "Ufesa",
    priceSeen: "339,99 EUR",
    rating: "4,1/5 (641 valoraciones)",
    affiliateUrl:
      "https://www.amazon.es/Ufesa-TotalChef-Inteligente-Multifunci%C3%B3n-Interactivo/dp/B09MWMJG76?content-id=amzn1.sym.bf7fd619-13de-4d86-8675-08fc9f414f76%3Aamzn1.sym.bf7fd619-13de-4d86-8675-08fc9f414f76&crid=1628EY8EP9YAC&cv_ct_cx=robot%2Bde%2Bcocina&keywords=robot%2Bde%2Bcocina&pd_rd_i=B09MWMJG76&pd_rd_r=9cbb59a2-6669-447d-8bd8-afb943da2e04&pd_rd_w=OsPTI&pd_rd_wg=4drJh&pf_rd_p=bf7fd619-13de-4d86-8675-08fc9f414f76&pf_rd_r=WE0EG0AWQ7R4VYNNYXFJ&qid=1776613042&sbo=RZvfv%2F%2FHxDF%2BO5021pAnSA%3D%3D&sprefix=robo%2Caps%2C145&sr=1-2-9ac51240-4b88-4e0c-aad1-ad3578b6cab1-spons&ufe=app_do%3Aamzn1.fos.4c3f56c3-e485-4a35-9abc-6532b61c3b62&aref=XZStHP0nwc&sp_csd=d2lkZ2V0TmFtZT1zcF9zZWFyY2hfdGhlbWF0aWM&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=64d13dde18f3b79495a12fa208f914d5&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/71TQd4oQH-L._AC_SX425_.jpg",
  },
  {
    rank: 4,
    name: "NEWLUX SmartChef V50",
    brand: "NEWLUX",
    priceSeen: "59,90 EUR",
    rating: "4,1/5 (2.787 valoraciones)",
    affiliateUrl:
      "https://www.amazon.es/NEWLUX-Robot-Multifunci%C3%B3n-Mod-Newcook-Antiadherente-autom%C3%A1ticos/dp/B00SBCZDDI?content-id=amzn1.sym.bf7fd619-13de-4d86-8675-08fc9f414f76%3Aamzn1.sym.bf7fd619-13de-4d86-8675-08fc9f414f76&crid=1628EY8EP9YAC&cv_ct_cx=robot%2Bde%2Bcocina&keywords=robot%2Bde%2Bcocina&pd_rd_i=B00SBCZDDI&pd_rd_r=9cbb59a2-6669-447d-8bd8-afb943da2e04&pd_rd_w=OsPTI&pd_rd_wg=4drJh&pf_rd_p=bf7fd619-13de-4d86-8675-08fc9f414f76&pf_rd_r=WE0EG0AWQ7R4VYNNYXFJ&qid=1776613042&sbo=RZvfv%2F%2FHxDF%2BO5021pAnSA%3D%3D&sprefix=robo%2Caps%2C145&sr=1-5-9ac51240-4b88-4e0c-aad1-ad3578b6cab1-spons&aref=3PfPJN051s&sp_csd=d2lkZ2V0TmFtZT1zcF9zZWFyY2hfdGhlbWF0aWM&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=22e809224b4630893a3177cee8ba5c3c&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/51b1NhImcIL._AC_SX425_.jpg",
  },
  {
    rank: 5,
    name: "Ufesa TotalChef RK10",
    brand: "Ufesa",
    priceSeen: "549,99 EUR",
    rating: "4,1/5 (641 valoraciones)",
    affiliateUrl:
      "https://www.amazon.es/Ufesa-Multifunci%C3%B3n-Inteligente-Interactiva-Accesorios/dp/B0FKT6CZPN?crid=1628EY8EP9YAC&dib=eyJ2IjoiMSJ9.13pWktvSSVlyu6AH2h6cRIytR1GDMKCNihFzPMOGOYaGQgrPoCKQ-KaFsWzw4ZiwZ96jGr0pU43Ujp5ZczbdIXJMQpOh5l4-IlQRPJwVutwDRDmAYebg3ZHy-UNTdD3fqDnp9K_fOujAEjU44C0mc3uPQXT-Pkbzr30ATN3bxmiGpsaULxn9lmKbxkJdHYnWBPcRDpQm5qg43eB-uIA71Rz3PPvunxoAhEGeg0gHOKWSXUHtOBxe1lZoD7aTG1P93MRdLDR9Zp78ENWNAnyinkMBj8pJ0DnYEtatNPzdks0.JUoAiRJzDUYwASpE53V25T-vNWHLdPAHRWEPbWlAVnk&dib_tag=se&keywords=robot%2Bde%2Bcocina&qid=1776613042&sprefix=robo%2Caps%2C145&sr=8-23&ufe=app_do%3Aamzn1.fos.4c3f56c3-e485-4a35-9abc-6532b61c3b62&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=f479fd1f974233e7934782cd471b7a1a&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/61Z3mCCETKL._AC_SX425_.jpg",
  },
];

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guides.mejores-robots-de-cocina-baratos-alternativas-thermomix-2026");

  const title = t("title");
  const description = t("description");
  const category = t("category");
  const keywords = t.raw("keywords") as string[];

  const strongPoints = t.raw("strongPoints") as string[];
  const idealFor = t.raw("idealFor") as string[];
  const keyFeatures = t.raw("keyFeatures") as string[][];
  const pros = t.raw("pros") as string[][];
  const cons = t.raw("cons") as string[][];
  const miniReviews = t.raw("miniReviews") as string[];

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
    image: robots[0]?.imageUrl,
    rankedItems: robots.map((p) => ({ name: p.name })),
    faqs: faqs.map((f) => ({ question: f.q, answer: f.a })),
    articleBody: robots.map((p, i) => `${p.name}: ${miniReviews[i]}`).join(" "),
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
            <p>{t("disclosure")}</p>
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
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colPrecio")}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{t("colCta")}</th>
                  </tr>
                </thead>
                <tbody>
                  {robots.map((product, i) => (
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
                      <td className="px-4 py-3 text-foreground">{strongPoints[i]}</td>
                      <td className="px-4 py-3 text-foreground">{idealFor[i]}</td>
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
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{t("quickTitle")}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {robots.map((product, i) => (
                <div key={`quick-${product.rank}`} className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">{t("topLabel", { rank: product.rank })}</p>
                  <h3 className="mt-1 text-base font-semibold text-foreground">{product.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{miniReviews[i]}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <p className="rounded-md bg-secondary px-2 py-1 text-foreground">{t("precioPrefix")}{product.priceSeen}</p>
                    <p className="rounded-md bg-secondary px-2 py-1 text-foreground">{product.rating}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12 space-y-10">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{t("analysisTitle")}</h2>

            {robots.map((product, i) => (
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
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{miniReviews[i]}</p>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-foreground">{t("marcaPrefix")}{product.brand}</p>
                      <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-foreground">{product.rating}</p>
                      <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-foreground">{t("precioPrefix")}{product.priceSeen}</p>
                      <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-foreground">{t("idealPrefix")}{idealFor[i]}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-border bg-background p-4">
                    <h4 className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      <ChefHat className="h-4 w-4 text-accent" /> {t("keyFeaturesTitle")}
                    </h4>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                      {keyFeatures[i].map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-xl border border-border bg-background p-4">
                      <h4 className="text-sm font-semibold text-foreground">{t("prosTitle")}</h4>
                      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                        {pros[i].map((pro) => (
                          <li key={pro}>{pro}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl border border-border bg-background p-4">
                      <h4 className="text-sm font-semibold text-foreground">{t("consTitle")}</h4>
                      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                        {cons[i].map((con) => (
                          <li key={con}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-accent/35 bg-accent/10 p-4">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{t("veredictoLabel")}</span> {t("veredictoBody", { strongPoint: strongPoints[i], idealFor: idealFor[i] })}
                  </p>
                  <a
                    href={product.affiliateUrl}
                    target="_blank"
                    rel="sponsored nofollow noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-accent/50 bg-background px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/15"
                  >
                    {t("ctaVerOferta")} <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </article>
            ))}
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              {t("buyingTitle")}
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">{t("buying1Title")}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("buying1Body")}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">{t("buying2Title")}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("buying2Body")}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">{t("buying3Title")}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("buying3Body")}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">{t("buying4Title")}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("buying4Body")}
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
                href="/categoria/electrodomesticos-y-cocina"
                className="group rounded-xl border border-border bg-background p-4 hover:border-accent/40"
              >
                <p className="text-sm font-semibold text-foreground">{t("internal1Title")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("internal1Body")}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  {t("internalGoCategory")} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              <Link
                href="/categoria/electrodomesticos-pequenos"
                className="group rounded-xl border border-border bg-background p-4 hover:border-accent/40"
              >
                <p className="text-sm font-semibold text-foreground">{t("internal2Title")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("internal2Body")}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  {t("internalGoCategory")} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              <Link
                href="/articulos/mejores-cafeteras-superautomaticas-2026"
                className="group rounded-xl border border-border bg-background p-4 hover:border-accent/40"
              >
                <p className="text-sm font-semibold text-foreground">{t("internal3Title")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("internal3Body")}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  {t("internalGoGuide")} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              <Link
                href="/asistente"
                className="group rounded-xl border border-border bg-background p-4 hover:border-accent/40"
              >
                <p className="text-sm font-semibold text-foreground">{t("internal4Title")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("internal4Body")}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  {t("internalGoAssistant")} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
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
                {t("ctaMoreGuides")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/buscar"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary"
              >
                {t("ctaSearch")} <Scale className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
