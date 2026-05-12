"use client";

import Image from "next/image";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import type { Category } from "@/domain/catalog/types";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { gaEvent } from "@/infrastructure/analytics/ga4";

interface FooterProps {
  categories: Category[];
}

const Footer = ({ categories }: FooterProps) => {
  const { openCookieSettings } = useCookieConsent();

  function handleCookieSettingsClick() {
    gaEvent("footer_link_clicked", { target_path: "#cookies-settings", group: "legal" });
    openCookieSettings();
  }

  const primaryCategories = categories.slice(0, 6);
  const secondaryCategories = categories.slice(6);

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <h2 className="mb-3">
              <Image
                src="/homara-logo-orange.svg"
                alt="Homara"
                width={120}
                height={40}
                className="h-10 w-auto max-w-full"
              />
            </h2>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              El comparador de precios especializado en hogar para España. Ahorra tiempo y dinero en tus compras.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3 text-primary-foreground/90">Categorías</h3>
            <ul className="space-y-1.5">
              {primaryCategories.map((c, i) => (
                <li key={c.id}>
                  <TrackedLink
                    href={`/categoria/${c.slug}`}
                    event="footer_link_clicked"
                    payload={{ target_path: `/categoria/${c.slug}`, group: "categorias", position: i + 1 }}
                    className="text-sm text-primary-foreground/60 hover:text-accent transition-colors"
                  >
                    {c.name}
                  </TrackedLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3 text-primary-foreground/90">Más categorías</h3>
            <ul className="space-y-1.5">
              {secondaryCategories.map((c, i) => (
                <li key={c.id}>
                  <TrackedLink
                    href={`/categoria/${c.slug}`}
                    event="footer_link_clicked"
                    payload={{
                      target_path: `/categoria/${c.slug}`,
                      group: "mas_categorias",
                      position: i + 1,
                    }}
                    className="text-sm text-primary-foreground/60 hover:text-accent transition-colors"
                  >
                    {c.name}
                  </TrackedLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3 text-primary-foreground/90">Información</h3>
            <ul className="space-y-1.5">
              <li>
                <TrackedLink
                  href="/acerca-de"
                  event="footer_link_clicked"
                  payload={{ target_path: "/acerca-de", group: "informacion", position: 1 }}
                  className="text-sm text-primary-foreground/60 hover:text-accent transition-colors"
                >
                  Acerca de Homara
                </TrackedLink>
              </li>
              <li>
                <TrackedLink
                  href="/blog"
                  event="footer_link_clicked"
                  payload={{ target_path: "/blog", group: "informacion", position: 2 }}
                  className="text-sm text-primary-foreground/60 hover:text-accent transition-colors"
                >
                  Guías de compra
                </TrackedLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3 text-primary-foreground/90">Legal</h3>
            <ul className="space-y-1.5">
              <li>
                <TrackedLink
                  href="/politica-privacidad"
                  event="footer_link_clicked"
                  payload={{ target_path: "/politica-privacidad", group: "legal", position: 1 }}
                  className="text-sm text-primary-foreground/60 hover:text-accent transition-colors"
                >
                  Política de privacidad
                </TrackedLink>
              </li>
              <li>
                <TrackedLink
                  href="/aviso-legal"
                  event="footer_link_clicked"
                  payload={{ target_path: "/aviso-legal", group: "legal", position: 2 }}
                  className="text-sm text-primary-foreground/60 hover:text-accent transition-colors"
                >
                  Aviso legal
                </TrackedLink>
              </li>
              <li>
                <TrackedLink
                  href="/cookies"
                  event="footer_link_clicked"
                  payload={{ target_path: "/cookies", group: "legal", position: 3 }}
                  className="text-sm text-primary-foreground/60 hover:text-accent transition-colors"
                >
                  Política de cookies
                </TrackedLink>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleCookieSettingsClick}
                  className="text-sm text-primary-foreground/60 hover:text-accent transition-colors"
                >
                  Configuración de cookies
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-primary-foreground/50">
          <p>© {new Date().getFullYear()} Homara. Todos los derechos reservados.</p>
          <p>Los precios y disponibilidad pueden variar. Homara no vende productos directamente.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
