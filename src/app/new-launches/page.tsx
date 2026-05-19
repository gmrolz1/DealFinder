import { getNewLaunchUnits } from "@/lib/data";
import { PropertyCard } from "@/components/property-card";

export const metadata = { title: "New Launches — DealFinder" };

export default function NewLaunchesPage() {
  const units = getNewLaunchUnits(48);

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
      <h1 className="text-[28px] font-black tracking-tight text-ink sm:text-[34px]">
        New launches
      </h1>
      <p className="mt-1 text-[15px] text-muted">
        The latest primary releases from developers across Egypt.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-4">
        {units.map((u) => (
          <PropertyCard key={u.nawy_id} unit={u} />
        ))}
      </div>
    </div>
  );
}
