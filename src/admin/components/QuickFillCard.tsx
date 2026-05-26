"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export interface QuickFillResult {
  name: string | null;
  image: string | null;
  description: string | null;
  price: number | null;
  merchantId: string | null;
  merchantName: string | null;
  brandGuess: string | null;
  sourceUrl: string;
}

interface QuickFillResponse {
  ok: boolean;
  data?: QuickFillResult;
  error?: string;
}

async function quickFill(url: string): Promise<QuickFillResult> {
  const response = await fetch("/api/admin/products/quick-fill", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const payload: QuickFillResponse = await response.json();
  if (!response.ok || !payload.ok || !payload.data) {
    throw new Error(payload.error || "No se pudo leer la página");
  }
  return payload.data;
}

export interface QuickFillCardProps {
  onFilled: (result: QuickFillResult) => void;
}

export function QuickFillCard({ onFilled }: QuickFillCardProps) {
  const [url, setUrl] = useState("");

  const mutation = useMutation({
    mutationFn: quickFill,
    onSuccess: (data) => {
      onFilled(data);
      const filledCount = [data.name, data.image, data.description, data.price, data.merchantId]
        .filter((v) => v !== null && v !== "")
        .length;
      if (filledCount === 0) {
        toast.warning("No encontramos datos en esa página — rellena manualmente.");
      } else {
        toast.success(`Rellenamos ${filledCount} campo(s).`);
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Error al rellenar desde URL");
    },
  });

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4" />
          Rellenar desde URL
        </CardTitle>
        <CardDescription className="text-xs">
          Pega un enlace de Amazon, IKEA, MediaMarkt… y rellenamos los campos por ti.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-2 md:flex-row">
          <Input
            className="min-w-0 flex-1"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              if (url.trim() && !mutation.isPending) mutation.mutate(url.trim());
            }}
            placeholder="https://www.amazon.es/dp/..."
            disabled={mutation.isPending}
            type="url"
          />
          <Button
            type="button"
            variant="default"
            className="md:shrink-0"
            disabled={!url.trim() || mutation.isPending}
            onClick={() => mutation.mutate(url.trim())}
          >
            {mutation.isPending ? "Leyendo..." : "Rellenar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
