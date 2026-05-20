import type { Metadata } from "next";
import Link from "next/link";
import { getStats, getTopDevelopers } from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { localizedPath } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "DealFinder — سوق العقارات في مصر",
  description:
    "تصفّح الشقق والفيلات والشاليهات من المطورين الموثوقين في جميع أنحاء مصر — أسعار محدثة وخطط سداد ومقارنة المشاريع.",
  alternates: {
    canonical: "/ar",
    languages: { en: "/", ar: "/ar", "x-default": "/" },
  },
};

export default function HomeAr() {
  const s = getStats();
  const topDevs = getTopDevelopers(8);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section className="border-b border-data pb-12">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-taupe">
          سوق العقارات في مصر
        </p>
        <h1 className="mt-2 text-[34px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[56px]">
          ابحث عن الصفقة
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate">
          {formatNumber(s.units)} وحدة أولية من {formatNumber(s.developers)} مطوّراً
          عبر {formatNumber(s.areas)} منطقة. قارن الأسعار وخطط السداد واطلب اتصالاً
          مباشرةً.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={localizedPath("/developers", "ar")}
            className="border border-ink bg-ink px-6 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-paper transition hover:bg-paper hover:text-ink"
          >
            تصفّح المطوّرين
          </Link>
          <Link
            href="/"
            className="border border-data px-6 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-slate transition hover:border-ink hover:text-ink"
          >
            English version
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-[20px] font-bold uppercase tracking-tight text-ink">
          أبرز المطوّرين
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
          {topDevs.map((d) => {
            const name = d.name_ar ?? d.name;
            return (
              <Link
                key={d.nawy_id}
                href={localizedPath(`/developers/${d.slug}`, "ar")}
                className="flex flex-col items-center gap-3 border border-data p-5 text-center transition hover:bg-data"
              >
                <div className="grid h-14 w-14 place-items-center overflow-hidden border border-data bg-paper">
                  {d.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={d.logo_url}
                      alt={name}
                      loading="lazy"
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <span className="text-[18px] font-extrabold text-ink">
                      {name.charAt(0)}
                    </span>
                  )}
                </div>
                <p className="text-[12px] font-bold uppercase tracking-[0.02em] text-ink">
                  {name}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-taupe">
                  {formatNumber(d.available)} وحدة
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
