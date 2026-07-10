// Lead-routing shared constants + pure helpers.
//
// EDGE-SAFE: imported by src/proxy.ts (edge runtime), the root layout, and
// API routes. Nothing in here may touch node:fs, the DB, or window. Server
// logic (the RPC wrapper) lives in leads-server.ts.

import type { Locale } from "./i18n";

// ── cookies ────────────────────────────────────────────────────────────────
export const COOKIE_SID = "df_sid"; // anonymous session id (dedupe key)
export const COOKIE_UTM = "df_utm"; // first-touch UTM/gclid JSON
export const COOKIE_ADMIN = "df_admin"; // dashboard auth token

// ── routing ────────────────────────────────────────────────────────────────
/** Landing-page path → client slug. A lead born on one of these paths is
 * PINNED to that client (even over quota). Everything else rotates. */
export const PINNED_ROUTES: Record<string, string> = {
  "/map": "map",
  "/ar/map": "map",
  "/arabian-estate": "arabian-estate",
  "/ar/arabian-estate": "arabian-estate",
  "/elite-homes": "elite-homes",
  "/ar/elite-homes": "elite-homes",
};

/** Pages rendered without the DealFinder chrome (client landings own their
 * branding; the dashboard is an internal tool). */
export function isStandalonePath(pathname: string): boolean {
  return pathname in PINNED_ROUTES || pathname.startsWith("/dashboard");
}

// ── bot filtering (applies to lead RECORDING only, never to redirecting) ──
export const BOT_UA_RE =
  /bot|crawl|spider|adsbot|mediapartners|facebookexternalhit|whatsapp|telegrambot|slackbot|skypeuripreview|preview|curl|wget|python|headless/i;

// ── UTM first-touch payload ────────────────────────────────────────────────
export type UtmPayload = {
  src?: string;
  med?: string;
  cmp?: string;
  term?: string;
  cnt?: string;
  gclid?: string;
  lp?: string; // landing path
  ts?: number;
};

const trunc = (v: string | null) => (v ? v.slice(0, 100) : undefined);

/** Extract UTM/gclid from a URL's search params (values truncated). */
export function utmFromSearch(sp: URLSearchParams, landingPath: string): UtmPayload {
  return {
    src: trunc(sp.get("utm_source")),
    med: trunc(sp.get("utm_medium")),
    cmp: trunc(sp.get("utm_campaign")),
    term: trunc(sp.get("utm_term")),
    cnt: trunc(sp.get("utm_content")),
    gclid: trunc(sp.get("gclid")),
    lp: landingPath.slice(0, 200),
    ts: Date.now(),
  };
}

export function hasAdSignal(u: UtmPayload): boolean {
  return Boolean(u.src || u.med || u.cmp || u.gclid);
}

export function parseUtmCookie(raw: string | undefined): UtmPayload | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as UtmPayload;
    return typeof v === "object" && v !== null ? v : null;
  } catch {
    return null;
  }
}

// ── WhatsApp text ──────────────────────────────────────────────────────────
/** Default prefill when the CTA didn't pass its own text. Unit label is the
 * caller's problem (catalog access is server-only). */
export function buildWaText(
  unitLabel: string | null,
  priceLabel: string | null,
  locale: Locale
): string {
  if (unitLabel) {
    return locale === "ar"
      ? `مرحباً — أنا مهتم بـ ${unitLabel}${priceLabel ? ` (${priceLabel})` : ""}. ممكن التفاصيل؟`
      : `Hi — I'm interested in ${unitLabel}${priceLabel ? ` (${priceLabel})` : ""}. Can you send details?`;
  }
  return locale === "ar"
    ? "مرحباً — أريد أفضل العروض المتاحة. ممكن التفاصيل؟"
    : "Hi — I'd like your best available deals. Can you send details?";
}

/** wa.me deep link for an E.164 phone. */
export function waHref(phone: string, text: string): string {
  return `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`;
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}

/** Build an /api/go CTA href. Omit `pinnedPath` on shared marketplace
 * surfaces — that's what makes the lead rotate. */
export function goHref(opts: {
  channel: "wa" | "tel";
  unitSlug?: string | null;
  pinnedPath?: string | null;
  locale?: string;
  source?: "chat";
  text?: string;
}): string {
  const q = new URLSearchParams();
  q.set("ch", opts.channel);
  if (opts.unitSlug) q.set("u", opts.unitSlug);
  if (opts.pinnedPath) q.set("p", opts.pinnedPath);
  if (opts.locale) q.set("l", opts.locale);
  if (opts.source) q.set("src", opts.source);
  if (opts.text) q.set("t", opts.text.slice(0, 1800));
  return `/api/go?${q.toString()}`;
}
