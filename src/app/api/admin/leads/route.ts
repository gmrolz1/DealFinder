// PATCH /api/admin/leads — update a lead's status (new | contacted | junk).
// Junk-marking un-counts the lead, which automatically frees the quota slot
// (counting is computed in the client_rotation view, never stored).

import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = new Set(["new", "contacted", "junk"]);

export async function PATCH(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  let body: { id?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.id || !body.status || !STATUSES.has(body.status)) {
    return NextResponse.json(
      { ok: false, error: "id and status (new|contacted|junk) required" },
      { status: 400 }
    );
  }
  const { error } = await getSupabaseAdmin()
    .from("leads")
    .update({ status: body.status })
    .eq("id", body.id);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
