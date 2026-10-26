import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { Pagination } from "../pagination";

export const dynamic = "force-dynamic";
const fmt = new Intl.NumberFormat("en-US");
const PAGE_SIZE = 100;

// One row per Nawy project: commission range + the date Nawy last updated
// that project's inventory (the "Updated yesterday" line on erealty).
export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page ?? "1"));
  const from = (page - 1) * PAGE_SIZE;

  const sb = getSupabaseAdmin();
  let query = sb
    .schema("nawy")
    .from("project_summary")
    .select("*", { count: "exact" })
    .order("last_inventory_update", { ascending: false, nullsFirst: false });
  if (q) {
    query = query.or(
      [`name.ilike.%${q}%`, `developer_name.ilike.%${q}%`, `area_name.ilike.%${q}%`].join(","),
    );
  }
  const { data, count } = await query.range(from, from + PAGE_SIZE - 1);
  const rows = data ?? [];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-medium">Projects (Nawy)</h2>
        <span className="text-xs text-neutral-500 tabular-nums">
          {fmt.format(count ?? 0)} projects
        </span>
      </div>
      <form className="mb-4 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search project, developer, area…"
          className="w-full max-w-md rounded border border-neutral-300 px-3 py-1.5 text-sm"
        />
        <button className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white" type="submit">
          Search
        </button>
      </form>
      <div className="overflow-x-auto rounded-md border border-neutral-200">
        <table className="w-full text-sm tabular-nums">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.1em] text-neutral-500">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Project</th>
              <th className="px-3 py-2 text-left font-semibold">Developer</th>
              <th className="px-3 py-2 text-left font-semibold">Area</th>
              <th className="px-3 py-2 text-right font-semibold">Primary units</th>
              <th className="px-3 py-2 text-right font-semibold">Price range (EGP)</th>
              <th className="px-3 py-2 text-right font-semibold">Commission</th>
              <th className="px-3 py-2 text-left font-semibold">Nawy last update</th>
              <th className="px-3 py-2 text-left font-semibold">Our sync</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id as number} className="border-t border-neutral-100 hover:bg-neutral-50">
                <td className="px-3 py-2">
                  <div className="font-medium">
                    <Link href={`/inventory/projects/${r.id}`} className="hover:underline">
                      {r.name}
                    </Link>
                    {r.is_launch && (
                      <span className="ml-2 rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] text-white">
                        LAUNCH
                      </span>
                    )}
                  </div>
                  {r.parent_compound_name && (
                    <div className="text-[11px] text-neutral-500">{r.parent_compound_name}</div>
                  )}
                </td>
                <td className="px-3 py-2 text-neutral-700">{r.developer_name ?? "—"}</td>
                <td className="px-3 py-2 text-neutral-700">{r.area_name ?? "—"}</td>
                <td className="px-3 py-2 text-right">{r.property_count_primary ?? "—"}</td>
                <td className="px-3 py-2 text-right">
                  {r.min_price_primary
                    ? `${fmt.format(r.min_price_primary)} – ${fmt.format(r.max_price_primary ?? r.min_price_primary)}`
                    : "—"}
                </td>
                <td className="px-3 py-2 text-right font-medium">{commission(r)}</td>
                <td className="px-3 py-2 text-[11px] text-neutral-700">{day(r.last_inventory_update)}</td>
                <td className="px-3 py-2 text-[11px] text-neutral-500">{day(r.synced_at)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-neutral-500">
                  No projects match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination base="/inventory/projects" page={page} totalPages={totalPages} q={q} />
    </section>
  );
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
