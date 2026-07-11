"use client";

// Keeps <html lang/dir> in sync with the live pathname. The root layout sets
// them correctly on the initial server render (from x-pathname), but never
// re-renders on client navigation — so without this, switching to /ar via a
// client-side <Link> would leave the document stuck at lang=en / dir=ltr
// until a hard refresh. This effect flips it on every navigation.

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { localeFromPath, isRtl } from "@/lib/i18n";

export function HtmlLangSync() {
  const pathname = usePathname();
  useEffect(() => {
    const locale = localeFromPath(pathname || "/");
    const el = document.documentElement;
    el.lang = locale;
    el.dir = isRtl(locale) ? "rtl" : "ltr";
  }, [pathname]);
  return null;
}
