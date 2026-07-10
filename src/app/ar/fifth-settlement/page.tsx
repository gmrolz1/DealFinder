import type { Metadata } from "next";
import { getAreaDeals, getCompoundsByArea, searchUnits } from "@/lib/data";
import { TAGAMO3, TAGAMO3_AREA, TAGAMO3_COPY } from "@/lib/campaign";
import { NewCapitalLanding } from "@/components/campaign/new-capital-landing";

export const metadata: Metadata = {
  title: "عقارات التجمع الخامس للبيع — أفضل العروض وخطط السداد",
  description:
    "شقق وفيلات أولية في التجمع الخامس والجولدن سكوير من كبار المطوّرين. تبدأ من 1.9 مليون جنيه، مقدمات من 2%، تقسيط حتى 12 سنة. تواصل معنا على واتساب لأفضل العروض.",
  alternates: {
    canonical: "/ar/fifth-settlement",
    languages: {
      en: "/fifth-settlement",
      ar: "/ar/fifth-settlement",
      "x-default": "/fifth-settlement",
    },
  },
};

export default function FifthSettlementLandingPageAr() {
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
      locale="ar"
      deals={deals}
      unitCount={unitCount}
      compoundCount={compounds.length}
      developerCount={developerCount}
      landingPath="/ar/fifth-settlement"
      copy={TAGAMO3_COPY}
      waArea={TAGAMO3_AREA}
    />
  );
}
