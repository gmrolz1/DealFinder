import type { Metadata } from "next";
import { getAreaDeals, getCompoundsByArea, searchUnits } from "@/lib/data";
import { CAMPAIGN } from "@/lib/campaign";
import { NewCapitalLanding } from "@/components/campaign/new-capital-landing";

export const metadata: Metadata = {
  title: "عقارات العاصمة الإدارية للبيع — أفضل العروض وخطط السداد",
  description:
    "شقق وفيلات أولية في العاصمة الإدارية الجديدة من كبار المطوّرين. تبدأ من 2.7 مليون جنيه، مقدمات من 1%، تقسيط حتى 15 سنة. تواصل معنا على واتساب لأفضل العروض.",
  alternates: {
    canonical: "/ar/new-capital",
    languages: {
      en: "/new-capital",
      ar: "/ar/new-capital",
      "x-default": "/new-capital",
    },
  },
};

export default function NewCapitalLandingPageAr() {
  const deals = getAreaDeals(CAMPAIGN.areaId, 24);
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
      landingPath="/ar/new-capital"
    />
  );
}
