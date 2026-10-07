import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { Pagination } from "../pagination";

export const dynamic = "force-dynamic";
const fmt = new Intl.NumberFormat("en-US");
const PAGE_SIZE = 100;

type PHRow = {
  id: string;
  apartment_code: string | null;
  unit_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_general_min: number | null;
  price_total_min: number | null;
  finishing_specs: string | null;
  last_seen_at: string | null;
  project_id: string | null;
  developer_id: string | null;
  location_id: string | null;
};

export default async function PHTablePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page ?? "1"));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const sb = getSupabaseAdmin();

  // Load lookup tables once
  const [{ data: projs }, { data: devs }, { data: locs }] = await Promise.all([
    sb.schema("propertyhub").from("projects").select("id, name"),
    sb.schema("propertyhub").from("developers").select("id, name"),
    sb.schema("propertyhub").from("locations").select("id, name"),
  ]);
  const projMap = new Map<string, string>();
  for (const p of projs ?? []) projMap.set(p.id as string, p.name as string);
  const devMap = new Map<string, string>();
  for (const d of devs ?? []) devMap.set(d.id as string, d.name as string);
  const locMap = new Map<string, string>();
  for (const l of locs ?? []) locMap.set(l.id as string, l.name as string);

  let query = sb
    .schema("propertyhub")
    .from("units")
    .select(
      "id, apartment_code, unit_type, bedrooms, bathrooms, area_general_min, price_total_min, finishing_specs, last_seen_at, project_id, developer_id, location_id",
      { count: "exact" },
    )
    .order("last_seen_at", { ascending: false });

  if (q) {
    // Server-side search on apartment_code + project_id lookup client-side is limited;
    // do simple ilike on apartment_code
    query = query.ilike("apartment_code", `%${q}%`);
  }
  const { data, count } = await query.range(from, to);
  let rows = (data ?? []) as PHRow[];

  // Client-side project/developer name filter as a supplementary pass
  if (q && rows.length === 0) {
    // fall back: search project/developer names, then filter units by their ids
    const matchProjIds = new Set(
      (projs ?? [])
        .filter((p) =>
          (p.name as string).toLowerCase().includes(q.toLowerCase()),
        )
        .map((p) => p.id as string),
    );
    const matchDevIds = new Set(
      (devs ?? [])
        .filter((d) =>
          (d.name as string).toLowerCase().includes(q.toLowerCase()),
        )
        .map((d) => d.id as string),
    );
    if (matchProjIds.size || matchDevIds.size) {
      const fbQuery = sb
        .schema("propertyhub")
        .from("units")
        .select(
          "id, apartment_code, unit_type, bedrooms, bathrooms, area_general_min, price_total_min, finishing_specs, last_seen_at, project_id, developer_id, location_id",
          { count: "exact" },
        )
        .order("last_seen_at", { ascending: false });
      const orParts: string[] = [];
      if (matchProjIds.size)
        orParts.push(`project_id.in.(${[...matchProjIds].map((id) => `"${id}"`).join(",")})`);
      if (matchDevIds.size)
        orParts.push(`developer_id.in.(${[...matchDevIds].map((id) => `"${id}"`).join(",")})`);
      const { data: fbData, count: fbCount } = await fbQuery
        .or(orParts.join(","))
        .range(from, to);
      rows = (fbData ?? []) as PHRow[];
      return renderTable(rows, fbCount ?? 0, page, q, projMap, devMap, locMap);
    }
  }

  return renderTable(rows, count ?? 0, page, q, projMap, devMap, locMap);
}

function renderTable(
  rows: PHRow[],
  count: number,
  page: number,
  q: string,
  projMap: Map<string, string>,
  devMap: Map<string, string>,
  locMap: Map<string, string>,
) {
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-medium">PropertyHub units</h2>
        <span className="text-xs text-neutral-500 tabular-nums">
          {fmt.format(count)} rows
        </span>
      </div>
      <form className="mb-4 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search apartment code, project, developer…"
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
              <th className="px-3 py-2 text-left font-semibold">Project / Code</th>
              <th className="px-3 py-2 text-left font-semibold">Developer</th>
              <th className="px-3 py-2 text-left font-semibold">Location</th>
              <th className="px-3 py-2 text-right font-semibold">Beds</th>
              <th className="px-3 py-2 text-right font-semibold">Baths</th>
              <th className="px-3 py-2 text-right font-semibold">m²</th>
              <th className="px-3 py-2 text-right font-semibold">Price (EGP)</th>
              <th className="px-3 py-2 text-left font-semibold">Finish</th>
              <th className="px-3 py-2 text-left font-semibold">Last seen</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                <td className="px-3 py-2">
                  <div className="font-medium">
                    {r.project_id ? projMap.get(r.project_id) ?? "—" : "—"}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    {r.apartment_code ?? "—"} · {r.unit_type ?? ""}
                  </div>
                </td>
                <td className="px-3 py-2 text-neutral-700">
                  {r.developer_id ? devMap.get(r.developer_id) ?? "—" : "—"}
                </td>
                <td className="px-3 py-2 text-neutral-700">
                  {r.location_id ? locMap.get(r.location_id) ?? "—" : "—"}
                </td>
                <td className="px-3 py-2 text-right">{r.bedrooms ?? "—"}</td>
                <td className="px-3 py-2 text-right">{r.bathrooms ?? "—"}</td>
                <td className="px-3 py-2 text-right">
                  {r.area_general_min ?? "—"}
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {r.price_total_min ? fmt.format(r.price_total_min) : "—"}
                </td>
                <td className="px-3 py-2 text-neutral-700">
                  {r.finishing_specs ?? "—"}
                </td>
                <td className="px-3 py-2 text-[11px] text-neutral-500">
                  {r.last_seen_at
                    ? new Date(r.last_seen_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                      })
                    : "—"}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-neutral-500">
                  No units match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        base="/inventory/propertyhub"
        page={page}
        totalPages={totalPages}
        q={q}
      />
    </section>
  );
}
