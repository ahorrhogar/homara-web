import type { Metadata } from "next";
import { LoginForm } from "@/admin/components/LoginForm";

export const metadata: Metadata = {
  title: "Acceso administrador",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  return (
    <main className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg">
        <h1 className="font-display text-2xl font-bold text-primary">Acceso administrador</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Inicia sesión para gestionar el catálogo de Homara.
        </p>
        <LoginFormWrapper searchParams={searchParams} />
      </div>
    </main>
  );
}

async function LoginFormWrapper({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const params = await searchParams;
  return <LoginForm redirectTo={params.from || "/admin"} />;
}
