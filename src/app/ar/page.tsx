import type { Metadata } from "next";
import Link from "next/link";
import {
  getStats,
  getAreas,
  getPopularAreas,
  getFeaturedUnits,
  getNewLaunchUnits,
  getPropertyTypes,
  getTopDevelopers,
} from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { PropertyCard } from "@/components/property-card";
import { localizedPath } from "@/lib/i18n";

const TYPE_AR: Record<string, string> = {
  Apartment: "شقة",
  Villa: "فيلا",
  Townhouse: "تاون هاوس",
  Twinhouse: "توين هاوس",
  Penthouse: "بنتهاوس",
  Duplex: "دوبلكس",
  Chalet: "شاليه",
  Studio: "ستوديو",
};

export const metadata: Metadata = {
  title: "DealFinder — سوق العقارات في مصر",
  description:
    "تصفّح الشقق والفيلات والشاليهات من المطورين الموثوقين في جميع أنحاء مصر — أسعار محدثة وخطط سداد ومقارنة المشاريع.",
  alternates: {
    canonical: "/ar",
    languages: { en: "/", ar: "/ar", "x-default": "/" },
  },
};

function SectionHeading({ title, href }: { title: string; href: string }) {
  return (
    <div className="mx-auto flex max-w-6xl items-end justify-between px-4 sm:px-6">
      <h2 className="text-[20px] font-bold uppercase tracking-tight text-ink sm:text-[26px]">
        {title}
      </h2>
      <Link
        href={href}
        className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate transition hover:text-ink"
      >
        عرض الكل
      </Link>
    </div>
  );
}

export default function HomeAr() {
  const stats = getStats();
  const areas = getAreas();
  const popularAreas = getPopularAreas(10);
  const featured = getFeaturedUnits(8);
  const launches = getNewLaunchUnits(8);
  const types = getPropertyTypes();
  const developers = getTopDevelopers(14);

  return (
    <div className="bg-paper">
      <section className="border-b border-data px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-taupe">
            سوق العقارات في مصر
          </p>
          <h1 className="mt-4 text-[46px] font-black uppercase leading-[0.95] tracking-tight text-ink sm:text-[88px]">
            ابحث عن <span className="glitch">الصفقة</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate sm:text-[18px]">
            {formatNumber(stats.units)} وحدة أولية من {stats.developers} مطوّراً
            موثوقاً في جميع أنحاء مصر. دقّة، لا ضوضاء.
          </p>

          <form
            action="/ar/properties"
            className="mt-8 flex max-w-2xl flex-col gap-2 sm:flex-row"
          >
            <input
              name="q"
              placeholder="ابحث عن كمبوند أو منطقة"
              className="min-w-0 flex-1 border border-data bg-paper px-4 py-3 text-[14px] text-ink outline-none placeholder:text-slate/50 focus:border-ink"
            />
            <select
              name="area"
              className="border border-data bg-paper px-4 py-3 text-[14px] text-slate outline-none focus:border-ink"
            >
              <option value="">كل المناطق</option>
              {areas.map((a) => (
                <option key={a.nawy_id} value={a.nawy_id}>
                  {a.name_ar ?? a.name}
                </option>
              ))}
            </select>
            <button className="border border-ink bg-ink px-7 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-paper transition hover:bg-paper hover:text-ink">
              بحث
            </button>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            {types.slice(0, 7).map((t) => (
              <Link
                key={t}
                href={`/ar/properties?type=${encodeURIComponent(t)}`}
                className="border border-data px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate transition hover:border-ink hover:text-ink"
              >
                {TYPE_AR[t] ?? t}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10">
        <SectionHeading title="مميزة" href={localizedPath("/properties", "ar")} />
        <div className="no-scrollbar mt-5 flex gap-4 overflow-x-auto px-4 sm:px-6">
          {featured.map((u) => (
            <div key={u.nawy_id} className="w-[260px] shrink-0">
              <PropertyCard unit={u} locale="ar" />
            </div>
          ))}
        </div>
      </section>

      <section className="py-10">
        <SectionHeading
          title="تصفّح حسب المنطقة"
          href={localizedPath("/areas", "ar")}
        />
        <div className="no-scrollbar mt-5 flex gap-3 overflow-x-auto px-4 sm:px-6">
          {popularAreas.map((a) => (
            <Link
              key={a.nawy_id}
              href={localizedPath(`/areas/${a.slug}`, "ar")}
              className="relative h-48 w-40 shrink-0 overflow-hidden border border-data bg-ink"
            >
              {a.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.image_url}
                  alt={a.name_ar ?? a.name}
                  loading="lazy"
                  className="h-full w-full object-cover opacity-70"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <p className="text-[13px] font-bold uppercase tracking-[0.02em] text-paper">
                  {a.name_ar ?? a.name}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-data">
                  {formatNumber(a.available)} وحدة
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-10">
        <SectionHeading
          title="إطلاقات جديدة"
          href={localizedPath("/new-launches", "ar")}
        />
        <div className="no-scrollbar mt-5 flex gap-4 overflow-x-auto px-4 sm:px-6">
          {launches.map((u) => (
            <div key={u.nawy_id} className="w-[260px] shrink-0">
              <PropertyCard unit={u} locale="ar" />
            </div>
          ))}
        </div>
      </section>

      <section className="py-10">
        <SectionHeading
          title="أبرز المطوّرين"
          href={localizedPath("/developers", "ar")}
        />
        <div className="mx-auto mt-5 flex max-w-6xl flex-wrap gap-2 px-4 sm:px-6">
          {developers.map((d) => (
            <Link
              key={d.nawy_id}
              href={localizedPath(`/developers/${d.slug}`, "ar")}
              className="border border-data px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate transition hover:border-ink hover:text-ink"
            >
              {d.name_ar ?? d.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid grid-cols-2 border-l border-t border-data sm:grid-cols-4">
          {[
            ["العقارات", stats.units],
            ["الكمبوندات", stats.compounds],
            ["المناطق", stats.areas],
            ["المطورون", stats.developers],
          ].map(([label, value]) => (
            <div
              key={label as string}
              className="border-b border-r border-data p-6"
            >
              <p className="text-[30px] font-black tracking-tight text-ink sm:text-[40px]">
                {formatNumber(value as number)}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-taupe">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
