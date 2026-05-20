import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCompoundBySlug,
  getUnitsByCompound,
  getAreaNameAr,
  getDeveloperOfCompound,
} from "@/lib/data";
import { formatNumber, formatPrice } from "@/lib/format";
import { PropertyCard } from "@/components/property-card";
import { localizedPath } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getCompoundBySlug(slug);
  if (!c) return { title: "كمبوند — DealFinder" };
  const name = c.name_ar ?? c.name;
  return {
    title: `${name} — عقارات للبيع | DealFinder`,
    description: `استكشف الوحدات المتاحة في ${name}. قارن الأسعار وخطط السداد واطلب اتصالاً على DealFinder.`,
    alternates: {
      canonical: `/ar/compounds/${c.slug}`,
      languages: {
        en: `/compounds/${c.slug}`,
        ar: `/ar/compounds/${c.slug}`,
        "x-default": `/compounds/${c.slug}`,
      },
    },
  };
}

export default async function CompoundPageAr({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const compound = getCompoundBySlug(slug);
  if (!compound) notFound();

  const name = compound.name_ar ?? compound.name;
  const units = getUnitsByCompound(compound.nawy_id);
  const developer = getDeveloperOfCompound(compound);
  const developerName = developer
    ? developer.name_ar ?? developer.name
    : null;
  const areaName = getAreaNameAr(compound.area_nawy_id);
  const minPrice =
    units.length > 0
      ? Math.min(...units.map((u) => u.price ?? Infinity))
      : compound.min_price;
  const propertyTypes =
    compound.property_types_ar.length > 0
      ? compound.property_types_ar
      : compound.property_types;

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
      <nav className="text-[10px] font-semibold uppercase tracking-[0.08em] text-taupe">
        <Link
          href={localizedPath("/properties", "ar")}
          className="hover:text-ink"
        >
          العقارات
        </Link>
        {areaName && <span> / {areaName}</span>}
      </nav>

      <div className="mt-3 aspect-[16/9] overflow-hidden border border-data bg-data sm:aspect-[16/7]">
        {compound.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={compound.image_url}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-[12px] uppercase tracking-[0.08em] text-slate">
            لا توجد صورة
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold uppercase tracking-tight text-ink sm:text-[34px]">
            {name}
          </h1>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-taupe">
            {[areaName, developerName].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="border border-data px-5 py-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-taupe">
            تبدأ من
          </p>
          <p className="mt-0.5 text-[20px] font-black tracking-tight text-ink">
            {formatPrice(minPrice === Infinity ? null : minPrice)}
          </p>
        </div>
      </div>

      {propertyTypes.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {propertyTypes.map((t) => (
            <span
              key={t}
              className="border border-data px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-slate"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {developer && (
        <Link
          href={localizedPath(`/developers/${developer.slug}`, "ar")}
          className="mt-4 inline-block text-[11px] font-bold uppercase tracking-[0.08em] text-slate hover:text-ink"
        >
          كل مشاريع {developerName} →
        </Link>
      )}

      <section className="mt-9">
        <h2 className="text-[18px] font-bold uppercase tracking-tight text-ink">
          {formatNumber(units.length)} {units.length === 1 ? "وحدة متاحة" : "وحدة متاحة"}
        </h2>
        {units.length === 0 ? (
          <p className="mt-4 border border-data py-12 text-center text-[12px] font-semibold uppercase tracking-[0.08em] text-slate">
            لا توجد وحدات أولية مدرجة حالياً في هذا الكمبوند
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {units.map((u) => (
              <PropertyCard key={u.nawy_id} unit={u} locale="ar" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
