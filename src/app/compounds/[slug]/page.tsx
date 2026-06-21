import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCompoundBySlug,
  getUnitsByCompound,
  getCompoundGallery,
  getAreaName,
  getDeveloperOfCompound,
} from "@/lib/data";
import { formatNumber, formatPrice } from "@/lib/format";
import { campaignTelHref, campaignWhatsAppCompound } from "@/lib/campaign";
import { PropertyCard } from "@/components/property-card";
import { Carousel } from "@/components/preview/carousel";
import { ContactButtons, StickyContact } from "@/components/campaign/sticky-contact";

export default async function CompoundPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const compound = getCompoundBySlug(slug);
  if (!compound) notFound();

  const units = getUnitsByCompound(compound.nawy_id);
  const areaName = getAreaName(compound.area_nawy_id);
  const developer = getDeveloperOfCompound(compound);
  const gallery = getCompoundGallery(compound.nawy_id, compound.slug);
  const minPrice =
    units.length > 0
      ? Math.min(...units.map((u) => u.price ?? Infinity))
      : compound.min_price;
  const priceLabel = formatPrice(minPrice === Infinity ? null : minPrice);
  const waHref = campaignWhatsAppCompound(
    compound.name,
    areaName,
    priceLabel,
    "en"
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-7 sm:px-6">
      <nav className="text-[10px] font-semibold uppercase tracking-[0.08em] text-taupe">
        <Link href="/properties" className="hover:text-ink">
          Properties
        </Link>
        {areaName && <span> / {areaName}</span>}
      </nav>

      {/* Gallery — swipeable on mobile, taller on phones for a fuller hero */}
      <div className="group mt-3 aspect-[4/3] overflow-hidden border border-data bg-data sm:aspect-[16/8]">
        <Carousel
          images={gallery}
          alt={compound.name}
          aspectRatio="auto"
          className="!h-full"
        />
      </div>
      {gallery.length > 1 && (
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-taupe">
          {formatNumber(gallery.length)} photos · swipe to browse
        </p>
      )}

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[26px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[34px]">
            {compound.name}
          </h1>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-taupe">
            {[areaName, developer?.name].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="shrink-0 border border-data px-5 py-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-taupe">
            Starting From
          </p>
          <p className="mt-0.5 text-[20px] font-black tracking-tight text-ink">
            {priceLabel}
          </p>
        </div>
      </div>

      {/* Lead CTA — primary action for paid traffic */}
      <div className="mt-5">
        <ContactButtons
          waHref={waHref}
          callHref={campaignTelHref}
          waLabel="WhatsApp Us"
          callLabel="Call Now"
          locale="en"
        />
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.07em] text-slate">
          Free consultation · prices & payment plans · no spam
        </p>
      </div>

      {compound.property_types.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {compound.property_types.map((t) => (
            <span
              key={t}
              className="border border-data px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-slate"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {developer && (
        <Link
          href={`/developers/${developer.slug}`}
          className="mt-4 inline-block text-[11px] font-bold uppercase tracking-[0.08em] text-slate hover:text-ink"
        >
          All projects by {developer.name} →
        </Link>
      )}

      <section className="mt-9">
        <h2 className="text-[18px] font-bold uppercase tracking-tight text-ink">
          {formatNumber(units.length)} Available{" "}
          {units.length === 1 ? "Home" : "Homes"}
        </h2>
        {units.length === 0 ? (
          <p className="mt-4 border border-data py-12 text-center text-[12px] font-semibold uppercase tracking-[0.08em] text-slate">
            No primary units currently listed in this compound
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {units.map((u) => (
              <PropertyCard key={u.nawy_id} unit={u} />
            ))}
          </div>
        )}
      </section>

      <StickyContact locale="en" waHref={waHref} callHref={campaignTelHref} />
    </div>
  );
}
