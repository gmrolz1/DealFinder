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
  const area = compound.area_nawy_id
    ? { id: compound.area_nawy_id, name: getAreaName(compound.area_nawy_id) }
    : null;
  const developer = getDeveloperOfCompound(compound);
  const minPrice =
    units.length > 0
      ? Math.min(...units.map((u) => u.price ?? Infinity))
      : compound.min_price;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <nav className="text-[12px] text-ink-soft">
        <Link href="/properties" className="hover:text-ink">
          Properties
        </Link>
        {area?.name && <span> / {area.name}</span>}
      </nav>

      <div className="mt-3 overflow-hidden rounded-3xl bg-canvas">
        <div className="aspect-[16/9] sm:aspect-[16/7]">
          {compound.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={compound.image_url}
              alt={compound.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-ink-faint">
              No image
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-ink sm:text-[32px]">
            {compound.name}
          </h1>
          <p className="mt-1 text-[14px] text-ink-soft">
            {[area?.name, developer?.name].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="rounded-2xl bg-canvas px-4 py-2.5">
          <p className="text-[11px] text-ink-faint">Starting from</p>
          <p className="text-[18px] font-semibold tracking-tight text-ink">
            {formatPrice(minPrice === Infinity ? null : minPrice)}
          </p>
        </div>
      </div>

      {compound.property_types.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {compound.property_types.map((t) => (
            <span
              key={t}
              className="rounded-full bg-canvas px-3.5 py-1.5 text-[12px] font-medium text-ink"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {developer && (
        <Link
          href={`/developers/${developer.slug}`}
          className="mt-4 inline-block text-[13px] font-medium text-blue hover:underline"
        >
          View all projects by {developer.name}
        </Link>
      )}

      <section className="mt-8">
        <h2 className="text-[20px] font-semibold tracking-tight text-ink">
          {formatNumber(units.length)} available{" "}
          {units.length === 1 ? "home" : "homes"}
        </h2>
        {units.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-canvas py-12 text-center text-[14px] text-ink-soft">
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
