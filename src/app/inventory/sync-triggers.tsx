"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SyncTriggers() {
  const router = useRouter();
  const [busy, setBusy] = useState<"nawy" | "propertyhub" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function run(source: "nawy" | "propertyhub") {
    setBusy(source);
    setMsg(`Running ${source} sync… this can take 1–3 minutes.`);
    try {
      const r = await fetch(`/api/inventory/sync/${source}`, { method: "POST" });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        if (j.needsToken) {
          setMsg(
            `${source}: token expired or missing → go to Tokens tab.`,
          );
        } else {
          setMsg(`${source}: FAILED · ${j.message ?? "unknown error"}`);
        }
      } else {
        setMsg(
          `${source}: done · ${j.seen} seen · +${j.added} added · −${j.removed} removed · Δ${j.changed} changed`,
        );
        router.refresh();
      }
    } catch (e) {
      setMsg(`${source}: exception · ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-md border border-neutral-200 bg-white p-5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
        Manual sync
      </h3>
      <p className="mt-1 text-xs text-neutral-600">
        Each button fetches everything and diffs against the DB. Nothing is
        deleted at the source — only the local mirror updates.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => run("nawy")}
          disabled={busy !== null}
          className="rounded bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
        >
          {busy === "nawy" ? "Syncing Nawy…" : "Sync Nawy"}
        </button>
        <button
          onClick={() => run("propertyhub")}
          disabled={busy !== null}
          className="rounded bg-orange-700 px-4 py-2 text-sm font-medium text-white hover:bg-orange-800 disabled:opacity-50"
        >
          {busy === "propertyhub"
            ? "Syncing PropertyHub…"
            : "Sync PropertyHub"}
        </button>
      </div>
      {msg && (
        <div className="mt-3 rounded bg-neutral-50 p-2 font-mono text-xs text-neutral-700">
          {msg}
        </div>
      )}
    </div>
  );
}
