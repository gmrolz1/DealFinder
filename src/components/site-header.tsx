import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { BrandIcon } from "@/components/brand-icon";
import { type Locale, t, localizedPath, switchLocaleHref } from "@/lib/i18n";

const NAV_KEYS: [string, string][] = [
  ["nav.properties", "/properties"],
  ["nav.areas", "/areas"],
  ["nav.developers", "/developers"],
  ["nav.newLaunches", "/new-launches"],
];

export function SiteHeader({
  locale = "en",
  pathname = "/",
}: {
  locale?: Locale;
  pathname?: string;
}) {
  const otherLocale: Locale = locale === "ar" ? "en" : "ar";
  const otherLabel = otherLocale === "ar" ? "عربي" : "EN";
  const switchHref = switchLocaleHref(pathname, otherLocale);
  return (
    <header className="sticky top-0 z-50 border-b border-data bg-paper">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href={localizedPath("/", locale)}
          className="flex items-center gap-2"
        >
          <BrandIcon className="h-[19px] w-auto" />
          <Wordmark className="text-[18px]" />
        </Link>

        <nav className="hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.09em] text-slate md:flex">
          {NAV_KEYS.map(([key, href]) => (
            <Link
              key={href}
              href={localizedPath(href, locale)}
              className="transition hover:text-ink"
            >
              {t(key, locale)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={switchHref}
            className="border border-data px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate transition hover:border-ink hover:text-ink"
            aria-label={`Switch to ${otherLocale}`}
          >
            {otherLabel}
          </Link>
          <Link
            href={localizedPath("/properties", locale)}
            className="border border-ink bg-ink px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.07em] text-paper transition hover:bg-paper hover:text-ink"
          >
            {locale === "ar" ? "تصفّح" : "Browse"}
          </Link>
        </div>
      </div>
    </header>
  );
}
