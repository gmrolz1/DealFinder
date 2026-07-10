// Google Ads conversion helper (client-side). No-ops unless
// NEXT_PUBLIC_GADS_ID is configured, so the site works with or without a
// linked Ads account. Uses beacon transport so the hit survives the
// navigation that immediately follows a CTA click.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID ?? "";
const LEAD_LABEL = process.env.NEXT_PUBLIC_GADS_LEAD_LABEL ?? "";

/** Fire a lead conversion. transaction_id (our lead uuid) dedupes on the
 * Ads side when we know it; click CTAs fire without one (pre-redirect). */
export function fireLeadConversion(leadId?: string): void {
  if (!GADS_ID || !LEAD_LABEL || typeof window === "undefined" || !window.gtag)
    return;
  window.gtag("event", "conversion", {
    send_to: `${GADS_ID}/${LEAD_LABEL}`,
    transport_type: "beacon",
    ...(leadId ? { transaction_id: leadId } : {}),
  });
}
