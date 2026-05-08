import Link from "next/link";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ProductCard from "@/components/product/ProductCard";
import CategorySeoBlock from "@/components/editorial/CategorySeoBlock";
import { CategoryToolbar } from "@/components/category/CategoryToolbar";
import type { Category, Product, Subcategory } from "@/domain/catalog/types";
import type { CategorySeoDocument } from "@/domain/catalog/category-seo";

interface CategoryViewProps {
  category: Category;
  subcategory?: Subcategory;
  products: Product[];
  seoDocument: CategorySeoDocument | null;
}

export function CategoryView({ category, subcategory, products, seoDocument }: CategoryViewProps) {
  const breadcrumbs = [
    { label: category.name, href: subcategory ? `/categoria/${category.slug}` : undefined },
    ...(subcategory ? [{ label: subcategory.name }] : []),
  ];

  return (
    <main className="container mx-auto px-4">
      <Breadcrumb items={breadcrumbs} />

      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          {seoDocument?.h1 || (subcategory ? subcategory.name : category.name)}
        </h1>
        <p className="text-muted-foreground mt-1">{category.description}</p>
      </div>

      {!subcategory && category.subcategories.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-6">
          {category.subcategories.map((sub) => (
            <Link
              key={sub.id}
              href={`/categoria/${category.slug}/${sub.slug}`}
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:border-accent hover:text-accent transition-colors bg-card"
            >
              {sub.name}
              <span className="ml-1.5 text-xs text-muted-foreground">({sub.productCount})</span>
            </Link>
          ))}
        </div>
      ) : null}

      <CategoryToolbar totalProducts={products.length} />

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg mb-2">No se encontraron productos</p>
          <p className="text-sm text-muted-foreground">Vuelve pronto: actualizamos el catálogo a diario.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {seoDocument ? <CategorySeoBlock document={seoDocument} /> : null}
    </main>
  );
}
