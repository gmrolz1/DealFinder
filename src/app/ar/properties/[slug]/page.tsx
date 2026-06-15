import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUnitBySlug } from "@/lib/data";
import { UnitDetail } from "@/components/unit-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const u = getUnitBySlug(slug);
  if (!u) return { title: "عقار — DealFinder" };
  const title = u.title_ar ?? u.title;
  const desc = u.subtitle_ar ?? u.subtitle ?? undefined;
  return {
    title: `${title} — DealFinder`,
    description: desc,
    alternates: {
      canonical: `/ar/properties/${u.slug}`,
      languages: {
        en: `/properties/${u.slug}`,
        ar: `/ar/properties/${u.slug}`,
        "x-default": `/properties/${u.slug}`,
      },
    },
  };
}

export default async function PropertyPageAr({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const unit = getUnitBySlug(slug);
  if (!unit) notFound();
  return <UnitDetail unit={unit} locale="ar" />;
}
