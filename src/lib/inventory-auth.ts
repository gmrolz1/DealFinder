// Auth for /api/inventory/* — accepts either the ADMIN_PASSWORD cookie
// or a ?secret=... query matching sync.config.inventory_cron_secret
// (so pg_cron can POST from Supabase without a browser session).

import { isAdminRequest } from "./admin-auth";
import { getSupabaseAdmin } from "./supabase-admin";

let cachedSecret: { v: string; at: number } | null = null;
const CACHE_MS = 30_000;

async function getCronSecret(): Promise<string | null> {
  if (cachedSecret && Date.now() - cachedSecret.at < CACHE_MS) return cachedSecret.v || null;
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .schema("sync")
    .from("config")
    .select("v")
    .eq("k", "inventory_cron_secret")
    .maybeSingle();
  const v = (data?.v as string | undefined) ?? "";
  cachedSecret = { v, at: Date.now() };
  return v || null;
}

export async function isInventoryRequest(req: Request): Promise<boolean> {
  if (isAdminRequest(req)) return true;
  const url = new URL(req.url);
  const provided = url.searchParams.get("secret");
  if (!provided) return false;
  const expected = await getCronSecret();
  if (!expected) return false;
  // constant-time compare
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  let ok = 0;
  for (let i = 0; i < a.length; i++) ok |= a[i] ^ b[i];
  return ok === 0;
}
