import type { Metadata } from "next";
import { getAreaDeals, getCompoundsByArea, searchUnits } from "@/lib/data";
import { CAMPAIGN, MAP_COPY, MAP_SIGNATURE } from "@/lib/campaign";
import { NewCapitalLanding } from "@/components/campaign/new-capital-landing";

/** Curated premium floor for the New Capital (MAP) landing — no budget stock. */
const MAP_MIN_PRICE = 5_000_000;

export const metadata: Metadata = {
  title: "Premium New Capital Properties for Sale — MAP Real Estate",
  description:
    "Hand-picked premium apartments & villas in Egypt's New Administrative Capital from top developers — from EGP 5M, flexible plans. WhatsApp us for the best premium deals.",
  alternates: {
    canonical: "/new-capital",
    languages: {
      en: "/new-capital",
      ar: "/ar/new-capital",
      "x-default": "/new-capital",
    },
  },
};

export default function NewCapitalLandingPage() {
  const deals = getAreaDeals(CAMPAIGN.areaId, 36, {
    minPrice: MAP_MIN_PRICE,
    premium: true,
    residentialOnly: true,
  });
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
      landingPath="/new-capital"
      copy={MAP_COPY}
      signature={MAP_SIGNATURE.en}
    />
  );
}
