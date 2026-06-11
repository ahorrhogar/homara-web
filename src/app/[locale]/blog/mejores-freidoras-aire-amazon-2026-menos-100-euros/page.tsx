import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, BadgeEuro, ChefHat, ExternalLink, Sparkles, Star, Zap } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBlogGuideSchemas } from "@/components/seo/blog-guide-schemas";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";
const PATH = "/blog/mejores-freidoras-aire-amazon-2026-menos-100-euros";
const TITLE = "Las 5 mejores freidoras de aire por menos de 100 € en 2026";
const DESCRIPTION =
  "Comparativa editorial de 5 freidoras de aire por debajo de 100 € en Amazon (2026): capacidad, potencia, pros, contras y recomendación según uso real.";
const PUBLISHED_AT = "2026-04-12";
const UPDATED_AT = "2026-04-12";
const CATEGORY = "Cocina";
const KEYWORDS = ["freidora de aire", "freidora aire menos 100 euros", "mejores freidoras 2026", "Cosori", "freidora Amazon"];

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
  bestFor: string;
  notes: string[];
  pros: string[];
  cons: string[];
  miniReview: string;
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
    bestFor: "Cocinas pequeñas y uso diario para 1-2 personas",
    notes: ["Ventana frontal para seguir la cocción sin abrir la cubeta", "Tiempo ajustable hasta 60 minutos", "Formato compacto"],
    pros: ["Muy buen precio de entrada", "Interfaz táctil sencilla", "Buena relación tamaño-precio"],
    cons: ["Capacidad justa para familias", "Menos margen para tandas grandes"],
    miniReview:
      "Si quieres empezar sin gastar mucho, esta es de las que mejor sensación deja. Es simple, calienta rápido para su gama y la ventana ayuda mucho cuando aún estás aprendiendo tiempos.",
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
    bestFor: "Hogares de 3-5 personas y lotes grandes",
    notes: ["Cesta de 8 litros", "Rango de temperatura amplio", "Control táctil"],
    pros: ["Capacidad superior dentro de precio contenido", "Buena para meal prep", "Excelente equilibrio capacidad-coste"],
    cons: ["Ocupa más encimera", "Puede ser sobredimensionada para uso individual"],
    miniReview:
      "Para familia o batch cooking, esta destaca por comodidad pura: menos tandas y menos esperas. Si tienes espacio en cocina, es de las compras que se notan en el día a día.",
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
    bestFor: "Usuarios que buscan opción equilibrada para 2-4 personas",
    notes: ["Acabado InoxBlack", "Tecnología PerfectCook en ficha", "Panel táctil"],
    pros: ["Precio competitivo en su capacidad", "Buena potencia para uso frecuente", "Producto muy consolidado en volumen de valoraciones"],
    cons: ["No llega a la capacidad de modelos de 8 L", "Menos funciones avanzadas que líneas grill"],
    miniReview:
      "Es la opción equilibrada de esta lista: buen tamaño, potencia suficiente y precio contenido. Muy recomendable si cocinas casi a diario para 2-4 personas.",
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
    bestFor: "Quien prioriza marca, construcción y robustez",
    notes: ["Estructura interior metálica destacada en la ficha", "Cesta 5,7 L", "Sistema de 1700 W"],
    pros: ["Volumen de valoraciones muy alto", "Perfil de producto maduro", "Acabado orientado a durabilidad"],
    cons: ["Va al límite de 100 EUR", "Menos agresiva en precio por litro"],
    miniReview:
      "Se nota que es un producto maduro: construcción cuidada y mucha validación de usuarios. Si valoras fiabilidad de marca por encima del precio mínimo, tiene mucho sentido.",
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
    bestFor: "Quien quiere freidora + grill con mayor potencia",
    notes: ["Doble resistencia en ficha", "Ventana de visualización", "Perfil multifunción (freidora y grill)"],
    pros: ["Potencia muy alta para su precio", "Muy versátil para diferentes recetas", "Capacidad equilibrada para hogar familiar"],
    cons: ["Curva de uso mayor que un modelo básico", "Interfaz más completa para quien busca simplicidad"],
    miniReview:
      "Si te gusta variar recetas y buscas un plus de dorado, esta ofrece un perfil más completo por muy buen precio. Es menos plug-and-play, pero devuelve versatilidad real.",
    affiliateUrl: "https://amzn.to/4dPJC1G",
    imageUrl: "https://m.media-amazon.com/images/I/71qEef7KxUL._AC_SX425_.jpg",
  },
];

const faqs = [
  { q: "¿Cuál es la mejor freidora de aire por menos de 100 EUR para 2 personas?", a: "Si cocinas para una o dos personas y quieres contener gasto, el formato de 4 L como Fantastik Window 4000 suele ser suficiente. Si quieres algo más flexible para invitados puntuales, 5,5 L es un buen salto." },
  { q: "¿Merece la pena subir a 8 litros sin pasar de 100 EUR?", a: "Si cocinas por tandas grandes o para 3-5 personas, sí. La ganancia principal no es solo cantidad, también comodidad para no ir cocinando en varias rondas." },
  { q: "¿Se nota la diferencia entre 1700 W y 2200 W?", a: "Normalmente sí en velocidad de calentamiento y dorado, especialmente en recetas con proteína o cuando quieres acabado tipo grill." },
  { q: "¿Qué es más importante: potencia o capacidad?", a: "Para la mayoría de usuarios, la capacidad adecuada a su hogar es la clave. La potencia suma, pero elegir una cuba demasiado pequeña suele ser el error más caro." },
  { q: "¿Los precios se mantienen siempre por debajo de 100 EUR?", a: "No necesariamente. Esta guía se basa en precios visibles al revisar los enlaces en abril de 2026. En Amazon pueden variar por stock, cupones o promociones." },
];

export default function AirFryersUnder100GuidePage() {
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
    articleBody: affiliateProducts
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
          <Breadcrumb items={[{ label: "Blog", href: "/blog" }, { label: TITLE }]} />
        </div>

        <article>
          <header className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-accent/15 via-secondary/50 to-card p-6 md:p-10">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/20 blur-2xl" aria-hidden />
            <div className="absolute -left-12 bottom-0 h-24 w-24 rounded-full bg-primary/15 blur-xl" aria-hidden />
            <div className="relative max-w-4xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                <Sparkles className="h-3.5 w-3.5" /> Guía de compra Homara 2026
              </p>
              <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-5xl">
                Las 5 mejores freidoras de aire por menos de 100 EUR en 2026 (Amazon)
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Si buscas las mejores freidoras de aire por menos de 100 EUR, esta comparativa está pensada para ayudarte a decidir en minutos:
                datos verificables, diferencias reales y recomendación final según tu tipo de uso.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Actualizado: abril 2026</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Intención: compra</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Rango: hasta 100 EUR</span>
              </div>
            </div>
          </header>

          <section className="mt-6 rounded-2xl border border-deal/30 bg-deal/5 p-4 text-sm text-muted-foreground">
            <p>
              Transparencia: este contenido incluye enlaces de afiliado. Si compras desde ellos, Homara puede recibir una comisión sin coste extra para ti.
              Precios y valoraciones pueden cambiar según stock y promociones.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Resumen rápido: comparativa de freidoras de aire</h2>
            <p className="mt-2 text-sm text-muted-foreground">Tabla visual para comparar capacidad, potencia y precio visto de un vistazo.</p>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[1040px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-left">
                    <th className="px-4 py-3 font-semibold text-foreground">Foto</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Modelo</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Capacidad</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Potencia</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Temperatura</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Programas</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Precio visto</th>
                    <th className="px-4 py-3 font-semibold text-foreground">CTA</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliateProducts.map((product) => (
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
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Las 5 mejores freidoras de aire de 2026 por debajo de 100 EUR</h2>
            <p className="mt-2 text-sm text-muted-foreground">Selección orientada a conversión con enfoque práctico: para quién es cada modelo y por qué puede encajar contigo.</p>

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
                    <a href={product.affiliateUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className="group block overflow-hidden rounded-xl border border-border bg-background">
                      <img src={product.imageUrl} alt={product.name} loading="lazy" className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]" />
                    </a>

                    <div>
                      <div className="grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
                        <SpecCell label="Capacidad" value={product.capacity} />
                        <SpecCell label="Potencia" value={product.power} />
                        <SpecCell label="Temperatura" value={product.temperature} />
                        <SpecCell label="Programas" value={product.programs} />
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <BulletList title="Por qué destaca" items={product.notes} icon={<Star className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-accent" />} />
                        <BulletList title="Pros" items={product.pros} icon={<Zap className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-deal" />} />
                        <BulletList title="Contras" items={product.cons} icon={<span className="mt-[8px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground" />} />
                      </div>

                      <div className="mt-4 rounded-lg border border-accent/30 bg-accent/5 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-accent">Mini review Homara</p>
                        <p className="mt-1 text-sm leading-relaxed text-foreground">{product.miniReview}</p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <a href={product.affiliateUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90">
                          Ver oferta en Amazon <ExternalLink className="h-4 w-4" />
                        </a>
                        <Link
                          href={`/buscar?q=${encodeURIComponent(`${product.brand} freidora aire`)}`}
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
            <h2 className="font-display text-2xl font-bold text-foreground">Qué tener en cuenta antes de comprar una air fryer</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Tip title="1) Capacidad según tu hogar" body="1-2 personas: 4-5,5 L. 3-4 personas: 5,5-6,5 L. 4+ personas: 8 L o más." />
              <Tip title="2) Potencia y rendimiento" body="1700 W suele ser el punto medio. Si quieres dorado más agresivo o uso intensivo, 2200 W ofrece margen extra." />
              <Tip title="3) Funciones realmente útiles" body="Ventana, recordatorio de volteo, preheat y grill son interesantes solo si los vas a usar de verdad en tu cocina diaria." />
              <Tip title="4) Espacio en encimera" body="Antes de comprar, revisa medidas y hueco real. Una buena compra también es la que puedes usar cómoda todos los días." />
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground">Preguntas frecuentes</h2>
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
            <h2 className="font-display text-2xl font-bold text-foreground">Recomendación editorial Homara</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Si quieres una decisión rápida: Fantastik 4000 para empezar gastando poco, InoxBlack 5500 Pro para equilibrio diario,
              Supreme 8000 si priorizas capacidad y Duoheat 6500 Plus si quieres versatilidad con extra de potencia.
              COSORI 5.7L encaja cuando prefieres una opción consolidada y al límite de presupuesto.
            </p>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Sigue comparando en Homara</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link href="/categoria/cocina" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver categoría Cocina</Link>
              <Link href="/categoria/electrodomesticos" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver categoría Electrodomésticos</Link>
              <Link href="/buscar?q=freidora%20aire" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Buscar freidoras de aire en Homara</Link>
              <Link href="/blog/review-cosori-5-7l-freidora-aire-calidad-precio-menos-100-euros" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Review honesta COSORI 5,7 L</Link>
              <Link href="/asistente" className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm font-semibold text-accent hover:bg-accent/20">Pedir recomendación al Asistente</Link>
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
