"use client";

import Link, { type LinkProps } from "next/link";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { gaEvent, type GaEventParams } from "@/infrastructure/analytics/ga4";

type AnchorProps = Omit<ComponentProps<"a">, keyof LinkProps>;

interface TrackedLinkProps extends LinkProps, AnchorProps {
  event: string;
  payload?: GaEventParams;
  children: ReactNode;
}

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
