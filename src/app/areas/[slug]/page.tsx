import Link from "next/link";
import { notFound } from "next/navigation";
import { getAreaBySlug, getCompoundsByArea, searchUnits } from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { PropertyCard } from "@/components/property-card";
import { CompoundCard } from "@/components/compound-card";

export default async function AreaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const area = getAreaBySlug(slug);
  if (!area) notFound();

  const compounds = getCompoundsByArea(area.nawy_id);
  const { results, total } = searchUnits({ area: String(area.nawy_id) });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav className="text-[10px] font-semibold uppercase tracking-[0.08em] text-taupe">
        <Link href="/areas" className="hover:text-paper">
          Areas
        </Link>
      </nav>
      <h1 className="mt-2 text-[32px] font-extrabold uppercase tracking-tight text-paper sm:text-[44px]">
        {area.name}
      </h1>
      <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-taupe">
        {formatNumber(total)} homes · {compounds.length} compounds
      </p>

      {compounds.length > 0 && (
        <section className="mt-8">
          <h2 className="text-[18px] font-bold uppercase tracking-tight text-paper">
            Compounds in {area.name}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {compounds.slice(0, 8).map((c) => (
              <CompoundCard key={c.nawy_id} compound={c} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="text-[18px] font-bold uppercase tracking-tight text-paper">
            Homes in {area.name}
          </h2>
          <Link
            href={`/properties?area=${area.nawy_id}`}
            className="text-[11px] font-bold uppercase tracking-[0.08em] text-data hover:text-paper"
          >
            See all
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {results.map((u) => (
            <PropertyCard key={u.nawy_id} unit={u} />
          ))}
        </div>
      </section>
    </div>
  );
}
