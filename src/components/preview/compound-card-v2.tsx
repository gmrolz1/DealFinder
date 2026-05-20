// Conversion-optimized compound card (preview), locale-aware.
//
// vs the current CompoundCard:
//   + Image area is a Carousel aggregated from the compound's units
//     (REAL multi-image carousel, no new data needed)
//   + Adds a "Starting from" price block (calculated from min unit price)
//   + Adds deal badges (FROM X% DOWN, READY YYYY)

import Link from "next/link";
import { formatNumber } from "@/lib/format";
import {
  getUnitsByCompound,
  type Compound,
  type WithCount,
} from "@/lib/data";
import { type Locale, localizedPath } from "@/lib/i18n";
import { Carousel } from "./carousel";
import { compoundDealBadges, formatPriceCompact } from "@/lib/conversion";

export function CompoundCardV2({
  compound,
  locale = "en",
}: {
  compound: WithCount<Compound>;
  locale?: Locale;
}) {
  const isAr = locale === "ar";
  const name = isAr ? compound.name_ar ?? compound.name : compound.name;
  const subtitle = isAr
    ? compound.subtitle_ar ?? compound.subtitle
    : compound.subtitle;

  const units = getUnitsByCompound(compound.nawy_id);
  const allImages = [
    compound.image_url,
    ...units.map((u) => u.image_url),
  ].filter((x): x is string => Boolean(x));
  const images = Array.from(new Set(allImages)).slice(0, 10);

  const unitPrices = units
    .map((u) => u.price)
    .filter((p): p is number => p != null && p > 0);
  const minPrice =
    unitPrices.length > 0 ? Math.min(...unitPrices) : compound.min_price;

  const badges = compoundDealBadges(compound, units);

  const fromLabel = isAr ? "تبدأ من" : "From";
  const availableLabel = isAr
    ? `${formatNumber(compound.available)} وحدة متاحة`
    : `${formatNumber(compound.available)} homes available`;

  return (
    <div
      className="group flex flex-col border border-data bg-paper transition hover:border-ink"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="relative">
        <Link
          href={localizedPath(`/compounds/${compound.slug}`, locale)}
          className="block"
        >
          <Carousel images={images} alt={name} aspectRatio="5/3" />
        </Link>
        {badges.length > 0 && (
          <div
            className={`pointer-events-none absolute bottom-2 ${
              isAr ? "right-2" : "left-2"
            } flex flex-wrap gap-1`}
          >
            {badges.map((b) => (
              <span
                key={b.key}
                className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] border border-ink ${
                  b.tone === "highlight"
                    ? "bg-ink text-paper"
                    : "bg-paper text-ink"
                }`}
              >
                {b.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <Link
        href={localizedPath(`/compounds/${compound.slug}`, locale)}
        className="flex flex-1 flex-col p-3"
      >
        <p className="truncate text-[14px] font-bold uppercase tracking-[0.02em] text-ink">
          {name}
        </p>
        {subtitle && (
          <p className="truncate text-[10px] font-medium uppercase tracking-[0.07em] text-taupe">
            {subtitle}
          </p>
        )}
        <div className="mt-2 flex items-end justify-between gap-2 border-t border-data pt-2">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate">
              {fromLabel}
            </p>
            <p className="text-[16px] font-extrabold tracking-tight text-ink">
              {formatPriceCompact(minPrice)}
            </p>
          </div>
          <p className="text-right text-[10px] font-semibold uppercase tracking-[0.07em] text-slate">
            {availableLabel}
          </p>
        </div>
      </Link>
    </div>
  );
}
