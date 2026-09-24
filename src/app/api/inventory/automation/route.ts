import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { setAutomation, type CredSource } from "@/lib/inventory-sync";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as {
    source?: CredSource;
    enabled?: boolean;
    schedule_time?: string;
  };
  if (!body.source || typeof body.enabled !== "boolean" || !body.schedule_time) {
    return NextResponse.json(
      { error: "source, enabled, schedule_time required" },
      { status: 400 },
    );
  }
  // Validate schedule_time HH:MM
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(body.schedule_time)) {
    return NextResponse.json(
      { error: "schedule_time must be HH:MM" },
      { status: 400 },
    );
  }
  await setAutomation(body.source, body.enabled, body.schedule_time);
  return NextResponse.json({ ok: true });
}
