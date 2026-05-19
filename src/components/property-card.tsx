import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { EnrichedUnit } from "@/lib/data";

export function PropertyCard({ unit }: { unit: EnrichedUnit }) {
  return (
    <Link
      href={`/properties/${unit.slug}`}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {unit.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={unit.image_url}
            alt={unit.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-slate-400">
            No image
          </div>
        )}
        {unit.property_type && (
          <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-xs font-semibold text-slate-700">
            {unit.property_type}
          </span>
        )}
        {unit.sale_type && (
          <span className="absolute right-3 top-3 rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold capitalize text-white">
            {unit.sale_type}
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="text-lg font-bold text-slate-900">
          {formatPrice(unit.price, unit.currency)}
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-slate-700">
          {unit.compoundName ?? unit.title}
        </p>
        <p className="truncate text-xs text-slate-500">
          {[unit.areaName, unit.developerName].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-3 flex gap-4 border-t border-slate-100 pt-3 text-xs text-slate-600">
          {unit.bedrooms != null && <span>{unit.bedrooms} Beds</span>}
          {unit.bathrooms != null && <span>{unit.bathrooms} Baths</span>}
          {unit.area_sqm != null && <span>{unit.area_sqm} m²</span>}
        </div>
      </div>
    </Link>
  );
}
