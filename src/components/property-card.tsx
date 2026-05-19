import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { EnrichedUnit } from "@/lib/data";

// Material card, light theme.
export function PropertyCard({ unit }: { unit: EnrichedUnit }) {
  return (
    <Link
      href={`/properties/${unit.slug}`}
      className="group block overflow-hidden rounded-xl bg-surface shadow-[0_1px_2px_rgba(60,64,67,0.2)] transition hover:shadow-[0_2px_8px_rgba(60,64,67,0.28)]"
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
          <div className="grid h-full place-items-center text-[13px] text-muted">
            No image
          </div>
        )}
        {unit.property_type && (
          <span className="absolute left-3 top-3 rounded-full bg-surface/95 px-2.5 py-1 text-[11px] font-medium text-ink shadow-sm">
            {unit.property_type}
          </span>
        )}
      </div>

      <div className="p-3.5">
        <p className="text-[18px] font-bold tracking-tight text-ink">
          {formatPrice(unit.price, unit.currency)}
        </p>
        <p className="mt-0.5 truncate text-[13px] font-medium text-ink">
          {unit.compoundName ?? unit.title}
        </p>
        <p className="truncate text-[12px] text-muted">
          {[unit.areaName, unit.developerName].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-3 flex gap-3 border-t border-hairline pt-2.5 text-[12px] text-muted">
          {unit.bedrooms != null && <span>{unit.bedrooms} bed</span>}
          {unit.bathrooms != null && <span>{unit.bathrooms} bath</span>}
          {unit.area_sqm != null && <span>{unit.area_sqm} m²</span>}
        </div>
      </div>
    </Link>
  );
}
