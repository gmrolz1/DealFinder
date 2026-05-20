// Deal / conversion calculations shared by the new cards.
//
// Only factual derivations from data we already have — no scraped pricing
// promises. Returns null when a calculation is not safe to show.

import type { EnrichedUnit, Compound } from "./data";

/** Rough monthly payment: price / years / 12. No interest factored in. */
export function monthlyPayment(unit: EnrichedUnit): number | null {
  if (!unit.price || !unit.installment_years || unit.installment_years <= 0) {
    return null;
  }
  return Math.round(unit.price / unit.installment_years / 12);
}

/** Down payment as a whole-number percentage of total price. */
export function downPaymentPct(unit: EnrichedUnit): number | null {
  if (!unit.price || !unit.down_payment || unit.down_payment <= 0) return null;
  const pct = Math.round((unit.down_payment / unit.price) * 100);
  // Filter obviously bad data (some compounds list 100%+ "down" by accident).
  return pct > 0 && pct <= 80 ? pct : null;
}

/** Compact YYYY from ready_by, which may be int (YYYYMMDD) or ISO string. */
export function readyYear(
  ready: string | number | null | undefined
): string | null {
  if (ready == null) return null;
  if (typeof ready === "number") {
    const s = String(ready);
    if (s.length === 8) return s.slice(0, 4);
    if (s.length === 4) return s;
    return null;
  }
  const d = new Date(ready);
  return Number.isNaN(d.getTime()) ? null : String(d.getFullYear());
}

/** Compact EGP format: 4.5M, 850K, 1,200. */
export function formatPriceCompact(n: number | null | undefined): string {
  if (n == null || n <= 0) return "—";
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `EGP ${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (n >= 1000) return `EGP ${Math.round(n / 1000)}K`;
  return `EGP ${n.toLocaleString("en-US")}`;
}

/** Build a WhatsApp deep link for the brand number with a prefilled message. */
export function whatsappHref(
  brandNumber: string,
  message: string
): string {
  const cleanNum = brandNumber.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`;
}

/** Deal badges to render on a unit card. Order = visual priority. */
export type DealBadge = {
  key: string;
  label: string;
  /** "primary" = white background black border; "highlight" = inverted */
  tone: "primary" | "highlight";
};

export function unitDealBadges(unit: EnrichedUnit): DealBadge[] {
  const badges: DealBadge[] = [];
  const pct = downPaymentPct(unit);
  if (pct !== null && pct <= 15) {
    badges.push({
      key: "down",
      label: `${pct}% DOWN`,
      tone: pct <= 5 ? "highlight" : "primary",
    });
  }
  const year = readyYear(unit.ready_by);
  if (year) {
    const yr = parseInt(year, 10);
    const now = new Date().getFullYear();
    if (!Number.isNaN(yr) && yr >= now) {
      badges.push({
        key: "ready",
        label: yr <= now + 1 ? `READY ${year}` : `DELIVERS ${year}`,
        tone: "primary",
      });
    }
  }
  return badges;
}

/** Compound-level deal badges using all units in the compound. */
export function compoundDealBadges(
  compound: Compound,
  units: EnrichedUnit[]
): DealBadge[] {
  const badges: DealBadge[] = [];
  // Lowest down payment % across units.
  const downs = units
    .map(downPaymentPct)
    .filter((x): x is number => x !== null);
  if (downs.length > 0) {
    const min = Math.min(...downs);
    if (min <= 15) {
      badges.push({
        key: "down",
        label: `FROM ${min}% DOWN`,
        tone: min <= 5 ? "highlight" : "primary",
      });
    }
  }
  const year = readyYear(compound.ready_by);
  if (year) {
    badges.push({ key: "ready", label: `READY ${year}`, tone: "primary" });
  }
  return badges;
}
