import Link from "next/link";
import { getAreasWithCounts } from "@/lib/data";
import { formatNumber } from "@/lib/format";

export const metadata = { title: "Areas — DealFinder" };

export default function AreasPage() {
  const areas = getAreasWithCounts().filter((a) => a.available > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
      <h1 className="text-[28px] font-semibold tracking-tight text-ink sm:text-[34px]">
        Explore by area
      </h1>
      <p className="mt-1 text-[15px] text-ink-soft">
        {areas.length} areas across Egypt
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
        {areas.map((a) => (
          <Link
            key={a.nawy_id}
            href={`/areas/${a.slug}`}
            className="relative h-44 overflow-hidden rounded-2xl bg-ink transition active:scale-[0.99]"
          >
            {a.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={a.image_url}
                alt={a.name}
                loading="lazy"
                className="h-full w-full object-cover opacity-75"
              />
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3.5">
              <p className="text-[16px] font-semibold text-white">{a.name}</p>
              <p className="text-[12px] text-white/80">
                {formatNumber(a.available)} homes
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
