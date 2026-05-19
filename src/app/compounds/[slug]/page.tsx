import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCompoundBySlug,
  getUnitsByCompound,
  getAreaName,
  getDeveloperOfCompound,
} from "@/lib/data";
import { formatNumber, formatPrice } from "@/lib/format";
import { PropertyCard } from "@/components/property-card";

export default async function CompoundPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const compound = getCompoundBySlug(slug);
  if (!compound) notFound();

  const units = getUnitsByCompound(compound.nawy_id);
  const areaName = getAreaName(compound.area_nawy_id);
  const developer = getDeveloperOfCompound(compound);
  const minPrice =
    units.length > 0
      ? Math.min(...units.map((u) => u.price ?? Infinity))
      : compound.min_price;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <nav className="text-[12px] text-muted">
        <Link href="/properties" className="hover:text-primary">
          Properties
        </Link>
        {areaName && <span> / {areaName}</span>}
      </nav>

      <div className="mt-3 aspect-[16/9] overflow-hidden rounded-2xl bg-canvas sm:aspect-[16/7]">
        {compound.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={compound.image_url}
            alt={compound.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-muted">
            No image
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-black tracking-tight text-ink sm:text-[32px]">
            {compound.name}
          </h1>
          <p className="mt-1 text-[14px] text-muted">
            {[areaName, developer?.name].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="rounded-xl bg-primary-soft px-4 py-2.5">
          <p className="text-[11px] text-muted">Starting from</p>
          <p className="text-[18px] font-black tracking-tight text-primary">
            {formatPrice(minPrice === Infinity ? null : minPrice)}
          </p>
        </div>
      </div>

      {compound.property_types.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {compound.property_types.map((t) => (
            <span
              key={t}
              className="rounded-full border border-hairline px-3.5 py-1.5 text-[12px] font-medium text-ink"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {developer && (
        <Link
          href={`/developers/${developer.slug}`}
          className="mt-4 inline-block text-[13px] font-medium text-primary hover:underline"
        >
          View all projects by {developer.name} →
        </Link>
      )}

      <section className="mt-8">
        <h2 className="text-[20px] font-bold tracking-tight text-ink">
          {formatNumber(units.length)} available{" "}
          {units.length === 1 ? "home" : "homes"}
        </h2>
        {units.length === 0 ? (
          <p className="mt-3 rounded-xl bg-canvas py-12 text-center text-[14px] text-muted">
            No primary units currently listed in this compound.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-4">
            {units.map((u) => (
              <PropertyCard key={u.nawy_id} unit={u} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
