// Lead dashboard — the control room. Per-client quota cards, rotation
// controls (quota / order / active / phone / force-next), the live leads
// table, and a campaign breakdown. Single-admin (ADMIN_PASSWORD env).
// EN-only by design: internal tool, noindex, excluded from the sitemap.

import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  ClientsPanel,
  LogoutButton,
  type ClientRow,
} from "./clients-panel";
import { LeadsTable, type LeadRow } from "./leads-table";

export const metadata: Metadata = {
  title: "Lead Dashboard · DealFinder",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type RawLead = {
  id: string;
  created_at: string;
  client_id: string | null;
  source: string;
  status: string;
  pinned: boolean;
  name: string | null;
  phone: string | null;
  unit_title: string | null;
  page_path: string | null;
  locale: string | null;
  utm: { cmp?: string } | null;
  gclid: string | null;
};

export default async function DashboardPage() {
  await requireAdmin();
  const db = getSupabaseAdmin();

  const [{ data: clientsRaw }, { data: leadsRaw }] = await Promise.all([
    db
      .from("client_rotation")
      .select("*")
      .order("rotation_order", { ascending: true }),
    db
      .from("leads")
      .select(
        "id, created_at, client_id, source, status, pinned, name, phone, unit_title, page_path, locale, utm, gclid"
      )
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  const clients = (clientsRaw ?? []) as ClientRow[];
  const leads = (leadsRaw ?? []) as RawLead[];
  const clientById = new Map(clients.map((c) => [c.id, c]));

  // Who takes the next rotated lead — the RPC's exact ORDER BY.
  const next = clients
    .filter((c) => c.active && c.counted_leads < c.quota)
    .sort(
      (a, b) =>
        Number(b.force_next) - Number(a.force_next) ||
        a.counted_leads - b.counted_leads ||
        a.rotation_order - b.rotation_order
    )[0];

  // Per-client source breakdown (counted leads only).
  const bySource = new Map<string, Record<string, number>>();
  for (const l of leads) {
    if (l.status === "junk" || !l.client_id) continue;
    const rec = bySource.get(l.client_id) ?? {};
    rec[l.source] = (rec[l.source] ?? 0) + 1;
    bySource.set(l.client_id, rec);
  }

  // Campaign breakdown (all non-junk leads).
  const byCampaign = new Map<string, number>();
  for (const l of leads) {
    if (l.status === "junk") continue;
    const key = l.utm?.cmp ?? (l.gclid ? "(gclid only)" : "(direct)");
    byCampaign.set(key, (byCampaign.get(key) ?? 0) + 1);
  }

  const overflow = leads.filter(
    (l) => !l.client_id && l.status !== "junk"
  ).length;

  const tableRows: LeadRow[] = leads.map((l) => ({
    id: l.id,
    created_at: l.created_at,
    client_name: l.client_id
      ? clientById.get(l.client_id)?.name ?? "?"
      : null,
    client_slug: l.client_id
      ? clientById.get(l.client_id)?.slug ?? null
      : null,
    source: l.source,
    status: l.status,
    pinned: l.pinned,
    name: l.name,
    phone: l.phone,
    unit_title: l.unit_title,
    page_path: l.page_path,
    locale: l.locale,
    campaign: l.utm?.cmp ?? null,
    gclid: l.gclid,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-taupe">
            DealFinder · internal
          </p>
          <h1 className="text-[28px] font-black uppercase tracking-tight text-ink sm:text-[36px]">
            Lead Dashboard
          </h1>
        </div>
        <LogoutButton />
      </div>

      {/* Client cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {clients.map((c) => {
          const src = bySource.get(c.id) ?? {};
          const pct =
            c.quota > 0
              ? Math.min(100, Math.round((c.counted_leads / c.quota) * 100))
              : 0;
          const over = c.counted_leads > c.quota;
          return (
            <div key={c.id} className="border border-ink">
              <div className="flex items-center justify-between border-b border-data px-4 py-2.5">
                <p className="text-[13px] font-black uppercase tracking-tight text-ink">
                  {c.name}
                </p>
                {!c.active && (
                  <span className="border border-data px-1.5 text-[9px] font-bold uppercase text-slate">
                    inactive
                  </span>
                )}
                {c.force_next && (
                  <span className="border border-ink bg-ink px-1.5 text-[9px] font-bold uppercase text-paper">
                    ★ next
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="text-[30px] font-black leading-none tracking-tight text-ink">
                  {c.counted_leads}
                  <span className="text-[16px] text-slate">/{c.quota}</span>
                  {over && (
                    <span className="ms-2 align-middle border border-ink bg-ink px-1.5 text-[10px] font-bold uppercase text-paper">
                      over quota
                    </span>
                  )}
                </p>
                <div className="mt-2 h-1.5 w-full bg-data">
                  <div
                    className="h-1.5 bg-ink"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate">
                  {(["whatsapp", "call", "form", "chat"] as const)
                    .map((s) => `${s}: ${src[s] ?? 0}`)
                    .join(" · ")}
                </p>
                {!c.active && c.landing_path && (
                  <p className="mt-2 border border-data px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.04em] text-ink">
                    ⚠ inactive but {c.landing_path} is live — its leads fall
                    through to rotation
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Who's next + overflow */}
      <div className="mt-4 flex flex-wrap items-center gap-3 border border-data px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-taupe">
          Next rotated lead →
        </p>
        <p className="text-[14px] font-black uppercase tracking-tight text-ink">
          {next ? next.name : "NOBODY — all quotas full (overflow mode)"}
        </p>
        {overflow > 0 && (
          <p className="ms-auto text-[11px] font-bold uppercase tracking-[0.06em] text-slate">
            {overflow} overflow lead{overflow === 1 ? "" : "s"} (no client)
          </p>
        )}
      </div>

      {/* Rotation controls */}
      <h2 className="mt-8 text-[16px] font-bold uppercase tracking-tight text-ink">
        Rotation controls
      </h2>
      <p className="mb-3 mt-1 text-[12px] text-slate">
        Edit quota, order, phone, or name → Save. “Next lead here” forces a
        client to take the next rotated lead (badge clears once consumed).
        Junk-marking a lead below frees its slot automatically.
      </p>
      <ClientsPanel clients={clients} />

      {/* Campaign breakdown */}
      {byCampaign.size > 0 && (
        <>
          <h2 className="mt-8 text-[16px] font-bold uppercase tracking-tight text-ink">
            Leads by campaign
          </h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {[...byCampaign.entries()]
              .sort((a, b) => b[1] - a[1])
              .slice(0, 9)
              .map(([cmp, n]) => (
                <div
                  key={cmp}
                  className="flex items-baseline justify-between border border-data px-3 py-2"
                >
                  <p className="truncate text-[12px] font-semibold text-ink">
                    {cmp}
                  </p>
                  <p className="text-[16px] font-black text-ink">{n}</p>
                </div>
              ))}
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-[0.06em] text-taupe">
            CPL per campaign arrives once the Google Ads spend pull is
            connected (Phase 7).
          </p>
        </>
      )}

      {/* Leads table */}
      <h2 className="mt-8 text-[16px] font-bold uppercase tracking-tight text-ink">
        Leads (latest {tableRows.length})
      </h2>
      <div className="mt-3">
        <LeadsTable leads={tableRows} />
      </div>
    </div>
  );
}
