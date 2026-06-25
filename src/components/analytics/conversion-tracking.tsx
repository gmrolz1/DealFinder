// Fires GA4 lead events whenever a visitor clicks a WhatsApp or Call link,
// anywhere on the site. Uses one delegated click listener so we don't have to
// wire onClick into every button. The events GA4 receives:
//
//   whatsapp_lead  — clicked any wa.me / WhatsApp link
//   call_lead      — clicked any tel: link
//
// Mark these as Key Events in GA4, then import them into Google Ads as
// conversions. No-ops safely if gtag isn't loaded (NEXT_PUBLIC_GA_ID unset).

"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function ConversionTracking() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const link = target?.closest?.("a");
      if (!link) return;
      const href = link.getAttribute("href") || "";

      let event: string | null = null;
      let method: string | null = null;
      if (href.includes("wa.me/") || href.includes("api.whatsapp.com")) {
        event = "whatsapp_lead";
        method = "whatsapp";
      } else if (href.startsWith("tel:")) {
        event = "call_lead";
        method = "call";
      }
      if (!event || typeof window.gtag !== "function") return;

      window.gtag("event", event, {
        method,
        // send before the browser navigates away (tel:/app handoff)
        transport_type: "beacon",
        page_path:
          typeof location !== "undefined" ? location.pathname : undefined,
        link_url: href,
      });
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
