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
    "rounded-lg border border-hairline bg-surface px-3.5 py-2 text-[13px] text-ink outline-none focus:border-primary";

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
      <h1 className="text-[28px] font-black tracking-tight text-ink sm:text-[34px]">
        Properties for sale in Egypt
      </h1>
      <p className="mt-1 text-[15px] text-muted">
        {formatNumber(total)} primary {total === 1 ? "home" : "homes"}{" "}
        available
      </p>

      {/* Filters */}
      <form
        action="/properties"
        className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1"
      >
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search"
          className={`${field} min-w-[160px]`}
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
        <button className="shrink-0 rounded-full bg-primary px-5 py-2 text-[13px] font-medium text-white transition hover:bg-primary-dark">
          Apply
        </button>
        <Link
          href="/properties"
          className="shrink-0 rounded-full px-3 py-2 text-[13px] font-medium text-muted transition hover:text-ink"
        >
          Reset
        </Link>
      </form>

      {results.length === 0 ? (
        <div className="mt-12 rounded-xl bg-canvas py-16 text-center text-[15px] text-muted">
          No properties match these filters.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-4">
          {results.map((u) => (
            <PropertyCard key={u.nawy_id} unit={u} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          {page > 1 ? (
            <Link
              href={qs(sp, { page: String(page - 1) })}
              className="rounded-full border border-hairline px-5 py-2 text-[13px] font-medium text-ink hover:border-primary"
            >
              Previous
            </Link>
          ) : (
            <span className="rounded-full border border-hairline px-5 py-2 text-[13px] text-muted/50">
              Previous
            </span>
          )}
          <span className="text-[13px] text-muted">
            {page} / {formatNumber(pages)}
          </span>
          {page < pages ? (
            <Link
              href={qs(sp, { page: String(page + 1) })}
              className="rounded-full border border-hairline px-5 py-2 text-[13px] font-medium text-ink hover:border-primary"
            >
              Next
            </Link>
          ) : (
            <span className="rounded-full border border-hairline px-5 py-2 text-[13px] text-muted/50">
              Next
            </span>
          )}
        </div>
      )}
    </div>
  );
}
