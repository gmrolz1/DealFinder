import type { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import "./globals.css";
import { magnetik } from "@/lib/fonts";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileTabBar } from "@/components/mobile-tabbar";
import { localeFromPath, isRtl } from "@/lib/i18n";
import { isStandalonePath } from "@/lib/leads";

const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID;

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
  const pathname = h.get("x-pathname") ?? "/";
  const locale = localeFromPath(pathname);
  const dir = isRtl(locale) ? "rtl" : "ltr";
  // Standalone (no DealFinder chrome): client campaign landings + dashboard.
  const standalone = isStandalonePath(pathname);

  return (
    <html lang={locale} dir={dir} className={`${magnetik.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-paper text-ink">
        {GADS_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GADS_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GADS_ID}');`}
            </Script>
          </>
        )}
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
