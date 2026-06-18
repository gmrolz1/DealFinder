import type { Metadata } from "next";
import { getAreaDeals, getCompoundsByArea, searchUnits } from "@/lib/data";
import { CAMPAIGN } from "@/lib/campaign";
import { NewCapitalLanding } from "@/components/campaign/new-capital-landing";

export const metadata: Metadata = {
  title: "MAP Real Estate — New Capital Properties for Sale",
  description:
    "Primary apartments & villas in Egypt's New Administrative Capital from top developers. From EGP 1.8M, 10% down, up to 8-year plans. WhatsApp us for the best deals.",
  alternates: {
    canonical: "/map",
    languages: {
      en: "/map",
      ar: "/ar/map",
      "x-default": "/map",
    },
  },
};

export default function MapLandingPage() {
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
    />
  );
}
