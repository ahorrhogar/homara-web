import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { signOutAdminAction } from "@/admin/_actions/auth";
import { auth } from "@/lib/auth";
import { isSuperadmin } from "@/lib/superadmin";

export const metadata: Metadata = {
  title: { default: "Admin · Homara", template: "%s · Admin · Homara" },
  robots: { index: false, follow: false },
};

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Productos" },
  { href: "/admin/offers", label: "Ofertas" },
  { href: "/admin/categories", label: "Categorías" },
  { href: "/admin/brands", label: "Marcas" },
  { href: "/admin/merchants", label: "Tiendas" },
  { href: "/admin/articles", label: "Artículos" },
  { href: "/admin/imports", label: "Importaciones" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/audit", label: "Auditoría" },
  { href: "/admin/settings", label: "Ajustes" },
] as const;

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/admin/login");
  if (!isSuperadmin(session.user.email)) redirect("/admin/denegado");
  const email = session.user.email ?? "";

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card lg:block">
        <div className="px-6 py-5">
          <Link href="/admin" className="font-display text-lg font-bold tracking-tight text-primary">
            Homara Admin
          </Link>
          {email ? <p className="mt-1 truncate text-xs text-muted-foreground">{email}</p> : null}
        </div>
        <nav className="px-3 pb-6">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <form action={signOutAdminAction} className="mt-6 px-3">
            <button
              type="submit"
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Cerrar sesión
            </button>
          </form>
        </nav>
      </aside>

      <main className="flex-1 px-4 py-6 lg:px-8">
        <div className="lg:hidden">
          <details className="mb-4 rounded-lg border border-border bg-card p-3">
            <summary className="cursor-pointer text-sm font-medium">Menú</summary>
            <ul className="mt-3 space-y-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block rounded px-2 py-1.5 text-sm text-muted-foreground hover:bg-secondary">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2">
                <form action={signOutAdminAction}>
                  <button type="submit" className="w-full rounded border border-border px-2 py-1.5 text-sm">
                    Cerrar sesión
                  </button>
                </form>
              </li>
            </ul>
          </details>
        </div>
        {children}
      </main>
    </div>
  );
}
