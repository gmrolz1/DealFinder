import type { Metadata } from "next";
import { DevelopersIndex } from "@/components/developers-index";

export const metadata: Metadata = {
  title: "مطورو العقارات في مصر — DealFinder",
  description:
    "تصفّح كل مطور عقاري في مصر. قارن المشاريع والأسعار والوحدات المتاحة واطلب اتصالاً على DealFinder.",
  alternates: {
    canonical: "/ar/developers",
    languages: {
      en: "/developers",
      ar: "/ar/developers",
      "x-default": "/developers",
    },
  },
};

export default function DevelopersPageAr() {
  return <DevelopersIndex locale="ar" />;
}
