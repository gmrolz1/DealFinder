import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { SyncTriggers } from "./sync-triggers";

export const dynamic = "force-dynamic";

const fmt = new Intl.NumberFormat("en-US");
const fmtDate = (s: string | null) =>
  s
    ? new Date(s).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

type LastRun = {
  id: number;
  source: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  rows_seen: number | null;
  rows_added: number | null;
  rows_removed: number | null;
  rows_changed: number | null;
  duration_ms: number | null;
  notes: string | null;
};

type Cred = {
  source: string;
  kind: string;
  expires_at: string | null;
  updated_at: string;
  last_ok_at: string | null;
  last_fail_at: string | null;
  last_fail_reason: string | null;
};

export default async function InventoryOverview() {
  const sb = getSupabaseAdmin();

  const [
    { count: nawyUnits },
    { count: nawyCompounds },
    { count: phUnits },
    { count: phProjects },
    { count: openConflicts },
    { data: nawyLast },
    { data: phLast },
    { data: creds },
  ] = await Promise.all([
    sb.schema("nawy").from("units").select("*", { count: "exact", head: true }),
    sb.schema("nawy").from("compounds").select("*", { count: "exact", head: true }),
    sb.schema("propertyhub").from("units").select("*", { count: "exact", head: true }),
    sb.schema("propertyhub").from("projects").select("*", { count: "exact", head: true }),
    sb
      .schema("sync")
      .from("conflicts")
      .select("*", { count: "exact", head: true })
      .is("resolved_at", null),
    sb
      .schema("sync")
      .from("runs")
      .select("*")
      .eq("source", "nawy")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    sb
      .schema("sync")
      .from("runs")
      .select("*")
      .eq("source", "propertyhub")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    sb.schema("sync").from("credentials").select("*"),
  ]);

  const credBy: Record<string, Cred | undefined> = {};
  for (const c of (creds ?? []) as Cred[]) credBy[c.source] = c;

  const cards = [
    {
      key: "nawy" as const,
      title: "Nawy",
      subtitle: "erealty.nawy.com · Bearer token",
      color: "bg-teal-700",
      stats: [
        { label: "Units", value: nawyUnits ?? 0 },
        { label: "Compounds", value: nawyCompounds ?? 0 },
      ],
      lastRun: nawyLast as LastRun | null,
      cred: credBy.nawy,
    },
    {
      key: "propertyhub" as const,
      title: "PropertyHub",
      subtitle: "propertyhub.site · Session cookie",
      color: "bg-orange-700",
      stats: [
        { label: "Units", value: phUnits ?? 0 },
        { label: "Projects", value: phProjects ?? 0 },
      ],
      lastRun: phLast as LastRun | null,
      cred: credBy.propertyhub,
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Nawy units" value={fmt.format(nawyUnits ?? 0)} />
        <Kpi label="PropertyHub units" value={fmt.format(phUnits ?? 0)} />
        <Kpi
          label="Open conflicts"
          value={fmt.format(openConflicts ?? 0)}
          highlight={(openConflicts ?? 0) > 0}
          link="/dashboard/inventory/conflicts"
        />
        <Kpi
          label="Last update"
          value={fmtDate(
            (nawyLast?.finished_at ?? nawyLast?.started_at) ||
              (phLast?.finished_at ?? phLast?.started_at) ||
              null,
          )}
        />
      </div>

      {/* Source cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((c) => {
          const { key, ...rest } = c;
          return <SourceCard key={key} {...rest} />;
        })}
      </div>

      <SyncTriggers />
    </div>
  );
}

function Kpi({
  label,
  value,
  highlight,
  link,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  link?: string;
}) {
  const body = (
    <div
      className={
        "rounded-md border p-4 " +
        (highlight
          ? "border-orange-400 bg-orange-50"
          : "border-neutral-200 bg-white")
      }
    >
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-medium tabular-nums tracking-tight">
        {value}
      </div>
    </div>
  );
  return link ? <Link href={link}>{body}</Link> : body;
}

function SourceCard(c: {
  title: string;
  subtitle: string;
  color: string;
  stats: { label: string; value: number }[];
  lastRun: LastRun | null;
  cred?: Cred;
}) {
  const r = c.lastRun;
  const credOk = c.cred?.last_ok_at && !c.cred?.last_fail_at;
  const credStatus = !c.cred
    ? "No credential stored"
    : c.cred.expires_at && new Date(c.cred.expires_at) < new Date()
      ? "Expired"
      : c.cred.last_fail_at &&
          (!c.cred.last_ok_at ||
            new Date(c.cred.last_fail_at) > new Date(c.cred.last_ok_at))
        ? `Failing · ${c.cred.last_fail_reason ?? "unknown"}`
        : "OK";

  return (
    <article className="rounded-md border border-neutral-200 bg-white">
      <div className={"h-1 w-full rounded-t-md " + c.color} />
      <div className="p-5">
        <div className="flex items-baseline justify-between">
          <div>
            <h3 className="text-lg font-medium">{c.title}</h3>
            <p className="text-xs text-neutral-500">{c.subtitle}</p>
          </div>
          <span
            className={
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " +
              (credOk
                ? "bg-emerald-50 text-emerald-700"
                : "bg-orange-50 text-orange-700")
            }
          >
            {credStatus}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-neutral-100 pt-4">
          {c.stats.map((s) => (
            <div key={s.label}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                {s.label}
              </div>
              <div className="mt-1 text-xl font-medium tabular-nums">
                {fmt.format(s.value)}
              </div>
            </div>
          ))}
        </div>
        {r ? (
          <div className="mt-4 rounded bg-neutral-50 p-3 text-xs">
            <div className="mb-1 flex justify-between text-neutral-500">
              <span>Last sync</span>
              <span>{fmtDate(r.finished_at || r.started_at)}</span>
            </div>
            <div className="flex justify-between text-neutral-800">
              <span className="font-medium capitalize">{r.status}</span>
              <span className="tabular-nums">
                +{fmt.format(r.rows_added ?? 0)} · −
                {fmt.format(r.rows_removed ?? 0)} · Δ
                {fmt.format(r.rows_changed ?? 0)}
              </span>
            </div>
            {r.notes && (
              <div className="mt-1 text-neutral-500">{r.notes}</div>
            )}
          </div>
        ) : (
          <p className="mt-4 text-xs text-neutral-500">No syncs yet.</p>
        )}
      </div>
    </article>
  );
}
