import type { Metadata } from "next";
import { getArabianListings, getArabianStats } from "@/lib/client-listings";
import { ARABIAN_ESTATE_COPY, ARABIAN_ESTATE_AREA } from "@/lib/campaign";
import { NewCapitalLanding } from "@/components/campaign/new-capital-landing";

export const metadata: Metadata = {
  title: "Arabian Estate — Best Property Deals & Payment Plans in Egypt",
  description:
    "130+ hand-picked primary units across New Capital, Mostakbal City, Shorouk, Sokhna and the North Coast. From 5% down, plans up to 15 years. WhatsApp us for today's offers.",
  alternates: {
    canonical: "/arabian-estate",
    languages: {
      en: "/arabian-estate",
      ar: "/ar/arabian-estate",
      "x-default": "/arabian-estate",
    },
  },
};

export default function ArabianEstateLandingPage() {
  const deals = getArabianListings();
  const stats = getArabianStats();

  return (
    <NewCapitalLanding
      locale="en"
      deals={deals}
      unitCount={stats.units}
      compoundCount={stats.compounds}
      developerCount={stats.developers}
      brandName="ARABIAN ESTATE"
      landingPath="/arabian-estate"
      copy={ARABIAN_ESTATE_COPY}
      waArea={ARABIAN_ESTATE_AREA}
    />
  );
}
