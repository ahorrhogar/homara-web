"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import type { MouseEvent } from "react";

interface PromoBannerProps {
  title: string;
  subtitle: string;
  cta: string;
  href?: string;
  resolveHref?: () => string;
  image: string;
  /** 'left' = text left image right, 'right' = opposite, 'full' = full-width image bg */
  layout?: "left" | "right" | "full";
  className?: string;
}

const PromoBanner = ({
  title,
  subtitle,
  cta,
  href,
  resolveHref,
  image,
  layout = "left",
  className = "",
}: PromoBannerProps) => {
  const router = useRouter();
  const targetHref = href || "/";

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!resolveHref) {
      return;
    }

    event.preventDefault();
    const nextHref = resolveHref();
    router.push(nextHref || targetHref);
  };

  if (layout === "full") {
    return (
      <Link
        href={targetHref}
        onClick={handleClick}
        className={`group block relative rounded-2xl overflow-hidden h-[200px] md:h-[240px] ${className}`}
      >
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
          <h3 className="text-white font-display text-xl md:text-2xl font-bold mb-1">{title}</h3>
          <p className="text-white/80 text-sm mb-3 max-w-md">{subtitle}</p>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent group-hover:gap-2.5 transition-all">
            {cta} <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </Link>
    );
  }

  const isRight = layout === "right";

  return (
    <Link
      href={targetHref}
      onClick={handleClick}
      className={`group block rounded-2xl overflow-hidden border border-border bg-card hover:shadow-card-hover transition-all duration-300 ${className}`}
    >
      <div className={`flex flex-col ${isRight ? "md:flex-row-reverse" : "md:flex-row"} h-full`}>
        <div className="md:w-1/2 h-[160px] md:h-[220px] relative overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>
        <div className="md:w-1/2 flex flex-col justify-center p-5 md:p-7">
          <h3 className="font-display text-lg md:text-xl font-bold text-foreground mb-1.5">{title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{subtitle}</p>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent group-hover:gap-2.5 transition-all">
            {cta} <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PromoBanner;
