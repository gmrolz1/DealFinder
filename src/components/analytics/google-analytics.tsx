// Google Analytics 4 loader. Loads gtag.js site-wide via next/script (no extra
// dependency). The measurement ID comes from NEXT_PUBLIC_GA_ID — when it's
// unset (e.g. local dev without analytics), this renders nothing, so the site
// works with or without GA configured.
//
// Conversion flow: GA4 receives the lead events fired by <ConversionTracking>,
// you mark them as key events in GA4, then import them into Google Ads.

import Script from "next/script";

// Google Ads conversion tag — "the deal makers" account (386-792-3119).
// Public ID; powers the WhatsApp/Call lead conversion fired in
// conversion-tracking.tsx. Loaded alongside GA4 on the same gtag.js.
export const GOOGLE_ADS_ID = "AW-18195355585";

export function GoogleAnalytics({ gaId }: { gaId?: string }) {
  if (!gaId) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>
    </>
  );
}
