import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getUnitBySlug,
  getSimilarUnits,
  type EnrichedUnit,
} from "@/lib/data";
import { formatFull, formatReadyBy } from "@/lib/format";
import { PropertyCard } from "@/components/property-card";

// Generated from factual fields — nawy's own description is never copied.
function describe(u: EnrichedUnit): string {
  const parts: string[] = [];
  const what = u.property_type?.toLowerCase() ?? "property";
  const where = [u.compoundName, u.areaName].filter(Boolean).join(", ");
  parts.push(
    `This ${what}${where ? ` in ${where}` : ""} offers ${
      u.bedrooms ?? "—"
    } bedroom${u.bedrooms === 1 ? "" : "s"} and ${
      u.bathrooms ?? "—"
    } bathroom${u.bathrooms === 1 ? "" : "s"}${
      u.area_sqm ? ` across ${u.area_sqm} m²` : ""
    }.`
  );
  if (u.finishing) parts.push(`Delivered ${u.finishing}.`);
  if (u.ready_by) parts.push(`Ready by ${formatReadyBy(u.ready_by)}.`);
  if (u.developerName) parts.push(`Developed by ${u.developerName}.`);
  return parts.join(" ");
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const unit = getUnitBySlug(slug);
  if (!unit) notFound();

  const similar = getSimilarUnits(unit, 4);

  const specs: [string, string][] = [
    ["Type", unit.property_type ?? "—"],
    ["Bedrooms", String(unit.bedrooms ?? "—")],
    ["Bathrooms", String(unit.bathrooms ?? "—")],
    ["Area", unit.area_sqm ? `${unit.area_sqm} m²` : "—"],
    ["Finishing", unit.finishing ?? "—"],
    ["Ready By", formatReadyBy(unit.ready_by)],
    ["Installments", unit.installment_years ? `${unit.installment_years} yrs` : "—"],
    ["Developer", unit.developerName ?? "—"],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
      <nav className="text-[10px] font-semibold uppercase tracking-[0.08em] text-taupe">
        <Link href="/properties" className="hover:text-paper">
          Properties
        </Link>
        {unit.areaSlug && (
          <>
            {" / "}
            <Link href={`/areas/${unit.areaSlug}`} className="hover:text-paper">
              {unit.areaName}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-4 grid gap-7 lg:grid-cols-[1.7fr_1fr]">
        <div>
          <div className="aspect-[16/10] overflow-hidden border border-slate bg-slate">
            {unit.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={unit.image_url}
                alt={unit.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center text-[12px] uppercase tracking-[0.08em] text-data/60">
                No image
              </div>
            )}
          </div>

          <h1 className="mt-6 text-[24px] font-extrabold uppercase tracking-tight text-paper sm:text-[30px]">
            {unit.title}
          </h1>
          {unit.compoundSlug ? (
            <Link
              href={`/compounds/${unit.compoundSlug}`}
              className="mt-1 inline-block text-[12px] font-semibold uppercase tracking-[0.07em] text-data hover:text-paper"
            >
              {unit.compoundName} · {unit.areaName}
            </Link>
          ) : (
            <p className="mt-1 text-[12px] uppercase tracking-[0.07em] text-data">
              {unit.areaName}
            </p>
          )}

          <div className="mt-6 grid grid-cols-2 border-l border-t border-slate sm:grid-cols-4">
            {specs.map(([k, v]) => (
              <div key={k} className="border-b border-r border-slate p-3.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-taupe">
                  {k}
                </p>
                <p className="mt-1 truncate text-[13px] font-bold capitalize text-paper">
                  {v}
                </p>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-[16px] font-bold uppercase tracking-tight text-paper">
            Overview
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-data">
            {describe(unit)}
          </p>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="border border-slate p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-taupe">
              Price
            </p>
            <p className="mt-1 text-[30px] font-black tracking-tight text-paper">
              {formatFull(unit.price, unit.currency)}
            </p>
            {unit.down_payment ? (
              <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-data">
                From {formatFull(unit.down_payment, unit.currency)} down
              </p>
            ) : null}

            <div className="mt-6 space-y-2.5">
              <input
                placeholder="Your name"
                className="w-full border border-slate bg-ink px-4 py-2.5 text-[13px] text-paper outline-none placeholder:text-data/50 focus:border-paper"
              />
              <input
                placeholder="Phone number"
                className="w-full border border-slate bg-ink px-4 py-2.5 text-[13px] text-paper outline-none placeholder:text-data/50 focus:border-paper"
              />
              <button
                type="button"
                className="w-full bg-paper px-4 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-ink transition hover:bg-data"
              >
                Request a Callback
              </button>
            </div>
            <p className="mt-3 text-[10px] uppercase tracking-[0.07em] text-taupe">
              Lead capture activates once the database is connected.
            </p>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="text-[18px] font-bold uppercase tracking-tight text-paper">
            More in {unit.areaName ?? "this area"}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {similar.map((u) => (
              <PropertyCard key={u.nawy_id} unit={u} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
