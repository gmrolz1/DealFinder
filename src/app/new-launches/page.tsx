import { getNewLaunchUnits } from "@/lib/data";
import { PropertyCard } from "@/components/property-card";

export const metadata = { title: "New Launches — DealFinder" };

export default function NewLaunchesPage() {
  const units = getNewLaunchUnits(48);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-[32px] font-extrabold uppercase tracking-tight text-ink sm:text-[44px]">
        New Launches
      </h1>
      <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-taupe">
        The latest primary releases from developers across Egypt
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {units.map((u) => (
          <PropertyCard key={u.nawy_id} unit={u} />
        ))}
      </div>
    </div>
  );
}
