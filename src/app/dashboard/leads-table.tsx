"use client";

// Leads table — status control per row. Marking "junk" un-counts the lead
// (frees the quota slot); flipping back re-counts it.

import { useState } from "react";
import { useRouter } from "next/navigation";

export type LeadRow = {
  id: string;
  created_at: string;
  client_name: string | null;
  client_slug: string | null;
  source: string;
  status: string;
  pinned: boolean;
  name: string | null;
  phone: string | null;
  unit_title: string | null;
  page_path: string | null;
  locale: string | null;
  campaign: string | null;
  gclid: string | null;
};

const SOURCE_ICON: Record<string, string> = {
  whatsapp: "WA",
  call: "CALL",
  form: "FORM",
  chat: "CHAT",
};

export function LeadsTable({ leads }: { leads: LeadRow[] }) {
  if (leads.length === 0) {
    return (
      <div className="border border-data p-8 text-center text-[12px] uppercase tracking-[0.08em] text-slate">
        No leads yet — they&apos;ll appear here the moment someone taps
        WhatsApp, Call, or submits a form.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto border border-ink">
      <table className="w-full min-w-[900px] text-left text-[12px]">
        <thead>
          <tr className="border-b border-ink bg-ink text-paper">
            {["When", "Client", "Src", "Contact", "Unit", "Page", "Campaign", "Status"].map(
              (h) => (
                <th
                  key={h}
                  className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em]"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <LeadRowEl key={l.id} l={l} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LeadRowEl({ l }: { l: LeadRow }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setStatus(status: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: l.id, status }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const when = new Date(l.created_at);
  const junk = l.status === "junk";

  return (
    <tr className={`border-b border-data ${junk ? "opacity-40" : ""}`}>
      <td className="whitespace-nowrap px-3 py-2 text-slate">
        {when.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}{" "}
        {when.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
      </td>
      <td className="px-3 py-2">
        <span className="font-bold text-ink">{l.client_name ?? "—"}</span>
        {!l.client_name && (
          <span className="ms-1 border border-data px-1 text-[9px] font-bold uppercase text-slate">
            overflow
          </span>
        )}
        {l.pinned && (
          <span className="ms-1 border border-ink px-1 text-[9px] font-bold uppercase text-ink">
            pin
          </span>
        )}
      </td>
      <td className="px-3 py-2">
        <span className="border border-data px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-ink">
          {SOURCE_ICON[l.source] ?? l.source}
        </span>
      </td>
      <td className="px-3 py-2">
        {l.name || l.phone ? (
          <>
            <p className="font-bold text-ink">{l.name ?? "—"}</p>
            <p className="font-mono text-[11px] text-slate">{l.phone ?? ""}</p>
          </>
        ) : (
          <span className="text-slate">click only</span>
        )}
      </td>
      <td className="max-w-[180px] truncate px-3 py-2 text-ink">
        {l.unit_title ?? "—"}
      </td>
      <td className="max-w-[140px] truncate px-3 py-2 font-mono text-[11px] text-slate">
        {l.page_path ?? "—"}
      </td>
      <td className="max-w-[120px] truncate px-3 py-2 text-slate">
        {l.campaign ?? (l.gclid ? "gclid" : "—")}
      </td>
      <td className="px-3 py-2">
        <select
          disabled={busy}
          value={l.status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-data bg-paper px-1.5 py-1 text-[11px] font-bold uppercase text-ink focus:border-ink"
        >
          <option value="new">new</option>
          <option value="contacted">contacted</option>
          <option value="junk">junk</option>
        </select>
      </td>
    </tr>
  );
}
