import Link from "next/link";
import { getAreasWithCounts } from "@/lib/data";
import { formatNumber } from "@/lib/format";

export const metadata = { title: "Areas — The Deal Maker" };

export default function AreasPage() {
  const areas = getAreasWithCounts().filter((a) => a.available > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-[32px] font-extrabold uppercase tracking-tight text-paper sm:text-[44px]">
        Explore by Area
      </h1>
      <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-taupe">
        {areas.length} areas across Egypt
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {areas.map((a) => (
          <Link
            key={a.nawy_id}
            href={`/areas/${a.slug}`}
            className="relative h-48 overflow-hidden border border-slate bg-slate transition hover:border-data"
          >
            {a.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={a.image_url}
                alt={a.name}
                loading="lazy"
                className="h-full w-full object-cover opacity-55 grayscale"
              />
            )}
            <div className="absolute inset-x-0 bottom-0 p-3.5">
              <p className="text-[14px] font-bold uppercase tracking-[0.02em] text-paper">
                {a.name}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-data">
                {formatNumber(a.available)} homes
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
