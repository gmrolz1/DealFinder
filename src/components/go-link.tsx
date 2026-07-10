"use client";

// CTA anchor for /api/go redirects. A plain <a> (NEVER next/link — prefetch
// would fire lead assignments) that also fires the Ads conversion beacon on
// click without blocking navigation.

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { fireLeadConversion } from "@/lib/gtag";

export function GoLink({
  href,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      onClick={() => fireLeadConversion()}
      rel="nofollow"
      {...rest}
    >
      {children}
    </a>
  );
}
