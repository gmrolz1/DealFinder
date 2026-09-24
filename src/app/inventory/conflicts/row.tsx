"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const fmt = new Intl.NumberFormat("en-US");

type NawySide = {
  compound: string;
  unit: string;
  developer: string;
  area: string;
  bedrooms: number;
  m2: number;
  price: number;
  image: string;
};
type PHSide = {
  project: string;
  code: string;
  developer: string;
  bedrooms: number;
  m2: number;
  price: number;
};

export function ConflictRow({
  id,
  matchKey,
  field,
  detectedAt,
  resolvedAt,
  resolution,
  nawy,
  ph,
}: {
  id: number;
  matchKey: string;
  field: string;
  detectedAt: string;
  resolvedAt: string | null;
  resolution: string | null;
  nawy: NawySide | null;
  ph: PHSide | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function resolve(choice: "nawy" | "propertyhub" | "skip") {
    setBusy(true);
    try {
      await fetch(`/api/inventory/conflicts/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution: choice }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const priceDelta =
    nawy && ph ? Math.abs(nawy.price - ph.price) : 0;
  const pct = nawy && ph ? ((priceDelta / Math.max(nawy.price, ph.price)) * 100).toFixed(1) : "";

  return (
    <article className="rounded-md border border-neutral-200 bg-white">
      <div className="flex items-baseline justify-between border-b border-neutral-100 px-4 py-2 text-xs text-neutral-500">
        <span>
          Question · <strong className="text-neutral-800">{field}</strong> disagrees on{" "}
          <code className="text-[10px]">{matchKey}</code>
        </span>
        <span>
          Detected {new Date(detectedAt).toLocaleString("en-GB")}
        </span>
      </div>
      <div className="grid gap-0 md:grid-cols-2 divide-y divide-neutral-100 md:divide-y-0 md:divide-x">
        <div className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-block rounded border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal-700">
              Nawy
            </span>
            {nawy && <span className="text-xs text-neutral-500">{nawy.unit}</span>}
          </div>
          {nawy ? (
            <>
              <div className="font-medium">{nawy.compound}</div>
              <div className="text-xs text-neutral-500">
                {nawy.developer} · {nawy.area}
              </div>
              <div className="mt-2 text-xs text-neutral-500">
                {nawy.bedrooms} bd · {nawy.m2} m²
              </div>
              <div className="mt-3 text-2xl font-medium tabular-nums">
                {fmt.format(nawy.price)}
                <span className="ml-1 text-xs text-neutral-500">EGP</span>
              </div>
            </>
          ) : (
            <div className="text-xs text-neutral-500">
              Nawy row not found (may have been removed since detection).
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-block rounded border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-700">
              PropertyHub
            </span>
            {ph && <span className="text-xs text-neutral-500">{ph.code}</span>}
          </div>
          {ph ? (
            <>
              <div className="font-medium">{ph.project}</div>
              <div className="text-xs text-neutral-500">{ph.developer}</div>
              <div className="mt-2 text-xs text-neutral-500">
                {ph.bedrooms} bd · {ph.m2 ?? "—"} m²
              </div>
              <div className="mt-3 text-2xl font-medium tabular-nums">
                {fmt.format(ph.price)}
                <span className="ml-1 text-xs text-neutral-500">EGP</span>
              </div>
            </>
          ) : (
            <div className="text-xs text-neutral-500">PropertyHub row not found.</div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-4 py-3">
        <div className="text-xs text-neutral-600">
          Difference: <strong className="tabular-nums">{fmt.format(priceDelta)}</strong> EGP ({pct}%)
        </div>
        {resolvedAt ? (
          <span className="text-xs text-neutral-600">
            Resolved → trust <strong className="capitalize">{resolution}</strong>
          </span>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => resolve("nawy")}
              disabled={busy}
              className="rounded bg-teal-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-800 disabled:opacity-50"
            >
              Trust Nawy
            </button>
            <button
              onClick={() => resolve("propertyhub")}
              disabled={busy}
              className="rounded bg-orange-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-800 disabled:opacity-50"
            >
              Trust PropertyHub
            </button>
            <button
              onClick={() => resolve("skip")}
              disabled={busy}
              className="rounded border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
            >
              Skip
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
