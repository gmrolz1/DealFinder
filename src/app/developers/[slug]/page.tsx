import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDeveloperBySlug,
  getCompoundsByDeveloper,
  getAreaName,
  searchUnits,
} from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { PropertyCard } from "@/components/property-card";
import { CompoundCard } from "@/components/compound-card";

export default async function DeveloperPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dev = getDeveloperBySlug(slug);
  if (!dev) notFound();

  const compounds = getCompoundsByDeveloper(dev.nawy_id);
  const { results, total } = searchUnits({
    developer: String(dev.nawy_id),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
      <nav className="text-[12px] text-ink-soft">
        <Link href="/developers" className="hover:text-ink">
          Developers
        </Link>
      </nav>

      <div className="mt-3 flex items-center gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-canvas">
          {dev.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dev.logo_url}
              alt={dev.name}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-[22px] font-semibold text-ink-faint">
              {dev.name.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight text-ink sm:text-[30px]">
            {dev.name}
          </h1>
          <p className="text-[14px] text-ink-soft">
            {formatNumber(total)} homes · {compounds.length} compounds
          </p>
        </div>
      </div>

      {compounds.length > 0 && (
        <section className="mt-8">
          <h2 className="text-[20px] font-semibold tracking-tight text-ink">
            Compounds by {dev.name}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-4">
            {compounds.slice(0, 8).map((c) => (
              <CompoundCard
                key={c.nawy_id}
                compound={c}
                subtitle={getAreaName(c.area_nawy_id)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mt-9">
        <div className="flex items-end justify-between">
          <h2 className="text-[20px] font-semibold tracking-tight text-ink">
            Available homes
          </h2>
          <Link
            href={`/properties?developer=${dev.nawy_id}`}
            className="text-[13px] font-medium text-blue hover:underline"
          >
            See all
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-4">
          {results.map((u) => (
            <PropertyCard key={u.nawy_id} unit={u} />
          ))}
        </div>
      </section>
    </div>
  );
}
