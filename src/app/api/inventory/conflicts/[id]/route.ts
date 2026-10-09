import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

// Resolving a conflict now WRITES the chosen price into the catalogue (public.units) and keeps it
// across publishes (sync.price_overrides) — RPC public.resolve_price_conflicts, service role only.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = (await req.json()) as {
    resolution?: "nawy" | "propertyhub" | "skip";
    resolved_by?: string;
  };
  if (!body.resolution || !["nawy", "propertyhub", "skip"].includes(body.resolution)) {
    return NextResponse.json(
      { error: "resolution must be nawy|propertyhub|skip" },
      { status: 400 },
    );
  }
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.rpc("resolve_price_conflicts", {
    p_ids: [Number(id)],
    p_pick: body.resolution === "skip" ? "keep" : body.resolution,
    p_by: body.resolved_by ?? "admin",
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, ...(data as object) });
}
