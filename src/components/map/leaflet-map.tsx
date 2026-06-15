"use client";

// Interactive map of Egyptian real-estate compounds, rendered with raw
// Leaflet + free OpenStreetMap tiles (no API key, no commercial limits).
//
// Why raw Leaflet over react-leaflet? Smaller dependency footprint, full
// control of the marker lifecycle, easier to lazy-load. Leaflet itself
// pulls in ~40KB gzipped.
//
// Markers cluster visually via a simple grid algorithm in the parent
// (we cap to ~200 markers and let the user zoom for more), so we don't
// need Leaflet.markercluster.

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Locale } from "@/lib/i18n";

export type MapMarker = {
  id: number;
  lat: number;
  lng: number;
  /** Compound name in user's locale */
  title: string;
  /** Optional subtitle line (area · developer) */
  subtitle?: string;
  /** Optional starting-from price label */
  priceLabel?: string;
  /** Available unit count */
  available: number;
  /** Where the popup link goes */
  href: string;
};

const t = {
  en: {
    homes: "homes available",
    view: "View compound",
    summary: (n: number) => `${n.toLocaleString("en-US")} compounds plotted`,
  },
  ar: {
    homes: "وحدة متاحة",
    view: "عرض الكمبوند",
    summary: (n: number) =>
      `${n.toLocaleString("en-US")} كمبوند على الخريطة`,
  },
} as const;

export function LeafletMap({
  markers,
  locale = "en",
}: {
  markers: MapMarker[];
  locale?: Locale;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tx = t[locale];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled) return;

      // Fix Leaflet's default icon paths — bundlers break the asset URLs.
      // We replace with a clean square SVG marker that matches the brand.
      const brandIcon = L.divIcon({
        className: "df-marker",
        html: `<span class="df-marker-pin"></span>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      // Centre on Cairo with a wide bbox covering New Capital → Sahel.
      const map = L.map(container, {
        center: [30.05, 31.5],
        zoom: 8,
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 18,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }
      ).addTo(map);

      const group = L.featureGroup();
      for (const m of markers) {
        if (!Number.isFinite(m.lat) || !Number.isFinite(m.lng)) continue;
        const popupHtml = `
          <div class="df-popup" dir="${locale === "ar" ? "rtl" : "ltr"}">
            <p class="df-popup-title">${escapeHtml(m.title)}</p>
            ${
              m.subtitle
                ? `<p class="df-popup-sub">${escapeHtml(m.subtitle)}</p>`
                : ""
            }
            ${
              m.priceLabel
                ? `<p class="df-popup-price">${escapeHtml(m.priceLabel)}</p>`
                : ""
            }
            <p class="df-popup-meta">${m.available} ${tx.homes}</p>
            <a class="df-popup-cta" href="${escapeHtml(m.href)}">${tx.view} →</a>
          </div>`;
        L.marker([m.lat, m.lng], { icon: brandIcon })
          .bindPopup(popupHtml, { closeButton: true, maxWidth: 260 })
          .addTo(group);
      }
      group.addTo(map);

      // Fit to markers when there are any, with light padding.
      if (markers.length > 0) {
        const bounds = group.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
        }
      }

      return () => {
        map.remove();
      };
    })();

    return () => {
      cancelled = true;
    };
  }, [markers, locale, tx]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="h-[600px] w-full border border-ink bg-data sm:h-[680px]"
        aria-label="Map of Egyptian real-estate compounds"
      />
      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-taupe">
        {tx.summary(markers.length)}
      </p>
      <style>{`
        /* Tailwind 4's preflight applies max-width: 100% / height: auto to
         * every <img>, which breaks Leaflet's absolutely-positioned tile
         * images and produces an empty grey map. Reset inside the map. */
        .leaflet-container img.leaflet-tile,
        .leaflet-container .leaflet-pane img {
          max-width: none !important;
          width: auto !important;
          height: auto !important;
        }
        .df-marker { background: transparent; border: 0; }
        .df-marker-pin {
          display: block;
          width: 14px;
          height: 14px;
          background: #000;
          border: 2px solid #fff;
          box-shadow: 0 0 0 1px rgba(0,0,0,0.4);
          transition: transform 0.15s ease;
        }
        .df-marker:hover .df-marker-pin {
          transform: scale(1.35);
          background: #fff;
          border-color: #000;
        }
        .leaflet-container {
          font-family: var(--font-sans), system-ui, sans-serif;
        }
        .leaflet-popup-content-wrapper {
          background: #fff;
          color: #000;
          border: 1px solid #000;
          border-radius: 0;
          box-shadow: 6px 6px 0 rgba(0,0,0,0.08);
          padding: 0;
        }
        .leaflet-popup-content {
          margin: 0;
          padding: 0;
          width: 240px !important;
        }
        .leaflet-popup-tip { background: #000; border: 0; }
        .df-popup { padding: 12px 14px; }
        .df-popup-title {
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          line-height: 1.2;
        }
        .df-popup-sub {
          margin-top: 4px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #6f5e57;
        }
        .df-popup-price {
          margin-top: 6px;
          font-size: 16px;
          font-weight: 900;
          letter-spacing: -0.01em;
        }
        .df-popup-meta {
          margin-top: 2px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #474747;
        }
        .df-popup-cta {
          display: inline-block;
          margin-top: 10px;
          padding: 7px 12px;
          background: #000;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
        }
        .df-popup-cta:hover {
          background: #fff;
          color: #000;
          outline: 1px solid #000;
        }
        .leaflet-control-zoom a {
          border-radius: 0 !important;
          color: #000 !important;
          border-color: #000 !important;
        }
      `}</style>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
