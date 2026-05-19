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
    ["Ready by", formatReadyBy(unit.ready_by)],
    ["Installments", unit.installment_years ? `${unit.installment_years} yrs` : "—"],
    ["Developer", unit.developerName ?? "—"],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <nav className="text-[12px] text-muted">
        <Link href="/properties" className="hover:text-primary">
          Properties
        </Link>
        {unit.areaSlug && (
          <>
            {" / "}
            <Link
              href={`/areas/${unit.areaSlug}`}
              className="hover:text-primary"
            >
              {unit.areaName}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-3 grid gap-7 lg:grid-cols-[1.7fr_1fr]">
        <div>
          <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-canvas">
            {unit.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={unit.image_url}
                alt={unit.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center text-muted">
                No image
              </div>
            )}
          </div>

          <h1 className="mt-5 text-[24px] font-black tracking-tight text-ink sm:text-[28px]">
            {unit.title}
          </h1>
          {unit.compoundSlug ? (
            <Link
              href={`/compounds/${unit.compoundSlug}`}
              className="mt-1 inline-block text-[14px] text-primary hover:underline"
            >
              {unit.compoundName} · {unit.areaName}
            </Link>
          ) : (
            <p className="mt-1 text-[14px] text-muted">{unit.areaName}</p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {specs.map(([k, v]) => (
              <div key={k} className="rounded-xl bg-canvas p-3">
                <p className="text-[11px] text-muted">{k}</p>
                <p className="mt-0.5 truncate text-[14px] font-bold capitalize text-ink">
                  {v}
                </p>
              </div>
            ))}
          </div>

          <h2 className="mt-7 text-[18px] font-bold tracking-tight text-ink">
            Overview
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            {describe(unit)}
          </p>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl bg-surface p-6 shadow-[0_1px_3px_rgba(60,64,67,0.25)]">
            <p className="text-[13px] text-muted">Price</p>
            <p className="text-[30px] font-black tracking-tight text-ink">
              {formatFull(unit.price, unit.currency)}
            </p>
            {unit.down_payment ? (
              <p className="mt-1 text-[13px] text-primary">
                From {formatFull(unit.down_payment, unit.currency)} down
              </p>
            ) : null}

            <div className="mt-5 space-y-2.5">
              <input
                placeholder="Your name"
                className="w-full rounded-lg border border-hairline px-4 py-2.5 text-[14px] outline-none focus:border-primary"
              />
              <input
                placeholder="Phone number"
                className="w-full rounded-lg border border-hairline px-4 py-2.5 text-[14px] outline-none focus:border-primary"
              />
              <button
                type="button"
                className="w-full rounded-full bg-primary px-4 py-2.5 text-[14px] font-medium text-white transition hover:bg-primary-dark"
              >
                Request a call back
              </button>
            </div>
            <p className="mt-3 text-[11px] text-muted">
              Lead capture activates once the database is connected.
            </p>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="text-[20px] font-bold tracking-tight text-ink">
            More in {unit.areaName ?? "this area"}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-4">
            {similar.map((u) => (
              <PropertyCard key={u.nawy_id} unit={u} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
