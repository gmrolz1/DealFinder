import { NextResponse } from "next/server";
import { isInventoryRequest } from "@/lib/inventory-auth";
import { syncPropertyHub } from "@/lib/inventory-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: Request) {
  if (!(await isInventoryRequest(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await syncPropertyHub();
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
