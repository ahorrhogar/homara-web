"use client";

import Image from "next/image";
import Link from "next/link";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import type { Category } from "@/domain/catalog/types";

interface FooterProps {
  categories: Category[];
}

const Footer = ({ categories }: FooterProps) => {
  const { openCookieSettings } = useCookieConsent();

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
              {categories.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/categoria/${c.slug}`}
                    className="text-sm text-primary-foreground/60 hover:text-accent transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3 text-primary-foreground/90">Más categorías</h3>
            <ul className="space-y-1.5">
              {categories.slice(6).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/categoria/${c.slug}`}
                    className="text-sm text-primary-foreground/60 hover:text-accent transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3 text-primary-foreground/90">Información</h3>
            <ul className="space-y-1.5">
              <li>
                <Link href="/acerca-de" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">
                  Acerca de Homara
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">
                  Guías de compra
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3 text-primary-foreground/90">Legal</h3>
            <ul className="space-y-1.5">
              <li>
                <Link
                  href="/politica-privacidad"
                  className="text-sm text-primary-foreground/60 hover:text-accent transition-colors"
                >
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link href="/aviso-legal" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">
                  Aviso legal
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">
                  Política de cookies
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCookieSettings}
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
