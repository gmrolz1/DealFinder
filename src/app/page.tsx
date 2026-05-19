import Link from "next/link";
import {
  getStats,
  getAreas,
  getPopularAreas,
  getFeaturedUnits,
  getPropertyTypes,
  getTopDevelopers,
} from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { PropertyCard } from "@/components/property-card";

export default function Home() {
  const stats = getStats();
  const areas = getAreas();
  const popularAreas = getPopularAreas(8);
  const featured = getFeaturedUnits(8);
  const types = getPropertyTypes();
  const developers = getTopDevelopers(12);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.18),_transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
            Egypt Property Marketplace
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            Find your next home across Egypt&apos;s best compounds.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-300">
            {formatNumber(stats.units)} listings in {stats.compounds}{" "}
            compounds — apartments, villas and chalets, all in one place.
          </p>

          {/* Search */}
          <form
            action="/properties"
            className="mt-8 grid max-w-3xl gap-3 rounded-2xl bg-white p-4 shadow-xl sm:grid-cols-[1fr_auto_auto_auto]"
          >
            <input
              name="q"
              placeholder="Search compound or area…"
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500"
            />
            <select
              name="area"
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
            >
              <option value="">All areas</option>
              {areas.map((a) => (
                <option key={a.nawy_id} value={a.nawy_id}>
                  {a.name}
                </option>
              ))}
            </select>
            <select
              name="type"
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
            >
              <option value="">Any type</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-4 sm:px-6">
          {[
            ["Properties", stats.units],
            ["Compounds", stats.compounds],
            ["Areas", stats.areas],
            ["Developers", stats.developers],
          ].map(([label, value]) => (
            <div key={label as string} className="text-center">
              <p className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {formatNumber(value as number)}
              </p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular areas */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Popular areas
          </h2>
          <Link
            href="/properties"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            View all →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {popularAreas.map((a) => (
            <Link
              key={a.nawy_id}
              href={`/properties?area=${a.nawy_id}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-800"
            >
              {a.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.image_url}
                  alt={a.name}
                  loading="lazy"
                  className="h-full w-full object-cover opacity-70 transition group-hover:scale-105 group-hover:opacity-85"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="font-semibold text-white">{a.name}</p>
                <p className="text-xs text-slate-200">
                  {formatNumber(a.properties_count ?? 0)} properties
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured properties */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Featured properties
            </h2>
            <Link
              href="/properties"
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Browse all →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((u) => (
              <PropertyCard key={u.nawy_id} unit={u} />
            ))}
          </div>
        </div>
      </section>

      {/* Developers */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Top developers
        </h2>
        <div className="mt-6 flex flex-wrap gap-2.5">
          {developers.map((d) => (
            <span
              key={d.nawy_id}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              {d.name}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-600">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Selling a property?
            </h2>
            <p className="mt-1 text-emerald-50">
              List it on DealFinder and reach thousands of buyers.
            </p>
          </div>
          <Link
            href="/properties"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            Get started
          </Link>
        </div>
      </section>
    </>
  );
}
