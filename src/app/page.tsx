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

function SectionHeading({
  title,
  href,
}: {
  title: string;
  href: string;
}) {
  return (
    <div className="flex items-end justify-between px-4 sm:px-6">
      <h2 className="text-[22px] font-semibold tracking-tight text-ink sm:text-[26px]">
        {title}
      </h2>
      <Link
        href={href}
        className="text-[13px] font-medium text-blue hover:underline"
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
  const developers = getTopDevelopers(12);

  return (
    <div className="bg-surface">
      {/* Hero */}
      <section className="px-4 pt-14 pb-10 text-center sm:pt-20 sm:pb-14">
        <h1 className="mx-auto max-w-3xl text-[40px] font-semibold leading-[1.07] tracking-tight text-ink sm:text-[64px]">
          Find your home.
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-[17px] leading-snug text-ink-soft sm:text-[21px]">
          {formatNumber(stats.units)} primary properties from{" "}
          {stats.developers} trusted developers across Egypt.
        </p>

        <form
          action="/properties"
          className="mx-auto mt-7 flex max-w-xl flex-col gap-2 rounded-3xl bg-canvas p-2 sm:flex-row"
        >
          <input
            name="q"
            placeholder="Search compound or area"
            className="min-w-0 flex-1 rounded-full bg-surface px-4 py-2.5 text-[15px] text-ink outline-none ring-1 ring-hairline focus:ring-blue"
          />
          <select
            name="area"
            className="rounded-full bg-surface px-4 py-2.5 text-[15px] text-ink-soft outline-none ring-1 ring-hairline focus:ring-blue"
          >
            <option value="">All areas</option>
            {areas.map((a) => (
              <option key={a.nawy_id} value={a.nawy_id}>
                {a.name}
              </option>
            ))}
          </select>
          <button className="rounded-full bg-blue px-6 py-2.5 text-[15px] font-medium text-white transition hover:bg-blue-hover">
            Search
          </button>
        </form>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {types.slice(0, 6).map((t) => (
            <Link
              key={t}
              href={`/properties?type=${encodeURIComponent(t)}`}
              className="rounded-full bg-canvas px-3.5 py-1.5 text-[13px] font-medium text-ink transition hover:bg-hairline"
            >
              {t}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="py-8">
        <SectionHeading title="Featured" href="/properties" />
        <div className="no-scrollbar mt-4 flex gap-4 overflow-x-auto px-4 sm:px-6">
          {featured.map((u) => (
            <div key={u.nawy_id} className="w-[260px] shrink-0">
              <PropertyCard unit={u} />
            </div>
          ))}
        </div>
      </section>

      {/* Popular areas */}
      <section className="py-8">
        <SectionHeading title="Explore by area" href="/areas" />
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto px-4 sm:px-6">
          {popularAreas.map((a) => (
            <Link
              key={a.nawy_id}
              href={`/areas/${a.slug}`}
              className="relative h-44 w-40 shrink-0 overflow-hidden rounded-2xl bg-ink"
            >
              {a.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.image_url}
                  alt={a.name}
                  loading="lazy"
                  className="h-full w-full object-cover opacity-75"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-[15px] font-semibold text-white">
                  {a.name}
                </p>
                <p className="text-[12px] text-white/80">
                  {formatNumber(a.available)} homes
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New launches */}
      <section className="py-8">
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
      <section className="py-8">
        <SectionHeading title="Top developers" href="/developers" />
        <div className="mt-4 flex flex-wrap gap-2 px-4 sm:px-6">
          {developers.map((d) => (
            <Link
              key={d.nawy_id}
              href={`/developers/${d.slug}`}
              className="rounded-full bg-canvas px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-hairline"
            >
              {d.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mx-4 my-10 rounded-3xl bg-canvas px-6 py-10 sm:mx-6">
        <div className="grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
          {[
            ["Properties", stats.units],
            ["Compounds", stats.compounds],
            ["Areas", stats.areas],
            ["Developers", stats.developers],
          ].map(([label, value]) => (
            <div key={label as string}>
              <p className="text-[28px] font-semibold tracking-tight text-ink sm:text-[34px]">
                {formatNumber(value as number)}
              </p>
              <p className="text-[13px] text-ink-soft">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
