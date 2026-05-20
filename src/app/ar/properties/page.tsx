import type { Metadata } from "next";
import Link from "next/link";
import {
  searchUnits,
  getAreas,
  getPropertyTypes,
  type SearchParams,
} from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { PropertyCard } from "@/components/property-card";

const PRICE_OPTS: [string, string][] = [
  ["1000000", "مليون"],
  ["2000000", "2 مليون"],
  ["3000000", "3 مليون"],
  ["5000000", "5 مليون"],
  ["10000000", "10 مليون"],
  ["20000000", "20 مليون"],
  ["50000000", "50 مليون"],
];

const SORT_OPTS: [string, string][] = [
  ["", "موصى به"],
  ["price-asc", "السعر: من الأقل"],
  ["price-desc", "السعر: من الأعلى"],
  ["area-desc", "الأكبر مساحة"],
];

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

function qs(base: SearchParams, override: Partial<SearchParams>): string {
  const merged = { ...base, ...override };
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) if (v) p.set(k, String(v));
  return `/ar/properties?${p.toString()}`;
}

export const metadata: Metadata = {
  title: "العقارات — DealFinder",
  description: "تصفّح كل الوحدات الأولية في مصر — شقق، فيلات، تاون هاوس وشاليهات. قارن الأسعار وخطط السداد على DealFinder.",
  alternates: {
    canonical: "/ar/properties",
    languages: { en: "/properties", ar: "/ar/properties", "x-default": "/properties" },
  },
};

export default async function PropertiesPageAr({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const sp: SearchParams = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
  );
  const { results, total, page, pages } = searchUnits(sp);
  const areas = getAreas();
  const types = getPropertyTypes();
  const field =
    "border border-data bg-paper px-3.5 py-2 text-[12px] text-ink outline-none focus:border-ink";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-[32px] font-extrabold uppercase tracking-tight text-ink sm:text-[44px]">
        العقارات
      </h1>
      <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-taupe">
        {formatNumber(total)} وحدة أولية متاحة
      </p>

      <form
        action="/ar/properties"
        className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1"
      >
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="بحث"
          className={`${field} min-w-[150px]`}
        />
        <select name="area" defaultValue={sp.area ?? ""} className={field}>
          <option value="">المنطقة</option>
          {areas.map((a) => (
            <option key={a.nawy_id} value={a.nawy_id}>
              {a.name_ar ?? a.name}
            </option>
          ))}
        </select>
        <select name="type" defaultValue={sp.type ?? ""} className={field}>
          <option value="">النوع</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {TYPE_AR[t] ?? t}
            </option>
          ))}
        </select>
        <select name="beds" defaultValue={sp.beds ?? ""} className={field}>
          <option value="">الغرف</option>
          {[1, 2, 3, 4].map((b) => (
            <option key={b} value={b}>
              {b} غرف
            </option>
          ))}
          <option value="5">5+ غرف</option>
        </select>
        <select name="min" defaultValue={sp.min ?? ""} className={field}>
          <option value="">الحد الأدنى</option>
          {PRICE_OPTS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select name="max" defaultValue={sp.max ?? ""} className={field}>
          <option value="">الحد الأقصى</option>
          {PRICE_OPTS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={sp.sort ?? ""} className={field}>
          {SORT_OPTS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <button className="shrink-0 border border-ink bg-ink px-5 py-2 text-[11px] font-bold uppercase tracking-[0.07em] text-paper transition hover:bg-paper hover:text-ink">
          تطبيق
        </button>
        <Link
          href="/ar/properties"
          className="shrink-0 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.07em] text-slate transition hover:text-ink"
        >
          إعادة تعيين
        </Link>
      </form>

      {results.length === 0 ? (
        <div className="mt-12 border border-data py-16 text-center text-[12px] font-semibold uppercase tracking-[0.08em] text-slate">
          لا توجد عقارات تطابق هذه الفلاتر
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {results.map((u) => (
            <PropertyCard key={u.nawy_id} unit={u} locale="ar" />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-3">
          {page > 1 ? (
            <Link
              href={qs(sp, { page: String(page - 1) })}
              className="border border-ink px-5 py-2 text-[11px] font-bold uppercase tracking-[0.07em] text-ink transition hover:bg-ink hover:text-paper"
            >
              السابق
            </Link>
          ) : (
            <span className="border border-data px-5 py-2 text-[11px] font-bold uppercase tracking-[0.07em] text-data">
              السابق
            </span>
          )}
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate">
            {page} / {formatNumber(pages)}
          </span>
          {page < pages ? (
            <Link
              href={qs(sp, { page: String(page + 1) })}
              className="border border-ink px-5 py-2 text-[11px] font-bold uppercase tracking-[0.07em] text-ink transition hover:bg-ink hover:text-paper"
            >
              التالي
            </Link>
          ) : (
            <span className="border border-data px-5 py-2 text-[11px] font-bold uppercase tracking-[0.07em] text-data">
              التالي
            </span>
          )}
        </div>
      )}
    </div>
  );
}
