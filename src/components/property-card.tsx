import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { EnrichedUnit } from "@/lib/data";

// Material card, monolith brand skin.
export function PropertyCard({ unit }: { unit: EnrichedUnit }) {
  return (
    <Link
      href={`/properties/${unit.slug}`}
      className="group block overflow-hidden border border-slate bg-ink transition hover:border-data"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate">
        {unit.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={unit.image_url}
            alt={unit.title}
            loading="lazy"
            className="h-full w-full object-cover grayscale-[15%] transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-[11px] uppercase tracking-[0.08em] text-data/60">
            No image
          </div>
        )}
        {unit.property_type && (
          <span className="absolute left-0 top-0 bg-ink px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.09em] text-paper">
            {unit.property_type}
          </span>
        )}
      </div>

      <div className="p-3.5">
        <p className="text-[17px] font-extrabold tracking-tight text-paper">
          {formatPrice(unit.price, unit.currency)}
        </p>
        <p className="mt-1 truncate text-[13px] font-medium text-data">
          {unit.compoundName ?? unit.title}
        </p>
        <p className="truncate text-[10px] font-medium uppercase tracking-[0.07em] text-taupe">
          {[unit.areaName, unit.developerName].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-3 flex gap-3 border-t border-slate pt-2.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-data">
          {unit.bedrooms != null && <span>{unit.bedrooms} Bed</span>}
          {unit.bathrooms != null && <span>{unit.bathrooms} Bath</span>}
          {unit.area_sqm != null && <span>{unit.area_sqm} m²</span>}
        </div>
      </div>
    </Link>
  );
}
