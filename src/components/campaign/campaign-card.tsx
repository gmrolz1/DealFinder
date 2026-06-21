// Mobile-first listing card for the campaign landing. Self-contained: the only
// actions are Call + WhatsApp to the campaign number (no navigation away, no
// chat). Server component.

import type { EnrichedUnit } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import {
  monthlyPayment,
  downPaymentPct,
  unitDealBadges,
  formatPriceCompact,
} from "@/lib/conversion";
import { campaignTelHref, campaignWhatsAppUnit } from "@/lib/campaign";
import { unitListingTitle } from "@/lib/usp";
import { PhoneIcon, WhatsAppIcon } from "./icons";

export function CampaignCard({
  unit,
  locale = "en",
}: {
  unit: EnrichedUnit;
  locale?: Locale;
}) {
  const isAr = locale === "ar";
  const compoundName = isAr
    ? unit.compoundNameAr ?? unit.compoundName
    : unit.compoundName;
  const areaName = isAr ? unit.areaNameAr ?? unit.areaName : unit.areaName;
  const developerName = isAr
    ? unit.developerNameAr ?? unit.developerName
    : unit.developerName;
  const propertyType = isAr
    ? unit.property_type_ar ?? unit.property_type
    : unit.property_type;
  const title = isAr ? unit.title_ar ?? unit.title : unit.title;
  const label = compoundName ?? title;
  const listingTitle = unitListingTitle(unit, locale);

  const priceLabel = formatPrice(unit.price, unit.currency);
  const monthly = monthlyPayment(unit);
  const downPct = downPaymentPct(unit);
  const badges = unitDealBadges(unit);
  const waHref = campaignWhatsAppUnit(label, priceLabel, locale);

  const t = {
    bed: isAr ? "غرفة" : "Bed",
    bath: isAr ? "حمام" : "Bath",
    area: isAr ? "م²" : "m²",
    down: isAr ? "مقدم" : "Down",
    monthly: isAr ? "شهرياً" : "Monthly",
    plan: isAr ? "خطة" : "Plan",
    yrs: isAr ? "سنة" : "yrs",
    wa: isAr ? "واتساب" : "WhatsApp",
    call: isAr ? "اتصال" : "Call",
  };

  return (
    <div
      className="flex flex-col overflow-hidden border border-data bg-paper transition hover:border-ink"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="relative aspect-[4/3] bg-ink">
        {unit.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={unit.image_url}
            alt={label}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
        {propertyType && (
          <span
            className={`absolute top-2 ${
              isAr ? "right-2" : "left-2"
            } bg-ink px-2 py-1 text-[9px] font-bold uppercase tracking-[0.09em] text-paper`}
          >
            {propertyType}
          </span>
        )}
        {badges.length > 0 && (
          <div
            className={`absolute bottom-2 ${
              isAr ? "right-2" : "left-2"
            } flex flex-wrap gap-1`}
          >
            {badges.map((b) => (
              <span
                key={b.key}
                className={`border border-ink px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] ${
                  b.tone === "highlight" ? "bg-ink text-paper" : "bg-paper text-ink"
                }`}
              >
                {b.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3 pt-3">
        <p className="text-[22px] font-black leading-none tracking-tight text-ink">
          {priceLabel}
        </p>
        <div className="mt-2">
          <p className="line-clamp-2 min-h-[2.4em] text-[13px] font-bold leading-[1.2] text-ink">
            {listingTitle}
          </p>
          <p className="mt-1 truncate text-[10px] font-medium uppercase tracking-[0.07em] text-taupe">
            {[areaName, developerName].filter(Boolean).join(" · ")}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-px border-y border-data bg-data">
          <Cell
            label={t.down}
            value={unit.down_payment ? formatPriceCompact(unit.down_payment) : "—"}
            sub={downPct != null ? `${downPct}%` : null}
          />
          <Cell
            label={t.monthly}
            value={monthly ? formatPriceCompact(monthly) : "—"}
            sub={null}
          />
          <Cell
            label={t.plan}
            value={unit.installment_years ? `${unit.installment_years} ${t.yrs}` : "—"}
            sub={null}
          />
        </div>

        <div className="mb-3 mt-3 grid grid-cols-3">
          <Spec value={unit.bedrooms} label={t.bed} />
          <Spec value={unit.bathrooms} label={t.bath} />
          <Spec value={unit.area_sqm} label={t.area} />
        </div>
      </div>

      <div className="mt-auto flex border-t border-data">
        <a
          href={campaignTelHref}
          className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-[12px] font-bold uppercase tracking-[0.06em] text-ink transition hover:bg-ink hover:text-paper ${
            isAr ? "border-l" : "border-r"
          } border-data`}
          aria-label={t.call}
        >
          <PhoneIcon size={14} />
          {t.call}
        </a>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 bg-ink py-3 text-[12px] font-bold uppercase tracking-[0.06em] text-paper transition hover:opacity-90"
          aria-label={t.wa}
        >
          <WhatsAppIcon size={14} />
          {t.wa}
        </a>
      </div>
    </div>
  );
}

function Cell({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string | null;
}) {
  return (
    <div className="bg-paper p-2 text-center">
      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-taupe">
        {label}
      </p>
      <p className="mt-0.5 text-[12px] font-extrabold tracking-tight text-ink">
        {value}
      </p>
      {sub && <p className="text-[9px] font-semibold text-slate">{sub}</p>}
    </div>
  );
}

function Spec({
  value,
  label,
}: {
  value: number | null | undefined;
  label: string;
}) {
  if (value == null) return <div />;
  return (
    <div className="text-center">
      <p className="text-[16px] font-black leading-none text-ink">{value}</p>
      <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate">
        {label}
      </p>
    </div>
  );
}
