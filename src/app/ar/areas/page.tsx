import type { Metadata } from "next";
import Link from "next/link";
import { getAreasWithCounts } from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { localizedPath } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "المناطق — DealFinder",
  description: "تصفّح أبرز المناطق العقارية في مصر — التجمع، الشيخ زايد، الساحل الشمالي، رأس الحكمة والمزيد.",
  alternates: {
    canonical: "/ar/areas",
    languages: { en: "/areas", ar: "/ar/areas", "x-default": "/areas" },
  },
};

export default function AreasPageAr() {
  const areas = getAreasWithCounts().filter((a) => a.available > 0);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-[32px] font-extrabold uppercase tracking-tight text-ink sm:text-[44px]">
        تصفّح حسب المنطقة
      </h1>
      <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-taupe">
        {formatNumber(areas.length)} منطقة في مصر
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {areas.map((a) => (
          <Link
            key={a.nawy_id}
            href={localizedPath(`/areas/${a.slug}`, "ar")}
            className="relative h-48 overflow-hidden border border-data bg-ink"
          >
            {a.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={a.image_url}
                alt={a.name_ar ?? a.name}
                loading="lazy"
                className="h-full w-full object-cover opacity-70"
              />
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3.5">
              <p className="text-[14px] font-bold uppercase tracking-[0.02em] text-paper">
                {a.name_ar ?? a.name}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-data">
                {formatNumber(a.available)} وحدة
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
