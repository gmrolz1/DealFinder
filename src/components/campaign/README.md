# src/components/campaign/

Self-contained UI for paid-campaign landing pages (Google Ads → leads).

| File | What it renders |
|---|---|
| `new-capital-landing.tsx` | Whole `/new-capital` page body — hero, deal hooks, best-listings grid, "why us", final CTA. Takes `locale` + data props. |
| `campaign-card.tsx` | Mobile-first listing card with Call + WhatsApp buttons. |
| `sticky-contact.tsx` | Fixed bottom WhatsApp + Call bar (sits above the mobile tab bar). |
| `icons.tsx` | Phone + WhatsApp SVG glyphs. |

## Conventions

- **Server components.** No interactivity here — every CTA is a plain `<a>` (`tel:` / `wa.me`). No `"use client"`.
- **Campaign number, not the chat broker.** CTAs use `CAMPAIGN.phone` from `@/lib/campaign` (`+201210222246`), kept separate from the site-wide broker in `chat-config.ts`.
- **Copy is bilingual** via `CAMPAIGN_COPY[locale]` in `@/lib/campaign` — never hard-code English.
- **Data is passed in.** Pages fetch via `getAreaDeals()` etc. and pass props; components don't fetch.

## Adding another campaign

Reuse `campaign-card` + `sticky-contact`. Add the new area id + copy to `@/lib/campaign`, build a `<area>-landing.tsx`, and wire EN + AR routes under `src/app/`.
