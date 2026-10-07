import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { Pagination } from "../pagination";

export const dynamic = "force-dynamic";
const fmt = new Intl.NumberFormat("en-US");
const PAGE_SIZE = 100;

const fmtWhen = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

export default async function MergedPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; src?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const src = sp.src ?? "both"; // both | nawy | propertyhub
  const page = Math.max(1, Number(sp.page ?? "1"));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const sb = getSupabaseAdmin();
  let query = sb
    .from("merged_inventory")
    .select("*", { count: "exact" })
    .order("winning_price", { ascending: false, nullsFirst: false });

  if (src === "both") query = query.eq("source", "both");
  else if (src === "nawy") query = query.eq("source", "nawy");
  else if (src === "propertyhub") query = query.eq("source", "propertyhub");

  if (q) {
    query = query.or(
      [`compound.ilike.%${q}%`, `developer.ilike.%${q}%`, `unit_code.ilike.%${q}%`].join(","),
    );
  }
  const { data, count } = await query.range(from, to);
  const rows = data ?? [];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <h2 className="text-lg font-medium">Merged inventory</h2>
          <p className="text-xs text-neutral-500">
            Unit-level join on <code>norm(compound_name + unit_code)</code>.
            Where prices disagree, the <strong>freshest</strong> source wins &mdash;
            the other price appears underneath as a note.
          </p>
        </div>
        <span className="text-xs text-neutral-500 tabular-nums">
          {fmt.format(count ?? 0)} rows
        </span>
      </div>
      <form className="mb-4 flex flex-wrap items-center gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search compound, developer, unit code…"
          className="w-full max-w-md rounded border border-neutral-300 px-3 py-1.5 text-sm"
        />
        <div className="flex rounded border border-neutral-300 text-xs">
          {(["both", "nawy", "propertyhub"] as const).map((s) => (
            <label
              key={s}
              className={
                "cursor-pointer px-3 py-1.5 " +
                (src === s ? "bg-neutral-900 text-white" : "text-neutral-700")
              }
            >
              <input type="radio" name="src" value={s} defaultChecked={src === s} className="sr-only" />
              {s}
            </label>
          ))}
        </div>
        <button className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white" type="submit">
          Apply
        </button>
      </form>
      <div className="overflow-x-auto rounded-md border border-neutral-200">
        <table className="w-full text-sm tabular-nums">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.1em] text-neutral-500">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Compound / Unit</th>
              <th className="px-3 py-2 text-left font-semibold">Developer</th>
              <th className="px-3 py-2 text-left font-semibold">Area</th>
              <th className="px-3 py-2 text-right font-semibold">Beds</th>
              <th className="px-3 py-2 text-right font-semibold">m²</th>
              <th className="px-3 py-2 text-right font-semibold">Price (EGP)</th>
              <th className="px-3 py-2 text-left font-semibold">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const winnerLabel = labelFor(r.winner);
              const otherLabel = r.other_source ? labelFor(r.other_source) : null;
              return (
                <tr key={i} className="border-t border-neutral-100 hover:bg-neutral-50 align-top">
                  <td className="px-3 py-2">
                    <div className="font-medium">{r.compound ?? "—"}</div>
                    <div className="text-[11px] text-neutral-500">{r.unit_code ?? "—"}</div>
                  </td>
                  <td className="px-3 py-2 text-neutral-700">{r.developer ?? "—"}</td>
                  <td className="px-3 py-2 text-neutral-700">{r.area ?? "—"}</td>
                  <td className="px-3 py-2 text-right">{r.bedrooms ?? "—"}</td>
                  <td className="px-3 py-2 text-right">{r.area_m2 ?? "—"}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="font-semibold text-neutral-900">
                      {r.winning_price ? fmt.format(r.winning_price) : "—"}
                    </div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wider text-neutral-500">
                      via <span className={colorFor(r.winner)}>{winnerLabel}</span>
                      {r.winning_updated && (
                        <span className="ml-1 text-neutral-400 normal-case tracking-normal">
                          · {fmtWhen(r.winning_updated)}
                        </span>
                      )}
                    </div>
                    {r.other_price != null && otherLabel && (
                      <div className="mt-1 rounded bg-orange-50 px-2 py-1 text-[11px] text-orange-800">
                        <span className={"font-semibold " + colorFor(r.other_source)}>
                          {otherLabel}
                        </span>
                        <span className="text-orange-700"> says </span>
                        <span className="font-medium tabular-nums">
                          {fmt.format(r.other_price)}
                        </span>
                        {r.price_conflict_delta && (
                          <span className="text-orange-600">
                            {" "}
                            (Δ {fmt.format(r.price_conflict_delta)})
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <SrcPill v={r.source} />
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-neutral-500">
                  No matches.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        base="/inventory/merged"
        page={page}
        totalPages={totalPages}
        q={q}
      />
    </section>
  );
}

function labelFor(w: string | null) {
  if (w === "nawy") return "Nawy";
  if (w === "propertyhub") return "PropertyHub";
  if (w === "agree") return "Both agree";
  return w ?? "—";
}
function colorFor(w: string | null) {
  if (w === "nawy") return "text-teal-700";
  if (w === "propertyhub") return "text-orange-700";
  return "text-neutral-500";
}

function SrcPill({ v }: { v: string }) {
  const cls =
    v === "both"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : v === "nawy"
        ? "bg-teal-50 text-teal-700 border-teal-200"
        : "bg-orange-50 text-orange-700 border-orange-200";
  return (
    <span
      className={
        "inline-block rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " +
        cls
      }
    >
      {v}
    </span>
  );
}
