import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
const fmt = new Intl.NumberFormat("en-US");
const PAGE_SIZE = 100;

export default async function NawyTablePage({
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
  let query = sb
    .schema("nawy")
    .from("units")
    .select(
      "id, unit_id, compound_name, developer_name, area_name, property_type, bedrooms, bathrooms, unit_area, price, finishing, ready_by, last_seen_at, image",
      { count: "exact" },
    )
    .order("last_seen_at", { ascending: false });
  if (q) {
    query = query.or(
      [
        `compound_name.ilike.%${q}%`,
        `developer_name.ilike.%${q}%`,
        `area_name.ilike.%${q}%`,
        `unit_id.ilike.%${q}%`,
      ].join(","),
    );
  }
  const { data, count } = await query.range(from, to);
  const rows = data ?? [];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-medium">Nawy units</h2>
        <span className="text-xs text-neutral-500 tabular-nums">
          {fmt.format(count ?? 0)} rows
        </span>
      </div>
      <form className="mb-4 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search compound, developer, area, unit id…"
          className="w-full max-w-md rounded border border-neutral-300 px-3 py-1.5 text-sm"
        />
        <button
          className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white"
          type="submit"
        >
          Search
        </button>
      </form>
      <div className="overflow-x-auto rounded-md border border-neutral-200">
        <table className="w-full text-sm tabular-nums">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.1em] text-neutral-500">
            <tr>
              <Th>Compound / Unit</Th>
              <Th>Developer</Th>
              <Th>Area</Th>
              <Th className="text-right">Beds</Th>
              <Th className="text-right">Baths</Th>
              <Th className="text-right">m²</Th>
              <Th className="text-right">Price (EGP)</Th>
              <Th>Finish</Th>
              <Th>Last seen</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id as number}
                className="border-t border-neutral-100 hover:bg-neutral-50"
              >
                <td className="px-3 py-2">
                  <div className="font-medium">{r.compound_name ?? "—"}</div>
                  <div className="text-[11px] text-neutral-500">
                    {r.unit_id ?? "—"} · {r.property_type ?? ""}
                  </div>
                </td>
                <td className="px-3 py-2 text-neutral-700">
                  {r.developer_name ?? "—"}
                </td>
                <td className="px-3 py-2 text-neutral-700">
                  {r.area_name ?? "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  {r.bedrooms ?? "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  {r.bathrooms ?? "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  {r.unit_area ?? "—"}
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {r.price ? fmt.format(r.price as number) : "—"}
                </td>
                <td className="px-3 py-2 text-neutral-700">
                  {r.finishing ?? "—"}
                </td>
                <td className="px-3 py-2 text-[11px] text-neutral-500">
                  {r.last_seen_at
                    ? new Date(r.last_seen_at as string).toLocaleDateString(
                        "en-GB",
                        { day: "2-digit", month: "short" },
                      )
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
        base="/dashboard/inventory/nawy"
        page={page}
        totalPages={totalPages}
        q={q}
      />
    </section>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={"px-3 py-2 text-left font-semibold " + className}
    >
      {children}
    </th>
  );
}

export function Pagination({
  base,
  page,
  totalPages,
  q,
}: {
  base: string;
  page: number;
  totalPages: number;
  q: string;
}) {
  if (totalPages <= 1) return null;
  const link = (p: number) => {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return s ? `${base}?${s}` : base;
  };
  return (
    <div className="mt-4 flex items-center justify-between text-xs text-neutral-600">
      <span>
        Page {page} of {fmt.format(totalPages)}
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={link(page - 1)} className="rounded border border-neutral-300 px-2 py-1 hover:bg-neutral-50">
            ← Prev
          </Link>
        )}
        {page < totalPages && (
          <Link href={link(page + 1)} className="rounded border border-neutral-300 px-2 py-1 hover:bg-neutral-50">
            Next →
          </Link>
        )}
      </div>
    </div>
  );
}
