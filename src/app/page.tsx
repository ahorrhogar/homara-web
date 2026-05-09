import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Sparkles, ArrowRight, TrendingUp, Star, Flame, Zap } from "lucide-react";
import Hero from "@/components/home/Hero";
import TrendingCategories from "@/components/home/TrendingCategories";
import PromoBanner from "@/components/home/PromoBanner";
import { ProductGrid } from "@/components/product/ProductCard";
import ProductDestinationLink from "@/components/product/ProductDestinationLink";
import TrustBlock from "@/components/home/TrustBlock";
import SEOContent from "@/components/home/SEOContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategories, getTrendingCategories } from "@/data/catalog/categories";
import { getHomeCollections } from "@/data/catalog/products";
import { computeDiscountPercent } from "@/domain/catalog/product-logic";
import { PRODUCT_IMAGE_FALLBACK } from "@/lib/productImage";
import type { Category, Product } from "@/domain/catalog/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";

export const metadata: Metadata = {
  title: "Comparador de hogar y jardín en español",
  description:
    "Compara productos para tu hogar y jardín con criterio editorial: precios reales, datos concretos y recomendaciones razonadas. Cocina, terraza, muebles y más.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "Homara — Comparador editorial de hogar y jardín",
    description:
      "Reseñas y comparativas con datos concretos. Encuentra el producto correcto sin ahogarte en pestañas.",
  },
};

const HOMEPAGE_FAQ = [
  {
    question: "¿Homara es una tienda?",
    answer:
      "No. Homara es un comparador editorial: analizamos productos, mostramos precios actualizados de varias tiendas y enlazamos a la que ofrece la mejor opción. La compra siempre se realiza en la tienda final.",
  },
  {
    question: "¿Cómo elegís los productos que recomendáis?",
    answer:
      "Seleccionamos productos con datos verificables (medidas, materiales, consumo, garantía), comparamos contra alternativas y descartamos los que no cumplen. No publicamos recomendaciones sin datos concretos.",
  },
  {
    question: "¿Los precios que muestra Homara son los reales?",
    answer:
      "Tomamos los precios de las APIs oficiales de las tiendas. Pueden variar en cualquier momento; antes de comprar, confirma siempre el precio en la página de la tienda.",
  },
  {
    question: "¿Cómo gana dinero Homara?",
    answer:
      "Cuando un usuario compra a través de los enlaces a tiendas, recibimos una comisión de afiliación. Esta comisión no encarece el producto y no influye en nuestra valoración editorial.",
  },
  {
    question: "¿Puedo pedir recomendaciones personalizadas?",
    answer:
      "Sí. El asistente de Homara te recomienda productos según tu presupuesto, estilo y necesidades. Es gratuito y no requiere registro.",
  },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOMEPAGE_FAQ.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

function normalize(value: string): string {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function findCategoryHref(
  categories: Category[],
  predicates: Array<(category: Category) => boolean>,
  fallback: string,
): string {
  for (const predicate of predicates) {
    const match = categories.find(predicate);
    if (match?.slug) return `/categoria/${match.slug}`;
  }
  return fallback;
}

function buildCategoryHrefMap(categories: Category[]): Map<string, string> {
  const result = new Map<string, string>();
  for (const category of categories) {
    if (!category.slug) continue;
    result.set(category.id, `/categoria/${category.slug}`);
    for (const subcategory of category.subcategories) {
      if (!subcategory.slug) continue;
      result.set(subcategory.id, `/categoria/${category.slug}/${subcategory.slug}`);
    }
  }
  return result;
}

function getCollectionShowAllHref(
  products: Product[],
  categoryHrefById: Map<string, string>,
  defaultHref: string,
): string {
  if (!products.length) return defaultHref;

  const counts = new Map<string, number>();
  for (const product of products) {
    counts.set(product.categoryId, (counts.get(product.categoryId) || 0) + 1);
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
  for (const categoryId of sorted) {
    const href = categoryHrefById.get(categoryId);
    if (href) return href;
  }
  return defaultHref;
}

export const revalidate = 60;

const EMPTY_COLLECTIONS = {
  topProducts: [] as Product[],
  bestDeals: [] as Product[],
  topRatedProducts: [] as Product[],
  bestSellers: [] as Product[],
  favoriteProducts: [] as Product[],
  featuredProducts: [] as Product[],
};

async function safeFetchHomeData() {
  try {
    const [categories, trending, collections] = await Promise.all([
      getCategories(),
      getTrendingCategories(),
      getHomeCollections({
        topProducts: 6,
        bestDeals: 4,
        topRatedProducts: 4,
        bestSellers: 4,
        favoriteProducts: 4,
        featuredProducts: 4,
      }),
    ]);
    return { categories, trending, collections };
  } catch {
    return { categories: [] as Category[], trending: [], collections: EMPTY_COLLECTIONS };
  }
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={FAQ_SCHEMA} />
      <h1 className="sr-only">Comparador editorial de productos para hogar y jardín</h1>
      <Hero />
      <Suspense fallback={<HomeSectionsSkeleton />}>
        <HomeCatalogSections />
      </Suspense>
      <SEOContent />
    </>
  );
}

function HomeSectionsSkeleton() {
  // Reserve roughly the vertical space the data-bound sections will occupy so the
  // Hero doesn't shift when content streams in. Visually neutral — no spinners.
  return (
    <div
      aria-hidden
      className="bg-secondary/30 min-h-[800px] md:min-h-[1100px]"
    />
  );
}

async function HomeCatalogSections() {
  const { categories, trending, collections } = await safeFetchHomeData();

  const { topProducts, bestDeals, topRatedProducts, bestSellers, favoriteProducts, featuredProducts } = collections;

  const categoryHrefById = buildCategoryHrefMap(categories);
  const defaultCategoryHref = findCategoryHref(
    categories,
    [(c) => c.productCount > 0 && Boolean(c.slug), (c) => Boolean(c.slug)],
    "/",
  );

  const kitchenHref = findCategoryHref(
    categories,
    [
      (c) =>
        normalize(`${c.name} ${c.slug}`).includes("electro") &&
        normalize(`${c.name} ${c.slug}`).includes("cocina"),
      (c) => normalize(`${c.name} ${c.slug}`).includes("electro"),
    ],
    "/categoria/cocina",
  );

  const gardenHref = findCategoryHref(
    categories,
    [
      (c) => normalize(c.slug) === "jardin-y-exterior",
      (c) => normalize(c.slug) === "jardin-exterior",
      (c) =>
        normalize(`${c.name} ${c.slug}`).includes("jardin") &&
        normalize(`${c.name} ${c.slug}`).includes("exterior"),
      (c) => normalize(`${c.name} ${c.slug}`).includes("jardin"),
    ],
    "/categoria/jardin-y-exterior",
  );

  const dealsHref = getCollectionShowAllHref(bestDeals, categoryHrefById, defaultCategoryHref);
  const topRatedHref = getCollectionShowAllHref(topRatedProducts, categoryHrefById, defaultCategoryHref);
  const bestSellersHref = getCollectionShowAllHref(bestSellers, categoryHrefById, defaultCategoryHref);
  const favoritesHref = getCollectionShowAllHref(favoriteProducts, categoryHrefById, defaultCategoryHref);

  const topProductsItemList =
    topProducts.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Top productos para hogar y jardín",
          itemListOrder: "https://schema.org/ItemListOrderDescending",
          numberOfItems: topProducts.length,
          itemListElement: topProducts.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${SITE_URL}/producto/${product.slug}`,
            name: product.name,
          })),
        }
      : null;

  return (
    <>
      {topProductsItemList ? <JsonLd data={topProductsItemList} /> : null}

      <TrendingCategories categories={categories} trending={trending} />

      {topProducts.length > 0 ? (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">Top productos</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {topProducts.map((product) => {
                const realDiscount = computeDiscountPercent(product);
                const previewImage = product.images.find(Boolean) || PRODUCT_IMAGE_FALLBACK;
                return (
                  <ProductDestinationLink
                    key={product.id}
                    product={product}
                    className="group bg-card rounded-xl border border-border p-3 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
                  >
                    {realDiscount ? (
                      <span className="inline-block mb-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-deal text-deal-foreground">
                        -{realDiscount}%
                      </span>
                    ) : null}
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-secondary/50 mb-2">
                      <ProductPreviewImage src={previewImage} alt={product.name} />
                    </div>
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                    <h3 className="text-xs font-medium text-foreground line-clamp-2 leading-tight mt-0.5">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-accent text-accent" />
                      <span className="text-xs font-medium">{product.rating}</span>
                      <span className="text-[10px] text-muted-foreground">({product.reviewCount})</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-xs text-muted-foreground">desde </span>
                      <span className="text-sm font-bold text-foreground">
                        {product.minPrice.toFixed(2).replace(".", ",")} €
                      </span>
                    </div>
                    {product.originalPrice && product.originalPrice > product.minPrice ? (
                      <p className="text-xs text-muted-foreground line-through mt-0.5">
                        {product.originalPrice.toFixed(2).replace(".", ",")} €
                      </p>
                    ) : null}
                  </ProductDestinationLink>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-4">
            <PromoBanner
              title="Las mejores gangas, a un clic"
              subtitle="Muebles, decoración, electrodomésticos y mucho más con los mayores descuentos."
              cta="¡Que no se te escapen!"
              href={defaultCategoryHref}
              image="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&h=400&fit=crop"
              layout="full"
            />
            <PromoBanner
              title="Renueva tu cocina"
              subtitle="Encuentra los mejores precios en electrodomésticos y utensilios de cocina."
              cta="Explorar cocina"
              href={kitchenHref}
              image="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop"
              layout="full"
            />
          </div>
        </div>
      </section>

      {bestDeals.length > 0 ? (
        <div id="supergangas" className="scroll-mt-28">
          <ProductGrid
            products={bestDeals}
            title="🔥 Supergangas"
            subtitle="Los mayores descuentos del momento"
            showAll={dealsHref}
          />
        </div>
      ) : null}

      <TrustBlock />

      {topRatedProducts.length > 0 ? (
        <ProductGrid
          products={topRatedProducts}
          title="⭐ Mejor valorados"
          subtitle="Los productos con mejores opiniones de nuestros usuarios"
          showAll={topRatedHref}
        />
      ) : null}

      <section className="py-4">
        <div className="container mx-auto px-4">
          <PromoBanner
            title="Tu jardín, tu refugio"
            subtitle="Barbacoas, muebles de exterior y todo lo que necesitas para disfrutar al aire libre."
            cta="Explorar jardín"
            href={gardenHref}
            image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=400&fit=crop"
            layout="full"
          />
        </div>
      </section>

      <section className="py-12 bg-secondary/50">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground text-center mb-8">
            ¿Cómo funciona Homara?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-10">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.title} className="text-center">
                <div className="w-14 h-14 rounded-xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-3">
                  {step.icon}
                </div>
                <h3 className="font-display font-bold text-foreground text-sm mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-lg md:text-xl font-bold text-foreground mb-4">
              Preguntas frecuentes
            </h2>
            <dl className="divide-y divide-border rounded-xl border border-border bg-card">
              {HOMEPAGE_FAQ.map((item) => (
                <div key={item.question} className="p-4">
                  <dt className="font-semibold text-foreground text-sm mb-1">{item.question}</dt>
                  <dd className="text-sm text-muted-foreground leading-relaxed">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {bestSellers.length > 0 ? (
        <ProductGrid
          products={bestSellers}
          title="🏆 Los más vendidos"
          subtitle="Productos con mayor traccion de usuarios"
          showAll={bestSellersHref}
        />
      ) : null}

      {favoriteProducts.length > 0 ? (
        <ProductGrid
          products={favoriteProducts}
          title="❤️ Favoritos de usuarios"
          subtitle="Los productos mas guardados y recomendados"
          showAll={favoritesHref}
        />
      ) : null}

      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-gradient-hero p-8 md:p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-10 right-20 w-32 h-32 rounded-full border border-primary-foreground/10 animate-orbit" />
            </div>
            <div className="relative z-10">
              <Sparkles className="w-9 h-9 text-accent mx-auto mb-3" />
              <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
                ¿No sabes qué elegir?
              </h2>
              <p className="text-primary-foreground/80 max-w-lg mx-auto mb-5">
                Nuestro asistente inteligente te recomienda los mejores productos según tu presupuesto, estilo y necesidades.
              </p>
              <Link
                href="/asistente"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-all shadow-glow"
              >
                Probar el Asistente <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {featuredProducts.length > 0 ? (
        <ProductGrid
          products={featuredProducts}
          title="💎 Productos destacados"
          subtitle="Seleccionados por el equipo editorial"
        />
      ) : null}
    </>
  );
}

const HOW_IT_WORKS = [
  { icon: <Zap className="w-6 h-6" />, title: "Busca tu producto", desc: "Explora miles de productos organizados por categoría." },
  { icon: <Star className="w-6 h-6" />, title: "Compara precios", desc: "Ve todas las ofertas de diferentes tiendas de un vistazo." },
  { icon: <Flame className="w-6 h-6" />, title: "Compra al mejor precio", desc: "Elige la mejor oferta y compra en la tienda oficial." },
];

function ProductPreviewImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 50vw"
      className="object-contain p-2"
    />
  );
}
