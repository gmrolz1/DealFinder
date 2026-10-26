import type { Metadata } from "next";
import { getAreaDeals, getCompoundsByArea, searchUnits } from "@/lib/data";
import { CAMPAIGN, MAP_COPY, MAP_SIGNATURE } from "@/lib/campaign";
import { NewCapitalLanding } from "@/components/campaign/new-capital-landing";

/** Curated premium floor for the MAP landing — no budget stock. */
const MAP_MIN_PRICE = 5_000_000;

export const metadata: Metadata = {
  title: "ماب العقارية — عقارات مميزة في العاصمة الإدارية للبيع",
  description:
    "شقق وفيلات أولية مميزة مختارة بعناية في العاصمة الإدارية الجديدة من كبار المطوّرين — تبدأ من ٥ مليون جنيه، خطط مرنة. تواصل معنا على واتساب لأفضل العروض المميزة.",
  alternates: {
    canonical: "/ar/map",
    languages: {
      en: "/map",
      ar: "/ar/map",
      "x-default": "/map",
    },
  },
};

export default function MapLandingPageAr() {
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
      locale="ar"
      deals={deals}
      unitCount={unitCount}
      compoundCount={compounds.length}
      developerCount={developerCount}
      brandName="MAP"
      landingPath="/ar/map"
      copy={MAP_COPY}
      signature={MAP_SIGNATURE.ar}
    />
  );
}
