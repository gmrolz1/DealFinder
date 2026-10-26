import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
const fmt = new Intl.NumberFormat("en-US");

type CmaRow = {
  compound_id: number;
  name: string;
  developer_name: string | null;
  area_name: string | null;
  is_subject: boolean;
  units: number;
  ppm_min: number;
  ppm_median: number;
  ppm_max: number;
  price_min: number;
  price_max: number;
  area_min: number | null;
  area_max: number | null;
  down_min: number | null;
  years_max: number | null;
  finishing: string | null;
  ready_min: string | null;
  ready_max: string | null;
  comm_max: number | null;
  last_inventory_update: string | null;
};

const SORTS: Record<string, { label: string; by: (a: CmaRow, b: CmaRow) => number }> = {
  ppm: { label: "Price / m²", by: (a, b) => b.ppm_median - a.ppm_median },
  down: { label: "Lowest down", by: (a, b) => (a.down_min ?? 99) - (b.down_min ?? 99) },
  years: { label: "Longest years", by: (a, b) => (b.years_max ?? 0) - (a.years_max ?? 0) },
  units: { label: "Most units", by: (a, b) => b.units - a.units },
  delivery: {
    label: "Soonest delivery",
    by: (a, b) => (a.ready_min ?? "9999").localeCompare(b.ready_min ?? "9999"),
  },
};

// One project: its CMA (every primary project in the same area selling the
// same property type, from our scraped Nawy units) + the social module.
export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string; sort?: string }>;
}) {
  const { id: idParam } = await params;
  const sp = await searchParams;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const sb = getSupabaseAdmin();
  const nawy = sb.schema("nawy");
  const [{ data: project }, { data: types }] = await Promise.all([
    nawy.from("project_summary").select("*").eq("id", id).maybeSingle(),
    nawy.rpc("project_types", { p_compound_id: id }),
  ]);
  if (!project) notFound();

  const typeList = (types ?? []) as { property_type: string; units: number }[];
  const type =
    sp.type && typeList.some((t) => t.property_type === sp.type)
      ? sp.type
      : typeList[0]?.property_type ?? null;
  const sortKey = sp.sort && SORTS[sp.sort] ? sp.sort : "ppm";

  const { data: cmaData } = type
    ? await nawy.rpc("project_cma", { p_compound_id: id, p_type: type })
    : { data: [] };
  const rows = ((cmaData ?? []) as CmaRow[]).map((r) => ({
    ...r,
    ppm_median: Number(r.ppm_median),
    ppm_min: Number(r.ppm_min),
    ppm_max: Number(r.ppm_max),
    units: Number(r.units),
  }));
  rows.sort(SORTS[sortKey].by);

  const subject = rows.find((r) => r.is_subject);
  const others = rows.filter((r) => !r.is_subject);
  const marketMedian = median(others.map((r) => r.ppm_median));
  const byPpm = [...rows].sort((a, b) => b.ppm_median - a.ppm_median);
  const rank = subject ? byPpm.indexOf(subject) + 1 : null;
  const gap = subject && marketMedian ? (subject.ppm_median / marketMedian - 1) * 100 : null;
  const lowestDown = min(others.map((r) => r.down_min));
  const longestYears = max(others.map((r) => r.years_max));

  const link = (p: { type?: string | null; sort?: string }) => {
    const qs = new URLSearchParams();
    const t = p.type === undefined ? type : p.type;
    const s = p.sort ?? sortKey;
    if (t && t !== typeList[0]?.property_type) qs.set("type", t);
    if (s !== "ppm") qs.set("sort", s);
    const str = qs.toString();
    return `/inventory/projects/${id}${str ? `?${str}` : ""}`;
  };

  return (
    <section className="space-y-8">
      <div>
        <Link href="/inventory/projects" className="text-xs text-neutral-500 hover:text-neutral-900 hover:underline">
          ← all projects
        </Link>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-2xl font-medium tracking-tight">
              {project.name}
              {project.is_launch && (
                <span className="ml-2 rounded bg-neutral-900 px-1.5 py-0.5 align-middle text-[10px] text-white">
                  LAUNCH
                </span>
              )}
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              {project.developer_name ?? "—"} · {project.area_name ?? "—"}
              {project.parent_compound_name && ` · part of ${project.parent_compound_name}`}
            </p>
          </div>
          <dl className="flex gap-6 text-right text-xs text-neutral-500">
            <Fact label="Primary units" value={project.property_count_primary ?? "—"} />
            <Fact label="Commission" value={commission(project)} />
            <Fact label="Nawy last update" value={day(project.last_inventory_update)} />
          </dl>
        </div>
      </div>

      {/* ── CMA ─────────────────────────────────────────────── */}
      <div>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">01 · CMA</p>
            <h3 className="text-lg font-medium">
              {type ? `${type}s in ${subject?.area_name ?? project.area_name}` : "No primary units scraped"}
            </h3>
          </div>
          <span className="text-xs text-neutral-500 tabular-nums">{rows.length} projects compared</span>
        </div>

        {typeList.length > 1 && (
          <div className="mb-3 flex flex-wrap gap-1 text-xs">
            {typeList.map((t) => (
              <Link
                key={t.property_type}
                href={link({ type: t.property_type })}
                className={
                  "rounded-full border px-3 py-1 " +
                  (t.property_type === type
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 text-neutral-700 hover:border-neutral-900")
                }
              >
                {t.property_type} <span className="opacity-60">{t.units}</span>
              </Link>
            ))}
          </div>
        )}

        {subject && (
          <div className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-neutral-200 bg-neutral-200 sm:grid-cols-4">
            <Stat
              label="Price / m² (median)"
              value={fmt.format(subject.ppm_median)}
              sub={marketMedian ? `area median ${fmt.format(Math.round(marketMedian))}` : undefined}
            />
            <Stat
              label="vs area"
              value={gap == null ? "—" : `${gap > 0 ? "+" : ""}${gap.toFixed(0)}%`}
              sub={gap == null ? undefined : gap > 0 ? "pricier than the area" : "cheaper than the area"}
            />
            <Stat label="Rank by price / m²" value={rank ? `${rank} of ${rows.length}` : "—"} sub="1 = most expensive" />
            <Stat
              label="Payment plan"
              value={plan(subject.down_min, subject.years_max)}
              sub={`area best: ${plan(lowestDown, longestYears)}`}
            />
          </div>
        )}

        <div className="mb-2 flex flex-wrap items-center gap-1 text-xs text-neutral-500">
          <span className="mr-1">Sort:</span>
          {Object.entries(SORTS).map(([k, s]) => (
            <Link
              key={k}
              href={link({ sort: k })}
              className={
                "rounded px-2 py-0.5 " +
                (k === sortKey ? "bg-neutral-200 text-neutral-900" : "hover:text-neutral-900")
              }
            >
              {s.label}
            </Link>
          ))}
        </div>

        <div className="overflow-x-auto rounded-md border border-neutral-200">
          <table className="w-full text-sm tabular-nums">
            <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.1em] text-neutral-500">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Project</th>
                <th className="px-3 py-2 text-left font-semibold">Developer</th>
                <th className="px-3 py-2 text-right font-semibold">Units</th>
                <th className="px-3 py-2 text-right font-semibold">Price / m²</th>
                <th className="px-3 py-2 text-right font-semibold">Price (EGP)</th>
                <th className="px-3 py-2 text-right font-semibold">Size m²</th>
                <th className="px-3 py-2 text-right font-semibold">Down / years</th>
                <th className="px-3 py-2 text-left font-semibold">Finishing</th>
                <th className="px-3 py-2 text-left font-semibold">Delivery</th>
                <th className="px-3 py-2 text-right font-semibold">Comm.</th>
                <th className="px-3 py-2 text-left font-semibold">Nawy update</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.compound_id}
                  className={
                    "border-t border-neutral-100 " +
                    (r.is_subject ? "bg-neutral-900 text-white" : "hover:bg-neutral-50")
                  }
                >
                  <td className="px-3 py-2 font-medium">
                    {r.is_subject ? (
                      r.name
                    ) : (
                      <Link href={`/inventory/projects/${r.compound_id}`} className="hover:underline">
                        {r.name}
                      </Link>
                    )}
                  </td>
                  <td className={"px-3 py-2 " + (r.is_subject ? "" : "text-neutral-700")}>{r.developer_name ?? "—"}</td>
                  <td className="px-3 py-2 text-right">{r.units}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="font-medium">{fmt.format(r.ppm_median)}</div>
                    {r.ppm_min !== r.ppm_max && (
                      <div className={"text-[11px] " + (r.is_subject ? "text-neutral-300" : "text-neutral-500")}>
                        {k(r.ppm_min)}–{k(r.ppm_max)}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">{range(r.price_min, r.price_max, m)}</td>
                  <td className="px-3 py-2 text-right">{range(r.area_min, r.area_max, (v) => fmt.format(Math.round(v)))}</td>
                  <td className="px-3 py-2 text-right">{plan(r.down_min, r.years_max)}</td>
                  <td className="px-3 py-2 text-[12px]">{finishing(r.finishing)}</td>
                  <td className="px-3 py-2 text-[12px]">{delivery(r.ready_min, r.ready_max)}</td>
                  <td className="px-3 py-2 text-right">{r.comm_max != null ? `${Number(r.comm_max)}%` : "—"}</td>
                  <td className={"px-3 py-2 text-[11px] " + (r.is_subject ? "text-neutral-300" : "text-neutral-500")}>
                    {day(r.last_inventory_update)}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-3 py-8 text-center text-neutral-500">
                    No primary units for this project in our Nawy copy yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-neutral-500">
          Built from the Nawy primary inventory in our database: same area, same property type, one row per project.
          Price / m² = median of the listed units (range below it). Down / years = lowest down payment and longest
          plan on offer. Numbers are only as fresh as the last sync ({day(project.synced_at)}).
        </p>
      </div>

      {/* ── Social media (coming soon) ──────────────────────── */}
      <div>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">02 · Social media</p>
            <h3 className="text-lg font-medium">Videos people are posting about {project.name}</h3>
          </div>
          <span className="rounded-full border border-neutral-300 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-600">
            Coming soon
          </span>
        </div>
        <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-5">
          <p className="max-w-2xl text-sm text-neutral-600">
            Every TikTok, Reel, YouTube and Facebook video that mentions this project, in one place: who posted it,
            views, likes, comments and what people are saying, so the team knows the talk around the project before
            planning its campaign.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {["TikTok", "Instagram Reels", "YouTube", "Facebook"].map((p) => (
              <div key={p} className="rounded-md border border-neutral-200 bg-white p-3 opacity-60">
                <div className="aspect-[9/16] w-full rounded bg-neutral-100" />
                <p className="mt-2 text-xs font-medium text-neutral-700">{p}</p>
                <p className="text-[11px] text-neutral-400">— views · — comments</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="uppercase tracking-[0.1em]">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-neutral-900 tabular-nums">{value}</dd>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white p-3">
      <p className="text-[10px] uppercase tracking-[0.1em] text-neutral-500">{label}</p>
      <p className="mt-1 text-xl font-medium tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-neutral-500">{sub}</p>}
    </div>
  );
}

const nums = (xs: (number | string | null)[]) =>
  xs.filter((x): x is number | string => x != null).map(Number);
const min = (xs: (number | string | null)[]) => (nums(xs).length ? Math.min(...nums(xs)) : null);
const max = (xs: (number | string | null)[]) => (nums(xs).length ? Math.max(...nums(xs)) : null);

function median(xs: number[]) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

const k = (v: number) => `${Math.round(v / 1000)}K`;
const m = (v: number) => (v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : k(v));

function range(lo: number | string | null, hi: number | string | null, f: (v: number) => string) {
  if (lo == null) return "—";
  const a = Number(lo);
  const b = Number(hi ?? lo);
  return f(a) === f(b) ? f(a) : `${f(a)}–${f(b)}`;
}

function plan(down: number | string | null, years: number | string | null) {
  if (down == null && years == null) return "—";
  return `${down != null ? Number(down) : "—"}% / ${years != null ? Number(years) : "—"} yrs`;
}

function finishing(v: string | null) {
  if (!v) return "—";
  return v.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

function delivery(lo: string | null, hi: string | null) {
  if (!lo) return "—";
  const a = new Date(lo).getFullYear();
  const b = hi ? new Date(hi).getFullYear() : a;
  return a === b ? String(a) : `${a}–${b}`;
}

function commission(r: { comm_normal_min: number | null; comm_normal_max: number | null }) {
  const { comm_normal_min: lo, comm_normal_max: hi } = r;
  if (hi == null) return "—";
  return lo != null && lo !== hi ? `${lo}–${hi}%` : `${hi}%`;
}

function day(v: string | null) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
