import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, BadgeEuro, Cloud, ExternalLink, Sparkles, Zap } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBlogGuideSchemas } from "@/components/seo/blog-guide-schemas";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";
const PATH = "/blog/mejores-sombrillas-resistentes-amazon-2026";
const TITLE = "Las mejores sombrillas resistentes en Amazon (2026)";
const DESCRIPTION = "Selección editorial de las sombrillas resistentes al viento más vendidas en Amazon en 2026: análisis, pros, contras y recomendación Homara.";

const PUBLISHED_AT = "2026-04-30";
const UPDATED_AT = "2026-04-30";
const CATEGORY = "Terraza";
const KEYWORDS = ["sombrilla resistente", "sombrilla Amazon", "parasol jardín", "parasol terraza", "sombrilla viento"];

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

type UmbrellaProduct = {
  rank: number;
  name: string;
  brand: string;
  size: string;
  material: string;
  uvProtection: string;
  weight: string;
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

const umbrellaProducts: UmbrellaProduct[] = [
  {
    rank: 1,
    name: "SONGMICS Patio Umbrella",
    brand: "SONGMICS",
    size: "190×120 cm",
    material: "Poliéster 160 g/m², Marco acero",
    uvProtection: "UPF 50+",
    weight: "2,5 kg",
    rating: "4,5/5 (54 valoraciones)",
    priceSeen: "€29,99",
    bestFor: "Playa, balcón pequeño, uso ocasional",
    notes: [
      "Inclinación doble 30° bidireccional",
      "Incluye bolsa de transporte",
      "Botón de seguridad anti-cierre repentino",
    ],
    pros: [
      "Precio imbatible para iniciarse",
      "Perfecta para playa y balcón",
      "Muy portátil y ligera",
      "Montaje instantáneo",
    ],
    cons: [
      "Capacidad limitada para más de 2 personas",
      "Tela más fina que modelos grandes",
      "No regulable en altura",
    ],
    miniReview:
      "Si buscas tu primer parasol sin gastar, aquí está. Calidad sorprendentemente buena por menos de 30€. Perfecta para llevarte a la playa sin cargo.",
    affiliateUrl: "https://amzn.to/3QoDsfp",
    imageUrl: "https://m.media-amazon.com/images/I/6163TwCWODL._AC_SX569_.jpg",
  },
  {
    rank: 2,
    name: "Acomoda Textil Garden Parasol",
    brand: "Acomoda Textil",
    size: "200×300 cm",
    material: "Aluminio 4mm, Poliéster 180 g/m²",
    uvProtection: "UPF 50+",
    weight: "6 kg",
    rating: "3,8/5 (49 valoraciones)",
    priceSeen: "€49,99",
    bestFor: "Terraza mediana, familia de 4-6 personas",
    notes: [
      "Manivela trinquete fluida y suave",
      "Tela removible para lavar",
      "Sombra amplia de 6 m²",
    ],
    pros: [
      "Mejor relación tamaño-precio del mercado",
      "Mantenimiento real (tela lavable)",
      "Cubre mesa de comedor completa",
      "Marco aluminio resistente",
    ],
    cons: [
      "La tela es fina (envejecimiento en climas muy soleados)",
      "Necesita base de mínimo 25 kg",
      "No es inclinable ni rotativa",
    ],
    miniReview:
      "Suena barata, es barata. Pero suministra. Acomoda lleva años en el mercado por una razón: calidad honesta sin tonterías por precio contenido.",
    affiliateUrl: "https://amzn.to/4sXb2Xk",
    imageUrl: "https://m.media-amazon.com/images/I/417bIAGRX5L._AC_SX425_.jpg",
  },
  {
    rank: 3,
    name: "SONGMICS Garden Umbrella 300cm",
    brand: "SONGMICS",
    size: "300 cm Ø (Octagonal)",
    material: "Acero revestido, Poliéster 180 g/m²",
    uvProtection: "UPF 50+",
    weight: "6,8 kg",
    rating: "4,4/5 (3.274 valoraciones)",
    priceSeen: "€56,99",
    bestFor: "Patio robusto, uso frecuente todo el verano",
    notes: [
      "3.274 valoraciones garantizan durabilidad",
      "Orificios de ventilación = más estabilidad con viento",
      "Manivela suave y segura",
    ],
    pros: [
      "Construcción legendaria (opiniones consistentes)",
      "Inclinación en dos direcciones",
      "Mantenimiento cero con cubierta",
      "Estructura de acero muy robusta",
    ],
    cons: [
      "No incluye base (necesita anclaje 15+ kg)",
      "No es rotativa",
      "Forma octagonal menos versátil que rectangular",
    ],
    miniReview:
      "Es el Corolla de las sombrillas: no es la más cara, ni la más chula. Pero será la última que venda. Reina callada de la durabilidad.",
    affiliateUrl: "https://amzn.to/4mTiVf4",
    imageUrl: "https://m.media-amazon.com/images/I/61evsUkivPL._AC_SX425_.jpg",
  },
  {
    rank: 4,
    name: "SONGMICS Solar LED Illuminated",
    brand: "SONGMICS",
    size: "300 cm Ø",
    material: "Acero metálico, Poliéster 180 g/m²",
    uvProtection: "UPF 50+",
    weight: "13,8 kg",
    rating: "4,3/5 (397 valoraciones)",
    priceSeen: "€99,99",
    bestFor: "Ambiente romántico nocturno, cenas en terraza",
    notes: [
      "32 luces LED solares integradas",
      "Base incluida (requiere 80 kg pesos)",
      "Carga solar automática 8 horas = 6 horas de luz",
    ],
    pros: [
      "Las luces funcionan de verdad",
      "Ambiente romántico garantizado",
      "Base incluida (valor añadido)",
      "Construcción robusta y duradera",
    ],
    cons: [
      "Precio al borde del límite (100€)",
      "Necesita 80 kg peso en base para estabilidad",
      "Las luces no reemplazan iluminación profesional",
    ],
    miniReview:
      "Es la sombrilla que impresiona a tus amigos. De día cumple, de noche seduce. Vale cada céntimo si disfrutas cenar en la terraza.",
    affiliateUrl: "https://amzn.to/4n02FZO",
    imageUrl: "https://m.media-amazon.com/images/I/61+BHg4B7YL._AC_SX679_.jpg",
  },
  {
    rank: 5,
    name: "tillvex Premium 330cm",
    brand: "tillvex",
    size: "330 cm Ø (100 cm base)",
    material: "Aluminio, Poliéster 180 g/m²",
    uvProtection: "UPF 50+",
    weight: "12 kg",
    rating: "4,1/5 (13 valoraciones)",
    priceSeen: "€149,90",
    bestFor: "Terrazas grandes, inversión a largo plazo",
    notes: [
      "360° rotación mediante palanca pie (sin mover base)",
      "6 posiciones de inclinación regulables",
      "Funda protectora con cierre cramallera",
      "Tubo soporte 70×50 mm extra robusto",
    ],
    pros: [
      "360° sin mover parasol = máxima comodidad",
      "6 inclinaciones dan flexibilidad real",
      "Funda profesional incluida",
      "Varillas reforzadas aguantan viento intenso",
    ],
    cons: [
      "Precio considerable (150€)",
      "Requiere base de calidad (pesos adicionales)",
      "Instalación más compleja",
      "Mantenimiento cuidadoso recomendado",
    ],
    miniReview:
      "Es sombrilla seria. La pagas, la usas 10 años sin pensar. Inversión que merece la pena para quien busca no volver a cambiar.",
    affiliateUrl: "https://amzn.to/42sWVhx",
    imageUrl: "https://m.media-amazon.com/images/I/81woIQnkj0L._AC_SX522_.jpg",
  },
  {
    rank: 6,
    name: "VOUNOT Square Eccentric Parasol",
    brand: "VOUNOT",
    size: "300×300 cm (Cuadrado)",
    material: "Acero reforzado, Poliéster 220 g/m²",
    uvProtection: "UPF 50+",
    weight: "22,5 kg",
    rating: "4,2/5 (23 valoraciones)",
    priceSeen: "€179,99",
    bestFor: "Piscinas, terrazas grandes, espacios profesionales",
    notes: [
      "Lona ultradensa 220 g/m² (máxima durabilidad)",
      "Rotación 360° con pedal en base",
      "6 niveles de inclinación por manilla",
      "8 varillas acero con revestimiento antioxidante",
    ],
    pros: [
      "Cobertura XXL (9 metros cuadrados)",
      "Tela premium 220 g/m²",
      "Rotación sin mover base = funcionalidad real",
      "Acabado profesional/high-end",
    ],
    cons: [
      "Precio premium (€179,99)",
      "Necesita base robusta (50-80 kg pesos)",
      "Volumen/peso significativo",
      "Requiere espacio amplio para rentabilizar",
    ],
    miniReview:
      "La Godzilla de las sombrillas. Si tu terraza es tu segundo salón, esta es la reina. Amplia, robusta, pensada para durar décadas bajo cualquier clima.",
    affiliateUrl: "https://amzn.to/48qBKjL",
    imageUrl: "https://m.media-amazon.com/images/I/71CVlYCvVdL._AC_SX679_.jpg",
  },
];

const faqs = [
  {
    q: "¿Cuánta sombra real da cada sombrilla?",
    a: "SONGMICS Patio (190×120): ~2,3 m². Acomoda (200×300): ~6 m². SONGMICS 300cm: ~7 m². VOUNOT 3×3m: ~9 m². Cuanto mayor el tamaño, más superficie cubre.",
  },
  {
    q: "¿Es imprescindible la inclinación?",
    a: "No, pero suma mucho. Te permite seguir el sol sin mover el parasol. La SONGMICS LED permite ajuste, pero el VOUNOT con 6 posiciones es casi tener sombrilla nueva cada hora.",
  },
  {
    q: "¿El viento arruina cualquier sombrilla?",
    a: "Con base de 50+ kg y cierre correcto, aguantan 40-50 km/h sin problemas. Ciérrala cuando hay viento fuerte o lluvia torrencial para prolongar su vida.",
  },
  {
    q: "¿Se puede dejar la sombrilla abierta todo el verano?",
    a: "Técnicamente sí, pero la tela envejecerá más rápido. Lo mejor: ciérrala por la noche y cuando haya viento fuerte. Con cuidado mínimo duran años.",
  },
  {
    q: "¿Cuántos años dura una sombrilla resistente?",
    a: "Con cuidado: SONGMICS Patio 2-3 años. Acomoda/SONGMICS octagonal 5-7 años. SONGMICS LED/tillvex 7-10 años. VOUNOT 10+ años.",
  },
  {
    q: "¿Hay diferencia real entre marcas?",
    a: "SONGMICS, Acomoda y VOUNOT tienen volumen de valoraciones que no engaña. Paga por volumen de reviews + reputación real. tillvex es menos conocida pero solidamente construida.",
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
    image: umbrellaProducts[0]?.imageUrl,
    rankedItems: umbrellaProducts.map((p) => ({ name: p.name })),
    faqs: faqs.map((f) => ({ question: f.q, answer: f.a })),
    articleBody: umbrellaProducts.map((p) => `${p.name}: ${p.miniReview}`).join(" "),
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
                Guía de compra Homara 2026
              </p>

              <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-5xl">
                Las 6 mejores sombrillas resistentes de Amazon 2026: para terraza sin pasar calor
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Comparativa editorial de 6 sombrillas premium con protección UPF 50+, análisis profundo de cada modelo, pros/contras reales y recomendación final según tu tipo de espacio exterior.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Actualizado: abril 2026</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Intención: compra</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Desde €29,99 a €179,99</span>
              </div>
            </div>
          </header>

          <section className="mt-6 rounded-2xl border border-deal/30 bg-deal/5 p-4 text-sm text-muted-foreground">
            <p>
              Transparencia: este contenido incluye enlaces de afiliado. Si compras desde ellos, Homara puede recibir una comisión sin coste extra para ti. Precios y valoraciones pueden cambiar según stock y promociones.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Resumen rápido: comparativa de sombrillas resistentes</h2>
            <p className="mt-2 text-sm text-muted-foreground">Tabla visual para comparar tamaño, protección UV y precio de un vistazo.</p>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[1040px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-left">
                    <th className="px-4 py-3 font-semibold text-foreground">Foto</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Modelo</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Tamaño</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Material</th>
                    <th className="px-4 py-3 font-semibold text-foreground">UV</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Peso</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Precio visto</th>
                    <th className="px-4 py-3 font-semibold text-foreground">CTA</th>
                  </tr>
                </thead>
                <tbody>
                  {umbrellaProducts.map((product) => (
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
                      <td className="px-4 py-3 text-foreground">{product.size}</td>
                      <td className="px-4 py-3 text-xs text-foreground">{product.material}</td>
                      <td className="px-4 py-3 text-foreground">{product.uvProtection}</td>
                      <td className="px-4 py-3 text-foreground">{product.weight}</td>
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
                          Ver oferta <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Las 6 mejores sombrillas resistentes para terrazas y jardines</h2>
            <p className="mt-2 text-sm text-muted-foreground">Análisis detallado de cada modelo: características reales, uso recomendado y veredicto editorial.</p>

            <div className="mt-6 space-y-6">
              {umbrellaProducts.map((product) => (
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
                          <p className="text-xs text-muted-foreground">Tamaño</p>
                          <p className="font-semibold text-foreground">{product.size}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">Material</p>
                          <p className="font-semibold text-foreground text-xs">{product.material}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">Protección UV</p>
                          <p className="font-semibold text-foreground">{product.uvProtection}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">Peso</p>
                          <p className="font-semibold text-foreground">{product.weight}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border border-border bg-background p-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Por qué destaca</p>
                          <ul className="space-y-1.5 text-sm text-foreground">
                            {product.notes.map((note) => (
                              <li key={note} className="flex items-start gap-2">
                                <Cloud className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-accent" />
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
                          href={`/buscar?q=${encodeURIComponent(product.brand)}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
                        >
                          Comparar alternativas <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Qué tener en cuenta antes de comprar una sombrilla resistente</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">1) Tamaño según tu espacio</h3>
                <p className="mt-1 text-sm text-muted-foreground">Balcón: 190×120 cm. Terraza mediana: 200×300 cm. Patio: 300 cm Ø. Piscina/grande: 330+ cm.</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">2) Densidad de tela</h3>
                <p className="mt-1 text-sm text-muted-foreground">160 g/m²: uso ocasional. 180 g/m²: estándar resistente. 220 g/m²: máxima durabilidad.</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">3) Sistema de apertura</h3>
                <p className="mt-1 text-sm text-muted-foreground">Manual: simple. Manivela: más fluida. Pedal (360°): profesional. Elige según comodidad diaria.</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">4) Base necesaria</h3>
                <p className="mt-1 text-sm text-muted-foreground">15-25 kg: medianas. 50+ kg: grandes. No la incluyen muchas. Presupuesta en el total.</p>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground">Preguntas frecuentes sobre sombrillas resistentes</h2>
            <div className="mt-4 space-y-3">
              {faqs.map((item) => (
                <details key={item.q} className="group rounded-xl border border-border bg-card p-4">
                  <summary className="cursor-pointer list-none font-semibold text-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Cloud className="h-4 w-4 text-accent" />
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
              Si buscas decisión rápida: SONGMICS Patio para playa/balcón, Acomoda para terraza mediana, SONGMICS 300cm para uso frecuente, LED para ambiente nocturno,
              tillvex para terrazas grandes, VOUNOT para piscinas profesionales. Cada una es justa en su categoría.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <a href="https://amzn.to/3QoDsfp" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">SONGMICS Patio (€29,99)</a>
              <a href="https://amzn.to/4sXb2Xk" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">Acomoda 200×300 (€49,99)</a>
              <a href="https://amzn.to/4mTiVf4" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">SONGMICS 300cm (€56,99)</a>
              <a href="https://amzn.to/4n02FZO" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">SONGMICS LED (€99,99)</a>
              <a href="https://amzn.to/42sWVhx" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">tillvex 330cm (€149,90)</a>
              <a href="https://amzn.to/48qBKjL" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">VOUNOT 3×3m (€179,99)</a>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Sigue comparando en Homara</h2>
            <p className="mt-2 text-sm text-muted-foreground">Enlaces internos útiles para continuar la decisión sin salir del ecosistema Homara.</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link href="/categoria/jardin-y-exterior" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver categoría Jardín y Exterior</Link>
              <Link href="/categoria/jardin-y-exterior/mesas-de-exterior" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver mesas de terraza</Link>
              <Link href="/buscar?q=sombrilla" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Buscar sombrillas en Homara</Link>
              <Link href="/buscar?q=parasol%20terraza" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Comparar más parasoles</Link>
              <Link href="/blog/10-mesas-de-terraza-baratas-y-bonitas-en-amazon-2026" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Mejores mesas de terraza 2026</Link>
              <Link href="/asistente" className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm font-semibold text-accent hover:bg-accent/20">Pedir recomendación al Asistente de Compras</Link>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
