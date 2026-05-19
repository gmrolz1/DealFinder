import Link from "next/link";
import { getDevelopersWithCounts } from "@/lib/data";
import { formatNumber } from "@/lib/format";

export const metadata = {
  title: "Real Estate Developers in Egypt — DealFinder",
  description:
    "Browse every real estate developer in Egypt. Compare projects, prices and available properties, and request a callback on DealFinder.",
};

export default function DevelopersPage() {
  const developers = getDevelopersWithCounts();
  const withInventory = developers.filter((d) => d.available > 0).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-[32px] font-extrabold uppercase tracking-tight text-ink sm:text-[44px]">
        Developers
      </h1>
      <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-taupe">
        {formatNumber(developers.length)} developers ·{" "}
        {formatNumber(withInventory)} with available homes
      </p>

      <div className="mt-6 grid grid-cols-1 border-l border-t border-data sm:grid-cols-2 lg:grid-cols-3">
        {developers.map((d) => (
          <Link
            key={d.nawy_id}
            href={`/developers/${d.slug}`}
            className="flex items-center gap-3.5 border-b border-r border-data p-4 transition hover:bg-data"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden border border-data bg-paper">
              {d.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={d.logo_url}
                  alt={d.name}
                  loading="lazy"
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <span className="text-[15px] font-extrabold text-ink">
                  {d.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold uppercase tracking-[0.02em] text-ink">
                {d.name}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-taupe">
                {d.available > 0
                  ? `${formatNumber(d.available)} homes available`
                  : "View developer profile"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
