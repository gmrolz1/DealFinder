import Link from "next/link";
import {
  searchUnits,
  getAreas,
  getPropertyTypes,
  type SearchParams,
} from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { PropertyCard } from "@/components/property-card";

const PRICE_OPTS: [string, string][] = [
  ["1000000", "1M"],
  ["2000000", "2M"],
  ["3000000", "3M"],
  ["5000000", "5M"],
  ["10000000", "10M"],
  ["20000000", "20M"],
  ["50000000", "50M"],
];

const SORT_OPTS: [string, string][] = [
  ["", "Recommended"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
  ["area-desc", "Largest area"],
];

function qs(base: SearchParams, override: Partial<SearchParams>): string {
  const merged = { ...base, ...override };
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v) p.set(k, String(v));
  }
  return `/properties?${p.toString()}`;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const sp: SearchParams = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
  );

  const { results, total, page, pages } = searchUnits(sp);
  const areas = getAreas();
  const types = getPropertyTypes();

  const inputCls =
    "rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Properties for sale in Egypt
      </h1>

      {/* Filters */}
      <form
        action="/properties"
        className="mt-5 flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
      >
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search…"
          className={`${inputCls} min-w-[180px] flex-1`}
        />
        <select name="area" defaultValue={sp.area ?? ""} className={inputCls}>
          <option value="">All areas</option>
          {areas.map((a) => (
            <option key={a.nawy_id} value={a.nawy_id}>
              {a.name}
            </option>
          ))}
        </select>
        <select name="type" defaultValue={sp.type ?? ""} className={inputCls}>
          <option value="">Any type</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select name="beds" defaultValue={sp.beds ?? ""} className={inputCls}>
          <option value="">Beds</option>
          {[1, 2, 3, 4].map((b) => (
            <option key={b} value={b}>
              {b} beds
            </option>
          ))}
          <option value="5">5+ beds</option>
        </select>
        <select name="min" defaultValue={sp.min ?? ""} className={inputCls}>
          <option value="">Min price</option>
          {PRICE_OPTS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select name="max" defaultValue={sp.max ?? ""} className={inputCls}>
          <option value="">Max price</option>
          {PRICE_OPTS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={sp.sort ?? ""} className={inputCls}>
          {SORT_OPTS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <button className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
          Apply
        </button>
        <Link
          href="/properties"
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          Reset
        </Link>
      </form>

      <p className="mt-5 text-sm text-slate-500">
        {formatNumber(total)} {total === 1 ? "property" : "properties"} found
      </p>

      {/* Results */}
      {results.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
          No properties match these filters.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((u) => (
            <PropertyCard key={u.nawy_id} unit={u} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          {page > 1 ? (
            <Link
              href={qs(sp, { page: String(page - 1) })}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              ← Prev
            </Link>
          ) : (
            <span className="rounded-lg border border-slate-100 px-4 py-2 text-sm text-slate-300">
              ← Prev
            </span>
          )}
          <span className="text-sm text-slate-500">
            Page {page} of {formatNumber(pages)}
          </span>
          {page < pages ? (
            <Link
              href={qs(sp, { page: String(page + 1) })}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Next →
            </Link>
          ) : (
            <span className="rounded-lg border border-slate-100 px-4 py-2 text-sm text-slate-300">
              Next →
            </span>
          )}
        </div>
      )}
    </div>
  );
}
