import { NextResponse } from "next/server";
import { isInventoryRequest } from "@/lib/inventory-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { syncNawy, syncPropertyHub } from "@/lib/inventory-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * POST /api/inventory/promote
 * Body: { steps?: Array<"nawy" | "propertyhub" | "publish"> }
 * Default = ["nawy", "propertyhub", "publish"] — fresh scrape then publish to
 * public.units / public.compounds (the tables the DealFinder site reads).
 */
export async function POST(req: Request) {
  if (!(await isInventoryRequest(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    steps?: Array<"nawy" | "propertyhub" | "publish">;
  };
  const steps = body.steps ?? ["nawy", "propertyhub", "publish"];

  const results: Record<string, unknown> = {};
  const sb = getSupabaseAdmin();

  for (const step of steps) {
    if (step === "nawy") {
      results.nawy = await syncNawy();
      // If scrape needs a fresh token, stop here — publish stale data is not useful
      if ((results.nawy as { needsToken?: boolean }).needsToken) {
        return NextResponse.json(
          { ok: false, halted_at: "nawy", results, message: "Nawy token expired — paste a fresh one on Settings" },
          { status: 200 },
        );
      }
    } else if (step === "propertyhub") {
      results.propertyhub = await syncPropertyHub();
      // PropertyHub token failure doesn't block publishing since publishing
      // reads from nawy only. Record and continue.
    } else if (step === "publish") {
      const { data, error } = await sb.rpc("promote_to_site");
      if (error) {
        return NextResponse.json(
          { ok: false, halted_at: "publish", results, error: error.message },
          { status: 500 },
        );
      }
      results.publish = data;
    }
  }

  return NextResponse.json({ ok: true, results });
}
