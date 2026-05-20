// Conversion-optimized property card (preview), locale-aware (EN / AR).
//
// Sections, top to bottom:
//   1. Media carousel — unit image + other units' images from the same
//      compound (so every card has a real multi-image carousel today,
//      no new data needed).
//   2. Headline price + property type chip on the image (over the carousel).
//   3. Deal breakdown — Total + 3-tile marketing grid (DOWN / MONTHLY / PLAN).
//   4. Compound + area + developer (subtle, taupe).
//   5. Minimalist specs row (3 / 3 / 187 m²) — big values, tiny labels.
//   6. CTA stack:
//        ● Smart chat preview (Layla, rotating intents)
//        Call | WhatsApp

import Link from "next/link";
import {
  type EnrichedUnit,
  getUnitGallery,
} from "@/lib/data";
import { type Locale, localizedPath } from "@/lib/i18n";
import { Carousel } from "./carousel";
import { SmartCTA } from "./smart-cta";
import {
  monthlyPayment,
  downPaymentPct,
  unitDealBadges,
  formatPriceCompact,
} from "@/lib/conversion";
import {
  CHAT_UI,
  brokerTelHref,
  buildDirectWhatsApp,
} from "@/lib/chat-config";
import { formatPrice } from "@/lib/format";

export function PropertyCardV2({
  unit,
  locale = "en",
}: {
  unit: EnrichedUnit;
  locale?: Locale;
}) {
  const isAr = locale === "ar";
  const ui = CHAT_UI[locale];

  // Localized text on the card itself
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
  const compoundLabel = compoundName ?? title;

  // Real multi-image carousel — unit image + sibling units in same compound
  const images = getUnitGallery(unit, 8);
  const monthly = monthlyPayment(unit);
  const downPct = downPaymentPct(unit);
  const badges = unitDealBadges(unit);
  const priceLabel = formatPrice(unit.price, unit.currency);

  const detailHref = localizedPath(`/properties/${unit.slug}`, locale);
  const waHref = buildDirectWhatsApp(compoundLabel, priceLabel, locale);

  // Localized micro-strings — only used on this card.
  const t = {
    bed: isAr ? "غرفة" : "Bed",
    bath: isAr ? "حمام" : "Bath",
    area: isAr ? "متر²" : "m²",
    down: isAr ? "مقدم" : "Down",
    monthly: isAr ? "شهرياً" : "Monthly",
    plan: isAr ? "خطة" : "Plan",
    yrs: isAr ? "سنة" : "yrs",
    perMonth: isAr ? "في الشهر" : "per month",
    toOwn: isAr ? "حتى التمليك" : "to own",
    ofTotal: isAr ? "من الإجمالي" : "of total",
  };

  return (
    <div
      className="group flex flex-col border border-data bg-paper transition hover:border-ink"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* ── MEDIA — carousel + overlays ─────────────────────────────────── */}
      <div className="relative">
        <Link
          href={detailHref}
          className="block"
          aria-label={compoundLabel}
        >
          <Carousel images={images} alt={title} aspectRatio="4/3" />
        </Link>

        {propertyType && (
          <span
            className={`pointer-events-none absolute top-2 ${
              isAr ? "right-2" : "left-2"
            } bg-ink px-2 py-1 text-[9px] font-bold uppercase tracking-[0.09em] text-paper`}
          >
            {propertyType}
          </span>
        )}

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

      {/* ── BODY — headline price + deal grid + location + specs ───────── */}
      <Link href={detailHref} className="block flex-1 px-3 pt-3">
        {/* Headline price */}
        <p className="text-[22px] font-black tracking-tight text-ink leading-none">
          {priceLabel}
        </p>

        {/* Deal breakdown — marketing-driven 3-tile grid */}
        <div className="mt-3 grid grid-cols-3 gap-px border-t border-data bg-data">
          <DealCell
            label={t.down}
            value={unit.down_payment ? formatPriceCompact(unit.down_payment) : "—"}
            sub={downPct != null ? `${downPct}% ${t.ofTotal}` : null}
          />
          <DealCell
            label={t.monthly}
            value={
              monthly
                ? `EGP ${monthly.toLocaleString("en-US").replace(/,000$/, "K")}`
                : "—"
            }
            sub={monthly ? t.perMonth : null}
          />
          <DealCell
            label={t.plan}
            value={
              unit.installment_years
                ? `${unit.installment_years} ${t.yrs}`
                : "—"
            }
            sub={unit.installment_years ? t.toOwn : null}
          />
        </div>

        {/* Compound name + area + developer */}
        <div className="mt-3">
          <p className="truncate text-[13px] font-bold text-ink">
            {compoundLabel}
          </p>
          <p className="truncate text-[10px] font-medium uppercase tracking-[0.07em] text-taupe">
            {[areaName, developerName].filter(Boolean).join(" · ")}
          </p>
        </div>

        {/* Minimalist specs — number prominent, label tiny */}
        <div className="mt-3 grid grid-cols-3 border-t border-data pt-2">
          <SpecCell value={unit.bedrooms} label={t.bed} />
          <SpecCell value={unit.bathrooms} label={t.bath} />
          <SpecCell value={unit.area_sqm} label={t.area} />
        </div>
      </Link>

      {/* ── CTAs — chat preview + call + whatsapp ───────────────────────── */}
      <div className="mt-3 border-t border-data">
        <SmartCTA unit={unit} locale={locale} />
        <div className="flex">
          <a
            href={brokerTelHref}
            className={`flex flex-1 items-center justify-center gap-1.5 bg-paper py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-ink transition hover:bg-ink hover:text-paper ${
              isAr ? "border-l" : "border-r"
            } border-data`}
            aria-label={ui.callLabel}
          >
            <PhoneIcon />
            {ui.callLabel}
          </a>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 bg-paper py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-ink transition hover:bg-ink hover:text-paper"
            aria-label={ui.whatsappLabel}
          >
            <WhatsAppIcon />
            {ui.whatsappLabel}
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function DealCell({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string | null;
}) {
  return (
    <div className="bg-paper p-2 text-center">
      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-taupe">
        {label}
      </p>
      <p className="mt-0.5 text-[13px] font-extrabold tracking-tight text-ink">
        {value}
      </p>
      {sub && (
        <p className="text-[9px] font-semibold uppercase tracking-[0.04em] text-slate">
          {sub}
        </p>
      )}
    </div>
  );
}

function SpecCell({
  value,
  label,
}: {
  value: number | null | undefined;
  label: string;
}) {
  if (value == null) return <div />;
  return (
    <div className="text-center">
      <p className="text-[18px] font-black leading-none text-ink">{value}</p>
      <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate">
        {label}
      </p>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1 1 0 0 0-1.02.24l-2.2 2.2a15.05 15.05 0 0 1-6.59-6.59l2.2-2.2a1 1 0 0 0 .25-1.02A11.36 11.36 0 0 1 8.5 4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1c0 9.39 7.61 17 17 17a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
    </svg>
  );
}
