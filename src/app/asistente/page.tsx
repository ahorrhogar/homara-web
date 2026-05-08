import type { Metadata } from "next";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { AssistantForm } from "@/components/assistant/AssistantForm";
import { getCategories } from "@/data/catalog/categories";
import { getProducts } from "@/data/catalog/products";

export const metadata: Metadata = {
  title: "Asistente de compras",
  description:
    "Cuéntanos qué necesitas y te recomendamos los mejores productos según tu presupuesto, estilo y prioridades.",
  alternates: { canonical: "/asistente" },
};

export const revalidate = 600;

export default async function AssistantPage() {
  const [categories, products] = await Promise.all([
    getCategories().catch(() => []),
    getProducts().catch(() => []),
  ]);

  const styles = Array.from(
    new Set(products.map((p) => p.style).filter((value): value is string => Boolean(value))),
  ).sort((a, b) => a.localeCompare(b));

  return (
    <main className="container mx-auto px-4">
      <Breadcrumb items={[{ label: "Asistente de compras" }]} />
      <AssistantForm categories={categories} styles={styles} products={products} />
    </main>
  );
}
