import Link from "next/link";
import {
  getDeveloperBySlug,
  getCompoundsByDeveloper,
  getUnitsByDeveloper,
  getDeveloperTypeGroups,
  getAreaName,
  type Developer,
  type UnitTypeGroup,
  type EnrichedUnit,
} from "@/lib/data";
import { formatNumber, formatPrice } from "@/lib/format";
import { readyYear } from "@/lib/conversion";
import { PropertyCard } from "@/components/property-card";
import { CompoundCard } from "@/components/compound-card";
import { GoLink } from "@/components/go-link";
import { DeveloperLeadForm } from "@/components/developer-lead-form";
import { goHref } from "@/lib/leads";
import { type Locale, t, localizedPath } from "@/lib/i18n";

const NBSP = " ";

const pick = <T,>(en: T, ar: T | null | undefined, locale: Locale): T =>
  locale === "ar" ? ar ?? en : en;

const fmtPriceLocale = (
  n: number | null | undefined,
  locale: Locale
): string => {
  if (n == null || n <= 0)
    return locale === "ar" ? "السعر عند الطلب" : "Price on request";
  if (locale === "ar") {
    if (n >= 1_000_000) {
      const m = n / 1_000_000;
      return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)} مليون`;
    }
    if (n >= 1000) return `${Math.round(n / 1000)} ألف`;
    return `${n}`;
  }
  return formatPrice(n).replace(/^EGP /, "");
};

const typeSlug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Monochrome line glyph per property type — used on the fallback tile.
function TypeIcon({ type }: { type: string }) {
  const k = type.toLowerCase();
  const common = {
    width: 40,
    height: 40,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    "aria-hidden": true as const,
  };
  if (k.includes("villa") || k.includes("twin") || k.includes("family"))
    return (
      <svg {...common}>
        <path d="M3 11l9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M10 20v-6h4v6" />
      </svg>
    );
  if (k.includes("chalet") || k.includes("cabin"))
    return (
      <svg {...common}>
        <path d="M3 20l9-15 9 15" />
        <path d="M7 20l5-8 5 8" />
      </svg>
    );
  if (k.includes("town"))
    return (
      <svg {...common}>
        <path d="M4 20V9l5-4 5 4v11" />
        <path d="M14 20V11l3-2 3 2v9" />
      </svg>
    );
  if (k.includes("retail") || k.includes("office") || k.includes("admin") || k.includes("clinic") || k.includes("pharmacy"))
    return (
      <svg {...common}>
        <rect x="4" y="4" width="16" height="16" />
        <path d="M4 9h16M9 9v11M14 9v11" />
      </svg>
    );
  if (k.includes("penthouse") || k.includes("loft") || k.includes("duplex"))
    return (
      <svg {...common}>
        <path d="M4 20V8h11v12" />
        <path d="M15 20v-6h5v6" />
        <path d="M7 20v-4h4v4" />
      </svg>
    );
  // apartment / studio / default
  return (
    <svg {...common}>
      <rect x="5" y="3" width="14" height="18" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
    </svg>
  );
}

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
  const groups = getDeveloperTypeGroups(dev.nawy_id);
  const hasInventory = units.length > 0;

  const prices = units
    .map((u) => u.price)
    .filter((p): p is number => typeof p === "number" && p > 0);
  const minPrice = prices.length ? Math.min(...prices) : dev.min_price;
  const monthlies = groups
    .map((g) => g.minMonthly)
    .filter((m): m is number => m != null && m > 0);
  const minMonthly = monthlies.length ? Math.min(...monthlies) : null;

  // Representative unit: cheapest with an image → for hero + CTA context.
  const heroUnit =
    [...units]
      .filter((u) => u.image_url && (u.price ?? 0) > 0)
      .sort((a, b) => (a.price ?? 0) - (b.price ?? 0))[0] ??
    units.find((u) => u.image_url) ??
    units[0] ??
    null;
  const heroImage =
    heroUnit?.image_url ?? compounds.find((c) => c.image_url)?.image_url ?? null;
  const downPct =
    heroUnit?.price && heroUnit?.down_payment
      ? Math.round((heroUnit.down_payment / heroUnit.price) * 100)
      : null;
  const heroYear = readyYear(heroUnit?.ready_by);

  // areas
  const compoundAreas = [
    ...new Set(
      compounds
        .map((c) => (c.area_nawy_id ? getAreaName(c.area_nawy_id) : null))
        .filter((n): n is string => Boolean(n))
    ),
  ];
  const areaArByEn = new Map<string, string>();
  for (let i = 0; i < dev.areas.length; i++) {
    if (dev.areas[i] && dev.areas_ar[i])
      areaArByEn.set(dev.areas[i], dev.areas_ar[i]);
  }
  const areaNamesEn = compoundAreas.length > 0 ? compoundAreas : dev.areas;
  const areaNames = isAr
    ? areaNamesEn.map((a) => areaArByEn.get(a) ?? a)
    : areaNamesEn;

  const pageUrl = localizedPath(`/developers/${dev.slug}`, locale);
  const propsLink = `${localizedPath("/properties", locale)}?developer=${dev.nawy_id}`;

  // Contact links (rotation — no pinnedPath).
  const waText = isAr
    ? `مرحباً — عايز أسعار وأنظمة تقسيط ${name}.`
    : `Hi — I want prices & payment plans for ${name}.`;
  const waHref = goHref({
    channel: "wa",
    locale,
    unitSlug: heroUnit?.slug ?? null,
    text: waText,
  });
  const telHref = goHref({
    channel: "tel",
    locale,
    unitSlug: heroUnit?.slug ?? null,
  });

  // ── SEO structured data (kept) ────────────────────────────────────────
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
      { "@type": "ListItem", position: 1, name: isAr ? "الرئيسية" : "Home", item: localizedPath("/", locale) },
      { "@type": "ListItem", position: 2, name: t("nav.developers", locale), item: localizedPath("/developers", locale) },
      { "@type": "ListItem", position: 3, name, item: pageUrl },
    ],
  };

  return (
    <div className="bg-paper pb-24" dir={isAr ? "rtl" : "ltr"}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <nav className="text-[10px] font-semibold uppercase tracking-[0.08em] text-taupe">
          <Link href={localizedPath("/developers", locale)} className="hover:text-ink">
            {t("nav.developers", locale)}
          </Link>
          <span>{NBSP}/{NBSP}{name}</span>
        </nav>

        {/* ── 1. PRICE-SCENT HERO ──────────────────────────────────────── */}
        <section className="mt-4 overflow-hidden border border-ink">
          <div className="grid md:grid-cols-[1.3fr_1fr]">
            <div className="relative aspect-[16/10] bg-ink md:aspect-auto md:min-h-[320px]">
              {heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroImage}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center">
                  <span className="text-[40px] font-black uppercase tracking-tight text-paper">
                    {name}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center gap-4 p-5 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden border border-data bg-paper">
                  {dev.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={dev.logo_url} alt="" className="h-full w-full object-contain p-1.5" />
                  ) : (
                    <span className="text-[20px] font-extrabold text-ink">{name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-taupe">
                    {t("dev.label", locale)}
                  </p>
                  <h1 className="text-[22px] font-extrabold uppercase leading-none tracking-tight text-ink sm:text-[28px]">
                    {name}
                  </h1>
                </div>
              </div>

              {hasInventory && (
                <div>
                  {minMonthly ? (
                    <p className="text-[28px] font-black leading-none tracking-tight text-ink sm:text-[34px]">
                      {t("dev.from", locale)} {fmtPriceLocale(minMonthly, locale)}
                      <span className="text-[16px] font-bold text-slate">
                        {" "}EGP{t("dev.perMonth", locale)}
                      </span>
                    </p>
                  ) : (
                    <p className="text-[26px] font-black leading-none tracking-tight text-ink sm:text-[32px]">
                      {t("dev.from", locale)} EGP {fmtPriceLocale(minPrice, locale)}
                    </p>
                  )}
                  <p className="mt-1.5 text-[12px] font-semibold uppercase tracking-[0.04em] text-slate">
                    {downPct != null && `${downPct}% ${t("dev.down", locale)} · `}
                    {t("dev.from", locale)} EGP {fmtPriceLocale(minPrice, locale)}
                    {heroYear && ` · ${t("dev.delivery", locale)} ${heroYear}`}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row">
                <GoLink
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex flex-[1.5] items-center justify-center gap-2 bg-ink px-5 py-3.5 text-[13px] font-bold uppercase tracking-[0.06em] text-paper transition hover:opacity-90"
                >
                  <WhatsAppGlyph /> {t("dev.waCta", locale)}
                </GoLink>
                <GoLink
                  href={telHref}
                  className="flex flex-1 items-center justify-center gap-2 border border-ink bg-paper px-5 py-3.5 text-[13px] font-bold uppercase tracking-[0.06em] text-ink transition hover:bg-ink hover:text-paper"
                >
                  <PhoneGlyph /> {t("dev.callCta", locale)}
                </GoLink>
              </div>
              <p className="text-[10px] uppercase tracking-[0.06em] text-taupe">
                {t("dev.replyFast", locale)}
              </p>
            </div>
          </div>
        </section>

        {/* ── 2. TRUST STAT BAND ───────────────────────────────────────── */}
        <div className="mt-5 grid grid-cols-2 border-l border-t border-data sm:grid-cols-4">
          {[
            dev.established_year
              ? [t("dev.buildingSince", locale), String(dev.established_year)]
              : null,
            [t("dev.projects", locale), formatNumber(compounds.length)],
            [t("dev.homesAvailable", locale), formatNumber(units.length)],
            [t("dev.areas", locale), formatNumber(areaNames.length)],
          ]
            .filter((x): x is [string, string] => Boolean(x))
            .map(([label, value]) => (
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

        {about && (
          <p className="mt-5 max-w-2xl text-[14px] leading-relaxed text-slate">
            {about}
          </p>
        )}

        {/* ── 3. BROWSE BY TYPE — image-forward type cards ─────────────── */}
        {groups.length > 0 && (
          <section className="mt-10">
            <h2 className="text-[20px] font-black uppercase tracking-tight text-ink sm:text-[26px]">
              {t("dev.browseByType", locale)}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {groups.map((g) => (
                <TypeCard key={g.type} group={g} locale={locale} devName={name} />
              ))}
            </div>
          </section>
        )}

        {/* ── 4. PER-TYPE SECTIONS (anchor targets) ────────────────────── */}
        {groups.map((g) => (
          <TypeSection
            key={g.type}
            group={g}
            locale={locale}
            propsLink={propsLink}
          />
        ))}

        {/* ── 5. PROJECTS (compounds) ──────────────────────────────────── */}
        {compounds.length > 0 && (
          <section className="mt-12">
            <h2 className="text-[20px] font-bold uppercase tracking-tight text-ink">
              {t("section.projectsBy", locale)} {name}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {compounds.slice(0, 8).map((c) => (
                <CompoundCard
                  key={c.nawy_id}
                  compound={c}
                  subtitle={getAreaName(c.area_nawy_id)}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── 6. AREAS ─────────────────────────────────────────────────── */}
        {areaNames.length > 0 && (
          <section className="mt-12">
            <h2 className="text-[20px] font-bold uppercase tracking-tight text-ink">
              {isAr ? `أين تطوّر ${name} مشاريعها` : `Where ${name} Builds`}
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

        {/* ── 7. CALLBACK FORM (working fallback) ──────────────────────── */}
        <section className="mt-12 grid gap-6 border border-ink p-5 sm:p-7 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-taupe">
              {hasInventory ? t("lead.exclusive", locale) : t("lead.newLaunches", locale)}
            </p>
            <h2 className="mt-1 text-[22px] font-extrabold uppercase leading-tight tracking-tight text-ink">
              {t("dev.formTitle", locale)}
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-slate">
              {t("dev.formSub", locale)}
            </p>
            <GoLink
              href={waHref}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.06em] text-ink underline decoration-1 underline-offset-4 hover:no-underline"
            >
              <WhatsAppGlyph /> {t("dev.orChat", locale)}
            </GoLink>
          </div>
          <DeveloperLeadForm
            developerName={name}
            unitSlug={heroUnit?.slug ?? null}
            pagePath={pageUrl}
            locale={locale}
          />
        </section>

        {/* ── 8. FAQ ───────────────────────────────────────────────────── */}
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
                <details key={i} className="group border-b border-data" {...(i === 0 ? { open: true } : {})}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[14px] font-bold uppercase tracking-[0.02em] text-ink">
                    {f.q}
                    <span className="shrink-0 text-[18px] font-black text-taupe transition group-open:rotate-45">+</span>
                  </summary>
                  <p className={`pb-5 text-[14px] leading-relaxed text-slate ${isAr ? "pl-8" : "pr-8"}`}>
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        <p className="mt-8 text-[10px] uppercase tracking-[0.06em] text-taupe">
          {t("dev.pricesUpdated", locale)}
        </p>
      </div>

      {/* ── 9. CLOSING CTA BAND ────────────────────────────────────────── */}
      <section className="mt-4 border-t border-data bg-ink">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-[22px] font-extrabold uppercase tracking-tight text-paper sm:text-[28px]">
              {t("cta.interestedIn", locale)} {name}؟
            </h2>
            <p className="mt-1 text-[13px] text-data">
              {hasInventory ? t("cta.browseAll", locale) : t("cta.callbackPosted", locale)}
            </p>
          </div>
          <GoLink
            href={waHref}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="shrink-0 border border-paper bg-paper px-6 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-ink transition hover:bg-ink hover:text-paper"
          >
            {t("dev.waCta", locale)}
          </GoLink>
        </div>
      </section>

      {/* ── 0. STICKY CONTACT BAR (every scroll depth) ───────────────────── */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ink bg-paper/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        dir={isAr ? "rtl" : "ltr"}
      >
        <div className="mx-auto flex max-w-3xl items-stretch gap-px bg-ink">
          <GoLink
            href={telHref}
            className="flex flex-1 items-center justify-center gap-2 bg-paper py-3.5 text-[12px] font-bold uppercase tracking-[0.06em] text-ink transition hover:bg-ink hover:text-paper"
          >
            <PhoneGlyph /> {t("dev.callCta", locale)}
          </GoLink>
          <GoLink
            href={waHref}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex flex-[1.6] items-center justify-center gap-2 bg-ink py-3.5 text-[12px] font-bold uppercase tracking-[0.06em] text-paper transition hover:opacity-90"
          >
            <WhatsAppGlyph /> {t("dev.waCta", locale)}
          </GoLink>
        </div>
      </div>
    </div>
  );
}

// ── Type card (browse-by-type grid item) ──────────────────────────────────
function TypeCard({
  group,
  locale,
  devName,
}: {
  group: UnitTypeGroup;
  locale: Locale;
  devName: string;
}) {
  const isAr = locale === "ar";
  const label = isAr ? group.typeAr ?? group.type : group.type;
  const beds = group.samples
    .map((u) => u.bedrooms)
    .filter((b): b is number => b != null && b > 0);
  const minBed = beds.length ? Math.min(...beds) : null;
  const maxBed = beds.length ? Math.max(...beds) : null;

  return (
    <a
      href={`#type-${typeSlug(group.type)}`}
      className="group flex flex-col border border-ink bg-paper transition hover:opacity-95"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink">
        {group.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={group.image}
            alt={`${label} — ${devName}`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-paper">
            <TypeIcon type={group.type} />
          </div>
        )}
        <span className="absolute top-0 left-0 bg-ink px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-paper">
          {formatNumber(group.count)} {t("dev.units", locale)}
        </span>
      </div>
      <div className="p-2.5">
        <p className="text-[12px] font-black uppercase tracking-[0.02em] text-ink">
          {label}
        </p>
        {group.minMonthly ? (
          <p className="mt-1 text-[15px] font-extrabold leading-none tracking-tight text-ink">
            {t("dev.from", locale)} {fmtPriceLocale(group.minMonthly, locale)}
            <span className="text-[10px] font-bold text-slate"> EGP{t("dev.perMonth", locale)}</span>
          </p>
        ) : group.minPrice ? (
          <p className="mt-1 text-[14px] font-extrabold leading-none tracking-tight text-ink">
            {t("dev.from", locale)} EGP {fmtPriceLocale(group.minPrice, locale)}
          </p>
        ) : null}
        {(minBed != null || group.minPrice) && (
          <p className="mt-1 truncate text-[9px] font-semibold uppercase tracking-[0.05em] text-taupe">
            {minBed != null &&
              `${minBed}${maxBed && maxBed !== minBed ? `–${maxBed}` : ""} ${t("dev.beds", locale)}`}
            {minBed != null && group.minMonthly ? " · " : ""}
            {group.minMonthly && group.minPrice
              ? `${t("dev.from", locale)} EGP ${fmtPriceLocale(group.minPrice, locale)}`
              : ""}
          </p>
        )}
      </div>
    </a>
  );
}

// ── Per-type section (carousel of that type's units) ──────────────────────
function TypeSection({
  group,
  locale,
  propsLink,
}: {
  group: UnitTypeGroup;
  locale: Locale;
  propsLink: string;
}) {
  const isAr = locale === "ar";
  const label = isAr ? group.typeAr ?? group.type : group.type;
  const seeAll = `${propsLink}&type=${encodeURIComponent(group.type)}`;
  return (
    <section id={`type-${typeSlug(group.type)}`} className="mt-12 scroll-mt-20">
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-[18px] font-black uppercase tracking-tight text-ink sm:text-[22px]">
            {label}
          </h3>
          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-slate">
            {formatNumber(group.count)} {t("dev.units", locale)}
            {group.minMonthly
              ? ` · ${t("dev.from", locale)} ${fmtPriceLocale(group.minMonthly, locale)} EGP${t("dev.perMonth", locale)}`
              : group.minPrice
                ? ` · ${t("dev.from", locale)} EGP ${fmtPriceLocale(group.minPrice, locale)}`
                : ""}
          </p>
        </div>
        <Link
          href={seeAll}
          className="shrink-0 text-[11px] font-bold uppercase tracking-[0.08em] text-slate hover:text-ink"
        >
          {t("dev.seeAllType", locale)} {formatNumber(group.count)}
        </Link>
      </div>
      <div className="no-scrollbar mt-4 flex snap-x gap-3 overflow-x-auto pb-1">
        {group.samples.map((u: EnrichedUnit) => (
          <div key={u.nawy_id} className="w-[260px] shrink-0 snap-start">
            <PropertyCard unit={u} locale={locale} />
          </div>
        ))}
        <Link
          href={seeAll}
          className="grid w-[160px] shrink-0 snap-start place-items-center border border-ink bg-ink text-center text-[12px] font-bold uppercase tracking-[0.06em] text-paper transition hover:bg-paper hover:text-ink"
        >
          {t("dev.seeAllType", locale)}
          <br />
          {formatNumber(group.count)} {label} →
        </Link>
      </div>
    </section>
  );
}

function WhatsAppGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
    </svg>
  );
}

function PhoneGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1 1 0 0 0-1.02.24l-2.2 2.2a15.05 15.05 0 0 1-6.59-6.59l2.2-2.2a1 1 0 0 0 .25-1.02A11.36 11.36 0 0 1 8.5 4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1c0 9.39 7.61 17 17 17a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1z" />
    </svg>
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
