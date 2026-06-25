import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { magnetik } from "@/lib/fonts";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileTabBar } from "@/components/mobile-tabbar";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { ConversionTracking } from "@/components/analytics/conversion-tracking";
import { localeFromPath, isRtl } from "@/lib/i18n";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: "DealFinder — Egypt Property Marketplace",
  description:
    "Browse primary apartments, villas and chalets from trusted developers across Egypt.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const h = await headers();
  const rawPath = h.get("x-pathname") ?? "/";
  // /newcapital is the clean ad alias that rewrites to the Arabic landing —
  // normalize it so locale (RTL) and standalone chrome resolve correctly.
  const pathname = rawPath === "/newcapital" ? "/ar/new-capital" : rawPath;
  const locale = localeFromPath(pathname);
  const dir = isRtl(locale) ? "rtl" : "ltr";
  // Standalone (no DealFinder chrome) for client campaign landing pages.
  const standalone =
    pathname === "/new-capital" || pathname === "/ar/new-capital";

  return (
    <html lang={locale} dir={dir} className={`${magnetik.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        <ConversionTracking />
        {standalone ? (
          <main className="flex-1">{children}</main>
        ) : (
          <>
            <SiteHeader locale={locale} pathname={pathname} />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <SiteFooter locale={locale} />
            <MobileTabBar locale={locale} />
          </>
        )}
      </body>
    </html>
  );
}
