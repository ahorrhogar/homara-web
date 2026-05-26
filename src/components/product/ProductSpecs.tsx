"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ProductSpec } from "@/domain/catalog/types";

const SPEC_VALUE_PREVIEW_LENGTH = 160;

function SpecValue({ value }: { value: string }) {
  const [expanded, setExpanded] = useState(false);
  const normalized = value.trim();
  const shouldTruncate = normalized.length > SPEC_VALUE_PREVIEW_LENGTH;
  const display = shouldTruncate && !expanded
    ? `${normalized.slice(0, SPEC_VALUE_PREVIEW_LENGTH).trimEnd()}...`
    : normalized;

  return (
    <div className="min-w-0 text-right">
      <span className="font-medium text-foreground min-w-0 break-words leading-snug">{display}</span>
      {shouldTruncate ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          className="mt-1 block w-full text-right text-xs font-medium text-accent hover:underline"
        >
          {expanded ? "Leer menos" : "Leer más"}
        </button>
      ) : null}
    </div>
  );
}

export function ProductSpecs({ specs }: { specs: ProductSpec[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? specs : specs.slice(0, 4);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="font-semibold text-foreground mb-3">Especificaciones</h3>
      <dl className="space-y-2 text-sm">
        {visible.map((spec) => (
          <div key={spec.label} className="flex justify-between gap-3 border-b border-border/50 pb-2 last:border-0">
            <dt className="text-muted-foreground">{spec.label}</dt>
            <dd className="font-medium text-foreground text-right max-w-[60%]">
              <SpecValue value={spec.value} />
            </dd>
          </div>
        ))}
      </dl>
      {specs.length > 4 ? (
        <button
          type="button"
          onClick={() => setShowAll((current) => !current)}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          {showAll ? (
            <>
              Ver menos <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Ver todas las especificaciones ({specs.length}) <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      ) : null}
    </div>
  );
}
