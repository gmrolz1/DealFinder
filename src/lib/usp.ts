// USP titles — generate a punchy headline for each unit / compound based on
// its strongest selling points. Replaces the generic "Townhouse, X" titles
// with deal-driven copy a buyer actually reads.
//
// The order in scoreSignals() is the priority order. We pick the top 2
// signals so the headline stays short and scannable on small cards.

import type { EnrichedUnit, Compound, WithCount, Unit } from "./data";
import type { Locale } from "./i18n";
import { downPaymentPct, readyYear, formatPriceCompact } from "./conversion";

type Signal = { en: string; ar: string };

function scoreSignals(unit: EnrichedUnit): Signal[] {
  const out: Signal[] = [];

  // 1. Low down payment (top priority — biggest conversion lever)
  const down = downPaymentPct(unit);
  if (down != null && down <= 10) {
    out.push({ en: `${down}% DOWN`, ar: `${down}% مقدم فقط` });
  }

  // 2. Long installment plan (8+ years)
  if (unit.installment_years && unit.installment_years >= 8) {
    out.push({
      en: `${unit.installment_years}-YR PLAN`,
      ar: `تقسيط ${unit.installment_years} سنوات`,
    });
  }

  // 3. Near-term delivery (ready in next 2 years)
  const year = readyYear(unit.ready_by);
  if (year) {
    const yr = parseInt(year, 10);
    const now = new Date().getFullYear();
    if (!Number.isNaN(yr) && yr >= now) {
      if (yr <= now + 1) {
        out.push({ en: `READY ${year}`, ar: `استلام ${year}` });
      } else if (yr <= now + 3) {
        out.push({ en: `DELIVERS ${year}`, ar: `تسليم ${year}` });
      }
    }
  }

  // 4. Fully finished
  if (unit.finishing) {
    const f = unit.finishing.toLowerCase();
    if (
      f === "finished" ||
      f === "fully_finished" ||
      f === "fully finished" ||
      f === "with acs"
    ) {
      out.push({ en: "FULLY FINISHED", ar: "تشطيب كامل" });
    }
  }

  // 5. Spacious unit (200+ sqm)
  if (unit.area_sqm && unit.area_sqm >= 200) {
    out.push({
      en: `SPACIOUS ${unit.area_sqm} M²`,
      ar: `مساحة ${unit.area_sqm} م²`,
    });
  }

  // 6. Premium developer (well-known brand)
  const premiumDevs = new Set([
    "sodic",
    "palm hills developments",
    "mountain view",
    "saudi egyptian developers (sed)",
    "tatweer misr",
    "city edge developments",
    "madinet masr",
    "ora developers",
  ]);
  if (
    unit.developerName &&
    premiumDevs.has(unit.developerName.toLowerCase())
  ) {
    out.push({
      en: `BY ${unit.developerName.toUpperCase().replace(/\s+DEVELOPMENTS?$/i, "")}`,
      ar: `${unit.developerNameAr ?? unit.developerName}`,
    });
  }

  return out;
}

/** PropertyFinder-style listing title — a unique, descriptive headline per
 * unit: "{beds} BR {type} in {compound} | {usp} | {usp}". Leads with what +
 * where (what a buyer scans for), then appends the unit's strongest selling
 * points. Every unit gets a distinct title driven by its own facts. */
export function unitListingTitle(unit: EnrichedUnit, locale: Locale): string {
  const isAr = locale === "ar";

  // Prefer a Gemini-generated, uniquely-phrased ad title when one exists for
  // this unit (scripts/gen-usp-titles.mjs → scraper/data/usp-titles.json).
  // Falls back to the deterministic template below when absent.
  const generated = isAr ? unit.uspTitleAr : unit.uspTitleEn;
  if (generated && generated.trim()) return generated.trim();

  const type =
    (isAr ? unit.property_type_ar ?? unit.property_type : unit.property_type) ??
    (isAr ? "وحدة" : "Property");
  const where = isAr
    ? unit.compoundNameAr ?? unit.compoundName ?? unit.areaNameAr ?? unit.areaName
    : unit.compoundName ?? unit.areaName;
  const beds = unit.bedrooms;

  // Base: "3 BR Apartment" (en) / "شقة 3 غرف" (ar). Studios (0 beds) drop the
  // count. Arabic uses correct grammatical number: غرفة (1), غرفتين (2), غرف (3+).
  let base: string;
  if (isAr) {
    let bedsAr = "";
    if (beds === 1) bedsAr = " غرفة";
    else if (beds === 2) bedsAr = " غرفتين";
    else if (beds && beds > 2) bedsAr = ` ${beds} غرف`;
    base = `${type}${bedsAr}`;
  } else {
    base = beds && beds > 0 ? `${beds} BR ${type}` : type;
  }
  if (where) base += isAr ? ` في ${where}` : ` in ${where}`;

  // Append up to 2 of the unit's strongest USP signals.
  const signals = scoreSignals(unit)
    .slice(0, 2)
    .map((s) => (isAr ? s.ar : s.en));

  return [base, ...signals].join(" | ");
}

/** Headline for a property card / detail page hero. 1–2 signals max. */
export function unitUSP(unit: EnrichedUnit, locale: Locale): string {
  const signals = scoreSignals(unit);
  if (signals.length === 0) {
    // Fallback — at least say what + where, capitalized.
    const what = locale === "ar" ? unit.property_type_ar : unit.property_type;
    const where = locale === "ar" ? unit.areaNameAr : unit.areaName;
    if (what && where) {
      return locale === "ar"
        ? `${what} في ${where}`
        : `${what.toUpperCase()} IN ${where.toUpperCase()}`;
    }
    return locale === "ar" ? "صفقة جديدة" : "FRESH LISTING";
  }
  const top = signals.slice(0, 2);
  return top.map((s) => (locale === "ar" ? s.ar : s.en)).join(" · ");
}

/** Compound-level USP — derived from min stats across its units. */
export function compoundUSP(
  compound: WithCount<Compound>,
  units: Unit[],
  locale: Locale
): string {
  const signals: Signal[] = [];

  // Lowest down payment across units
  const downs = units
    .map((u) => {
      if (!u.price || !u.down_payment) return null;
      const pct = Math.round((u.down_payment / u.price) * 100);
      return pct > 0 && pct <= 80 ? pct : null;
    })
    .filter((x): x is number => x !== null);
  if (downs.length > 0) {
    const min = Math.min(...downs);
    if (min <= 10) {
      signals.push({
        en: `FROM ${min}% DOWN`,
        ar: `بداية من ${min}% مقدم`,
      });
    }
  }

  // Starting from price
  const prices = units
    .map((u) => u.price)
    .filter((p): p is number => p != null && p > 0);
  if (prices.length > 0) {
    const min = Math.min(...prices);
    const compact = formatPriceCompact(min);
    signals.push({
      en: `FROM ${compact}`,
      ar: `بداية من ${compact}`,
    });
  }

  // Ready by
  const year = readyYear(compound.ready_by);
  if (year) {
    signals.push({ en: `READY ${year}`, ar: `استلام ${year}` });
  }

  if (signals.length === 0) {
    return locale === "ar"
      ? `${compound.available} وحدة متاحة`
      : `${compound.available} HOMES AVAILABLE`;
  }
  return signals.slice(0, 2).map((s) => (locale === "ar" ? s.ar : s.en)).join(" · ");
}
