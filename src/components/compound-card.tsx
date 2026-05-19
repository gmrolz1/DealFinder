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
      className="group block overflow-hidden rounded-xl bg-surface shadow-[0_1px_2px_rgba(60,64,67,0.2)] transition hover:shadow-[0_2px_8px_rgba(60,64,67,0.28)]"
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
          <div className="grid h-full place-items-center text-[13px] text-muted">
            No image
          </div>
        )}
      </div>
      <div className="p-3.5">
        <p className="truncate text-[15px] font-bold tracking-tight text-ink">
          {compound.name}
        </p>
        {subtitle && (
          <p className="truncate text-[12px] text-muted">{subtitle}</p>
        )}
        <p className="mt-1 text-[12px] font-medium text-primary">
          {formatNumber(compound.available)} homes available
        </p>
      </div>
    </Link>
  );
}
