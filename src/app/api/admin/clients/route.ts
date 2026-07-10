// PATCH /api/admin/clients — the dashboard rotation controls.
// Editable: quota, active, rotation_order, phone, name, force_next.
// This is also how placeholder numbers become real ones — no deploy needed.

import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Patch = {
  id?: string;
  quota?: number;
  active?: boolean;
  rotation_order?: number;
  phone?: string;
  name?: string;
  force_next?: boolean;
};

export async function PATCH(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  let body: Patch;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (typeof body.quota === "number" && body.quota >= 0 && body.quota <= 10000)
    patch.quota = Math.floor(body.quota);
  if (typeof body.active === "boolean") patch.active = body.active;
  if (
    typeof body.rotation_order === "number" &&
    Number.isFinite(body.rotation_order)
  )
    patch.rotation_order = Math.floor(body.rotation_order);
  if (typeof body.phone === "string" && /^\+?[0-9]{8,15}$/.test(body.phone.trim()))
    patch.phone = body.phone.trim().startsWith("+")
      ? body.phone.trim()
      : `+${body.phone.trim()}`;
  if (typeof body.name === "string" && body.name.trim().length >= 2)
    patch.name = body.name.trim().slice(0, 80);
  if (typeof body.force_next === "boolean") patch.force_next = body.force_next;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { ok: false, error: "no valid fields to update" },
      { status: 400 }
    );
  }

  const { error } = await getSupabaseAdmin()
    .from("clients")
    .update(patch)
    .eq("id", body.id);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
