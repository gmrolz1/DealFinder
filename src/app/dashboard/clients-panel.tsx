"use client";

// Rotation control panel — the dashboard's "adjust rotations" surface.
// Inline-edit quota / order / phone / name, toggle active, and "Next lead
// goes here" (force_next). Saves per row via PATCH /api/admin/clients.

import { useState } from "react";
import { useRouter } from "next/navigation";

export type ClientRow = {
  id: string;
  slug: string;
  name: string;
  phone: string;
  quota: number;
  active: boolean;
  rotation_order: number;
  force_next: boolean;
  counted_leads: number;
  landing_path: string | null;
};

export function ClientsPanel({ clients }: { clients: ClientRow[] }) {
  return (
    <div className="overflow-x-auto border border-ink">
      <table className="w-full min-w-[760px] text-left text-[12px]">
        <thead>
          <tr className="border-b border-ink bg-ink text-paper">
            {["Client", "Phone", "Leads", "Quota", "Order", "Active", "Rotation", ""].map(
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
          {clients.map((c) => (
            <ClientRowEl key={c.id} c={c} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ClientRowEl({ c }: { c: ClientRow }) {
  const router = useRouter();
  const [name, setName] = useState(c.name);
  const [phone, setPhone] = useState(c.phone);
  const [quota, setQuota] = useState(c.quota);
  const [order, setOrder] = useState(c.rotation_order);
  const [busy, setBusy] = useState(false);

  const dirty =
    name !== c.name ||
    phone !== c.phone ||
    quota !== c.quota ||
    order !== c.rotation_order;

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/clients", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: c.id, ...body }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(`Save failed: ${d.error ?? res.status}`);
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const over = c.counted_leads > c.quota;
  const full = c.counted_leads >= c.quota;

  return (
    <tr className={`border-b border-data ${c.active ? "" : "opacity-50"}`}>
      <td className="px-3 py-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-36 border border-data bg-paper px-2 py-1 text-[12px] font-bold text-ink focus:border-ink"
        />
        <p className="mt-0.5 text-[9px] uppercase tracking-[0.08em] text-taupe">
          {c.slug}
          {c.landing_path ? ` · ${c.landing_path}` : ""}
        </p>
      </td>
      <td className="px-3 py-2">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-36 border border-data bg-paper px-2 py-1 font-mono text-[12px] text-ink focus:border-ink"
        />
      </td>
      <td className="px-3 py-2">
        <span
          className={`text-[15px] font-black ${over ? "text-ink" : "text-ink"}`}
        >
          {c.counted_leads}
        </span>
        <span className="text-slate">/{c.quota}</span>
        {over && (
          <span className="ms-1 border border-ink bg-ink px-1 text-[9px] font-bold uppercase text-paper">
            over
          </span>
        )}
        {!over && full && (
          <span className="ms-1 border border-ink px-1 text-[9px] font-bold uppercase text-ink">
            full
          </span>
        )}
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          min={0}
          value={quota}
          onChange={(e) => setQuota(Number(e.target.value))}
          className="w-16 border border-data bg-paper px-2 py-1 text-[12px] text-ink focus:border-ink"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
          className="w-14 border border-data bg-paper px-2 py-1 text-[12px] text-ink focus:border-ink"
        />
      </td>
      <td className="px-3 py-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => patch({ active: !c.active })}
          className={`border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em] transition ${
            c.active
              ? "border-ink bg-ink text-paper hover:bg-paper hover:text-ink"
              : "border-data text-slate hover:border-ink hover:text-ink"
          }`}
        >
          {c.active ? "Active" : "Off"}
        </button>
      </td>
      <td className="px-3 py-2">
        {c.force_next ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => patch({ force_next: false })}
            className="border border-ink bg-ink px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-paper"
            title="This client takes the next rotated lead — click to cancel"
          >
            ★ Next
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => patch({ force_next: true })}
            className="border border-data px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-slate transition hover:border-ink hover:text-ink"
          >
            Next lead here
          </button>
        )}
      </td>
      <td className="px-3 py-2">
        {dirty && (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              patch({ name, phone, quota, rotation_order: order })
            }
            className="border border-ink bg-ink px-3 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-paper transition hover:bg-paper hover:text-ink disabled:opacity-50"
          >
            {busy ? "…" : "Save"}
          </button>
        )}
      </td>
    </tr>
  );
}

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/login", { method: "DELETE" });
        location.href = "/dashboard/login";
      }}
      className="border border-data px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate transition hover:border-ink hover:text-ink"
    >
      Log out
    </button>
  );
}
