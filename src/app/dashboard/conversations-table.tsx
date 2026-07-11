"use client";

// AI chat log — every Layla conversation. Filter by date range + search,
// click a row to read the full transcript. Read-only (internal tool).

import { useMemo, useState } from "react";

export type ConversationMessage = { role: string; text: string };

export type ConversationRow = {
  id: string;
  updated_at: string;
  created_at: string;
  unit_slug: string | null;
  unit_title: string | null;
  locale: string | null;
  page_path: string | null;
  turns: number;
  handed_off: boolean;
  messages: ConversationMessage[];
};

type Range = "today" | "7d" | "30d" | "all";

const RANGES: { key: Range; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "all", label: "All" },
];

function cutoffFor(range: Range): number {
  if (range === "all") return 0;
  const now = new Date();
  if (range === "today") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  const days = range === "7d" ? 7 : 30;
  return now.getTime() - days * 24 * 60 * 60 * 1000;
}

export function ConversationsTable({ rows }: { rows: ConversationRow[] }) {
  const [range, setRange] = useState<Range>("7d");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const cut = cutoffFor(range);
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (cut && new Date(r.updated_at).getTime() < cut) return false;
      if (!needle) return true;
      const hay = `${r.unit_title ?? ""} ${r.unit_slug ?? ""} ${r.messages
        .map((m) => m.text)
        .join(" ")}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [rows, range, q]);

  const handoffs = filtered.filter((r) => r.handed_off).length;

  return (
    <div>
      {/* Controls */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex gap-px border border-ink bg-ink">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] ${
                range === r.key
                  ? "bg-ink text-paper"
                  : "bg-paper text-ink hover:bg-data"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search unit or message…"
          className="min-w-[180px] flex-1 border border-data bg-paper px-3 py-1.5 text-[12px] text-ink placeholder:text-taupe focus:border-ink focus:outline-none"
        />
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate">
          {filtered.length} chats · {handoffs} handoff{handoffs === 1 ? "" : "s"}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-data p-8 text-center text-[12px] uppercase tracking-[0.08em] text-slate">
          No conversations in this range yet.
        </div>
      ) : (
        <div className="overflow-x-auto border border-ink">
          <table className="w-full min-w-[720px] text-left text-[12px]">
            <thead>
              <tr className="border-b border-ink bg-ink text-paper">
                {["When", "Unit", "Lang", "Turns", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <ConversationRowEl
                  key={r.id}
                  r={r}
                  open={openId === r.id}
                  onToggle={() =>
                    setOpenId((cur) => (cur === r.id ? null : r.id))
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ConversationRowEl({
  r,
  open,
  onToggle,
}: {
  r: ConversationRow;
  open: boolean;
  onToggle: () => void;
}) {
  const when = new Date(r.updated_at);
  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer border-b border-data hover:bg-data/50 ${
          open ? "bg-data/40" : ""
        }`}
      >
        <td className="whitespace-nowrap px-3 py-2 text-slate">
          {when.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}{" "}
          {when.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </td>
        <td className="max-w-[220px] truncate px-3 py-2 text-ink">
          {r.unit_title ?? r.unit_slug ?? "—"}
        </td>
        <td className="px-3 py-2">
          <span className="border border-data px-1.5 py-0.5 text-[9px] font-bold uppercase text-ink">
            {(r.locale ?? "en").toUpperCase()}
          </span>
        </td>
        <td className="px-3 py-2 font-bold text-ink">{r.turns}</td>
        <td className="px-3 py-2">
          {r.handed_off ? (
            <span className="border border-ink bg-ink px-1.5 py-0.5 text-[9px] font-bold uppercase text-paper">
              handoff
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-[0.06em] text-slate">
              chat only
            </span>
          )}
        </td>
        <td className="px-3 py-2 text-[16px] font-black text-taupe">
          {open ? "−" : "+"}
        </td>
      </tr>
      {open && (
        <tr className="border-b border-data bg-paper">
          <td colSpan={6} className="px-3 py-3">
            <div className="space-y-2">
              {r.messages.map((m, i) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={i}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] border px-3 py-1.5 text-[12px] leading-relaxed ${
                        isUser
                          ? "border-ink bg-ink text-paper"
                          : "border-data bg-paper text-ink"
                      }`}
                    >
                      <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-[0.1em] opacity-60">
                        {isUser ? "Visitor" : "Layla"}
                      </span>
                      {m.text}
                    </div>
                  </div>
                );
              })}
            </div>
            {r.page_path && (
              <p className="mt-2 font-mono text-[10px] text-taupe">
                {r.page_path}
              </p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
