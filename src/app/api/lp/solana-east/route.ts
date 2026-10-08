// POST /api/lp/solana-east — the Solana East landing form.
//
// The lead does NOT enter this site's rotation: it belongs to Crestline, so
// it is forwarded server-to-server to The Deal Maker portal
// (wemake.deals /api/lp/lead), which files it under Crestline · Solana East
// and notifies their team. Forwarding from here keeps the browser on one
// origin (no CORS) and keeps the portal URL out of the page.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PORTAL_ENDPOINT =
  process.env.LP_LEAD_ENDPOINT || "https://www.wemake.deals/api/lp/lead";

const FIELDS = [
  "name", "phone", "unit", "website", "gclid", "page",
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
] as const;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const out: Record<string, string> = { landing: "solana-east" };
  for (const k of FIELDS) {
    const v = body[k];
    if (typeof v === "string" && v.trim()) out[k] = v.trim().slice(0, 200);
  }

  try {
    const res = await fetch(PORTAL_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(out),
      signal: AbortSignal.timeout(12_000),
    });
    const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || !j.ok) {
      return NextResponse.json({ ok: false, error: j.error ?? "save" }, { status: res.status >= 400 ? res.status : 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/lp/solana-east]", err);
    return NextResponse.json({ ok: false, error: "network" }, { status: 502 });
  }
}
