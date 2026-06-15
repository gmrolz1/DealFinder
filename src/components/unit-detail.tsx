// Unit detail page body — locale-aware, mobile-first, bigger touch targets.
//
// Sections, top to bottom:
//   1. Breadcrumbs (small, taupe)
//   2. Image carousel (4/3 mobile, 16/10 desktop)
//   3. USP headline (deal-driven; replaces the generic "Townhouse, X" title)
//   4. Compound + area + developer subtitle
//   5. Headline price + monthly + plan (sticky on desktop, inline on mobile)
//   6. 3-tile deal grid (Down / Monthly / Plan)
//   7. Specs grid (2-col mobile, 4-col desktop — generous padding)
//   8. Overview text (generated from facts, not copied)
//   9. CTA stack: SmartCTA + CALL + WHATSAPP (large mobile targets)
//  10. Similar units (4 cards)

import Link from "next/link";
import {
  type EnrichedUnit,
  getUnitGallery,
  getSimilarUnits,
} from "@/lib/data";
import {
  formatFull,
  formatReadyBy,
} from "@/lib/format";
import { type Locale, localizedPath } from "@/lib/i18n";
import {
  monthlyPayment,
  downPaymentPct,
  formatPriceCompact,
  unitDealBadges,
} from "@/lib/conversion";
import { unitUSP } from "@/lib/usp";
import { PropertyCard } from "@/components/property-card";
import { Carousel } from "@/components/preview/carousel";
import { SmartCTA } from "@/components/preview/smart-cta";
import {
  CHAT_UI,
  brokerTelHref,
  buildDirectWhatsApp,
} from "@/lib/chat-config";

export function UnitDetail({
  unit,
  locale = "en",
}: {
  unit: EnrichedUnit;
  locale?: Locale;
}) {
  const isAr = locale === "ar";
  const ui = CHAT_UI[locale];
  const similar = getSimilarUnits(unit, 4);

  // Localized fields
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

  const images = getUnitGallery(unit, 12);
  const monthly = monthlyPayment(unit);
  const downPct = downPaymentPct(unit);
  const badges = unitDealBadges(unit);
  const priceLabel = formatFull(unit.price, unit.currency);
  const usp = unitUSP(unit, locale);

  const waHref = buildDirectWhatsApp(compoundLabel, priceLabel, locale);

  // Localized micro-strings
  const t = {
    properties: isAr ? "العقارات" : "Properties",
    overview: isAr ? "نظرة عامة" : "Overview",
    moreIn: isAr ? "المزيد في" : "More in",
    thisArea: isAr ? "هذه المنطقة" : "this area",
    down: isAr ? "مقدم" : "Down",
    monthly: isAr ? "شهرياً" : "Monthly",
    plan: isAr ? "خطة" : "Plan",
    perMonth: isAr ? "في الشهر" : "per month",
    toOwn: isAr ? "حتى التمليك" : "to own",
    ofTotal: isAr ? "من الإجمالي" : "of total",
    yrs: isAr ? "سنة" : "yrs",
    type: isAr ? "النوع" : "Type",
    bedrooms: isAr ? "غرف النوم" : "Bedrooms",
    bathrooms: isAr ? "الحمامات" : "Bathrooms",
    area: isAr ? "المساحة" : "Area",
    finishing: isAr ? "التشطيب" : "Finishing",
    readyBy: isAr ? "موعد التسليم" : "Ready By",
    installments: isAr ? "التقسيط" : "Installments",
    developer: isAr ? "المطور" : "Developer",
  };

  const specs: [string, string][] = [
    [t.type, propertyType ?? "—"],
    [t.bedrooms, String(unit.bedrooms ?? "—")],
    [t.bathrooms, String(unit.bathrooms ?? "—")],
    [t.area, unit.area_sqm ? `${unit.area_sqm} m²` : "—"],
    [t.finishing, unit.finishing ?? "—"],
    [t.readyBy, formatReadyBy(unit.ready_by)],
    [
      t.installments,
      unit.installment_years ? `${unit.installment_years} ${t.yrs}` : "—",
    ],
    [t.developer, developerName ?? "—"],
  ];

  const describe = () => {
    const parts: string[] = [];
    if (isAr) {
      parts.push(
        `${propertyType ?? "وحدة"} في ${compoundName ?? ""}${
          areaName ? ` بـ${areaName}` : ""
        } تضم ${unit.bedrooms ?? "—"} غرف نوم و${
          unit.bathrooms ?? "—"
        } حمامات${unit.area_sqm ? ` على مساحة ${unit.area_sqm} م²` : ""}.`
      );
      if (unit.finishing) parts.push(`تسليم ${unit.finishing}.`);
      if (unit.ready_by)
        parts.push(`موعد الاستلام ${formatReadyBy(unit.ready_by)}.`);
      if (developerName) parts.push(`من تطوير ${developerName}.`);
      return parts.join(" ");
    }
    const what = propertyType?.toLowerCase() ?? "property";
    const where = [compoundName, areaName].filter(Boolean).join(", ");
    parts.push(
      `This ${what}${where ? ` in ${where}` : ""} offers ${
        unit.bedrooms ?? "—"
      } bedroom${unit.bedrooms === 1 ? "" : "s"} and ${
        unit.bathrooms ?? "—"
      } bathroom${unit.bathrooms === 1 ? "" : "s"}${
        unit.area_sqm ? ` across ${unit.area_sqm} m²` : ""
      }.`
    );
    if (unit.finishing) parts.push(`Delivered ${unit.finishing}.`);
    if (unit.ready_by) parts.push(`Ready by ${formatReadyBy(unit.ready_by)}.`);
    if (developerName) parts.push(`Developed by ${developerName}.`);
    return parts.join(" ");
  };

  return (
    <div
      className="mx-auto max-w-6xl px-4 pb-12 pt-5 sm:px-6 sm:pt-7"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Breadcrumbs */}
      <nav className="text-[11px] font-semibold uppercase tracking-[0.08em] text-taupe">
        <Link
          href={localizedPath("/properties", locale)}
          className="hover:text-ink"
        >
          {t.properties}
        </Link>
        {unit.areaSlug && areaName && (
          <>
            {" / "}
            <Link
              href={localizedPath(`/areas/${unit.areaSlug}`, locale)}
              className="hover:text-ink"
            >
              {areaName}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-4 grid gap-7 lg:grid-cols-[1.7fr_1fr]">
        {/* LEFT — media + specs + overview */}
        <div>
          {/* Carousel — big on desktop, taller on phone */}
          <div className="aspect-[4/3] sm:aspect-[16/10] overflow-hidden border border-data">
            <Carousel
              images={images}
              alt={compoundLabel}
              aspectRatio="auto"
              className="!h-full"
            />
          </div>

          {/* USP headline — replaces the bland title */}
          <p className="mt-5 text-[12px] font-black uppercase tracking-[0.14em] text-ink sm:text-[13px]">
            {usp}
          </p>
          <h1 className="mt-1 text-[26px] font-extrabold uppercase tracking-tight text-ink sm:text-[34px]">
            {compoundLabel}
          </h1>
          {(areaName || developerName) && (
            <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-slate sm:text-[13px]">
              {[areaName, developerName].filter(Boolean).join(" · ")}
            </p>
          )}

          {/* Inline (mobile) deal cells — same as the sidebar but always visible */}
          <div className="mt-5 grid grid-cols-3 gap-px border border-data bg-data lg:hidden">
            <DealCell
              label={t.down}
              value={
                unit.down_payment
                  ? formatPriceCompact(unit.down_payment)
                  : "—"
              }
              sub={downPct != null ? `${downPct}% ${t.ofTotal}` : null}
            />
            <DealCell
              label={t.monthly}
              value={monthly ? formatPriceCompact(monthly) : "—"}
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

          {/* Badges (if any) */}
          {badges.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {badges.map((b) => (
                <span
                  key={b.key}
                  className={`px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em] border border-ink ${
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

          {/* Mobile CTAs — bigger touch targets, full-width primary */}
          <div className="mt-5 border border-ink lg:hidden">
            <SmartCTA unit={unit} locale={locale} />
            <div className="flex">
              <a
                href={brokerTelHref}
                className={`flex flex-1 items-center justify-center gap-2 bg-paper py-4 text-[13px] font-bold uppercase tracking-[0.06em] text-ink transition active:bg-ink active:text-paper ${
                  isAr ? "border-l" : "border-r"
                } border-data`}
                aria-label={ui.callLabel}
              >
                <PhoneIcon big />
                {ui.callLabel}
              </a>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 bg-paper py-4 text-[13px] font-bold uppercase tracking-[0.06em] text-ink transition active:bg-ink active:text-paper"
                aria-label={ui.whatsappLabel}
              >
                <WhatsAppIcon big />
                {ui.whatsappLabel}
              </a>
            </div>
          </div>

          {/* Specs */}
          <div className="mt-8 grid grid-cols-2 border-l border-t border-data sm:grid-cols-4">
            {specs.map(([k, v]) => (
              <div key={k} className="border-b border-r border-data p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-taupe">
                  {k}
                </p>
                <p className="mt-1.5 truncate text-[14px] font-bold capitalize text-ink sm:text-[15px]">
                  {v}
                </p>
              </div>
            ))}
          </div>

          {/* Overview */}
          <h2 className="mt-9 text-[16px] font-bold uppercase tracking-tight text-ink">
            {t.overview}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-slate sm:text-[16px]">
            {describe()}
          </p>
        </div>

        {/* RIGHT — sticky price + CTAs (desktop only) */}
        <aside className="hidden lg:block lg:sticky lg:top-20 lg:self-start">
          <div className="border border-ink">
            <div className="border-b border-data p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-taupe">
                {isAr ? "السعر" : "Price"}
              </p>
              <p className="mt-1 text-[28px] font-black tracking-tight text-ink">
                {priceLabel}
              </p>
              {unit.down_payment ? (
                <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-slate">
                  {isAr ? "من" : "From"}{" "}
                  {formatPriceCompact(unit.down_payment)} {t.down.toLowerCase()}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-3 gap-px border-b border-data bg-data">
              <DealCell
                label={t.down}
                value={
                  unit.down_payment
                    ? formatPriceCompact(unit.down_payment)
                    : "—"
                }
                sub={downPct != null ? `${downPct}%` : null}
              />
              <DealCell
                label={t.monthly}
                value={monthly ? formatPriceCompact(monthly) : "—"}
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

            <SmartCTA unit={unit} locale={locale} />
            <div className="flex border-t border-data">
              <a
                href={brokerTelHref}
                className={`flex flex-1 items-center justify-center gap-2 bg-paper py-3.5 text-[12px] font-bold uppercase tracking-[0.06em] text-ink transition hover:bg-ink hover:text-paper ${
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
                className="flex flex-1 items-center justify-center gap-2 bg-paper py-3.5 text-[12px] font-bold uppercase tracking-[0.06em] text-ink transition hover:bg-ink hover:text-paper"
                aria-label={ui.whatsappLabel}
              >
                <WhatsAppIcon />
                {ui.whatsappLabel}
              </a>
            </div>
          </div>
        </aside>
      </div>

      {/* Similar units */}
      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="text-[18px] font-bold uppercase tracking-tight text-ink sm:text-[20px]">
            {t.moreIn} {areaName ?? t.thisArea}
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {similar.map((u) => (
              <PropertyCard key={u.nawy_id} unit={u} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

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
    <div className="bg-paper p-3 text-center">
      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-taupe">
        {label}
      </p>
      <p className="mt-1 text-[14px] font-extrabold tracking-tight text-ink sm:text-[15px]">
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.04em] text-slate">
          {sub}
        </p>
      )}
    </div>
  );
}

function PhoneIcon({ big = false }: { big?: boolean }) {
  const s = big ? 16 : 14;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1 1 0 0 0-1.02.24l-2.2 2.2a15.05 15.05 0 0 1-6.59-6.59l2.2-2.2a1 1 0 0 0 .25-1.02A11.36 11.36 0 0 1 8.5 4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1c0 9.39 7.61 17 17 17a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1z" />
    </svg>
  );
}

function WhatsAppIcon({ big = false }: { big?: boolean }) {
  const s = big ? 16 : 14;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
    </svg>
  );
}
