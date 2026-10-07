"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type StepKey = "nawy" | "propertyhub" | "publish";

const STEP_LABEL: Record<StepKey, string> = {
  nawy: "Scrape Nawy",
  propertyhub: "Scrape PropertyHub",
  publish: "Publish to marketplace",
};

export function UpdateButtons({ nawyTokenExpired }: { nawyTokenExpired: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  function line(m: string) {
    setLog((l) => [...l, `[${new Date().toLocaleTimeString("en-GB")}] ${m}`]);
  }

  async function run(steps: StepKey[], label: string) {
    setBusy(label);
    setLog([]);
    line(`Started: ${steps.map((s) => STEP_LABEL[s]).join(" → ")}`);
    if (steps.includes("nawy") && nawyTokenExpired) {
      line("⚠ Nawy token is expired. Paste a fresh one on Settings first.");
    }
    try {
      const r = await fetch("/api/inventory/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps }),
      });
      const j = await r.json();
      const results = j.results ?? {};
      if (results.nawy) {
        const n = results.nawy;
        line(
          `Nawy: ${n.ok ? "ok" : "fail"} — seen ${n.seen ?? 0}, +${n.added ?? 0} added, −${n.removed ?? 0} removed, Δ${n.changed ?? 0} changed`,
        );
        if (n.needsToken) line("Nawy needs a fresh token — halted.");
      }
      if (results.propertyhub) {
        const p = results.propertyhub;
        line(
          `PropertyHub: ${p.ok ? "ok" : "fail"} — seen ${p.seen ?? 0}, +${p.added ?? 0} added`,
        );
      }
      if (results.publish) {
        const pb = results.publish;
        line(
          `Published: ${pb.units} units · ${pb.compounds} compounds · ${pb.developers} devs · ${pb.areas} areas (${pb.duration_ms}ms)`,
        );
      }
      if (!j.ok && j.message) line(`✗ ${j.message}`);
      router.refresh();
    } catch (e) {
      line(`Exception · ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-md border border-neutral-200 bg-white p-5">
      <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
        Actions
      </h3>
      <p className="mb-4 text-xs text-neutral-500">
        Full run is the safe default: refreshes both scrapes then publishes.
        Publish-only reuses the raw data already in <code>nawy.*</code>.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => run(["nawy", "propertyhub", "publish"], "full")}
          disabled={busy !== null}
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {busy === "full"
            ? "Running… (2–4 min)"
            : "Full: scrape both + publish"}
        </button>
        <button
          onClick={() => run(["nawy", "publish"], "nawy-publish")}
          disabled={busy !== null}
          className="rounded bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
        >
          {busy === "nawy-publish" ? "Running…" : "Nawy scrape + publish"}
        </button>
        <button
          onClick={() => run(["publish"], "publish-only")}
          disabled={busy !== null}
          className="rounded border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
        >
          {busy === "publish-only" ? "Publishing…" : "Publish only (skip scrape)"}
        </button>
      </div>
      {log.length > 0 && (
        <pre className="mt-4 max-h-64 overflow-auto rounded bg-neutral-900 p-3 text-[11px] leading-relaxed text-neutral-100">
          {log.join("\n")}
        </pre>
      )}
    </div>
  );
}
