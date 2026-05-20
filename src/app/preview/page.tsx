// /preview — design + AI agent reference page.
// Not linked from nav, robots disallowed.
//
// The cards shown here are exactly what now ships across the live site:
// PropertyCard and CompoundCard import from `@/components/*` which
// re-export the v2 implementations under preview/. So this page doubles
// as both the public-facing demo and an internal component reference.

import type { Metadata } from "next";
import Link from "next/link";
import {
  getFeaturedUnits,
  getCompoundsByArea,
  getAreas,
} from "@/lib/data";
import { PropertyCard } from "@/components/property-card";
import { CompoundCard } from "@/components/compound-card";
import { Carousel } from "@/components/preview/carousel";

export const metadata: Metadata = {
  title: "Card system + AI agent · DealFinder",
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
  const featured = getFeaturedUnits(6);
  const areas = getAreas();
  const popularCompounds = areas
    .flatMap((a) => getCompoundsByArea(a.nawy_id))
    .filter((c) => c.image_url)
    .sort((a, b) => b.available - a.available)
    .slice(0, 2);

  const unitA = featured[0];
  const unitB = featured[1];
  const compoundA = popularCompounds[0];
  const compoundB = popularCompounds[1];

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
            Design reference · now live across the site
          </p>
          <h1 className="mt-3 text-[36px] font-black uppercase leading-[0.95] tracking-tight text-ink sm:text-[60px]">
            Card
            <br />
            <span className="glitch">System</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[14px] leading-relaxed text-slate sm:text-[16px]">
            Every property and compound card on the live site uses the
            implementations below. Multi-image carousel, marketing-led deal
            grid, minimalist specs, and a Smart CTA that opens Layla — the
            AI deal opener — with the visitor&apos;s intent already loaded.
            Locale auto-matches; RTL flips everywhere.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/properties"
              className="border border-data px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate transition hover:border-ink hover:text-ink"
            >
              Live listings →
            </Link>
            <Link
              href="/"
              className="border border-ink bg-ink px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-paper transition hover:bg-paper hover:text-ink"
            >
              Live homepage
            </Link>
          </div>
        </div>
      </header>

      {/* SECTION 1 — PROPERTY CARD */}
      <Section
        num="01"
        title="Property card"
        intent="Used everywhere a unit is listed. Multi-image carousel aggregated from sibling units in the same compound. Marketing-led 3-tile deal grid: Total → Down → Monthly → Plan. Smart CTA opens Layla with the visitor's chosen intent."
      >
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <Label>English · LTR</Label>
            {unitA && (
              <div className="max-w-xs">
                <PropertyCard unit={unitA} locale="en" />
              </div>
            )}
          </div>
          <div>
            <Label>Arabic · RTL · Layla replies in Arabic</Label>
            {unitA && (
              <div className="max-w-xs">
                <PropertyCard unit={unitA} locale="ar" />
              </div>
            )}
          </div>
        </div>
        {unitB && (
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div>
              <Label>Second example · English</Label>
              <div className="max-w-xs">
                <PropertyCard unit={unitB} locale="en" />
              </div>
            </div>
            <div>
              <Label>Second example · Arabic</Label>
              <div className="max-w-xs">
                <PropertyCard unit={unitB} locale="ar" />
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* SECTION 2 — COMPOUND CARD */}
      <Section
        num="02"
        title="Compound card"
        intent="Aggregates images from all units in the compound for a real carousel. Adds a 'starting from' price and compound-level deal badges (FROM X% DOWN, READY YYYY)."
      >
        <div className="grid gap-8 sm:grid-cols-2">
          {compoundA && (
            <div>
              <Label>English</Label>
              <div className="max-w-sm">
                <CompoundCard compound={compoundA} locale="en" />
              </div>
            </div>
          )}
          {compoundB && (
            <div>
              <Label>Arabic · RTL</Label>
              <div className="max-w-sm">
                <CompoundCard compound={compoundB} locale="ar" />
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* SECTION 3 — CAROUSEL */}
      <Section
        num="03"
        title="Carousel"
        intent="Reusable image carousel. Touch-swipe on mobile, hover arrows on desktop, dot indicators, counter pill. Used by every card today; ready to plug into detail-page galleries once per-unit images are scraped (M2)."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="group max-w-md">
            <Label>Multi-image (6)</Label>
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

      {/* SECTION 4 — AI agent explanation */}
      <Section
        num="04"
        title="Smart CTA + Layla"
        intent="The black panel on every card is the Smart CTA — Layla's chat preview. Avatar + online status + typing dots + speech bubble holding a rotating intent prompt. Tap any intent and the chat opens with that question already sent — Layla picks up the lane immediately."
      >
        <div className="border border-data bg-paper p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-taupe">
            Deal-opener playbook
          </p>
          <h3 className="mt-1 text-[18px] font-bold uppercase tracking-tight text-ink">
            Six things Layla does
          </h3>
          <ol className="mt-4 grid gap-3 text-[12px] leading-relaxed text-slate sm:grid-cols-2">
            <li>
              <strong className="text-ink">1. Rotating intents.</strong> Card
              cycles every 3.5s through 5 prompts with up / right / left
              slide animations. Pauses on hover.
            </li>
            <li>
              <strong className="text-ink">2. Locale auto-match.</strong>{" "}
              English on <code>/properties/...</code>, Arabic on{" "}
              <code>/ar/properties/...</code>. RTL flips end-to-end.
            </li>
            <li>
              <strong className="text-ink">3. Professional + warm.</strong>{" "}
              Speaks like a senior advisor — no hype, no emoji, no exclamation
              marks unless warranted.
            </li>
            <li>
              <strong className="text-ink">4. Grounded answers only.</strong>{" "}
              Price, monthly payment, down %, ready date, beds, area — all
              injected from Supabase. She literally cannot invent numbers.
            </li>
            <li>
              <strong className="text-ink">5. Soft pivot to WhatsApp.</strong>{" "}
              After 2-3 turns or buying intent (&quot;I&apos;m
              interested&quot; / &quot;مهتم&quot;), she offers the handoff.
            </li>
            <li>
              <strong className="text-ink">6. Pre-filled handoff.</strong>{" "}
              CONTINUE ON WHATSAPP opens a chat to{" "}
              <code>+20 102 330 3230</code> pre-filled with unit, price,
              extracted name + phone, and full transcript.
            </li>
          </ol>
          <div className="mt-5 border-t border-data pt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-taupe">
              Editable in <code>src/lib/chat-config.ts</code> and{" "}
              <code>src/lib/chat-intents.ts</code>
            </p>
            <ul className="mt-2 grid gap-1 text-[11px] text-slate sm:grid-cols-2">
              <li>· Agent name (Layla) + persona</li>
              <li>· Broker name (Ahmed) + phone</li>
              <li>· Gemini model + max tokens</li>
              <li>· Hand-off turn threshold</li>
              <li>· Intent labels + seed messages (EN + AR)</li>
              <li>· Animation directions per intent</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <section className="bg-ink px-4 py-12 text-paper sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-data">
            What&apos;s next
          </p>
          <h3 className="mt-2 text-[28px] font-black uppercase tracking-tight">
            Phase 2 + 3
          </h3>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2">
            <li className="border border-data/30 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-data">
                Phase 2 · per-unit gallery
              </p>
              <p className="mt-2 text-[14px] font-bold">
                Real multi-image carousels on every unit
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-data">
                Re-scrape nawy unit detail pages so each unit carries its own
                gallery (today we aggregate sibling images from the same
                compound). Schema adds <code>units.images text[]</code>.
              </p>
            </li>
            <li className="border border-data/30 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-data">
                Phase 3 · site-wide UX
              </p>
              <p className="mt-2 text-[14px] font-bold">
                Breadcrumbs · sticky filters · saved listings
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-data">
                Wire <code>/api/chat</code> conversations into the Supabase{" "}
                <code>leads</code> table (audit trail). Add filter bar,
                sort options, mobile action bar, breadcrumbs.
              </p>
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}
