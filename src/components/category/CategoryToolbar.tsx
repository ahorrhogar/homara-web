"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import type { ProductSortBy } from "@/domain/catalog/types";

const SORT_OPTIONS: Array<{ value: ProductSortBy; label: string }> = [
  { value: "popular", label: "Más populares" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "discount", label: "Mayor descuento" },
  { value: "rating", label: "Mejor valorados" },
  { value: "newest", label: "Más recientes" },
];

interface CategoryToolbarProps {
  totalProducts: number;
  defaultSort?: ProductSortBy;
}

export function CategoryToolbar({ totalProducts, defaultSort = "popular" }: CategoryToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = (searchParams?.get("orden") as ProductSortBy) || defaultSort;

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value;
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (next === defaultSort) {
      params.delete("orden");
    } else {
      params.set("orden", next);
    }
    const query = params.toString();
    router.replace(query ? `?${query}` : "?");
  }

  return (
    <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
      <span className="text-sm text-muted-foreground">{totalProducts} productos</span>

      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
        <select
          value={currentSort}
          onChange={handleChange}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-card focus:outline-none focus:ring-2 focus:ring-accent/50"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
