import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { EnrichedUnit } from "@/lib/data";

export function PropertyCard({ unit }: { unit: EnrichedUnit }) {
  return (
    <Link
      href={`/properties/${unit.slug}`}
      className="group block overflow-hidden rounded-2xl bg-surface ring-1 ring-hairline transition active:scale-[0.99]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-canvas">
        {unit.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={unit.image_url}
            alt={unit.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-[13px] text-ink-faint">
            No image
          </div>
        )}
        {unit.property_type && (
          <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-medium text-ink backdrop-blur">
            {unit.property_type}
          </span>
        )}
      </div>

      <div className="p-3.5">
        <p className="text-[17px] font-semibold tracking-tight text-ink">
          {formatPrice(unit.price, unit.currency)}
        </p>
        <p className="mt-0.5 truncate text-[13px] font-medium text-ink">
          {unit.compoundName ?? unit.title}
        </p>
        <p className="truncate text-[12px] text-ink-soft">
          {[unit.areaName, unit.developerName].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-3 flex gap-3 border-t border-hairline pt-2.5 text-[12px] text-ink-soft">
          {unit.bedrooms != null && <span>{unit.bedrooms} bed</span>}
          {unit.bathrooms != null && <span>{unit.bathrooms} bath</span>}
          {unit.area_sqm != null && <span>{unit.area_sqm} m²</span>}
        </div>
      </div>
    </Link>
  );
}
