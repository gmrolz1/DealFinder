import Link from "next/link";
import {
  getStats,
  getAreas,
  getPopularAreas,
  getFeaturedUnits,
  getNewLaunchUnits,
  getPropertyTypes,
  getTopDevelopers,
} from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { PropertyCard } from "@/components/property-card";

function SectionHeading({ title, href }: { title: string; href: string }) {
  return (
    <div className="mx-auto flex max-w-6xl items-end justify-between px-4 sm:px-6">
      <h2 className="text-[22px] font-bold tracking-tight text-ink sm:text-[26px]">
        {title}
      </h2>
      <Link
        href={href}
        className="text-[13px] font-medium text-primary hover:underline"
      >
        See all
      </Link>
    </div>
  );
}

export default function Home() {
  const stats = getStats();
  const areas = getAreas();
  const popularAreas = getPopularAreas(10);
  const featured = getFeaturedUnits(8);
  const launches = getNewLaunchUnits(8);
  const types = getPropertyTypes();
  const developers = getTopDevelopers(14);

  return (
    <div className="bg-surface">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-soft to-surface px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-[13px] font-medium uppercase tracking-wide text-primary">
            Egypt Property Marketplace
          </p>
          <h1 className="mt-3 max-w-2xl text-[36px] font-black leading-[1.1] tracking-tight text-ink sm:text-[56px]">
            Find your next home in Egypt.
          </h1>
          <p className="mt-3 max-w-lg text-[16px] text-muted sm:text-[19px]">
            {formatNumber(stats.units)} primary properties from{" "}
            {stats.developers} trusted developers — all in one place.
          </p>

          <form
            action="/properties"
            className="mt-7 flex max-w-2xl flex-col gap-2.5 rounded-2xl bg-surface p-3 shadow-[0_2px_10px_rgba(60,64,67,0.18)] sm:flex-row"
          >
            <input
              name="q"
              placeholder="Search compound or area"
              className="min-w-0 flex-1 rounded-lg border border-hairline px-4 py-2.5 text-[15px] text-ink outline-none focus:border-primary"
            />
            <select
              name="area"
              className="rounded-lg border border-hairline px-4 py-2.5 text-[15px] text-muted outline-none focus:border-primary"
            >
              <option value="">All areas</option>
              {areas.map((a) => (
                <option key={a.nawy_id} value={a.nawy_id}>
                  {a.name}
                </option>
              ))}
            </select>
            <button className="rounded-full bg-primary px-7 py-2.5 text-[15px] font-medium text-white transition hover:bg-primary-dark">
              Search
            </button>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            {types.slice(0, 7).map((t) => (
              <Link
                key={t}
                href={`/properties?type=${encodeURIComponent(t)}`}
                className="rounded-full border border-hairline bg-surface px-3.5 py-1.5 text-[13px] font-medium text-ink transition hover:border-primary hover:text-primary"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-9">
        <SectionHeading title="Featured" href="/properties" />
        <div className="no-scrollbar mt-4 flex gap-4 overflow-x-auto px-4 sm:px-6">
          {featured.map((u) => (
            <div key={u.nawy_id} className="w-[260px] shrink-0">
              <PropertyCard unit={u} />
            </div>
          ))}
        </div>
      </section>

      {/* Areas */}
      <section className="py-9">
        <SectionHeading title="Explore by area" href="/areas" />
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto px-4 sm:px-6">
          {popularAreas.map((a) => (
            <Link
              key={a.nawy_id}
              href={`/areas/${a.slug}`}
              className="relative h-44 w-40 shrink-0 overflow-hidden rounded-xl bg-ink shadow-sm"
            >
              {a.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.image_url}
                  alt={a.name}
                  loading="lazy"
                  className="h-full w-full object-cover opacity-80 transition hover:scale-105"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3">
                <p className="text-[15px] font-bold text-white">{a.name}</p>
                <p className="text-[12px] text-white/85">
                  {formatNumber(a.available)} homes
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New launches */}
      <section className="bg-canvas py-9">
        <SectionHeading title="New launches" href="/new-launches" />
        <div className="no-scrollbar mt-4 flex gap-4 overflow-x-auto px-4 sm:px-6">
          {launches.map((u) => (
            <div key={u.nawy_id} className="w-[260px] shrink-0">
              <PropertyCard unit={u} />
            </div>
          ))}
        </div>
      </section>

      {/* Developers */}
      <section className="py-9">
        <SectionHeading title="Top developers" href="/developers" />
        <div className="mx-auto mt-4 flex max-w-6xl flex-wrap gap-2 px-4 sm:px-6">
          {developers.map((d) => (
            <Link
              key={d.nawy_id}
              href={`/developers/${d.slug}`}
              className="rounded-full border border-hairline px-4 py-2 text-[13px] font-medium text-ink transition hover:border-primary hover:text-primary"
            >
              {d.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <div className="grid grid-cols-2 gap-4 rounded-2xl bg-primary-soft px-6 py-9 text-center sm:grid-cols-4">
          {[
            ["Properties", stats.units],
            ["Compounds", stats.compounds],
            ["Areas", stats.areas],
            ["Developers", stats.developers],
          ].map(([label, value]) => (
            <div key={label as string}>
              <p className="text-[28px] font-black tracking-tight text-primary sm:text-[34px]">
                {formatNumber(value as number)}
              </p>
              <p className="text-[13px] text-muted">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
