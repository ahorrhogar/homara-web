"use client";

import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { gaEvent, type GaEventParams } from "@/infrastructure/analytics/ga4";

type TrackedLinkProps = ComponentProps<typeof Link> & {
  event: string;
  payload?: GaEventParams;
  children: ReactNode;
};

export function TrackedLink({ event, payload, onClick, children, ...rest }: TrackedLinkProps) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    gaEvent(event, payload);
    onClick?.(e);
  }
  return (
    <Link {...rest} onClick={handleClick}>
      {children}
    </Link>
  );
}
