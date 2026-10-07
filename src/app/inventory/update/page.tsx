import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { UpdateButtons } from "./buttons";

export const dynamic = "force-dynamic";

const fmt = new Intl.NumberFormat("en-US");
const fmtDT = (s: string | null | undefined) =>
  s
    ? new Date(s).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const relTime = (s: string | null | undefined) => {
  if (!s) return "never";
  const diff = Date.now() - new Date(s).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

export default async function UpdatePage() {
  const sb = getSupabaseAdmin();

  const [
    { data: nawyLast },
    { data: phLast },
    { data: siteImports },
    { count: nawyUnits },
    { count: siteUnits },
    { count: siteCompounds },
    { count: siteAreas },
    { count: siteDevs },
    { data: creds },
  ] = await Promise.all([
    sb.schema("sync").from("runs").select("*").eq("source", "nawy")
      .eq("status", "ok").order("started_at", { ascending: false }).limit(1).maybeSingle(),
    sb.schema("sync").from("runs").select("*").eq("source", "propertyhub")
      .eq("status", "ok").order("started_at", { ascending: false }).limit(1).maybeSingle(),
    sb.schema("sync").from("site_imports").select("*")
      .order("started_at", { ascending: false }).limit(10),
    sb.schema("nawy").from("units").select("*", { count: "exact", head: true }),
    sb.from("units").select("*", { count: "exact", head: true }),
    sb.from("compounds").select("*", { count: "exact", head: true }),
    sb.from("areas").select("*", { count: "exact", head: true }),
    sb.from("developers").select("*", { count: "exact", head: true }),
    sb.schema("sync").from("credentials").select("*"),
  ]);

  const credBy: Record<string, { expires_at: string | null; last_ok_at: string | null }> = {};
  for (const c of (creds ?? []) as Array<{
    source: string;
    expires_at: string | null;
    last_ok_at: string | null;
  }>)
    credBy[c.source] = { expires_at: c.expires_at, last_ok_at: c.last_ok_at };

  const nawyExpired =
    credBy["nawy"]?.expires_at && new Date(credBy["nawy"].expires_at) < new Date();
  const lastPublish = siteImports?.[0];

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Update inventory</h2>
        <p className="text-xs text-neutral-500">
          Two stages: <strong>scrape</strong> (external API → our raw
          <code className="mx-1">nawy.*</code> mirror) then{" "}
          <strong>publish</strong> (raw → <code className="mx-1">public.*</code> the
          marketplace reads). Paste tokens on the{" "}
          <Link href="/inventory/settings" className="underline">
            Settings
          </Link>{" "}
          tab; press the buttons here to run.
        </p>
      </div>

      {/* Big status strip */}
      <div className="grid gap-4 md:grid-cols-3">
        <StageCard
          title="Scrape"
          subtitle="external API → nawy.* raw mirror"
          badge={nawyExpired ? "TOKEN EXPIRED" : nawyLast ? "OK" : "NO RUN"}
          badgeCls={
            nawyExpired
              ? "bg-red-50 text-red-700 border-red-200"
              : nawyLast
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-neutral-100 text-neutral-500 border-neutral-300"
          }
          rows={[
            { k: "Last successful scrape", v: fmtDT(nawyLast?.started_at ?? null) + " · " + relTime(nawyLast?.started_at ?? null) },
            { k: "Units in raw", v: fmt.format(nawyUnits ?? 0) },
            { k: "Nawy token expiry", v: fmtDT(credBy["nawy"]?.expires_at ?? null) + (nawyExpired ? " · EXPIRED" : "") },
          ]}
        />

        <StageCard
          title="Publish"
          subtitle="nawy.* → public.* (site tables)"
          badge={lastPublish?.status === "ok" ? "OK" : lastPublish ? "FAILED" : "NO RUN"}
          badgeCls={
            lastPublish?.status === "ok"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : lastPublish
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-neutral-100 text-neutral-500 border-neutral-300"
          }
          rows={[
            { k: "Last publish", v: fmtDT(lastPublish?.started_at ?? null) + " · " + relTime(lastPublish?.started_at ?? null) },
            { k: "Units published last run", v: fmt.format(lastPublish?.units_upserted ?? 0) },
            { k: "Compounds published last run", v: fmt.format(lastPublish?.compounds_upserted ?? 0) },
          ]}
        />

        <StageCard
          title="Live on marketplace"
          subtitle="public.* — what visitors see"
          badge={(siteUnits ?? 0) > 0 ? "LIVE" : "EMPTY"}
          badgeCls={
            (siteUnits ?? 0) > 0
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-yellow-50 text-yellow-800 border-yellow-200"
          }
          rows={[
            { k: "Units", v: fmt.format(siteUnits ?? 0) },
            { k: "Compounds", v: fmt.format(siteCompounds ?? 0) },
            { k: "Developers · Areas", v: `${fmt.format(siteDevs ?? 0)} · ${fmt.format(siteAreas ?? 0)}` },
          ]}
        />
      </div>

      {/* Action strip */}
      <UpdateButtons nawyTokenExpired={!!nawyExpired} />

      {/* History */}
      <div>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
          Recent publishes
        </h3>
        <div className="overflow-x-auto rounded-md border border-neutral-200">
          <table className="w-full text-sm tabular-nums">
            <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.1em] text-neutral-500">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">When</th>
                <th className="px-3 py-2 text-left font-semibold">Status</th>
                <th className="px-3 py-2 text-right font-semibold">Areas</th>
                <th className="px-3 py-2 text-right font-semibold">Developers</th>
                <th className="px-3 py-2 text-right font-semibold">Compounds</th>
                <th className="px-3 py-2 text-right font-semibold">Units</th>
                <th className="px-3 py-2 text-right font-semibold">Duration</th>
                <th className="px-3 py-2 text-left font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {(siteImports ?? []).map((r) => (
                <tr key={r.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                  <td className="px-3 py-2 whitespace-nowrap">{fmtDT(r.started_at)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        "inline-block rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " +
                        (r.status === "ok"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : r.status === "running"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-red-50 text-red-700 border-red-200")
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">{fmt.format(r.areas_upserted ?? 0)}</td>
                  <td className="px-3 py-2 text-right">{fmt.format(r.developers_upserted ?? 0)}</td>
                  <td className="px-3 py-2 text-right">{fmt.format(r.compounds_upserted ?? 0)}</td>
                  <td className="px-3 py-2 text-right font-semibold">{fmt.format(r.units_upserted ?? 0)}</td>
                  <td className="px-3 py-2 text-right text-neutral-500">
                    {r.duration_ms ? (r.duration_ms / 1000).toFixed(1) + "s" : "—"}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-neutral-500 max-w-[300px] truncate" title={r.notes ?? undefined}>
                    {r.notes ?? "—"}
                  </td>
                </tr>
              ))}
              {(siteImports?.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-neutral-500">
                    No publishes yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function StageCard({
  title,
  subtitle,
  badge,
  badgeCls,
  rows,
}: {
  title: string;
  subtitle: string;
  badge: string;
  badgeCls: string;
  rows: { k: string; v: string }[];
}) {
  return (
    <article className="rounded-md border border-neutral-200 bg-white p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-[11px] text-neutral-500">{subtitle}</p>
        </div>
        <span
          className={
            "inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " +
            badgeCls
          }
        >
          {badge}
        </span>
      </div>
      <dl className="space-y-1.5 text-xs">
        {rows.map((r) => (
          <div key={r.k} className="flex justify-between gap-3">
            <dt className="text-neutral-500">{r.k}</dt>
            <dd className="text-right font-medium text-neutral-900 tabular-nums">{r.v}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
