// CTA anchor for /api/go redirects. A plain <a> — NEVER next/link, because
// prefetch would fire lead assignments. Conversion events are handled
// site-wide by <ConversionTracking>'s delegated click listener (it matches
// /api/go hrefs), so no onClick is needed here. Server component.

import type { AnchorHTMLAttributes, ReactNode } from "react";

export function GoLink({
  href,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
}) {
  return (
    <a href={href} rel="nofollow" {...rest}>
      {children}
    </a>
  );
}
