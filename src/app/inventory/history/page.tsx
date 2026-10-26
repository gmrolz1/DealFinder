import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
const fmt = new Intl.NumberFormat("en-US");
const fmtDT = (s: string | null) =>
  s
    ? new Date(s).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export default async function HistoryPage() {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .schema("sync")
    .from("runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(100);
  const rows = data ?? [];

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-medium">Sync history</h2>
        <span className="text-xs text-neutral-500">last 100 runs</span>
      </div>
      <div className="overflow-x-auto rounded-md border border-neutral-200">
        <table className="w-full text-sm tabular-nums">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.1em] text-neutral-500">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">When</th>
              <th className="px-3 py-2 text-left font-semibold">Source</th>
              <th className="px-3 py-2 text-left font-semibold">Status</th>
              <th className="px-3 py-2 text-right font-semibold">Pages</th>
              <th className="px-3 py-2 text-right font-semibold">Seen</th>
              <th className="px-3 py-2 text-right font-semibold">+Added</th>
              <th className="px-3 py-2 text-right font-semibold">−Removed</th>
              <th className="px-3 py-2 text-right font-semibold">ΔChanged</th>
              <th className="px-3 py-2 text-right font-semibold">Duration</th>
              <th className="px-3 py-2 text-left font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                <td className="px-3 py-2 whitespace-nowrap">
                  {fmtDT(r.started_at)}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={
                      "inline-block rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " +
                      (r.source === "nawy"
                        ? "bg-teal-50 text-teal-700 border-teal-200"
                        : "bg-orange-50 text-orange-700 border-orange-200")
                    }
                  >
                    {r.source}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <StatusPill v={r.status} />
                </td>
                <td className="px-3 py-2 text-right">{r.pages_fetched ?? 0}</td>
                <td className="px-3 py-2 text-right">
                  {fmt.format(r.rows_seen ?? 0)}
                </td>
                <td className="px-3 py-2 text-right text-emerald-700">
                  {fmt.format(r.rows_added ?? 0)}
                </td>
                <td className="px-3 py-2 text-right text-red-700">
                  {fmt.format(r.rows_removed ?? 0)}
                </td>
                <td className="px-3 py-2 text-right text-neutral-800">
                  {fmt.format(r.rows_changed ?? 0)}
                </td>
                <td className="px-3 py-2 text-right text-neutral-500">
                  {r.duration_ms ? (r.duration_ms / 1000).toFixed(1) + "s" : "—"}
                </td>
                <td className="px-3 py-2 text-[11px] text-neutral-500 max-w-[300px] truncate" title={r.notes ?? undefined}>
                  {r.notes ?? "—"}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="px-3 py-8 text-center text-neutral-500">
                  No sync runs yet. Trigger one from the Overview tab.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatusPill({ v }: { v: string }) {
  const cls =
    v === "ok"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : v === "running"
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : v === "needs_token"
          ? "bg-yellow-50 text-yellow-800 border-yellow-200"
          : "bg-red-50 text-red-700 border-red-200";
  return (
    <span
      className={
        "inline-block rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " +
        cls
      }
    >
      {v.replace("_", " ")}
    </span>
  );
}
