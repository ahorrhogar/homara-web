import type { Metadata } from "next";
import { SignUpForm } from "@/admin/components/SignUpForm";

export const metadata: Metadata = {
  title: "Crear cuenta de administrador",
  robots: { index: false, follow: false },
};

export default function AdminSignUpPage() {
  return (
    <main className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg">
        <h1 className="font-display text-2xl font-bold text-primary">Crear cuenta de administrador</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Solo los correos autorizados pueden registrarse para gestionar Homara.
        </p>
        <SignUpForm />
      </div>
    </main>
  );
}
