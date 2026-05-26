"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { TrackedLink } from "@/components/analytics/TrackedLink";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const Breadcrumb = ({ items }: { items: BreadcrumbItem[] }) => {
  const pathname = usePathname() ?? "/";
  return (
    <nav aria-label="Breadcrumb" className="py-3">
      <ol className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
        <li>
          <TrackedLink
            href="/"
            event="breadcrumb_clicked"
            payload={{ level: 1, from_path: pathname, to_path: "/", label: "Inicio" }}
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Inicio</span>
          </TrackedLink>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5" />
            {item.href ? (
              <TrackedLink
                href={item.href}
                event="breadcrumb_clicked"
                payload={{
                  level: i + 2,
                  from_path: pathname,
                  to_path: item.href,
                  label: item.label,
                }}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </TrackedLink>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
