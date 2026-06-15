"use client";

// Dynamic-imported wrapper so Leaflet (which touches window) stays
// out of the server bundle. Renders a skeleton until the map module loads.

import dynamic from "next/dynamic";
import type { MapMarker } from "./leaflet-map";
import type { Locale } from "@/lib/i18n";

const LeafletMap = dynamic(
  () => import("./leaflet-map").then((m) => m.LeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[600px] w-full place-items-center border border-ink bg-data sm:h-[680px]">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate">
          Loading map…
        </p>
      </div>
    ),
  }
);

export function MapShell({
  markers,
  locale,
}: {
  markers: MapMarker[];
  locale: Locale;
}) {
  return <LeafletMap markers={markers} locale={locale} />;
}
