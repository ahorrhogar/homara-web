import Link from "next/link";
import type { Metadata } from "next";

// Root-level 404 boundary. Rendered for requests that resolve outside the
// `[locale]` segment (e.g. an unknown locale, where the locale layout calls
// notFound()). It has no locale context, so copy is plain Spanish and it links
// with `next/link`. Localized 404s for paths *inside* a valid locale are handled
// by `src/app/[locale]/not-found.tsx`.
export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent">404</p>
      <h1 className="mt-2 font-display text-4xl font-bold text-primary">Página no encontrada</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        La URL que has intentado abrir no existe o ya no está disponible.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
