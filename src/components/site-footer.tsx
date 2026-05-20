import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { BrandIcon } from "@/components/brand-icon";
import { type Locale, t, localizedPath } from "@/lib/i18n";

const FACEBOOK = "https://www.facebook.com/profile.php?id=61552295002435";

export function SiteFooter({ locale = "en" }: { locale?: Locale }) {
  const isAr = locale === "ar";
  return (
    <footer className="border-t border-data bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <span className="flex items-center gap-2">
              <BrandIcon className="h-[17px] w-auto" />
              <Wordmark className="text-[17px]" />
            </span>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-slate">
              {isAr
                ? "سوق العقارات في مصر — وحدات أولية من مطوّرين موثوقين."
                : "Egypt’s property marketplace — primary homes from trusted developers."}
            </p>
            <a
              href={FACEBOOK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block border border-data px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-slate transition hover:border-ink hover:text-ink"
            >
              {isAr ? "فيسبوك ↗" : "Facebook ↗"}
            </a>
          </div>
          <nav className="grid grid-cols-2 gap-x-12 gap-y-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate">
            <Link href={localizedPath("/properties", locale)} className="hover:text-ink">
              {t("nav.properties", locale)}
            </Link>
            <Link href={localizedPath("/areas", locale)} className="hover:text-ink">
              {t("nav.areas", locale)}
            </Link>
            <Link href={localizedPath("/developers", locale)} className="hover:text-ink">
              {t("nav.developers", locale)}
            </Link>
            <Link href={localizedPath("/new-launches", locale)} className="hover:text-ink">
              {t("nav.newLaunches", locale)}
            </Link>
          </nav>
        </div>
        <p className="mt-10 border-t border-data pt-6 text-[10px] uppercase tracking-[0.08em] text-taupe">
          {isAr
            ? `© ${new Date().getFullYear()} DealFinder · إصدار تجريبي — بيانات معروضة لأغراض العرض`
            : `© ${new Date().getFullYear()} DealFinder · MVP build — listing data shown for demonstration`}
        </p>
      </div>
    </footer>
  );
}
