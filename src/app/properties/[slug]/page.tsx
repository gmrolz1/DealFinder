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
    ["Sale type", unit.sale_type ?? "—"],
    ["Installments", unit.installment_years ? `${unit.installment_years} yrs` : "—"],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-emerald-600">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/properties" className="hover:text-emerald-600">
          Properties
        </Link>{" "}
        / <span className="text-slate-700">{unit.compoundName ?? unit.title}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1.7fr_1fr]">
        {/* Main */}
        <div>
          <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100">
            {unit.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={unit.image_url}
                alt={unit.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center text-slate-400">
                No image
              </div>
            )}
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
            {unit.title}
          </h1>
          <p className="mt-1 text-slate-500">
            {[unit.compoundName, unit.areaName].filter(Boolean).join(" · ")}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {specs.map(([k, v]) => (
              <div
                key={k}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-xs text-slate-500">{k}</p>
                <p className="mt-0.5 text-sm font-semibold capitalize text-slate-900">
                  {v}
                </p>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-lg font-bold text-slate-900">Overview</h2>
          <p className="mt-2 leading-relaxed text-slate-600">{describe(unit)}</p>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
            <p className="text-sm text-slate-500">Price</p>
            <p className="text-3xl font-bold text-slate-900">
              {formatFull(unit.price, unit.currency)}
            </p>
            {unit.down_payment ? (
              <p className="mt-1 text-sm text-emerald-700">
                From {formatFull(unit.down_payment, unit.currency)} down
              </p>
            ) : null}

            <div className="mt-5 space-y-3">
              <input
                placeholder="Your name"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              />
              <input
                placeholder="Phone number"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Request a call back
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Lead capture is wired up once the database is connected.
            </p>
          </div>
        </aside>
      </div>

      {/* Similar */}
      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Similar properties in {unit.areaName ?? "this area"}
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((u) => (
              <PropertyCard key={u.nawy_id} unit={u} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
