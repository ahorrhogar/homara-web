"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpAdminAction } from "@/admin/_actions/auth";

export function SignUpForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await signUpAdminAction(formData);
      if (result.ok && result.redirectTo) {
        router.replace(result.redirectTo);
        return;
      }
      setErrorMessage(result.message || "No se pudo crear la cuenta.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-foreground">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          className="mt-1 w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-foreground">Contraseña</span>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={12}
          required
          className="mt-1 w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <span className="mt-1 block text-xs text-muted-foreground">Mínimo 12 caracteres.</span>
      </label>

      {errorMessage ? (
        <p className="text-sm font-medium text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Creando…" : "Crear cuenta"}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/admin/login" className="font-medium text-accent hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
