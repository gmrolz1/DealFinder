import type { Metadata } from "next";
import { getNewLaunchUnits } from "@/lib/data";
import { PropertyCard } from "@/components/property-card";

export const metadata: Metadata = {
  title: "إطلاقات جديدة — DealFinder",
  description: "أحدث الإطلاقات الأولية من المطورين في جميع أنحاء مصر — وحدات لم تُطرح من قبل وفرص حجز مبكرة.",
  alternates: {
    canonical: "/ar/new-launches",
    languages: {
      en: "/new-launches",
      ar: "/ar/new-launches",
      "x-default": "/new-launches",
    },
  },
};

export default function NewLaunchesPageAr() {
  const units = getNewLaunchUnits(48);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-[32px] font-extrabold uppercase tracking-tight text-ink sm:text-[44px]">
        إطلاقات جديدة
      </h1>
      <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-taupe">
        أحدث الإطلاقات الأولية من المطورين في جميع أنحاء مصر
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {units.map((u) => (
          <PropertyCard key={u.nawy_id} unit={u} locale="ar" />
        ))}
      </div>
    </div>
  );
}
