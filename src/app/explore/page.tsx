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
  title: "Explore on the Map · DealFinder",
  description:
    "Browse compounds across Cairo, New Capital, North Coast and beyond on an interactive map.",
  alternates: {
    canonical: "/explore",
    languages: {
      en: "/explore",
      ar: "/ar/explore",
      "x-default": "/explore",
    },
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
        title: c.name,
        subtitle: area.name,
        priceLabel: min ? `From ${formatPriceCompact(min)}` : undefined,
        available: c.available,
        href: `/compounds/${c.slug}`,
      });
    }
  }
  return out;
}

export default function ExplorePage() {
  const markers = buildMarkers();

  return (
    <div className="bg-paper">
      <header className="border-b border-data px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-taupe">
            Egypt property marketplace
          </p>
          <h1 className="mt-3 text-[34px] font-black uppercase leading-[0.95] tracking-tight text-ink sm:text-[48px]">
            Explore <span className="glitch">on the Map</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[13px] leading-relaxed text-slate sm:text-[15px]">
            {markers.length.toLocaleString("en-US")} compounds, plotted live.
            Click a pin for the starting price, available homes, and a link to
            the compound page.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <MapShell markers={markers} locale="en" />

        <div className="mt-10 flex flex-wrap items-baseline justify-between gap-3 border-t border-data pt-6">
          <h2 className="text-[18px] font-bold uppercase tracking-tight text-ink">
            Or browse by area
          </h2>
          <Link
            href="/areas"
            className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate transition hover:text-ink"
          >
            See all →
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {getAreas()
            .slice(0, 16)
            .map((a) => (
              <Link
                key={a.nawy_id}
                href={`/areas/${a.slug}`}
                className="border border-data px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate transition hover:border-ink hover:text-ink"
              >
                {a.name}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
