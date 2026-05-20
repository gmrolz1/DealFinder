import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAreaBySlug, getCompoundsByArea, searchUnits } from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { PropertyCard } from "@/components/property-card";
import { CompoundCard } from "@/components/compound-card";
import { localizedPath } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const area = getAreaBySlug(slug);
  if (!area) return { title: "المنطقة — DealFinder" };
  const name = area.name_ar ?? area.name;
  return {
    title: `${name} — عقارات للبيع | DealFinder`,
    description: `استكشف العقارات والكمبوندات في ${name}. قارن الأسعار وخطط السداد على DealFinder.`,
    alternates: {
      canonical: `/ar/areas/${area.slug}`,
      languages: {
        en: `/areas/${area.slug}`,
        ar: `/ar/areas/${area.slug}`,
        "x-default": `/areas/${area.slug}`,
      },
    },
  };
}

export default async function AreaPageAr({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const area = getAreaBySlug(slug);
  if (!area) notFound();
  const name = area.name_ar ?? area.name;
  const compounds = getCompoundsByArea(area.nawy_id);
  const { results, total } = searchUnits({ area: String(area.nawy_id) });
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav className="text-[10px] font-semibold uppercase tracking-[0.08em] text-taupe">
        <Link href={localizedPath("/areas", "ar")} className="hover:text-ink">
          المناطق
        </Link>
      </nav>
      <h1 className="mt-2 text-[32px] font-extrabold uppercase tracking-tight text-ink sm:text-[44px]">
        {name}
      </h1>
      <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-taupe">
        {formatNumber(total)} وحدة · {compounds.length} كمبوند
      </p>
      {compounds.length > 0 && (
        <section className="mt-8">
          <h2 className="text-[18px] font-bold uppercase tracking-tight text-ink">
            كمبوندات في {name}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {compounds.slice(0, 8).map((c) => (
              <CompoundCard key={c.nawy_id} compound={c} locale="ar" />
            ))}
          </div>
        </section>
      )}
      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="text-[18px] font-bold uppercase tracking-tight text-ink">
            وحدات في {name}
          </h2>
          <Link
            href={`${localizedPath("/properties", "ar")}?area=${area.nawy_id}`}
            className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate hover:text-ink"
          >
            عرض الكل
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {results.map((u) => (
            <PropertyCard key={u.nawy_id} unit={u} locale="ar" />
          ))}
        </div>
      </section>
    </div>
  );
}
