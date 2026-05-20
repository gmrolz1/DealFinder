import Link from "next/link";
import {
  getDeveloperBySlug,
  getCompoundsByDeveloper,
  getUnitsByDeveloper,
  getAreaName,
  type Developer,
} from "@/lib/data";
import { formatNumber, formatPrice } from "@/lib/format";
import { PropertyCard } from "@/components/property-card";
import { CompoundCard } from "@/components/compound-card";
import { type Locale, t, localizedPath } from "@/lib/i18n";

const NBSP = " ";

// Picks the locale-appropriate field, falling back to EN.
const pick = <T,>(en: T, ar: T | null | undefined, locale: Locale): T =>
  (locale === "ar" ? (ar ?? en) : en);

const fmtPriceLocale = (
  n: number | null | undefined,
  locale: Locale
): string => {
  if (n == null || n <= 0)
    return locale === "ar" ? "السعر عند الطلب" : "Price on request";
  if (locale === "ar") {
    if (n >= 1_000_000) {
      const m = n / 1_000_000;
      return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)} مليون جنيه`;
    }
    if (n >= 1000) return `${Math.round(n / 1000)} ألف جنيه`;
    return `${n} جنيه`;
  }
  return formatPrice(n);
};

export function DeveloperDetail({
  dev,
  locale,
}: {
  dev: Developer;
  locale: Locale;
}) {
  const isAr = locale === "ar";
  const name = pick(dev.name, dev.name_ar, locale);
  const about = pick(dev.about, dev.about_ar, locale);
  const faqs = pick(dev.faqs, dev.faqs_ar, locale);

  const compounds = getCompoundsByDeveloper(dev.nawy_id);
  const units = getUnitsByDeveloper(dev.nawy_id);
  const hasInventory = units.length > 0;

  const prices = units
    .map((u) => u.price)
    .filter((p): p is number => typeof p === "number" && p > 0);
  const minPrice = prices.length ? Math.min(...prices) : dev.min_price;

  // areas — show locale-appropriate names
  const compoundAreas = [
    ...new Set(
      compounds
        .map((c) => (c.area_nawy_id ? getAreaName(c.area_nawy_id) : null))
        .filter((n): n is string => Boolean(n))
    ),
  ];
  // Map EN → AR via dev.areas / dev.areas_ar pairing (same order)
  const areaArByEn = new Map<string, string>();
  for (let i = 0; i < dev.areas.length; i++) {
    if (dev.areas[i] && dev.areas_ar[i])
      areaArByEn.set(dev.areas[i], dev.areas_ar[i]);
  }
  const areaNamesEn = compoundAreas.length > 0 ? compoundAreas : dev.areas;
  const areaNames = isAr
    ? areaNamesEn.map((a) => areaArByEn.get(a) ?? a)
    : areaNamesEn;

  const stats: [string, string][] = [
    [t("dev.projects", locale), formatNumber(compounds.length)],
    [t("dev.homesAvailable", locale), formatNumber(units.length)],
    [t("dev.areas", locale), formatNumber(areaNames.length)],
    [
      t("dev.startingFrom", locale),
      minPrice ? fmtPriceLocale(minPrice, locale) : "—",
    ],
  ];

  // SEO structured data
  const pageUrl = localizedPath(`/developers/${dev.slug}`, locale);
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name,
    url: pageUrl,
    ...(dev.logo_url ? { logo: dev.logo_url, image: dev.logo_url } : {}),
    ...(dev.established_year
      ? { foundingDate: String(dev.established_year) }
      : {}),
    description: about ?? undefined,
    address: { "@type": "PostalAddress", addressCountry: "EG" },
    areaServed: areaNames.map((a) => ({ "@type": "Place", name: a })),
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: isAr ? "الرئيسية" : "Home",
        item: localizedPath("/", locale),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t("nav.developers", locale),
        item: localizedPath("/developers", locale),
      },
      { "@type": "ListItem", position: 3, name, item: pageUrl },
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
          <Link
            href={localizedPath("/developers", locale)}
            className="hover:text-ink"
          >
            {t("nav.developers", locale)}
          </Link>
          <span>
            {NBSP}/{NBSP}
            {name}
          </span>
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
                    alt={`${name} logo`}
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <span className="text-[28px] font-extrabold text-ink">
                    {name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-taupe">
                  {t("dev.label", locale)}
                </p>
                <h1 className="text-[26px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[36px]">
                  {name}
                </h1>
              </div>
            </div>

            {/* Credibility chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              {dev.established_year && (
                <span className="border border-data px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate">
                  {t("dev.establishedShort", locale)} {dev.established_year}
                </span>
              )}
              {compounds.length > 0 && (
                <span className="border border-data px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate">
                  {formatNumber(compounds.length)}{NBSP}
                  {t("dev.projects", locale)}
                </span>
              )}
              {hasInventory && (
                <span className="border border-ink bg-ink px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-paper">
                  {formatNumber(units.length)}{NBSP}
                  {t("dev.homesAvailable", locale)}
                </span>
              )}
            </div>

            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate">
              {about}
            </p>

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

          {/* Lead capture */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="border border-ink p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-taupe">
                {hasInventory
                  ? t("lead.exclusive", locale)
                  : t("lead.newLaunches", locale)}
              </p>
              <h2 className="mt-1 text-[20px] font-extrabold uppercase leading-tight tracking-tight text-ink">
                {hasInventory
                  ? `${name}${isAr ? " — " : "'s "}${t("lead.priceListTitle", locale)}`
                  : `${t("lead.beFirstTitle", locale)} — ${name}`}
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-slate">
                {hasInventory
                  ? t("lead.priceListSub", locale)
                  : t("lead.beFirstSub", locale)}
              </p>
              <div className="mt-5 space-y-2.5">
                <input
                  placeholder={t("lead.namePlaceholder", locale)}
                  className="w-full border border-data bg-paper px-4 py-2.5 text-[13px] text-ink outline-none placeholder:text-slate/50 focus:border-ink"
                />
                <input
                  placeholder={t("lead.phonePlaceholder", locale)}
                  className="w-full border border-data bg-paper px-4 py-2.5 text-[13px] text-ink outline-none placeholder:text-slate/50 focus:border-ink"
                />
                <button
                  type="button"
                  className="w-full border border-ink bg-ink px-4 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-paper transition hover:bg-paper hover:text-ink"
                >
                  {hasInventory
                    ? t("lead.ctaPriceList", locale)
                    : t("lead.ctaRegister", locale)}
                </button>
              </div>
              <p className="mt-3 text-[10px] uppercase tracking-[0.07em] text-taupe">
                {t("lead.privacyNote", locale)}
              </p>
            </div>
          </aside>
        </section>

        {compounds.length > 0 && (
          <section className="mt-12">
            <h2 className="text-[20px] font-bold uppercase tracking-tight text-ink">
              {t("section.projectsBy", locale)} {name}
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

        {units.length > 0 && (
          <section className="mt-12">
            <div className="flex items-end justify-between">
              <h2 className="text-[20px] font-bold uppercase tracking-tight text-ink">
                {t("section.availableHomes", locale)}
              </h2>
              <Link
                href={`${localizedPath("/properties", locale)}?developer=${dev.nawy_id}`}
                className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate hover:text-ink"
              >
                {t("section.seeAll", locale)} {formatNumber(units.length)}
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {units.slice(0, 8).map((u) => (
                <PropertyCard key={u.nawy_id} unit={u} />
              ))}
            </div>
          </section>
        )}

        {areaNames.length > 0 && (
          <section className="mt-12">
            <h2 className="text-[20px] font-bold uppercase tracking-tight text-ink">
              {isAr
                ? `أين تطوّر ${name} مشاريعها`
                : `Where ${name} Builds`}
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

        {!hasInventory && (
          <section className="mt-12 border border-data py-12 text-center">
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-slate">
              {t("section.noUnits", locale)} {name}
            </p>
            <p className="mx-auto mt-2 max-w-md text-[13px] text-taupe">
              {t("section.registerHint", locale)}
            </p>
          </section>
        )}

        {faqs.length > 0 && (
          <section className="mt-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-taupe">
              {t("section.faqLabel", locale)}
            </p>
            <h2 className="mt-1 text-[22px] font-extrabold uppercase tracking-tight text-ink sm:text-[28px]">
              {name} — {t("section.faqHeading", locale)}
            </h2>
            <div className="mt-5 border-t border-data">
              {faqs.map((f, i) => (
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
                  <p
                    className={`pb-5 text-[14px] leading-relaxed text-slate ${
                      isAr ? "pl-8" : "pr-8"
                    }`}
                  >
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>

      <section className="mt-14 border-t border-data bg-ink">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-[22px] font-extrabold uppercase tracking-tight text-paper sm:text-[28px]">
              {t("cta.interestedIn", locale)} {name}؟
            </h2>
            <p className="mt-1 text-[13px] text-data">
              {hasInventory
                ? t("cta.browseAll", locale)
                : t("cta.callbackPosted", locale)}
            </p>
          </div>
          <Link
            href={
              hasInventory
                ? `${localizedPath("/properties", locale)}?developer=${dev.nawy_id}`
                : localizedPath("/developers", locale)
            }
            className="shrink-0 border border-paper bg-paper px-6 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-ink transition hover:bg-ink hover:text-paper"
          >
            {hasInventory
              ? t("cta.viewAll", locale)
              : t("cta.explore", locale)}
          </Link>
        </div>
      </section>
    </div>
  );
}

// Locale-aware metadata used by both EN and AR routes.
export function developerMetadata(slug: string, locale: Locale) {
  const dev = getDeveloperBySlug(slug);
  if (!dev) {
    return {
      title: locale === "ar" ? "مطور — DealFinder" : "Developer — DealFinder",
    };
  }
  const name = pick(dev.name, dev.name_ar, locale);
  const title =
    pick(dev.meta_title, dev.meta_title_ar, locale) ?? `${name} — DealFinder`;
  const description =
    pick(dev.meta_description, dev.meta_description_ar, locale) ?? undefined;
  const path = localizedPath(`/developers/${dev.slug}`, locale);
  const altPath = localizedPath(`/developers/${dev.slug}`, locale === "ar" ? "en" : "ar");
  return {
    title,
    description,
    keywords: [
      name,
      `${name} ${locale === "ar" ? "مشاريع" : "projects"}`,
      `${name} ${locale === "ar" ? "عقارات" : "properties"}`,
      `${name} ${locale === "ar" ? "أسعار" : "prices"}`,
      ...((locale === "ar" ? dev.areas_ar : dev.areas) || []).map(
        (a: string) => `${name} ${a}`
      ),
    ],
    alternates: {
      canonical: path,
      languages: {
        en: localizedPath(`/developers/${dev.slug}`, "en"),
        ar: localizedPath(`/developers/${dev.slug}`, "ar"),
        "x-default": localizedPath(`/developers/${dev.slug}`, "en"),
      },
    },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      siteName: "DealFinder",
      locale: locale === "ar" ? "ar_EG" : "en_US",
      alternateLocale: locale === "ar" ? "en_US" : "ar_EG",
      images: dev.logo_url ? [{ url: dev.logo_url }] : undefined,
    },
    twitter: { card: "summary" as const, title, description },
    other: { "x-alt-path": altPath },
  };
}
