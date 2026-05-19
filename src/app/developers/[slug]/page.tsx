import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDeveloperBySlug,
  getCompoundsByDeveloper,
  getUnitsByDeveloper,
  getAreaName,
} from "@/lib/data";
import { formatNumber, formatPrice } from "@/lib/format";
import { PropertyCard } from "@/components/property-card";
import { CompoundCard } from "@/components/compound-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dev = getDeveloperBySlug(slug);
  if (!dev) return { title: "Developer — DealFinder" };
  const title = dev.meta_title ?? `${dev.name} — DealFinder`;
  const description = dev.meta_description ?? undefined;
  const url = `/developers/${dev.slug}`;
  return {
    title,
    description,
    keywords: [
      dev.name,
      `${dev.name} projects`,
      `${dev.name} properties`,
      `${dev.name} prices`,
      `${dev.name} apartments`,
      "real estate developer Egypt",
      ...dev.areas.map((a) => `${dev.name} ${a}`),
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "DealFinder",
      images: dev.logo_url ? [{ url: dev.logo_url }] : undefined,
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function DeveloperPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dev = getDeveloperBySlug(slug);
  if (!dev) notFound();

  const compounds = getCompoundsByDeveloper(dev.nawy_id);
  const units = getUnitsByDeveloper(dev.nawy_id);
  const hasInventory = units.length > 0;

  const prices = units
    .map((u) => u.price)
    .filter((p): p is number => typeof p === "number" && p > 0);
  const minPrice = prices.length ? Math.min(...prices) : dev.min_price;

  const compoundAreas = [
    ...new Set(
      compounds
        .map((c) => (c.area_nawy_id ? getAreaName(c.area_nawy_id) : null))
        .filter((n): n is string => Boolean(n))
    ),
  ];
  const areaNames = compoundAreas.length > 0 ? compoundAreas : dev.areas;

  const stats: [string, string][] = [
    ["Projects", formatNumber(compounds.length)],
    ["Homes Available", formatNumber(units.length)],
    ["Areas", formatNumber(areaNames.length)],
    ["Starting From", minPrice ? formatPrice(minPrice) : "—"],
  ];

  // ── SEO: structured data (JSON-LD) ───────────────────────────────────
  const pageUrl = `/developers/${dev.slug}`;
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: dev.name,
    url: pageUrl,
    ...(dev.logo_url ? { logo: dev.logo_url, image: dev.logo_url } : {}),
    ...(dev.established_year
      ? { foundingDate: String(dev.established_year) }
      : {}),
    description: dev.about ?? undefined,
    address: { "@type": "PostalAddress", addressCountry: "EG" },
    areaServed: areaNames.map((a) => ({ "@type": "Place", name: a })),
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dev.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Developers",
        item: "/developers",
      },
      { "@type": "ListItem", position: 3, name: dev.name, item: pageUrl },
    ],
  };

  return (
    <div className="bg-paper">
      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
        <nav className="text-[10px] font-semibold uppercase tracking-[0.08em] text-taupe">
          <Link href="/developers" className="hover:text-ink">
            Developers
          </Link>
          <span> / {dev.name}</span>
        </nav>

        {/* Hero */}
        <section className="mt-4 grid gap-7 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="flex items-center gap-4">
              <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden border border-data bg-paper">
                {dev.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={dev.logo_url}
                    alt={`${dev.name} logo`}
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <span className="text-[28px] font-extrabold text-ink">
                    {dev.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-taupe">
                  Real Estate Developer
                </p>
                <h1 className="text-[26px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[36px]">
                  {dev.name}
                </h1>
              </div>
            </div>

            {/* Credibility chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              {dev.established_year && (
                <span className="border border-data px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate">
                  Est. {dev.established_year}
                </span>
              )}
              {compounds.length > 0 && (
                <span className="border border-data px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate">
                  {formatNumber(compounds.length)} Projects
                </span>
              )}
              {hasInventory && (
                <span className="border border-ink bg-ink px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-paper">
                  {formatNumber(units.length)} Homes Available
                </span>
              )}
            </div>

            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate">
              {dev.about}
            </p>

            {/* Stat strip */}
            <div className="mt-6 grid grid-cols-2 border-l border-t border-data sm:grid-cols-4">
              {stats.map(([label, value]) => (
                <div key={label} className="border-b border-r border-data p-4">
                  <p className="text-[18px] font-black tracking-tight text-ink sm:text-[22px]">
                    {value}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-taupe">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Lead capture — the conversion engine */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="border border-ink p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-taupe">
                {hasInventory ? "Exclusive" : "New Launches"}
              </p>
              <h2 className="mt-1 text-[20px] font-extrabold uppercase leading-tight tracking-tight text-ink">
                {hasInventory ? (
                  <>
                    Get {dev.name}&apos;s
                    <br />
                    Price List &amp; Offers
                  </>
                ) : (
                  <>
                    Be First to Know
                    <br />
                    {dev.name}&apos;s Launch
                  </>
                )}
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-slate">
                {hasInventory
                  ? "Latest prices, payment plans and availability — sent to you directly."
                  : "Register your interest and we'll alert you the moment new units are released."}
              </p>
              <div className="mt-5 space-y-2.5">
                <input
                  placeholder="Your name"
                  className="w-full border border-data bg-paper px-4 py-2.5 text-[13px] text-ink outline-none placeholder:text-slate/50 focus:border-ink"
                />
                <input
                  placeholder="Phone number"
                  className="w-full border border-data bg-paper px-4 py-2.5 text-[13px] text-ink outline-none placeholder:text-slate/50 focus:border-ink"
                />
                <button
                  type="button"
                  className="w-full border border-ink bg-ink px-4 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-paper transition hover:bg-paper hover:text-ink"
                >
                  {hasInventory ? "Get the Price List" : "Register My Interest"}
                </button>
              </div>
              <p className="mt-3 text-[10px] uppercase tracking-[0.07em] text-taupe">
                No spam — just deals. Lead capture activates with the database.
              </p>
            </div>
          </aside>
        </section>

        {/* Compounds */}
        {compounds.length > 0 && (
          <section className="mt-12">
            <h2 className="text-[20px] font-bold uppercase tracking-tight text-ink">
              Projects by {dev.name}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {compounds.slice(0, 8).map((c) => (
                <CompoundCard
                  key={c.nawy_id}
                  compound={c}
                  subtitle={getAreaName(c.area_nawy_id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Units */}
        {units.length > 0 && (
          <section className="mt-12">
            <div className="flex items-end justify-between">
              <h2 className="text-[20px] font-bold uppercase tracking-tight text-ink">
                Available Homes
              </h2>
              <Link
                href={`/properties?developer=${dev.nawy_id}`}
                className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate hover:text-ink"
              >
                See all {formatNumber(units.length)}
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {units.slice(0, 8).map((u) => (
                <PropertyCard key={u.nawy_id} unit={u} />
              ))}
            </div>
          </section>
        )}

        {/* Areas */}
        {areaNames.length > 0 && (
          <section className="mt-12">
            <h2 className="text-[20px] font-bold uppercase tracking-tight text-ink">
              Where {dev.name} Builds
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {areaNames.map((a) => (
                <span
                  key={a}
                  className="border border-data px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate"
                >
                  {a}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Empty-inventory state */}
        {!hasInventory && (
          <section className="mt-12 border border-data py-12 text-center">
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-slate">
              No primary units currently listed for {dev.name}
            </p>
            <p className="mx-auto mt-2 max-w-md text-[13px] text-taupe">
              Register your interest above and our team will reach out as soon
              as inventory becomes available.
            </p>
          </section>
        )}

        {/* FAQ — Q&A at the end of the page (with FAQPage schema above) */}
        {dev.faqs.length > 0 && (
          <section className="mt-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-taupe">
              Questions &amp; Answers
            </p>
            <h2 className="mt-1 text-[22px] font-extrabold uppercase tracking-tight text-ink sm:text-[28px]">
              {dev.name} — FAQ
            </h2>
            <div className="mt-5 border-t border-data">
              {dev.faqs.map((f, i) => (
                <details
                  key={i}
                  className="group border-b border-data"
                  {...(i === 0 ? { open: true } : {})}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[14px] font-bold uppercase tracking-[0.02em] text-ink">
                    {f.q}
                    <span className="shrink-0 text-[18px] font-black text-taupe transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="pb-5 pr-8 text-[14px] leading-relaxed text-slate">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Closing CTA */}
      <section className="mt-14 border-t border-data bg-ink">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-[22px] font-extrabold uppercase tracking-tight text-paper sm:text-[28px]">
              Interested in {dev.name}?
            </h2>
            <p className="mt-1 text-[13px] text-data">
              {hasInventory
                ? "Browse every available home or request a callback from our team."
                : "Request a callback and we'll keep you posted on every new launch."}
            </p>
          </div>
          <Link
            href={
              hasInventory
                ? `/properties?developer=${dev.nawy_id}`
                : "/developers"
            }
            className="shrink-0 border border-paper bg-paper px-6 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-ink transition hover:bg-ink hover:text-paper"
          >
            {hasInventory ? "View All Homes" : "Explore Developers"}
          </Link>
        </div>
      </section>
    </div>
  );
}
