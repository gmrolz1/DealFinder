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
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
      <nav className="text-[10px] font-semibold uppercase tracking-[0.08em] text-taupe">
        <Link href="/properties" className="hover:text-paper">
          Properties
        </Link>
        {areaName && <span> / {areaName}</span>}
      </nav>

      <div className="mt-3 aspect-[16/9] overflow-hidden border border-slate bg-slate sm:aspect-[16/7]">
        {compound.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={compound.image_url}
            alt={compound.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-[12px] uppercase tracking-[0.08em] text-data/60">
            No image
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold uppercase tracking-tight text-paper sm:text-[34px]">
            {compound.name}
          </h1>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-taupe">
            {[areaName, developer?.name].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="border border-slate px-5 py-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-taupe">
            Starting From
          </p>
          <p className="mt-0.5 text-[20px] font-black tracking-tight text-paper">
            {formatPrice(minPrice === Infinity ? null : minPrice)}
          </p>
        </div>
      </div>

      {compound.property_types.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {compound.property_types.map((t) => (
            <span
              key={t}
              className="border border-slate px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-data"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {developer && (
        <Link
          href={`/developers/${developer.slug}`}
          className="mt-4 inline-block text-[11px] font-bold uppercase tracking-[0.08em] text-data hover:text-paper"
        >
          All projects by {developer.name} →
        </Link>
      )}

      <section className="mt-9">
        <h2 className="text-[18px] font-bold uppercase tracking-tight text-paper">
          {formatNumber(units.length)} Available{" "}
          {units.length === 1 ? "Home" : "Homes"}
        </h2>
        {units.length === 0 ? (
          <p className="mt-4 border border-slate py-12 text-center text-[12px] font-semibold uppercase tracking-[0.08em] text-data">
            No primary units currently listed in this compound
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {units.map((u) => (
              <PropertyCard key={u.nawy_id} unit={u} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
