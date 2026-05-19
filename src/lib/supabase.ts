import { createClient } from "@supabase/supabase-js";

// Browser/server-safe client (anon key — read-only catalog via RLS).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

export const hasSupabase = Boolean(url && anonKey);
