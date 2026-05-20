import type { Metadata } from "next";
import { DevelopersIndex } from "@/components/developers-index";

export const metadata: Metadata = {
  title: "Real Estate Developers in Egypt — DealFinder",
  description:
    "Browse every real estate developer in Egypt. Compare projects, prices and available properties, and request a callback on DealFinder.",
  alternates: {
    canonical: "/developers",
    languages: {
      en: "/developers",
      ar: "/ar/developers",
      "x-default": "/developers",
    },
  },
};

export default function DevelopersPageEn() {
  return <DevelopersIndex locale="en" />;
}
