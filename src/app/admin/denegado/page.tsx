import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceso denegado",
  robots: { index: false, follow: false },
};

export default function AdminDeniedPage() {
  return (
    <main className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-bold text-primary">Acceso denegado</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Tu sesión está activa pero no tienes permisos de administrador.
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
