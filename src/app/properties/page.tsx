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
  for (const [k, v] of Object.entries(merged)) if (v) p.set(k, String(v));
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

  const field =
    "border border-slate bg-ink px-3.5 py-2 text-[12px] text-paper outline-none focus:border-paper";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-[32px] font-extrabold uppercase tracking-tight text-paper sm:text-[44px]">
        Properties
      </h1>
      <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-taupe">
        {formatNumber(total)} primary {total === 1 ? "home" : "homes"}{" "}
        available
      </p>

      {/* Filters */}
      <form
        action="/properties"
        className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1"
      >
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search"
          className={`${field} min-w-[150px]`}
        />
        <select name="area" defaultValue={sp.area ?? ""} className={field}>
          <option value="">Area</option>
          {areas.map((a) => (
            <option key={a.nawy_id} value={a.nawy_id}>
              {a.name}
            </option>
          ))}
        </select>
        <select name="type" defaultValue={sp.type ?? ""} className={field}>
          <option value="">Type</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select name="beds" defaultValue={sp.beds ?? ""} className={field}>
          <option value="">Beds</option>
          {[1, 2, 3, 4].map((b) => (
            <option key={b} value={b}>
              {b} beds
            </option>
          ))}
          <option value="5">5+ beds</option>
        </select>
        <select name="min" defaultValue={sp.min ?? ""} className={field}>
          <option value="">Min</option>
          {PRICE_OPTS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select name="max" defaultValue={sp.max ?? ""} className={field}>
          <option value="">Max</option>
          {PRICE_OPTS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={sp.sort ?? ""} className={field}>
          {SORT_OPTS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <button className="shrink-0 bg-paper px-5 py-2 text-[11px] font-bold uppercase tracking-[0.07em] text-ink transition hover:bg-data">
          Apply
        </button>
        <Link
          href="/properties"
          className="shrink-0 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.07em] text-data transition hover:text-paper"
        >
          Reset
        </Link>
      </form>

      {results.length === 0 ? (
        <div className="mt-12 border border-slate py-16 text-center text-[12px] font-semibold uppercase tracking-[0.08em] text-data">
          No properties match these filters
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {results.map((u) => (
            <PropertyCard key={u.nawy_id} unit={u} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-3">
          {page > 1 ? (
            <Link
              href={qs(sp, { page: String(page - 1) })}
              className="border border-slate px-5 py-2 text-[11px] font-bold uppercase tracking-[0.07em] text-paper transition hover:border-data"
            >
              Prev
            </Link>
          ) : (
            <span className="border border-slate/40 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.07em] text-slate">
              Prev
            </span>
          )}
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-data">
            {page} / {formatNumber(pages)}
          </span>
          {page < pages ? (
            <Link
              href={qs(sp, { page: String(page + 1) })}
              className="border border-slate px-5 py-2 text-[11px] font-bold uppercase tracking-[0.07em] text-paper transition hover:border-data"
            >
              Next
            </Link>
          ) : (
            <span className="border border-slate/40 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.07em] text-slate">
              Next
            </span>
          )}
        </div>
      )}
    </div>
  );
}
