import Link from "next/link";
import { formatNumber } from "@/lib/format";
import type { Compound, WithCount } from "@/lib/data";
import { type Locale, localizedPath } from "@/lib/i18n";

export function CompoundCard({
  compound,
  subtitle,
  locale = "en",
}: {
  compound: WithCount<Compound>;
  subtitle?: string | null;
  locale?: Locale;
}) {
  const isAr = locale === "ar";
  const name = isAr ? compound.name_ar ?? compound.name : compound.name;
  return (
    <Link
      href={localizedPath(`/compounds/${compound.slug}`, locale)}
      className="group block overflow-hidden border border-data bg-paper transition hover:border-ink"
    >
      <div className="relative aspect-[5/3] overflow-hidden bg-data">
        {compound.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={compound.image_url}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-[11px] uppercase tracking-[0.08em] text-slate">
            {isAr ? "لا توجد صورة" : "No image"}
          </div>
        )}
      </div>
      <div className="p-3.5">
        <p className="truncate text-[14px] font-bold uppercase tracking-[0.02em] text-ink">
          {name}
        </p>
        {subtitle && (
          <p className="truncate text-[10px] font-medium uppercase tracking-[0.07em] text-taupe">
            {subtitle}
          </p>
        )}
        <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-slate">
          {isAr
            ? `${formatNumber(compound.available)} وحدة متاحة`
            : `${formatNumber(compound.available)} homes available`}
        </p>
      </div>
    </Link>
  );
}
