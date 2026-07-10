// GET /api/go — click-conversion capture + redirect. Every WhatsApp / Call
// CTA on the site points here; the server records the lead, asks the RPC
// which broker takes it, and forwards the visitor to THAT broker's number.
//
//   /api/go?ch=wa|tel &u=<unitSlug>? &p=<pinnedPath>? &t=<prefill>? &src=chat? &l=en|ar?
//
// Bot policy: guards gate RECORDING only — every caller still gets
// redirected (pinned client's number or the house fallback), so crawlers
// and prefetchers can never consume rotation slots or burn quota.
//
// tel: uses a micro-interstitial instead of a 302 — several browsers and
// in-app WebViews refuse non-http Location headers.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUnitBySlug } from "@/lib/data";
import { getArabianListingBySlug } from "@/lib/client-listings";
import { formatPrice } from "@/lib/format";
import {
  BOT_UA_RE,
  COOKIE_SID,
  COOKIE_UTM,
  PINNED_ROUTES,
  buildWaText,
  parseUtmCookie,
  telHref,
  waHref,
} from "@/lib/leads";
import {
  assignLead,
  fallbackPhone,
  getClientPhone,
  type LeadSource,
} from "@/lib/leads-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

function telInterstitial(phone: string): NextResponse {
  const href = telHref(phone);
  const html = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="refresh" content="0;url=${href}">
<title>Calling…</title></head>
<body style="font-family:system-ui;display:grid;place-items:center;min-height:100vh;margin:0;background:#fff;color:#000">
<div style="text-align:center">
<p style="font-size:14px;letter-spacing:.08em;text-transform:uppercase">Connecting your call…</p>
<a href="${href}" style="font-size:24px;font-weight:800;color:#000">${phone}</a>
</div>
<script>location.replace(${JSON.stringify(href)})</script>
</body></html>`;
  return new NextResponse(html, {
    status: 200,
    headers: { ...NO_STORE, "content-type": "text/html; charset=utf-8" },
  });
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const ch = sp.get("ch") === "tel" ? "tel" : "wa";
  const unitSlug = sp.get("u");
  const pinnedPath = sp.get("p");
  const prefill = sp.get("t");
  const locale = sp.get("l") === "ar" ? "ar" : "en";
  const source: LeadSource =
    sp.get("src") === "chat" ? "chat" : ch === "wa" ? "whatsapp" : "call";

  const pinnedSlug = pinnedPath ? PINNED_ROUTES[pinnedPath] ?? null : null;
  // Referer path as page context when the CTA didn't bake one in.
  let pagePath = pinnedPath;
  if (!pagePath) {
    try {
      const ref = req.headers.get("referer");
      pagePath = ref ? new URL(ref).pathname.slice(0, 200) : null;
    } catch {
      pagePath = null;
    }
  }

  // Resolve against the nawy catalog first, then client-supplied listings
  // (Arabian Estate slugs are prefixed "ae-").
  const unit = unitSlug
    ? getUnitBySlug(unitSlug) ?? getArabianListingBySlug(unitSlug)
    : null;
  const unitLabel = unit ? unit.compoundName ?? unit.title : null;
  const priceLabel = unit?.price ? formatPrice(unit.price, unit.currency) : null;

  // Recording guards — humans have the sid cookie by click time (set on the
  // page view that rendered the CTA); bots/prefetchers typically don't.
  const sid = req.cookies.get(COOKIE_SID)?.value ?? null;
  const ua = req.headers.get("user-agent") ?? "";
  const purpose =
    req.headers.get("purpose") ?? req.headers.get("sec-purpose") ?? "";
  const record =
    Boolean(sid) && !BOT_UA_RE.test(ua) && !/prefetch|preview/i.test(purpose);

  let phone: string | null = null;
  if (record) {
    try {
      const utm = parseUtmCookie(req.cookies.get(COOKIE_UTM)?.value);
      const result = await assignLead({
        sessionId: sid,
        source,
        pinnedSlug,
        unitNawyId: unit?.nawy_id ?? null,
        unitTitle: unitLabel,
        pagePath,
        locale,
        message: source === "chat" && prefill ? prefill.slice(0, 2000) : null,
        utm,
      });
      phone = result.client?.phone ?? null;
    } catch (err) {
      console.error("[/api/go] assign failed:", err);
    }
  } else if (pinnedSlug) {
    try {
      phone = await getClientPhone(pinnedSlug);
    } catch {
      phone = null;
    }
  }
  if (!phone) phone = fallbackPhone();

  if (ch === "tel") return telInterstitial(phone);

  const text = prefill?.slice(0, 1800) || buildWaText(unitLabel, priceLabel, locale);
  return NextResponse.redirect(waHref(phone, text), {
    status: 302,
    headers: NO_STORE,
  });
}
