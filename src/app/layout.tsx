import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { magnetik } from "@/lib/fonts";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileTabBar } from "@/components/mobile-tabbar";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { ConversionTracking } from "@/components/analytics/conversion-tracking";
import { HtmlLangSync } from "@/components/html-lang-sync";
import { localeFromPath, isRtl } from "@/lib/i18n";
import { isStandalonePath } from "@/lib/leads";

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
  // /newcapital and /tagamo3 are clean ad aliases that rewrite to the Arabic
  // landings — normalize them so locale (RTL) and standalone chrome resolve.
  const AD_ALIASES: Record<string, string> = {
    "/newcapital": "/ar/new-capital",
    "/tagamo3": "/ar/fifth-settlement",
  };
  const pathname = AD_ALIASES[rawPath] ?? rawPath;
  const locale = localeFromPath(pathname);
  const dir = isRtl(locale) ? "rtl" : "ltr";
  // Standalone (no DealFinder chrome): campaign landings + dashboard.
  const standalone = isStandalonePath(pathname);

  return (
    <html lang={locale} dir={dir} className={`${magnetik.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        <ConversionTracking />
        <HtmlLangSync />
        {standalone ? (
          <main className="flex-1">{children}</main>
        ) : (
          <>
            <SiteHeader />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <SiteFooter />
            <MobileTabBar />
          </>
        )}
      </body>
    </html>
  );
}
