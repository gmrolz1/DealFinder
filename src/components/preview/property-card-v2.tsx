// Conversion-optimized property card (preview).
//
// vs the current PropertyCard:
//   + Image area is a Carousel (supports multi-image — single today, multi
//     after Roadmap M2 unit gallery scrape)
//   + Monthly payment estimate under the headline price
//   + Deal badges (X% DOWN, READY YYYY) overlaid on the image
//   + Visible primary CTA (Request Callback) — opens LeadSheet
//   + Secondary WhatsApp quick-contact button (deep link)
//   + Card body and CTAs separated so buttons don't trigger the link
//
// Brand-compliant: square corners, black-and-white, Magnetik via inherited
// font family. No taupe in the CTAs.

import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { EnrichedUnit } from "@/lib/data";
import { Carousel } from "./carousel";
import { ChatTrigger } from "./chat-trigger";
import {
  monthlyPayment,
  unitDealBadges,
  whatsappHref,
} from "@/lib/conversion";
import { CHAT_CONFIG } from "@/lib/chat-config";

export function PropertyCardV2({ unit }: { unit: EnrichedUnit }) {
  const images = unit.image_url ? [unit.image_url] : [];
  const monthly = monthlyPayment(unit);
  const badges = unitDealBadges(unit);

  const waMessage = `Hi — I'm interested in ${
    unit.compoundName ?? unit.title
  }${unit.price ? ` (${formatPrice(unit.price, unit.currency)})` : ""}. Can you send details?`;

  return (
    <div className="group flex flex-col border border-data bg-paper transition hover:border-ink">
      {/* Media area */}
      <div className="relative">
        <Link
          href={`/properties/${unit.slug}`}
          className="block"
          aria-label={unit.compoundName ?? unit.title}
        >
          <Carousel images={images} alt={unit.title} aspectRatio="4/3" />
        </Link>

        {/* Property type label (top-left) */}
        {unit.property_type && (
          <span className="pointer-events-none absolute top-2 left-2 bg-ink px-2 py-1 text-[9px] font-bold uppercase tracking-[0.09em] text-paper">
            {unit.property_type}
          </span>
        )}

        {/* Deal badges (bottom-left, above the dots if there's a carousel) */}
        {badges.length > 0 && (
          <div className="pointer-events-none absolute bottom-2 left-2 flex flex-wrap gap-1">
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

      {/* Content */}
      <Link
        href={`/properties/${unit.slug}`}
        className="block flex-1 p-3"
      >
        <p className="text-[20px] font-extrabold tracking-tight text-ink">
          {formatPrice(unit.price, unit.currency)}
        </p>
        {monthly && (
          <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-slate">
            EGP {monthly.toLocaleString("en-US")}/mo · {unit.installment_years}
            yr plan
          </p>
        )}
        <p className="mt-2 truncate text-[13px] font-medium text-ink">
          {unit.compoundName ?? unit.title}
        </p>
        <p className="truncate text-[10px] font-medium uppercase tracking-[0.07em] text-taupe">
          {[unit.areaName, unit.developerName].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-3 flex gap-3 border-t border-data pt-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate">
          {unit.bedrooms != null && <span>{unit.bedrooms} Bed</span>}
          {unit.bathrooms != null && <span>{unit.bathrooms} Bath</span>}
          {unit.area_sqm != null && <span>{unit.area_sqm} m²</span>}
        </div>
      </Link>

      {/* CTA row — AI chat is the primary action; WhatsApp is the direct alt. */}
      <div className="flex border-t border-data">
        <ChatTrigger unit={unit} className="flex-1" />
        <a
          href={whatsappHref(CHAT_CONFIG.brokerWhatsApp, waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="grid w-12 place-items-center border-l border-data bg-paper text-ink transition hover:bg-ink hover:text-paper"
          aria-label="Chat on WhatsApp"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
          </svg>
        </a>
      </div>
    </div>
  );
}
