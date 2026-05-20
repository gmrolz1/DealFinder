// /preview — a single page that shows every conversion + UX change
// proposed for DealFinder. Internal review only — not linked from nav,
// not in the sitemap, robots disallowed below.
//
// What's live on this page:
//   ✅ PropertyCardV2 — side-by-side vs current PropertyCard
//   ✅ CompoundCardV2 — side-by-side, with real multi-image carousel
//   ✅ Carousel — interactive demo
//   ✅ AI Chat agent (Gemini-powered) — click "Ask Layla about this unit"
//   🖼 Breadcrumbs / sticky filter / mobile action bar — visual examples
//
// Phase plan recap:
//   1 (this preview) — cards + conversion + AI chat agent, NO new data
//   2              — per-unit gallery scrape so unit cards carousel too
//   3              — site-wide UX (sticky filter, breadcrumbs, saved listings)

import type { Metadata } from "next";
import Link from "next/link";
import {
  getFeaturedUnits,
  getCompoundsByArea,
  getAreas,
} from "@/lib/data";
import { PropertyCard } from "@/components/property-card";
import { CompoundCard } from "@/components/compound-card";
import { PropertyCardV2 } from "@/components/preview/property-card-v2";
import { CompoundCardV2 } from "@/components/preview/compound-card-v2";
import { Carousel } from "@/components/preview/carousel";

export const metadata: Metadata = {
  title: "Preview — Conversion + UX changes | DealFinder",
  robots: { index: false, follow: false },
};

function Section({
  num,
  title,
  intent,
  children,
}: {
  num: string;
  title: string;
  intent: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-data py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-baseline gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-taupe">
            {num}
          </span>
          <h2 className="text-[24px] font-black uppercase tracking-tight text-ink sm:text-[32px]">
            {title}
          </h2>
        </div>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-slate sm:text-[14px]">
          {intent}
        </p>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-taupe">
      {children}
    </p>
  );
}

export default function PreviewPage() {
  // Real data, real units, real compounds — easier to evaluate.
  const featured = getFeaturedUnits(6);

  // Find a couple of popular compounds with enough units for a believable
  // multi-image carousel demo.
  const areas = getAreas();
  const popularCompounds = areas
    .flatMap((a) => getCompoundsByArea(a.nawy_id))
    .filter((c) => c.image_url)
    .sort((a, b) => b.available - a.available)
    .slice(0, 4);

  const unitA = featured[0];
  const unitB = featured[1];
  const compoundA = popularCompounds[0];
  const compoundB = popularCompounds[1];

  // Pull a handful of unit images for the standalone carousel demo.
  const demoImages = featured
    .map((u) => u.image_url)
    .filter((x): x is string => Boolean(x))
    .slice(0, 6);

  return (
    <div className="bg-paper">
      {/* Hero */}
      <header className="border-b border-data px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-taupe">
            Internal review · not linked from nav
          </p>
          <h1 className="mt-3 text-[36px] font-black uppercase leading-[0.95] tracking-tight text-ink sm:text-[60px]">
            Conversion
            <br />
            <span className="glitch">Preview</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[14px] leading-relaxed text-slate sm:text-[16px]">
            Side-by-side preview of the proposed card redesign, image carousels,
            lead-capture sheet, and site-wide UX changes. Everything below uses
            real listings from Supabase. Production cards are unchanged until you
            approve.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/"
              className="border border-data px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate transition hover:border-ink hover:text-ink"
            >
              ← Live site
            </Link>
            <a
              href="#cards"
              className="border border-ink bg-ink px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-paper transition hover:bg-paper hover:text-ink"
            >
              Jump to cards
            </a>
          </div>
        </div>
      </header>

      {/* SECTION 1 — PROPERTY CARDS */}
      <div id="cards" />
      <Section
        num="01"
        title="Property Card"
        intent="The most-used card on the site (listings, homepage, compound & developer pages). Goal: more lead capture without losing the brand."
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <Label>Current</Label>
            <div className="max-w-xs">
              {unitA && <PropertyCard unit={unitA} />}
            </div>
            <ul className="mt-4 space-y-1 text-[12px] text-slate">
              <li>· Whole card is a link — no visible CTA button</li>
              <li>· Single image, no carousel</li>
              <li>· No deal indicators (down %, ready year)</li>
              <li>· No monthly payment estimate</li>
              <li>· No quick contact (WhatsApp / callback)</li>
            </ul>
          </div>

          <div>
            <Label>Proposed</Label>
            <div className="max-w-xs">
              {unitA && <PropertyCardV2 unit={unitA} />}
            </div>
            <ul className="mt-4 space-y-1 text-[12px] text-slate">
              <li>✓ Carousel-ready (multi-image once Phase 2 scrape lands)</li>
              <li>✓ <strong className="text-ink">Monthly payment</strong> shown under price (data we have)</li>
              <li>✓ Deal badges: <span className="border border-ink bg-paper px-1 text-[9px] font-bold uppercase">X% DOWN</span> · <span className="border border-ink bg-paper px-1 text-[9px] font-bold uppercase">READY YYYY</span></li>
              <li>✓ <strong className="text-ink">Visible CTA</strong> opens the lead sheet (try it →)</li>
              <li>✓ WhatsApp quick-contact button</li>
            </ul>
          </div>
        </div>

        {/* Second pair to show variety in real data */}
        {unitB && (
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div>
              <Label>Current · second example</Label>
              <div className="max-w-xs">
                <PropertyCard unit={unitB} />
              </div>
            </div>
            <div>
              <Label>Proposed · second example</Label>
              <div className="max-w-xs">
                <PropertyCardV2 unit={unitB} />
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* SECTION 2 — COMPOUND CARDS */}
      <Section
        num="02"
        title="Compound Card · with real carousel"
        intent="Compounds aggregate all units' images, so the carousel is real today — no new data needed. Try the arrows / dots / swipe."
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <Label>Current</Label>
            <div className="max-w-sm">
              {compoundA && <CompoundCard compound={compoundA} />}
            </div>
          </div>
          <div>
            <Label>Proposed (carousel + price + badges)</Label>
            <div className="max-w-sm">
              {compoundA && <CompoundCardV2 compound={compoundA} />}
            </div>
          </div>
        </div>

        {compoundB && (
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div>
              <Label>Current · second example</Label>
              <div className="max-w-sm">
                <CompoundCard compound={compoundB} />
              </div>
            </div>
            <div>
              <Label>Proposed · second example</Label>
              <div className="max-w-sm">
                <CompoundCardV2 compound={compoundB} />
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* SECTION 3 — STANDALONE CAROUSEL */}
      <Section
        num="03"
        title="Carousel component"
        intent="Reusable building block. Touch-swipe on mobile · arrows on desktop hover · dot indicators · counter pill. Used by both v2 cards above and ready for detail-page galleries."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="group max-w-md">
            <Label>Multi-image (6 images)</Label>
            <Carousel
              images={demoImages}
              alt="Carousel demo"
              aspectRatio="16/9"
            />
          </div>
          <div className="max-w-md">
            <Label>Single image (no controls)</Label>
            <Carousel
              images={demoImages.slice(0, 1)}
              alt="Single image demo"
              aspectRatio="16/9"
            />
          </div>
        </div>
      </Section>

      {/* SECTION 4 — AI CHAT AGENT */}
      <Section
        num="04"
        title="AI sales agent · Layla"
        intent="Click the black CTA on any card → opens a live chat with Layla, an AI deal opener powered by Gemini. She knows this exact unit's price, payment plan, and specs (injected as context — never hallucinated). After 2-3 turns she hands off to a human broker on WhatsApp with the conversation transcript pre-filled."
      >
        {unitA && (
          <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-start">
            {/* Try-it card */}
            <div className="w-full max-w-xs">
              <PropertyCardV2 unit={unitA} />
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.08em] text-taupe">
                ↑ Click &quot;Ask Layla about this unit&quot;
              </p>
            </div>

            {/* How it works */}
            <div className="border border-data bg-paper p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-taupe">
                How the agent works
              </p>
              <h3 className="mt-1 text-[18px] font-bold uppercase tracking-tight text-ink">
                Deal opener, not a chatbot
              </h3>
              <ol className="mt-4 space-y-3 text-[12px] leading-relaxed text-slate">
                <li>
                  <strong className="text-ink">1. Warm open.</strong> &quot;Nice
                  — Mountain View iCity is a solid pick. What do you want to
                  know first?&quot; — references the actual compound by name.
                </li>
                <li>
                  <strong className="text-ink">2. Grounded answers.</strong>{" "}
                  Price, monthly payment, down %, ready date, beds, area —
                  injected from the data layer as context. She literally cannot
                  invent numbers.
                </li>
                <li>
                  <strong className="text-ink">3. Quick reply chips.</strong>{" "}
                  Suggested follow-ups (&quot;Payment plan?&quot;, &quot;Why is
                  this a deal?&quot;) — one-tap engagement.
                </li>
                <li>
                  <strong className="text-ink">4. Soft pivot to WhatsApp.</strong>{" "}
                  After 2-3 turns or buying intent (&quot;I&apos;m
                  interested&quot;), she offers: &quot;Let me get Ahmed to send
                  the full price list on WhatsApp.&quot;
                </li>
                <li>
                  <strong className="text-ink">5. Pre-filled handoff.</strong>{" "}
                  The green button below sends a WhatsApp message to your broker
                  with: unit name, price, extracted name + phone, and the full
                  chat transcript.
                </li>
              </ol>
              <div className="mt-5 border-t border-data pt-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-taupe">
                  Configurable in <code>src/lib/chat-config.ts</code>
                </p>
                <ul className="mt-2 grid gap-1 text-[11px] text-slate sm:grid-cols-2">
                  <li>· Agent name (Layla)</li>
                  <li>· Broker name (Ahmed)</li>
                  <li>· Broker WhatsApp number</li>
                  <li>· Gemini model + temperature</li>
                  <li>· Hand-off turn count</li>
                  <li>· System prompt + persona</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* SECTION 5 — SITE-WIDE UX (Phase 3 visual examples) */}
      <Section
        num="05"
        title="Site-wide UX · Phase 3 examples"
        intent="Static mockups of the site-wide journey changes. Built for real once you approve scope."
      >
        {/* Breadcrumbs */}
        <div className="mb-10">
          <Label>Breadcrumbs · on every detail page</Label>
          <nav className="border border-data bg-paper px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate">
            <Link href="/" className="hover:text-ink">Home</Link>
            <span className="mx-2 text-data">/</span>
            <Link href="/areas" className="hover:text-ink">Areas</Link>
            <span className="mx-2 text-data">/</span>
            <Link href="/areas" className="hover:text-ink">New Cairo</Link>
            <span className="mx-2 text-data">/</span>
            <span className="text-ink">Mountain View iCity</span>
          </nav>
        </div>

        {/* Sticky filter bar */}
        <div className="mb-10">
          <Label>Sticky filter bar · /properties</Label>
          <div className="border border-data bg-paper p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink">
                Filters
              </span>
              {[
                "New Cairo",
                "Apartment",
                "3 Bed",
                "EGP 3M – 6M",
                "Ready 2026",
              ].map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 border border-ink bg-paper px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-ink"
                >
                  {c}
                  <button
                    type="button"
                    className="text-slate hover:text-ink"
                    aria-label={`Remove ${c}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                type="button"
                className="ml-auto border border-data px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-slate transition hover:border-ink hover:text-ink"
              >
                Clear all
              </button>
              <select className="border border-data bg-paper px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-ink">
                <option>Sort: Best match</option>
                <option>Price ↑</option>
                <option>Price ↓</option>
                <option>Area ↓</option>
                <option>Ready date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile action bar */}
        <div className="mb-10">
          <Label>Mobile sticky action bar · on detail pages</Label>
          <div className="max-w-sm">
            <div className="relative h-40 border border-data bg-data/40 grid place-items-center text-[11px] font-bold uppercase tracking-[0.06em] text-slate">
              property detail content
              <div className="absolute inset-x-0 bottom-0 flex border-t border-ink bg-paper">
                <button className="flex-1 border-r border-ink py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-ink">
                  Call
                </button>
                <button className="flex-1 border-r border-ink py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-ink">
                  WhatsApp
                </button>
                <button className="flex-1 bg-ink py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-paper">
                  Callback
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Saved listings */}
        <div>
          <Label>Saved listings · localStorage, no login</Label>
          <div className="border border-data bg-paper p-4">
            <div className="flex items-center justify-between border-b border-data pb-2">
              <p className="text-[13px] font-bold uppercase tracking-tight text-ink">
                Your saved deals (3)
              </p>
              <button className="text-[10px] font-bold uppercase tracking-[0.06em] text-slate hover:text-ink">
                Compare all
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate">
              Tap the ♡ on any card to save it. Saved here without an account
              (localStorage). Useful for the &quot;came back tomorrow&quot;
              buyer.
            </p>
          </div>
        </div>
      </Section>

      {/* Footer: phase roadmap */}
      <section className="bg-ink px-4 py-12 text-paper sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-data">
            Roadmap from this preview
          </p>
          <h3 className="mt-2 text-[28px] font-black uppercase tracking-tight">
            What ships when
          </h3>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            <li className="border border-data/30 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-data">
                Phase 1 · this preview
              </p>
              <p className="mt-2 text-[14px] font-bold">
                Cards + AI sales agent + carousels
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-data">
                Approve → replace cards everywhere. Wire <code>/api/chat</code>
                to also write each conversation into the Supabase{" "}
                <code>leads</code> table (audit trail). Plug in the real broker
                WhatsApp number.
              </p>
            </li>
            <li className="border border-data/30 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-data">
                Phase 2 · half day
              </p>
              <p className="mt-2 text-[14px] font-bold">
                Per-unit image gallery
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-data">
                Re-scrape nawy unit detail pages → multi-image carousel on
                <em> every</em> unit card (not just compounds). Schema adds
                <code>units.images text[]</code>.
              </p>
            </li>
            <li className="border border-data/30 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-data">
                Phase 3 · ~1 day
              </p>
              <p className="mt-2 text-[14px] font-bold">
                Site-wide UX + client journey
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-data">
                Breadcrumbs, sticky filters, sort options, saved listings,
                mobile action bar, strategic lead-capture moments.
              </p>
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}
