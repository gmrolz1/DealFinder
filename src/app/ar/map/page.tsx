import type { Metadata } from "next";
import Link from "next/link";
import {
  getAreas,
  getCompoundsByArea,
  getUnitsByCompound,
} from "@/lib/data";
import { MapShell } from "@/components/map/map-shell";
import type { MapMarker } from "@/components/map/leaflet-map";
import { formatPriceCompact } from "@/lib/conversion";

export const metadata: Metadata = {
  title: "الخريطة · DealFinder — العقارات في مصر",
  description:
    "تصفح الكمبوندات في القاهرة الجديدة والعاصمة الإدارية والساحل الشمالي على خريطة تفاعلية.",
  alternates: {
    canonical: "/ar/map",
    languages: { en: "/map", ar: "/ar/map", "x-default": "/map" },
  },
};

function buildMarkers(): MapMarker[] {
  const out: MapMarker[] = [];
  for (const area of getAreas()) {
    const compounds = getCompoundsByArea(area.nawy_id);
    for (const c of compounds) {
      if (c.lat == null || c.lng == null) continue;
      const lat = Number(c.lat);
      const lng = Number(c.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      const units = getUnitsByCompound(c.nawy_id);
      const prices = units
        .map((u) => u.price)
        .filter((p): p is number => p != null && p > 0);
      const min = prices.length > 0 ? Math.min(...prices) : c.min_price;
      out.push({
        id: c.nawy_id,
        lat,
        lng,
        title: c.name_ar ?? c.name,
        subtitle: area.name_ar ?? area.name,
        priceLabel: min ? `من ${formatPriceCompact(min)}` : undefined,
        available: c.available,
        href: `/ar/compounds/${c.slug}`,
      });
    }
  }
  return out;
}

export default function MapPageAr() {
  const markers = buildMarkers();

  return (
    <div className="bg-paper" dir="rtl">
      <header className="border-b border-data px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-taupe">
            سوق العقارات في مصر
          </p>
          <h1 className="mt-3 text-[34px] font-black uppercase leading-[0.95] tracking-tight text-ink sm:text-[48px]">
            على <span className="glitch">الخريطة</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[13px] leading-relaxed text-slate sm:text-[15px]">
            {markers.length.toLocaleString("en-US")} كمبوند، معروضين مباشرة.
            اضغط على أي علامة لرؤية السعر التقديري، الوحدات المتاحة، ورابط
            صفحة الكمبوند.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <MapShell markers={markers} locale="ar" />

        <div className="mt-10 flex flex-wrap items-baseline justify-between gap-3 border-t border-data pt-6">
          <h2 className="text-[18px] font-bold uppercase tracking-tight text-ink">
            أو تصفح حسب المنطقة
          </h2>
          <Link
            href="/ar/areas"
            className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate transition hover:text-ink"
          >
            عرض الكل ←
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {getAreas()
            .slice(0, 16)
            .map((a) => (
              <Link
                key={a.nawy_id}
                href={`/ar/areas/${a.slug}`}
                className="border border-data px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate transition hover:border-ink hover:text-ink"
              >
                {a.name_ar ?? a.name}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
