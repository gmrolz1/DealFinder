import Link from "next/link";
import { getDevelopersWithCounts } from "@/lib/data";
import { formatNumber } from "@/lib/format";

export const metadata = { title: "Developers — DealFinder" };

export default function DevelopersPage() {
  const developers = getDevelopersWithCounts().filter((d) => d.available > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
      <h1 className="text-[28px] font-black tracking-tight text-ink sm:text-[34px]">
        Developers
      </h1>
      <p className="mt-1 text-[15px] text-muted">
        {developers.length} developers with available homes
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {developers.map((d) => (
          <Link
            key={d.nawy_id}
            href={`/developers/${d.slug}`}
            className="flex items-center gap-3.5 rounded-xl bg-surface p-3.5 shadow-[0_1px_2px_rgba(60,64,67,0.2)] transition hover:shadow-[0_2px_8px_rgba(60,64,67,0.28)]"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-canvas">
              {d.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={d.logo_url}
                  alt={d.name}
                  loading="lazy"
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <span className="text-[15px] font-bold text-muted">
                  {d.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium text-ink">
                {d.name}
              </p>
              <p className="text-[12px] text-muted">
                {formatNumber(d.available)} homes available
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
