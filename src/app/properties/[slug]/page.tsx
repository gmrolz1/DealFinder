import { notFound } from "next/navigation";
import { getUnitBySlug } from "@/lib/data";
import { UnitDetail } from "@/components/unit-detail";

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const unit = getUnitBySlug(slug);
  if (!unit) notFound();
  return <UnitDetail unit={unit} locale="en" />;
}
