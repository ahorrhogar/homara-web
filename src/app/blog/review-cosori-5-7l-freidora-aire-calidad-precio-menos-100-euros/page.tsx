import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink, Flame, Sparkles, Star, ThumbsUp } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";
const REVIEW_PATH = "/blog/review-cosori-5-7l-freidora-aire-calidad-precio-menos-100-euros";
const AFFILIATE_URL = "https://amzn.to/41DW3q9";

const TITLE =
  "COSORI 5,7 L por menos de 100 EUR: review honesta de calidad precio (2026)";
const DESCRIPTION =
  "Review honesta de la COSORI 5,7 L por menos de 100 EUR: opinión real, ficha técnica, pros, contras, veredicto y enlace de compra.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: REVIEW_PATH },
  openGraph: {
    type: "article",
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}${REVIEW_PATH}`,
  },
};

const product = {
  name: "COSORI Air Fryer Real Metallic Interior 5.7L",
  priceSeen: "84,99 EUR",
  rating: "4,7/5",
  reviews: "103.776 valoraciones",
  capacity: "5,7 L",
  power: "1700 W",
  programs: "13 programas de un toque",
  recipes: "40 recetas",
  warranty: "3 años",
  mainImage: "https://m.media-amazon.com/images/I/81HDt6NDs7L._AC_SX522_.jpg",
  extraImages: [
    "https://m.media-amazon.com/images/I/51Hz0BEs8-L._AC_US100_.jpg",
    "https://m.media-amazon.com/images/I/519eb9UfuxL._AC_US100_.jpg",
    "https://m.media-amazon.com/images/I/514hF8Z02sL._AC_US100_.jpg",
  ],
};

const faqs = [
  { q: "¿La COSORI 5,7 L entra de verdad en menos de 100 EUR?", a: "En la revisión de abril de 2026 se vio a 84,99 EUR. El precio puede variar por promociones y stock." },
  { q: "¿Es una buena freidora de aire para 3 o 4 personas?", a: "Sí. Por capacidad, 5,7 L encaja bien para uso diario en hogares de 2 a 4 personas sin tantas tandas." },
  { q: "¿Merece la pena frente a una air fryer más barata?", a: "Si priorizas fiabilidad, acabados y una compra de menor riesgo, suele compensar frente a modelos de entrada." },
  { q: "¿Es difícil de limpiar en el día a día?", a: "Según la ficha del producto, las piezas son antiadherentes y aptas para lavavajillas, lo que ayuda mucho en rutina." },
];

export default function CosoriReviewPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: { "@type": "Product", name: product.name },
    author: { "@type": "Organization", name: "Homara" },
    reviewRating: { "@type": "Rating", ratingValue: 4.7, bestRating: 5 },
    headline: TITLE,
    datePublished: "2026-04-19",
    description: DESCRIPTION,
    mainEntityOfPage: `${SITE_URL}${REVIEW_PATH}`,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <main className="container mx-auto px-4 pb-16">
        <div className="py-2">
          <Breadcrumb items={[{ label: "Guías", href: "/blog" }, { label: "Review COSORI 5,7 L" }]} />
        </div>

        <article>
          <header className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-accent/15 via-secondary/50 to-card p-6 md:p-10">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/20 blur-2xl" aria-hidden />
            <div className="absolute -left-12 bottom-0 h-24 w-24 rounded-full bg-primary/15 blur-xl" aria-hidden />

            <div className="relative max-w-4xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                <Sparkles className="h-3.5 w-3.5" />
                Review Homara 2026
              </p>

              <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-5xl">
                COSORI 5,7 L por menos de 100 EUR: review honesta de la mejor freidora de aire calidad precio
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Si estás buscando una freidora de aire calidad precio por menos de 100 EUR, esta review va al grano:
                qué ofrece de verdad, para quién compensa y si la compraría hoy sin rodeos.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Actualizado: abril 2026</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Intención: compra</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Producto: 1 review</span>
              </div>
            </div>
          </header>

          <section className="mt-6 rounded-2xl border border-deal/30 bg-deal/5 p-4 text-sm text-muted-foreground">
            <p>
              Transparencia: este contenido incluye enlace de afiliado. Si compras desde el enlace, Homara puede
              recibir una comisión sin coste extra para ti. Precio y disponibilidad pueden cambiar en Amazon.
            </p>
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                Mi opinión: qué me transmite esta air fryer tras analizarla
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                Esta COSORI no es la más barata de su categoría, pero da una sensación clara de compra segura.
                Combina capacidad útil (5,7 L), potencia suficiente para uso real (1700 W) y un volumen de
                valoraciones muy alto, que reduce bastante el riesgo de equivocarte.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                Si cocinas varias veces por semana, aquí se nota más la consistencia que rascar 10 o 15 euros en un
                modelo más básico. Para mí, ese es el punto que marca la diferencia en calidad precio.
              </p>

              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="font-display text-xl font-bold text-foreground">Lo que más me gusta</h3>
                <ul className="mt-3 space-y-2 text-sm text-foreground">
                  <li className="flex items-start gap-2"><ThumbsUp className="mt-0.5 h-4 w-4 text-deal" />Capacidad 5,7 L muy equilibrada para 2-4 personas.</li>
                  <li className="flex items-start gap-2"><ThumbsUp className="mt-0.5 h-4 w-4 text-deal" />Valoración 4,7/5 con más de 100.000 reseñas.</li>
                  <li className="flex items-start gap-2"><ThumbsUp className="mt-0.5 h-4 w-4 text-deal" />13 programas para simplificar la cocina diaria.</li>
                  <li className="flex items-start gap-2"><ThumbsUp className="mt-0.5 h-4 w-4 text-deal" />Piezas aptas para lavavajillas según ficha.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="font-display text-xl font-bold text-foreground">Lo que menos me convence</h3>
                <ul className="mt-3 space-y-2 text-sm text-foreground">
                  <li className="flex items-start gap-2"><span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-muted-foreground" />Hay opciones más baratas si solo buscas precio mínimo.</li>
                  <li className="flex items-start gap-2"><span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-muted-foreground" />Para una persona puede ser más capacidad de la necesaria.</li>
                  <li className="flex items-start gap-2"><span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-muted-foreground" />No toda la ficha pública tiene detalle técnico avanzado.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="font-display text-xl font-bold text-foreground">Para quién lo recomiendo</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Para quien quiere una freidora de aire calidad precio por menos de 100 EUR con uso frecuente,
                  sin experimentar con modelos demasiado básicos y con enfoque práctico de cocina diaria.
                </p>
              </div>
            </div>

            <aside className="space-y-4">
              <a href={AFFILIATE_URL} target="_blank" rel="sponsored nofollow noopener noreferrer" className="group block overflow-hidden rounded-2xl border border-border bg-card">
                <img
                  src={product.mainImage}
                  alt={product.name}
                  loading="lazy"
                  className="h-64 w-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </a>

              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Precio visto</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{product.priceSeen}</p>
                <p className="mt-2 text-xs text-muted-foreground">Rating {product.rating} · {product.reviews}</p>
                <a
                  href={AFFILIATE_URL}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
                >
                  Ver oferta en Amazon <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </aside>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Características y especificaciones</h2>
            <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[760px] text-sm">
                <tbody>
                  <SpecRow label="Modelo" value={product.name} />
                  <SpecRow label="Capacidad" value={product.capacity} />
                  <SpecRow label="Potencia" value={product.power} />
                  <SpecRow label="Programas" value={product.programs} />
                  <SpecRow label="Recetas incluidas" value={product.recipes} />
                  <SpecRow label="Garantía" value={product.warranty} />
                  <SpecRow label="Precio visto" value={product.priceSeen} last />
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Imágenes del producto</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {product.extraImages.map((imageUrl) => (
                <a
                  key={imageUrl}
                  href={AFFILIATE_URL}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  className="overflow-hidden rounded-xl border border-border bg-card p-3"
                >
                  <img src={imageUrl} alt="Detalle de la COSORI 5,7 L" loading="lazy" className="h-24 w-full object-contain" />
                </a>
              ))}
            </div>
          </section>

          <section className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-2xl font-bold text-foreground">Pros</h2>
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                <li className="flex items-start gap-2"><Star className="mt-0.5 h-4 w-4 text-accent" />Muy buen equilibrio entre precio y sensación de producto robusto.</li>
                <li className="flex items-start gap-2"><Star className="mt-0.5 h-4 w-4 text-accent" />Capacidad cómoda para uso familiar medio.</li>
                <li className="flex items-start gap-2"><Star className="mt-0.5 h-4 w-4 text-accent" />Volumen de valoraciones altísimo para comprar con más confianza.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-2xl font-bold text-foreground">Contras</h2>
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                <li className="flex items-start gap-2"><span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-muted-foreground" />No es la opción más low cost del mercado.</li>
                <li className="flex items-start gap-2"><span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-muted-foreground" />Puede ocupar demasiado si tienes encimera muy limitada.</li>
                <li className="flex items-start gap-2"><span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-muted-foreground" />Parte de sus claims dependen del tipo de receta y uso real.</li>
              </ul>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Qué me parece tras analizarlo</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              La COSORI 5,7 L es una de esas compras que no prometen magia, pero sí mucha tranquilidad. Si quieres
              mejorar tu cocina diaria con menos aceite y sin complicarte, es de las opciones más sólidas por debajo
              de 100 EUR en 2026.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              Si mi objetivo fuese comprar hoy una freidora única para casa, esta entraría en mi shortlist final sin dudas.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground">Preguntas frecuentes</h2>
            <div className="mt-4 space-y-3">
              {faqs.map((item) => (
                <details key={item.q} className="group rounded-xl border border-border bg-card p-4">
                  <summary className="cursor-pointer list-none font-semibold text-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Flame className="h-4 w-4 text-accent" />
                      {item.q}
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-accent/20 bg-gradient-to-br from-card via-card to-accent/10 p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Veredicto final</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Si buscas la mejor freidora de aire calidad precio por menos de 100 EUR con enfoque de compra segura,
              la COSORI 5,7 L merece la pena. No es la más barata, pero sí una de las opciones más consistentes para uso real.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={AFFILIATE_URL}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
              >
                Ver oferta de COSORI en Amazon <ExternalLink className="h-4 w-4" />
              </a>
              <Link
                href="/blog/mejores-freidoras-aire-amazon-2026-menos-100-euros"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
              >
                Comparar con otras air fryers <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Sigue navegando por Homara</h2>
            <p className="mt-2 text-sm text-muted-foreground">Si quieres afinar aún más la compra, aquí tienes enlaces internos útiles.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link href="/categoria/cocina" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">
                Ver categoría Cocina
              </Link>
              <Link href="/categoria/electrodomesticos" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">
                Ver categoría Electrodomésticos
              </Link>
              <Link href="/buscar?q=freidora%20aire" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">
                Buscar freidoras de aire
              </Link>
              <Link href="/asistente" className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm font-semibold text-accent hover:bg-accent/20">
                Pedir recomendación al Asistente
              </Link>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}

function SpecRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <tr className={last ? "" : "border-b border-border"}>
      <th className="w-1/3 bg-secondary/50 px-4 py-3 text-left font-semibold text-foreground">{label}</th>
      <td className="px-4 py-3 text-foreground">{value}</td>
    </tr>
  );
}
