import type { Metadata } from "next";
import { getAreaDeals, getCompoundsByArea, searchUnits } from "@/lib/data";
import { TAGAMO3, TAGAMO3_AREA, TAGAMO3_COPY } from "@/lib/campaign";
import { NewCapitalLanding } from "@/components/campaign/new-capital-landing";

export const metadata: Metadata = {
  title: "Fifth Settlement Properties for Sale — Best Deals & Payment Plans",
  description:
    "Primary apartments & villas in New Cairo's Fifth Settlement and the Golden Square from top developers. From EGP 1.9M, from 2% down, up to 12-year plans. WhatsApp us for the best deals.",
  alternates: {
    canonical: "/fifth-settlement",
    languages: {
      en: "/fifth-settlement",
      ar: "/ar/fifth-settlement",
      "x-default": "/fifth-settlement",
    },
  },
};

export default function FifthSettlementLandingPage() {
  const deals = getAreaDeals(TAGAMO3.areaIds, 24);
  const compounds = getCompoundsByArea(TAGAMO3.areaIds);
  const unitCount = TAGAMO3.areaIds.reduce(
    (total, id) => total + searchUnits({ area: String(id) }).total,
    0
  );
  const developerCount = new Set(
    compounds.map((c) => c.developer_nawy_id).filter(Boolean)
  ).size;

  return (
    <NewCapitalLanding
      locale="en"
      deals={deals}
      unitCount={unitCount}
      compoundCount={compounds.length}
      developerCount={developerCount}
      copy={TAGAMO3_COPY}
      waArea={TAGAMO3_AREA}
    />
  );
}
