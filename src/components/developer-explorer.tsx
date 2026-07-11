"use client";

// Interactive drill-down for a developer's inventory: Type → Bedrooms → Areas.
// Each level is image/price-forward and ends in a WhatsApp "developer agent"
// CTA (routed through /api/go → rotation → broker). A "Too many options?"
// banner opens the AI chat. All contact links fire the site-wide conversion
// tracker (it matches /api/go on any anchor).

import { useState } from "react";
import Link from "next/link";
import type { EnrichedUnit, TypeNode, BedBucket } from "@/lib/data";
import { type Locale, t, localizedPath } from "@/lib/i18n";
import { formatNumber } from "@/lib/format";
import { goHref } from "@/lib/leads";
import { ChatSheet } from "@/components/preview/chat-sheet";

function fromMonthly(n: number | null, locale: Locale): string | null {
  if (!n || n <= 0) return null;
  const v = n >= 1000 ? `${Math.round(n / 1000)}K` : `${n}`;
  return `${t("dev.from", locale)} EGP ${v}${t("dev.perMonth", locale)}`;
}
function fromTotal(n: number | null, locale: Locale): string | null {
  if (!n || n <= 0) return null;
  const v = n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
    : `${Math.round(n / 1000)}K`;
  return `${t("dev.from", locale)} EGP ${v}`;
}

export function DeveloperExplorer({
  tree,
  locale,
  developerName,
  developerId,
  heroUnit,
}: {
  tree: TypeNode[];
  locale: Locale;
  developerName: string;
  developerId: number;
  heroUnit: EnrichedUnit | null;
}) {
  const isAr = locale === "ar";
  const [typeIdx, setTypeIdx] = useState<number | null>(null);
  const [bedIdx, setBedIdx] = useState<number | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const node = typeIdx != null ? tree[typeIdx] : null;
  const bed = node && bedIdx != null ? node.beds[bedIdx] : null;

  const propsBase = `${localizedPath("/properties", locale)}?developer=${developerId}`;

  const bedLabel = (b: BedBucket) =>
    b.beds < 0
      ? t("dev.studio", locale)
      : `${b.beds}${b.beds >= 5 ? "+" : ""} ${t("dev.bed", locale)}`;

  // WhatsApp prefill for the current drill selection.
  function waFor(opts: {
    type?: string;
    beds?: number;
    area?: string;
    slug: string | null;
  }): string {
    const parts = [developerName];
    if (opts.type) parts.push(opts.type);
    if (opts.beds != null && opts.beds > 0) parts.push(`${opts.beds} ${t("dev.bed", locale)}`);
    if (opts.area) parts.push(opts.area);
    const sel = parts.join(" · ");
    const text = isAr
      ? `مرحباً — عايز أسعار ${sel}.`
      : `Hi — I want prices for ${sel}.`;
    return goHref({ channel: "wa", locale, unitSlug: opts.slug, text });
  }

  return (
    <section className="mt-10">
      {/* AI hook banner */}
      <div className="flex flex-col items-start justify-between gap-3 border border-ink bg-ink p-4 text-paper sm:flex-row sm:items-center sm:p-5">
        <div>
          <p className="text-[16px] font-black uppercase tracking-tight sm:text-[20px]">
            {t("dev.tooMany", locale)}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-data">
            {t("dev.tooManySub", locale)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 border border-paper bg-paper px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.06em] text-ink transition hover:bg-ink hover:text-paper"
        >
          <LiveDot dark /> {t("dev.chatAi", locale)}
        </button>
      </div>

      {/* Drill breadcrumb */}
      <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.06em]">
        <button
          type="button"
          onClick={() => {
            setTypeIdx(null);
            setBedIdx(null);
          }}
          className={typeIdx == null ? "text-ink" : "text-slate hover:text-ink"}
        >
          {t("dev.chooseType", locale)}
        </button>
        {node && (
          <>
            <span className="text-data">›</span>
            <button
              type="button"
              onClick={() => setBedIdx(null)}
              className={bedIdx == null ? "text-ink" : "text-slate hover:text-ink"}
            >
              {isAr ? node.typeAr ?? node.type : node.type}
            </button>
          </>
        )}
        {bed && (
          <>
            <span className="text-data">›</span>
            <span className="text-ink">{bedLabel(bed)}</span>
          </>
        )}
      </div>

      {/* LEVEL 1 — Types */}
      {typeIdx == null && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {tree.map((n, i) => (
            <button
              key={n.type}
              type="button"
              onClick={() => {
                setTypeIdx(i);
                setBedIdx(null);
              }}
              className="group flex flex-col border border-ink bg-paper text-left transition hover:opacity-95"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-ink">
                {n.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={n.image}
                    alt={n.type}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-[11px] uppercase tracking-[0.1em] text-paper">
                    {isAr ? n.typeAr ?? n.type : n.type}
                  </div>
                )}
                <span className="absolute top-0 left-0 bg-ink px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-paper">
                  {formatNumber(n.count)} {t("dev.units", locale)}
                </span>
              </div>
              <div className="p-2.5">
                <p className="text-[12px] font-black uppercase tracking-[0.02em] text-ink">
                  {isAr ? n.typeAr ?? n.type : n.type}
                </p>
                <p className="mt-1 text-[13px] font-extrabold leading-none tracking-tight text-ink">
                  {fromMonthly(n.minMonthly, locale) ?? fromTotal(n.minPrice, locale) ?? ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* LEVEL 2 — Bedrooms for chosen type */}
      {node && bedIdx == null && (
        <div className="mt-4">
          <BackBar
            locale={locale}
            onBack={() => setTypeIdx(null)}
            label={t("dev.chooseBeds", locale)}
          />
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {node.beds.map((b, i) => (
              <button
                key={b.beds}
                type="button"
                onClick={() => setBedIdx(i)}
                className="flex items-center justify-between border border-ink bg-paper p-3 text-left transition hover:bg-ink hover:text-paper"
              >
                <div>
                  <p className="text-[14px] font-black uppercase tracking-tight">
                    {bedLabel(b)}
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate">
                    {fromMonthly(b.minMonthly, locale) ?? fromTotal(b.minPrice, locale) ?? ""}
                  </p>
                </div>
                <span className="text-[13px] font-black text-taupe">
                  {formatNumber(b.count)}
                </span>
              </button>
            ))}
          </div>
          <SelectionCta
            locale={locale}
            wa={waFor({ type: node.type, slug: node.sampleSlug })}
            tel={goHref({ channel: "tel", locale, unitSlug: node.sampleSlug })}
          />
        </div>
      )}

      {/* LEVEL 3 — Areas for chosen type + beds */}
      {node && bed && (
        <div className="mt-4">
          <BackBar
            locale={locale}
            onBack={() => setBedIdx(null)}
            label={t("dev.chooseArea", locale)}
          />
          <div className="mt-3 divide-y divide-data border border-ink">
            {bed.areas.map((a) => {
              const href =
                `${propsBase}&type=${encodeURIComponent(node.type)}` +
                (bed.beds > 0 ? `&beds=${bed.beds}` : "") +
                (a.areaId ? `&area=${a.areaId}` : "");
              return (
                <div
                  key={a.areaId ?? a.area}
                  className="flex items-center justify-between gap-3 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold uppercase tracking-[0.02em] text-ink">
                      {isAr ? a.areaAr : a.area}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate">
                      {formatNumber(a.count)} {t("dev.units", locale)}
                      {a.minPrice ? ` · ${fromTotal(a.minPrice, locale)}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={waFor({
                        type: node.type,
                        beds: bed.beds,
                        area: isAr ? a.areaAr : a.area,
                        slug: a.sampleSlug,
                      })}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-1.5 bg-ink px-3 py-2 text-[10px] font-bold uppercase tracking-[0.06em] text-paper transition hover:opacity-90"
                    >
                      <WhatsAppGlyph /> {t("dev.askAboutSel", locale)}
                    </a>
                    <Link
                      href={href}
                      className="border border-ink px-3 py-2 text-[10px] font-bold uppercase tracking-[0.06em] text-ink transition hover:bg-ink hover:text-paper"
                    >
                      {t("dev.viewUnits", locale)}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {chatOpen && heroUnit && (
        <ChatSheet
          unit={heroUnit}
          locale={locale}
          seedMessage={
            isAr
              ? `أبحث عن وحدة من ${developerName}. ساعدني أختار الأنسب لميزانيتي.`
              : `I'm looking for a home from ${developerName}. Help me pick the right one for my budget.`
          }
          onClose={() => setChatOpen(false)}
        />
      )}
    </section>
  );
}

function BackBar({
  locale,
  onBack,
  label,
}: {
  locale: Locale;
  onBack: () => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        className="border border-data px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.06em] text-slate transition hover:border-ink hover:text-ink"
      >
        ← {t("dev.back", locale)}
      </button>
      <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-ink">
        {label}
      </p>
    </div>
  );
}

function SelectionCta({
  locale,
  wa,
  tel,
}: {
  locale: Locale;
  wa: string;
  tel: string;
}) {
  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="flex flex-[1.5] items-center justify-center gap-2 bg-ink px-4 py-3 text-[12px] font-bold uppercase tracking-[0.06em] text-paper transition hover:opacity-90"
      >
        <LiveDot /> <WhatsAppGlyph /> {t("dev.waAgent", locale)}
      </a>
      <a
        href={tel}
        className="flex flex-1 items-center justify-center gap-2 border border-ink bg-paper px-4 py-3 text-[12px] font-bold uppercase tracking-[0.06em] text-ink transition hover:bg-ink hover:text-paper"
      >
        <PhoneGlyph /> {t("dev.callAgent", locale)}
      </a>
    </div>
  );
}

// Small pulsing "live now" dot. Green is the one accent allowed (matches the
// chat online indicator).
function LiveDot({ dark = false }: { dark?: boolean }) {
  return (
    <span className="relative flex h-2 w-2 shrink-0" aria-label="live">
      <span className="absolute inline-flex h-full w-full animate-ping bg-green-400 opacity-75" />
      <span className={`relative inline-flex h-2 w-2 bg-green-400 ${dark ? "" : ""}`} />
    </span>
  );
}

function WhatsAppGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
    </svg>
  );
}
function PhoneGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1 1 0 0 0-1.02.24l-2.2 2.2a15.05 15.05 0 0 1-6.59-6.59l2.2-2.2a1 1 0 0 0 .25-1.02A11.36 11.36 0 0 1 8.5 4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1c0 9.39 7.61 17 17 17a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1z" />
    </svg>
  );
}
