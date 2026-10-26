import type { Metadata } from "next";
import { getAreaDeals, getCompoundsByArea, searchUnits } from "@/lib/data";
import { CAMPAIGN, MAP_COPY, MAP_SIGNATURE } from "@/lib/campaign";
import { NewCapitalLanding } from "@/components/campaign/new-capital-landing";

/** Curated premium floor for the MAP landing — no budget stock. */
const MAP_MIN_PRICE = 5_000_000;

export const metadata: Metadata = {
  title: "MAP Real Estate — Premium New Capital Properties for Sale",
  description:
    "Hand-picked premium apartments & villas in Egypt's New Administrative Capital from top developers — from EGP 5M, flexible plans. WhatsApp us for the best premium deals.",
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
  const deals = getAreaDeals(CAMPAIGN.areaId, 24, {
    minPrice: MAP_MIN_PRICE,
    premium: true,
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
      brandName="MAP"
      landingPath="/map"
      copy={MAP_COPY}
      signature={MAP_SIGNATURE.en}
    />
  );
}
