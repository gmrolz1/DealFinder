import type { Metadata } from "next";
import { getArabianListings, getArabianStats } from "@/lib/client-listings";
import { ARABIAN_ESTATE_COPY } from "@/lib/campaign";
import { NewCapitalLanding } from "@/components/campaign/new-capital-landing";

export const metadata: Metadata = {
  title: "أريبيان استيت — أفضل عروض العقارات وخطط السداد في مصر",
  description:
    "أكثر من 130 وحدة أولية مختارة في العاصمة الإدارية والمستقبل والشروق والسخنة والساحل الشمالي. مقدم من 5%، تقسيط حتى 15 سنة. تواصل واتساب لعروض اليوم.",
  alternates: {
    canonical: "/ar/arabian-estate",
    languages: {
      en: "/arabian-estate",
      ar: "/ar/arabian-estate",
      "x-default": "/arabian-estate",
    },
  },
};

export default function ArabianEstateLandingPageAr() {
  const deals = getArabianListings();
  const stats = getArabianStats();

  return (
    <NewCapitalLanding
      locale="ar"
      deals={deals}
      unitCount={stats.units}
      compoundCount={stats.compounds}
      developerCount={stats.developers}
      brandName="ARABIAN ESTATE"
      landingPath="/ar/arabian-estate"
      copy={ARABIAN_ESTATE_COPY.ar}
    />
  );
}
