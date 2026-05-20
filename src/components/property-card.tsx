// Re-export v2 as the canonical PropertyCard.
//
// Every page that imports `@/components/property-card` now gets the
// conversion-optimized v2 design: multi-image carousel (aggregated from
// the same compound), deal-breakdown grid (Total + Down/Monthly/Plan),
// minimalist specs, SmartCTA chat preview + Call + WhatsApp.
//
// The v2 source still lives under preview/ for now — its history was
// developed there. A follow-up will move it to components/ proper.

export { PropertyCardV2 as PropertyCard } from "./preview/property-card-v2";
