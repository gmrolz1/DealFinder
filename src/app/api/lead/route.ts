// POST /api/lead — form (and programmatic) lead capture.
//
// The visitor-facing response deliberately omits the assigned client's
// phone number; forms don't need it and it keeps broker numbers out of
// casual network-tab scraping. Click CTAs use /api/go instead.

import { NextResponse } from "next/server";
import { getUnitBySlug } from "@/lib/data";
import { getArabianListingBySlug } from "@/lib/client-listings";
import { COOKIE_SID, COOKIE_UTM, PINNED_ROUTES, parseUtmCookie } from "@/lib/leads";
import { assignLead, type LeadSource } from "@/lib/leads-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  unitSlug?: string;
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
  pagePath?: string;
  locale?: string;
  source?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const source: LeadSource = body.source === "chat" ? "chat" : "form";
  const name = body.name?.trim() || null;
  const phone = body.phone?.trim() || null;
  if (source === "form" && (!name || !phone)) {
    return NextResponse.json(
      { ok: false, error: "name and phone are required" },
      { status: 400 }
    );
  }

  const cookieHeader = req.headers.get("cookie") ?? "";
  const readCookie = (n: string) => {
    const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${n}=([^;]+)`));
    return m ? decodeURIComponent(m[1]) : undefined;
  };
  const sessionId = readCookie(COOKIE_SID) ?? req.headers.get("x-df-sid");
  const utm = parseUtmCookie(readCookie(COOKIE_UTM));

  const pagePath = (body.pagePath ?? "").slice(0, 200) || null;
  const pinnedSlug = pagePath ? PINNED_ROUTES[pagePath] ?? null : null;

  const unit = body.unitSlug
    ? getUnitBySlug(body.unitSlug) ?? getArabianListingBySlug(body.unitSlug)
    : null;

  try {
    const result = await assignLead({
      sessionId: sessionId ?? null,
      source,
      pinnedSlug,
      unitNawyId: unit?.nawy_id ?? null,
      unitTitle: unit ? unit.compoundName ?? unit.title : null,
      pagePath,
      locale: body.locale === "ar" ? "ar" : "en",
      name,
      phone,
      email: body.email?.trim() || null,
      message: body.message?.trim() || null,
      utm,
    });
    return NextResponse.json({
      ok: true,
      leadId: result.leadId,
      deduped: result.deduped,
      client: result.client
        ? { slug: result.client.slug, name: result.client.name }
        : null,
    });
  } catch (err) {
    console.error("[/api/lead]", err);
    return NextResponse.json(
      { ok: false, error: "Lead capture failed" },
      { status: 502 }
    );
  }
}
