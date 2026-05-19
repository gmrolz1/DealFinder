import Link from "next/link";
import { formatNumber } from "@/lib/format";
import type { Compound, WithCount } from "@/lib/data";

export function CompoundCard({
  compound,
  subtitle,
}: {
  compound: WithCount<Compound>;
  subtitle?: string | null;
}) {
  return (
    <Link
      href={`/compounds/${compound.slug}`}
      className="group block overflow-hidden rounded-2xl bg-surface ring-1 ring-hairline transition active:scale-[0.99]"
    >
      <div className="relative aspect-[5/3] overflow-hidden bg-canvas">
        {compound.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={compound.image_url}
            alt={compound.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-[13px] text-ink-faint">
            No image
          </div>
        )}
      </div>
      <div className="p-3.5">
        <p className="truncate text-[15px] font-semibold tracking-tight text-ink">
          {compound.name}
        </p>
        {subtitle && (
          <p className="truncate text-[12px] text-ink-soft">{subtitle}</p>
        )}
        <p className="mt-1 text-[12px] font-medium text-blue">
          {formatNumber(compound.available)} homes available
        </p>
      </div>
    </Link>
  );
}
