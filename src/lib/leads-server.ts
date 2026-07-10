// Server-side lead assignment — thin wrapper over the assign_lead RPC.
// The RPC owns ALL routing logic (dedupe, pin, rotation, force_next, quota);
// this file just shapes the call and the result.

import { getSupabaseAdmin } from "./supabase-admin";
import type { UtmPayload } from "./leads";

export type LeadSource = "form" | "whatsapp" | "call" | "chat";

export type AssignedClient = {
  slug: string;
  name: string;
  phone: string;
} | null;

export type AssignResult = {
  leadId: string;
  deduped: boolean;
  client: AssignedClient;
};

export async function assignLead(params: {
  sessionId: string | null;
  source: LeadSource;
  pinnedSlug?: string | null;
  unitNawyId?: number | null;
  unitTitle?: string | null;
  pagePath?: string | null;
  locale?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  message?: string | null;
  utm?: UtmPayload | null;
}): Promise<AssignResult> {
  const db = getSupabaseAdmin();
  const { data, error } = await db.rpc("assign_lead", {
    p_session_id: params.sessionId,
    p_source: params.source,
    p_pinned_slug: params.pinnedSlug ?? null,
    p_unit_nawy_id: params.unitNawyId ?? null,
    p_unit_title: params.unitTitle ?? null,
    p_page_path: params.pagePath ?? null,
    p_locale: params.locale ?? null,
    p_name: params.name ?? null,
    p_phone: params.phone ?? null,
    p_email: params.email ?? null,
    p_message: params.message ?? null,
    p_utm: params.utm ?? null,
    p_gclid: params.utm?.gclid ?? null,
  });
  if (error) throw new Error(`assign_lead failed: ${error.message}`);
  const r = data as {
    lead_id: string;
    deduped: boolean;
    client: { slug: string; name: string; phone: string } | null;
  };
  return { leadId: r.lead_id, deduped: r.deduped, client: r.client };
}

/** Read-only phone lookup for the no-record path (bots still get redirected
 * to the right number without consuming rotation). */
export async function getClientPhone(slug: string): Promise<string | null> {
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("clients")
    .select("phone")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  return data?.phone ?? null;
}

export function fallbackPhone(): string {
  return process.env.LEAD_FALLBACK_PHONE || "+201023303230";
}
