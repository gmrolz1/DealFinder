import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

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
  const { error } = await sb
    .schema("sync")
    .from("conflicts")
    .update({
      resolved_at: new Date().toISOString(),
      resolution: body.resolution,
      resolved_by: body.resolved_by ?? "admin",
    })
    .eq("id", Number(id));
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
