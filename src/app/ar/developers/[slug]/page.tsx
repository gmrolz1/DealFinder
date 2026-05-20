import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDeveloperBySlug } from "@/lib/data";
import {
  DeveloperDetail,
  developerMetadata,
} from "@/components/developer-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return developerMetadata(slug, "ar");
}

export default async function DeveloperPageAr({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dev = getDeveloperBySlug(slug);
  if (!dev) notFound();
  return <DeveloperDetail dev={dev} locale="ar" />;
}
