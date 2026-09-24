import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { setCredential, type CredSource } from "@/lib/inventory-sync";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as {
    source?: CredSource;
    kind?: "bearer" | "cookie";
    value?: string;
  };
  if (!body.source || !body.kind || !body.value?.trim()) {
    return NextResponse.json(
      { error: "source, kind, value are all required" },
      { status: 400 },
    );
  }
  // Normalize: strip "Bearer " prefix if present
  let value = body.value.trim();
  if (body.kind === "bearer" && value.toLowerCase().startsWith("bearer ")) {
    value = value.slice(7).trim();
  }
  await setCredential(body.source, body.kind, value);
  return NextResponse.json({ ok: true });
}
