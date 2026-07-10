// Server-only Supabase client using the SERVICE ROLE key. Bypasses RLS —
// this is what lets lead writes stay locked away from the anon key.
//
// NEVER import from a client component. The window guard below turns a
// bundling mistake into a loud crash instead of a leaked secret.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

if (typeof window !== "undefined") {
  throw new Error("supabase-admin.ts must never reach the browser bundle");
}

let _admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — set both in .env.local / Vercel env."
    );
  }
  _admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _admin;
}
