// New Capital lead-gen landing page body (EN / AR). Mobile-first, single goal:
// get the visitor to WhatsApp or call the campaign advisor. Server component;
// data is passed in by the route. No map — just the best listings + strong CTAs.

import type { EnrichedUnit } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { formatNumber } from "@/lib/format";
import {
  CAMPAIGN_COPY,
  campaignTelHref,
  campaignWhatsAppGeneric,
  type CampaignCopy,
  type CampaignAreaLabel,
} from "@/lib/campaign";
import { CampaignCard } from "./campaign-card";
import { StickyContact } from "./sticky-contact";
import { PhoneIcon, WhatsAppIcon } from "./icons";

export function NewCapitalLanding({
  locale = "en",
  deals,
  unitCount,
  compoundCount,
  developerCount,
  copy = CAMPAIGN_COPY,
  waArea,
}: {
  locale?: Locale;
  deals: EnrichedUnit[];
  unitCount: number;
  compoundCount: number;
  developerCount: number;
  /** Landing copy — defaults to the New Capital campaign. */
  copy?: CampaignCopy;
  /** Area wording for the prefilled WhatsApp messages (defaults to New Capital). */
  waArea?: CampaignAreaLabel;
}) {
  const isAr = locale === "ar";
  const c = copy[locale];
  const waHref = campaignWhatsAppGeneric(locale, waArea);
  const stats = c.statsTpl
    .replace("{units}", formatNumber(unitCount))
    .replace("{compounds}", formatNumber(compoundCount))
    .replace("{developers}", formatNumber(developerCount));

  return (
    <div className="bg-paper pb-40 md:pb-28" dir={isAr ? "rtl" : "ltr"}>
      {/* ── Brand bar (standalone — MAP) ──────────────────────────────── */}
      {/* Swap the MAP wordmark below for <img src="/map-logo.png" .../> once
          the client logo is added to /public. */}
      <header className="flex items-center justify-between border-b border-ink px-4 py-3 sm:px-6">
        <span className="text-[20px] font-black uppercase tracking-tight text-ink">
          MAP
        </span>
        <a
          href={campaignTelHref}
          className="flex items-center gap-1.5 border border-ink px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-ink transition hover:bg-ink hover:text-paper"
        >
          <PhoneIcon size={13} /> {c.callCta}
        </a>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="border-b border-data px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-taupe">
            {c.eyebrow}
          </p>
          <h1 className="mt-4 text-[40px] font-black uppercase leading-[0.95] tracking-tight text-ink sm:text-[68px]">
            {c.h1a} <span className="glitch">{c.h1b}</span>
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-slate sm:text-[18px]">
            {c.sub}
          </p>

          <div className="mt-7 flex flex-col gap-2 sm:flex-row">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-ink px-7 py-4 text-[13px] font-bold uppercase tracking-[0.07em] text-paper transition hover:opacity-90"
            >
              <WhatsAppIcon size={17} /> {c.waCta}
            </a>
            <a
              href={campaignTelHref}
              className="flex items-center justify-center gap-2 border border-ink bg-paper px-7 py-4 text-[13px] font-bold uppercase tracking-[0.07em] text-ink transition hover:bg-ink hover:text-paper"
            >
              <PhoneIcon size={17} /> {c.callCta}
            </a>
          </div>

          <div className="mt-9 grid grid-cols-2 border-l border-t border-data sm:grid-cols-4">
            {c.hooks.map((h) => (
              <div key={h.v} className="border-b border-r border-data p-4">
                <p className="text-[20px] font-black tracking-tight text-ink sm:text-[24px]">
                  {h.v}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-taupe">
                  {h.l}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate">
            {stats}
          </p>
        </div>
      </section>

      {/* ── Best deals ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-[24px] font-black uppercase tracking-tight text-ink sm:text-[32px]">
          {c.dealsTitle}
        </h2>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-slate">
          {c.dealsSub}
        </p>
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((u) => (
            <CampaignCard key={u.nawy_id} unit={u} locale={locale} waArea={waArea} />
          ))}
        </div>
      </section>

      {/* ── Why us ────────────────────────────────────────────────────── */}
      <section className="border-t border-data bg-ink px-4 py-12 text-paper sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-[24px] font-black uppercase tracking-tight sm:text-[32px]">
            {c.whyTitle}
          </h2>
          <div className="mt-7 grid gap-px border-l border-t border-paper/20 sm:grid-cols-2 lg:grid-cols-4">
            {c.why.map((w) => (
              <div key={w.t} className="border-b border-r border-paper/20 p-5">
                <p className="text-[14px] font-bold uppercase tracking-[0.04em]">
                  {w.t}
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-data">{w.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-[28px] font-black uppercase tracking-tight text-ink sm:text-[40px]">
          {c.finalTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-slate">
          {c.finalSub}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-ink px-8 py-4 text-[13px] font-bold uppercase tracking-[0.07em] text-paper transition hover:opacity-90"
          >
            <WhatsAppIcon size={17} /> {c.waCta}
          </a>
          <a
            href={campaignTelHref}
            className="flex items-center justify-center gap-2 border border-ink bg-paper px-8 py-4 text-[13px] font-bold uppercase tracking-[0.07em] text-ink transition hover:bg-ink hover:text-paper"
          >
            <PhoneIcon size={17} /> {c.callCta}
          </a>
        </div>
      </section>

      <StickyContact locale={locale} waHref={waHref} />
    </div>
  );
}
