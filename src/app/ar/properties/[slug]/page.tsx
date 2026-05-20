import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getUnitBySlug,
  getSimilarUnits,
  type EnrichedUnit,
} from "@/lib/data";
import { formatFull, formatReadyBy } from "@/lib/format";
import { PropertyCard } from "@/components/property-card";
import { localizedPath } from "@/lib/i18n";

function describeAr(u: EnrichedUnit): string {
  const parts: string[] = [];
  const what = u.property_type_ar ?? u.property_type ?? "عقار";
  const where = [u.compoundNameAr ?? u.compoundName, u.areaNameAr ?? u.areaName]
    .filter(Boolean)
    .join("، ");
  parts.push(
    `${what}${where ? ` في ${where}` : ""} يضم ${u.bedrooms ?? "—"} ` +
      `${u.bedrooms === 1 ? "غرفة نوم" : "غرف نوم"} و${u.bathrooms ?? "—"} ` +
      `${u.bathrooms === 1 ? "حمام" : "حمامات"}` +
      (u.area_sqm ? ` على مساحة ${u.area_sqm} م²` : "") +
      "."
  );
  if (u.finishing) parts.push(`التسليم: ${u.finishing}.`);
  if (u.ready_by) parts.push(`جاهز للاستلام بحلول ${formatReadyBy(u.ready_by)}.`);
  const dev = u.developerNameAr ?? u.developerName;
  if (dev) parts.push(`من تطوير ${dev}.`);
  return parts.join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const u = getUnitBySlug(slug);
  if (!u) return { title: "عقار — DealFinder" };
  const title = u.title_ar ?? u.title;
  const desc = u.subtitle_ar ?? u.subtitle ?? undefined;
  return {
    title: `${title} — DealFinder`,
    description: desc,
    alternates: {
      canonical: `/ar/properties/${u.slug}`,
      languages: {
        en: `/properties/${u.slug}`,
        ar: `/ar/properties/${u.slug}`,
        "x-default": `/properties/${u.slug}`,
      },
    },
  };
}

export default async function PropertyPageAr({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const unit = getUnitBySlug(slug);
  if (!unit) notFound();

  const similar = getSimilarUnits(unit, 4);
  const title = unit.title_ar ?? unit.title;
  const compoundName = unit.compoundNameAr ?? unit.compoundName;
  const areaName = unit.areaNameAr ?? unit.areaName;
  const developerName = unit.developerNameAr ?? unit.developerName;

  const specs: [string, string][] = [
    ["النوع", unit.property_type_ar ?? unit.property_type ?? "—"],
    ["غرف النوم", String(unit.bedrooms ?? "—")],
    ["الحمامات", String(unit.bathrooms ?? "—")],
    ["المساحة", unit.area_sqm ? `${unit.area_sqm} م²` : "—"],
    ["التشطيب", unit.finishing ?? "—"],
    ["الاستلام", formatReadyBy(unit.ready_by)],
    [
      "الأقساط",
      unit.installment_years ? `${unit.installment_years} سنة` : "—",
    ],
    ["المطور", developerName ?? "—"],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
      <nav className="text-[10px] font-semibold uppercase tracking-[0.08em] text-taupe">
        <Link
          href={localizedPath("/properties", "ar")}
          className="hover:text-ink"
        >
          العقارات
        </Link>
        {unit.areaSlug && (
          <>
            {" / "}
            <Link
              href={localizedPath(`/areas/${unit.areaSlug}`, "ar")}
              className="hover:text-ink"
            >
              {areaName}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-4 grid gap-7 lg:grid-cols-[1.7fr_1fr]">
        <div>
          <div className="aspect-[16/10] overflow-hidden border border-data bg-data">
            {unit.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={unit.image_url}
                alt={title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center text-[12px] uppercase tracking-[0.08em] text-slate">
                لا توجد صورة
              </div>
            )}
          </div>

          <h1 className="mt-6 text-[24px] font-extrabold uppercase tracking-tight text-ink sm:text-[30px]">
            {title}
          </h1>
          {unit.compoundSlug ? (
            <Link
              href={localizedPath(`/compounds/${unit.compoundSlug}`, "ar")}
              className="mt-1 inline-block text-[12px] font-semibold uppercase tracking-[0.07em] text-slate hover:text-ink"
            >
              {compoundName} · {areaName}
            </Link>
          ) : (
            <p className="mt-1 text-[12px] uppercase tracking-[0.07em] text-slate">
              {areaName}
            </p>
          )}

          <div className="mt-6 grid grid-cols-2 border-l border-t border-data sm:grid-cols-4">
            {specs.map(([k, v]) => (
              <div key={k} className="border-b border-r border-data p-3.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-taupe">
                  {k}
                </p>
                <p className="mt-1 truncate text-[13px] font-bold capitalize text-ink">
                  {v}
                </p>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-[16px] font-bold uppercase tracking-tight text-ink">
            نظرة عامة
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-slate">
            {describeAr(unit)}
          </p>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="border border-data p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-taupe">
              السعر
            </p>
            <p className="mt-1 text-[30px] font-black tracking-tight text-ink">
              {formatFull(unit.price, unit.currency)}
            </p>
            {unit.down_payment ? (
              <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-slate">
                مقدم من {formatFull(unit.down_payment, unit.currency)}
              </p>
            ) : null}

            <div className="mt-6 space-y-2.5">
              <input
                placeholder="اسمك"
                className="w-full border border-data bg-paper px-4 py-2.5 text-[13px] text-ink outline-none placeholder:text-slate/50 focus:border-ink"
              />
              <input
                placeholder="رقم الهاتف"
                className="w-full border border-data bg-paper px-4 py-2.5 text-[13px] text-ink outline-none placeholder:text-slate/50 focus:border-ink"
              />
              <button
                type="button"
                className="w-full border border-ink bg-ink px-4 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-paper transition hover:bg-paper hover:text-ink"
              >
                اطلب اتصالاً
              </button>
            </div>
            <p className="mt-3 text-[10px] uppercase tracking-[0.07em] text-taupe">
              يتم تفعيل التواصل عند ربط قاعدة البيانات.
            </p>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="text-[18px] font-bold uppercase tracking-tight text-ink">
            المزيد في {areaName ?? "هذه المنطقة"}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {similar.map((u) => (
              <PropertyCard key={u.nawy_id} unit={u} locale="ar" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
