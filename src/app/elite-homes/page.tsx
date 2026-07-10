import type { Metadata } from "next";
import { getAreaDeals, getCompoundsByArea, searchUnits } from "@/lib/data";
import { CAMPAIGN } from "@/lib/campaign";
import { NewCapitalLanding } from "@/components/campaign/new-capital-landing";

export const metadata: Metadata = {
  title: "Elite Homes — New Capital Properties for Sale",
  description:
    "Primary apartments & villas in Egypt's New Administrative Capital from top developers. Flexible plans, low down payments. WhatsApp us for the best deals.",
  alternates: {
    canonical: "/elite-homes",
    languages: {
      en: "/elite-homes",
      ar: "/ar/elite-homes",
      "x-default": "/elite-homes",
    },
  },
};

// Shared deal-ranked inventory until Elite Homes supplies its own listings.
export default function EliteHomesLandingPage() {
  const deals = getAreaDeals(CAMPAIGN.areaId, 24);
  const compounds = getCompoundsByArea(CAMPAIGN.areaId);
  const unitCount = searchUnits({ area: String(CAMPAIGN.areaId) }).total;
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
      brandName="ELITE HOMES"
      landingPath="/elite-homes"
    />
  );
}
