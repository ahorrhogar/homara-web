"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRODUCT_IMAGE_FALLBACK } from "@/lib/productImage";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  badge: { kind: "discount"; value: number } | { kind: "deal" } | null;
}

export function ProductGallery({ images, productName, badge }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const galleryImages = images.length ? images : [PRODUCT_IMAGE_FALLBACK];
  const hasMultipleImages = galleryImages.length > 1;
  const clamped = Math.min(selectedIndex, galleryImages.length - 1);
  const selectedImage = galleryImages[clamped] || PRODUCT_IMAGE_FALLBACK;

  function prev() {
    setSelectedIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length);
  }

  function next() {
    setSelectedIndex((current) => (current + 1) % galleryImages.length);
  }

  return (
    <div className="min-w-0 space-y-3">
      <div className="bg-secondary/30 rounded-2xl p-8 flex items-center justify-center aspect-square relative overflow-hidden">
        <Image
          src={selectedImage}
          alt={`${productName} — imagen ${clamped + 1}`}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain rounded-lg p-8"
        />

        {hasMultipleImages ? (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute left-3 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-background/90"
              onClick={prev}
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-3 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-background/90"
              onClick={next}
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        ) : null}

        {badge?.kind === "discount" ? (
          <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-deal text-deal-foreground text-sm font-bold">
            <TrendingDown className="w-4 h-4" />
            -{badge.value}%
          </span>
        ) : null}
        {badge?.kind === "deal" ? (
          <span className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-deal text-deal-foreground text-sm font-bold">
            Oferta
          </span>
        ) : null}
      </div>

      {hasMultipleImages ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {galleryImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition ${
                index === clamped ? "border-accent shadow-sm" : "border-border hover:border-accent/60"
              }`}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <Image
                src={image || PRODUCT_IMAGE_FALLBACK}
                alt={`${productName} miniatura ${index + 1}`}
                width={64}
                height={64}
                sizes="64px"
                className="h-full w-full object-contain p-1"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
