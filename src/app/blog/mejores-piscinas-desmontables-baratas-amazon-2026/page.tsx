import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeEuro, ExternalLink, Sparkles, Star, Zap } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBlogGuideSchemas } from "@/components/seo/blog-guide-schemas";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";
const PATH = "/blog/mejores-piscinas-desmontables-baratas-amazon-2026";
const TITLE = "Las mejores piscinas desmontables baratas en Amazon (2026)";
const DESCRIPTION = "Selección editorial de piscinas desmontables baratas y completas en Amazon 2026: capacidades, pros, contras y recomendación Homara.";

const PUBLISHED_AT = "2026-04-30";
const UPDATED_AT = "2026-04-30";
const CATEGORY = "Jardín";
const KEYWORDS = ["piscina desmontable", "piscina barata Amazon", "piscina familia", "piscina Bestway", "piscina Intex"];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}${PATH}`,
    publishedTime: PUBLISHED_AT,
    modifiedTime: UPDATED_AT,
    authors: ["Equipo editorial Homara"],
    section: CATEGORY,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

type PoolProduct = {
  rank: number;
  name: string;
  brand: string;
  structure: string;
  size: string;
  rating: string;
  priceSeen: string;
  bestFor: string;
  notes: string[];
  pros: string[];
  cons: string[];
  miniReview: string;
  affiliateUrl: string;
  imageUrl: string;
};

const affiliateProducts: PoolProduct[] = [
  {
    rank: 1,
    name: "Intex 28272NP Small Frame – Detachable Swimming Pool, 300 x 200 x 75 cm, 3.834 Litres, Blue",
    brand: "Intex",
    structure: "Small Frame (tubular metálica)",
    size: "300 x 200 x 75 cm",
    rating: "4,5/5 (48.084 valoraciones)",
    priceSeen: "99,00 EUR",
    bestFor: "Patios medianos y familias de 4-6 personas",
    notes: [
      "Dimensiones 300 x 200 x 75 cm",
      "Capacidad 3.834 L",
      "Montaje aproximado 30 minutos",
    ],
    pros: [
      "Estructura de acero con recubrimiento anticorrosión",
      "Lona Super-Tough de triple capa",
      "Válvula de drenaje con conexión a manguera",
    ],
    cons: [
      "No incluye depuradora (solo conexión de 32 mm)",
      "Requiere espacio rectangular de 3 x 2 m",
    ],
    miniReview:
      "Una de las Intex más equilibradas si tienes patio medio y quieres una piscina sólida sin irte a tamaños XXL.",
    affiliateUrl: "https://amzn.to/4u4lMEf",
    imageUrl: "https://m.media-amazon.com/images/I/61Yj7vQtbAL._AC_SX569_.jpg",
  },
  {
    rank: 2,
    name: "BESTWAY 56406 – Steel Pro MAX Tubular Detachable Swimming Pool, 305 x 76 cm, Multicoloured",
    brand: "Bestway",
    structure: "Steel Pro MAX (tubular)",
    size: "305 x 76 cm",
    rating: "4,4/5 (2.555 valoraciones)",
    priceSeen: "89,99 EUR",
    bestFor: "Familias que quieren tamaño estándar con precio contenido",
    notes: [
      "Estructura Steel Pro MAX tubular",
      "Dimensiones 305 x 76 cm",
      "Marca Bestway",
    ],
    pros: [
      "Buen tamaño familiar",
      "Estructura tubular estable",
      "Precio competitivo para 305 cm",
    ],
    cons: [
      "Pocos datos técnicos visibles en ficha",
      "Capacidad no visible",
    ],
    miniReview:
      "Si quieres 305 cm con precio razonable y estructura tubular, esta Bestway cumple sin complicarte.",
    affiliateUrl: "https://amzn.to/4cvKozO",
    imageUrl: "https://m.media-amazon.com/images/I/81i97asQzML._AC_SX569_.jpg",
  },
  {
    rank: 3,
    name: "Intex ¡¡¡28212-POOL Metal Frame 366X76CM 6503L C/DEPURATOR",
    brand: "Intex",
    structure: "Metal Frame",
    size: "366 x 76 cm",
    rating: "4,3/5 (5.169 valoraciones)",
    priceSeen: "114,99 EUR",
    bestFor: "Familias que quieren más capacidad con depuradora",
    notes: [
      "Dimensiones 366 x 76 cm",
      "Capacidad 6.503 L",
      "Incluye depuradora de cartucho (tipo A) 2.006 L/h",
    ],
    pros: [
      "Gran capacidad para uso familiar",
      "Incluye depuradora",
      "Estructura metálica resistente",
    ],
    cons: [
      "Necesita más espacio",
      "Precio más alto que modelos básicos",
    ],
    miniReview:
      "Si tu prioridad es espacio y mantenimiento más cómodo, esta Intex con depuradora es una apuesta segura.",
    affiliateUrl: "https://amzn.to/4cZY4TQ",
    imageUrl: "https://m.media-amazon.com/images/I/51m14kNojZL._AC_SX569_.jpg",
  },
  {
    rank: 4,
    name: "Bestway Fast Set Self-Standing Detachable Pool, 244 x 66 cm",
    brand: "Bestway",
    structure: "Autoportante (Fast Set)",
    size: "244 x 66 cm",
    rating: "3,9/5 (4.037 valoraciones)",
    priceSeen: "41,99 EUR",
    bestFor: "Montaje rápido y presupuestos muy ajustados",
    notes: [
      "Montaje rápido con aro hinchable",
      "Válvula de drenaje con conexión a manguera",
      "Lona Tritech de triple capa",
    ],
    pros: [
      "Precio muy bajo",
      "Montaje rápido",
      "Fácil de desmontar y guardar",
    ],
    cons: [
      "Menor estabilidad que estructuras metálicas",
      "Tamaño más limitado",
    ],
    miniReview:
      "La opción de entrada para refrescarse rápido sin montar una estructura completa. Ideal para uso ocasional.",
    affiliateUrl: "https://amzn.to/4u4hBZ1",
    imageUrl: "https://m.media-amazon.com/images/I/51-glVV9EwL._AC_SX569_.jpg",
  },
  {
    rank: 5,
    name: "Intex 26700NP – Round Prisma Frame Raised Pool 305 x 76 cm",
    brand: "Intex",
    structure: "Prism Frame",
    size: "305 x 76 cm",
    rating: "4,1/5 (1.186 valoraciones)",
    priceSeen: "89,95 EUR",
    bestFor: "Quien busca estructura robusta con 305 cm",
    notes: [
      "Dimensiones 305 x 76 cm",
      "Capacidad 4.485 L",
      "Lona PVC-poliéster de triple capa",
    ],
    pros: [
      "Equilibrio entre tamaño y precio",
      "Estructura metálica sólida",
      "Acabado interior efecto gresite",
    ],
    cons: [
      "No incluye depuradora",
      "Necesita espacio circular",
    ],
    miniReview:
      "Si quieres una piscina redonda de 305 cm con estructura seria y buen precio, esta Intex es una apuesta muy equilibrada.",
    affiliateUrl: "https://amzn.to/498sukr",
    imageUrl: "https://m.media-amazon.com/images/I/61o2sQfnLvL._AC_SX425_.jpg",
  },
];

const faqs = [
  {
    q: "Cuál es la mejor piscina desmontable barata para un patio pequeño?",
    a: "Los formatos Small Frame o autoportantes suelen ser más fáciles de montar y ocupan menos espacio. Son ideales para patios pequeños o uso ocasional.",
  },
  {
    q: "Qué estructura es más estable: Metal Frame o autoportante?",
    a: "Las estructuras Metal Frame y Prism Frame suelen ofrecer más estabilidad que las autoportantes. Si la vas a usar mucho, compensa.",
  },
  {
    q: "Cómo elegir el tamaño correcto?",
    a: "Mide el espacio disponible y piensa en cuántas personas van a usarla. Un diámetro de 300 cm ya es cómodo para familia, pero exige más espacio.",
  },
  {
    q: "Es mejor Intex o Bestway?",
    a: "Ambas son marcas conocidas en piscinas desmontables. Intex suele destacar en estructuras metálicas y Bestway en opciones de entrada económicas.",
  },
  {
    q: "Los precios se mantienen todo el verano?",
    a: "No siempre. En Amazon los precios cambian por stock y promociones, por eso recomendamos revisar el enlace antes de decidir.",
  },
];

export default function GuidePage() {
  const { article, breadcrumb, faqPage, itemList } = buildBlogGuideSchemas({
    path: PATH,
    title: TITLE,
    description: DESCRIPTION,
    publishedAt: PUBLISHED_AT,
    updatedAt: UPDATED_AT,
    category: CATEGORY,
    keywords: KEYWORDS,
    image: affiliateProducts[0]?.imageUrl,
    rankedItems: affiliateProducts.map((p) => ({ name: p.name })),
    faqs: faqs.map((f) => ({ question: f.q, answer: f.a })),
    articleBody: affiliateProducts.map((p) => `${p.name}: ${p.miniReview}`).join(" "),
  });

  return (
    <>
      <JsonLd data={article} />
      <JsonLd data={breadcrumb} />
      {faqPage ? <JsonLd data={faqPage} /> : null}
      {itemList ? <JsonLd data={itemList} /> : null}

      <main className="container mx-auto px-4 pb-16">
        <div className="py-2">
          <Breadcrumb items={[{ label: "Blog", href: "/blog" }, { label: TITLE }]} />
        </div>

        <article className="pb-16">
          <header className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-accent/15 via-secondary/50 to-card p-6 md:p-10">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/20 blur-2xl" aria-hidden="true" />
            <div className="absolute -left-12 bottom-0 h-24 w-24 rounded-full bg-primary/15 blur-xl" aria-hidden="true" />

            <div className="relative max-w-4xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                <Sparkles className="h-3.5 w-3.5" />
                Guia de compra Homara 2026
              </p>

              <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-5xl">
                Las mejores piscinas desmontables baratas en Amazon para sobrevivir al calor este verano 2026
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Si buscas piscinas desmontables baratas en Amazon, esta comparativa editorial resume lo esencial: qué modelo encaja con tu patio,
                cuál es más estable y cuál se monta más rápido.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Actualizado: abril 2026</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Intención: compra</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Rango: 41,99 EUR - 114,99 EUR</span>
              </div>
            </div>
          </header>

          <section className="mt-6 rounded-2xl border border-deal/30 bg-deal/5 p-4 text-sm text-muted-foreground">
            <p>
              Transparencia: este contenido incluye enlaces de afiliado. Si compras desde ellos, Homara puede recibir una comisión sin coste extra para ti.
              Precios y disponibilidad pueden cambiar según stock y promociones.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Resumen rápido: top piscinas desmontables baratas</h2>
            <p className="mt-2 text-sm text-muted-foreground">Tabla visual para comparar estructura, tamaño y mejor uso de un vistazo.</p>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[1040px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-left">
                    <th className="px-4 py-3 font-semibold text-foreground">Foto</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Modelo</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Estructura</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Tamaño</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Ideal para</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Precio visto</th>
                    <th className="px-4 py-3 font-semibold text-foreground">CTA</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliateProducts.map((product) => (
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
                          Ver en Amazon <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Comparativa rápida: estructura, tamaño y mejor uso</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Las fichas de Amazon no muestran siempre datos completos, así que nos centramos en lo seguro: tipo de estructura, tamaño visible y para quién encaja.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {affiliateProducts.map((product) => (
                <div key={product.rank} className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">Top {product.rank}</p>
                  <h3 className="mt-1 font-display text-lg font-bold text-foreground">{product.name}</h3>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p><span className="font-semibold text-foreground">Estructura:</span> {product.structure}</p>
                    <p><span className="font-semibold text-foreground">Tamaño:</span> {product.size}</p>
                    <p><span className="font-semibold text-foreground">Mejor para:</span> {product.bestFor}</p>
                    <p><span className="font-semibold text-foreground">Precio:</span> {product.priceSeen}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Las 5 mejores piscinas desmontables baratas de 2026</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Selección editorial con enfoque práctico: qué aporta cada modelo y para qué tipo de patio es más recomendable.
            </p>

            <div className="mt-6 space-y-6">
              {affiliateProducts.map((product) => (
                <section key={product.rank} className="rounded-2xl border border-border bg-card p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Top {product.rank}</p>
                      <h3 className="mt-1 font-display text-xl font-bold text-foreground md:text-2xl">{product.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Mejor para: {product.bestFor}</p>
                    </div>

                    <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-right text-sm">
                      <p className="font-semibold text-foreground">{product.priceSeen}</p>
                      <p className="text-xs text-muted-foreground">Precio visto</p>
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
                          <p className="text-xs text-muted-foreground">Estructura</p>
                          <p className="font-semibold text-foreground">{product.structure}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">Tamaño</p>
                          <p className="font-semibold text-foreground">{product.size}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">Valoraciones</p>
                          <p className="font-semibold text-foreground">{product.rating}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">Precio visto</p>
                          <p className="font-semibold text-foreground">{product.priceSeen}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border border-border bg-background p-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Por que destaca</p>
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
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pros</p>
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
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contras</p>
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
                        <p className="text-xs font-semibold uppercase tracking-wide text-accent">Mini review Homara</p>
                        <p className="mt-1 text-sm leading-relaxed text-foreground">{product.miniReview}</p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <a
                          href={product.affiliateUrl}
                          target="_blank"
                          rel="sponsored nofollow noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
                        >
                          Ver oferta en Amazon <ExternalLink className="h-4 w-4" />
                        </a>
                        <Link
                          href={`/buscar?q=${encodeURIComponent(`${product.brand} piscina desmontable`)}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
                        >
                          Comparar alternativas en Homara <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Qué tener en cuenta antes de comprar una piscina desmontable barata</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">1) Espacio real en el patio</h3>
                <p className="mt-1 text-sm text-muted-foreground">Mide largo y ancho disponibles. Asegúrate de dejar margen para acceder y mover agua sin problemas.</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">2) Tipo de estructura</h3>
                <p className="mt-1 text-sm text-muted-foreground">Autoportante = montaje rápido. Metal/Prism Frame = más estabilidad si vas a usarla a diario.</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">3) Tiempo de montaje</h3>
                <p className="mt-1 text-sm text-muted-foreground">Si quieres algo rápido, prioriza estructuras simples. Si buscas estabilidad, acepta un montaje más largo.</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">4) Mantenimiento y vaciado</h3>
                <p className="mt-1 text-sm text-muted-foreground">Un buen drenaje facilita el vaciado. Revisa siempre si el modelo lo incluye.</p>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground">Preguntas frecuentes</h2>
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
            <h2 className="font-display text-2xl font-bold text-foreground">Recomendación editorial Homara</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Si quieres decidir rápido: Small Frame para empezar con poco presupuesto, Metal Frame para estabilidad y uso frecuente,
              y Prism Frame si necesitas más espacio y una sensación más robusta.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <a href="https://amzn.to/4u4lMEf" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">Intex Small Frame</a>
              <a href="https://amzn.to/4cZY4TQ" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">Intex Metal Frame</a>
              <a href="https://amzn.to/498sukr" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">Intex Prism Frame 305x76</a>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Sigue comparando en Homara</h2>
            <p className="mt-2 text-sm text-muted-foreground">Enlaces útiles para seguir comparando productos de verano en Homara.</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link href="/categoria/jardin-y-exterior" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver categoria Jardin y Exterior</Link>
              <Link href="/categoria/jardin-y-exterior/mobiliario-de-exterior" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver mobiliario de exterior</Link>
              <Link href="/categoria/jardin-y-exterior/mesas-de-exterior" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver mesas de exterior</Link>
              <Link href="/buscar?q=piscina%20desmontable" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Buscar piscinas desmontables</Link>
              <Link href="/buscar?q=intex" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Comparar modelos Intex</Link>
              <Link href="/buscar?q=bestway" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Comparar modelos Bestway</Link>
              <Link href="/asistente" className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm font-semibold text-accent hover:bg-accent/20">Pedir recomendación al Asistente de Compras</Link>
            </div>

            <div className="mt-6 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              Contenidos sugeridos para enlazado interno cuando estén publicados:
              <ul className="mt-2 space-y-1 text-foreground">
                <li>Guía de mantenimiento básico para piscinas desmontables.</li>
                <li>Cómo preparar el patio antes de instalar una piscina.</li>
                <li>Los mejores accesorios para piscinas desmontables en verano.</li>
              </ul>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
