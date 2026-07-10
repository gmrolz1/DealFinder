"use client";

// Lead capture: slides up from the bottom on mobile, centered modal on
// desktop. Submits to /api/lead — the server assigns the broker (pinned on
// client landings, rotation elsewhere) and the Ads conversion fires with the
// lead id for exact dedupe.

import { useState } from "react";
import { usePathname } from "next/navigation";
import { formatPrice } from "@/lib/format";
import type { EnrichedUnit } from "@/lib/data";
import { fireLeadConversion } from "@/lib/gtag";

export function LeadSheetTrigger({
  unit,
  className = "",
  variant = "primary",
}: {
  unit: EnrichedUnit;
  className?: string;
  /** primary = filled black, secondary = outline */
  variant?: "primary" | "secondary";
}) {
  const [open, setOpen] = useState(false);

  const baseCls =
    "py-2 px-3 text-[11px] font-bold uppercase tracking-[0.06em] transition";
  const variantCls =
    variant === "primary"
      ? "bg-ink text-paper hover:bg-paper hover:text-ink border border-ink"
      : "bg-paper text-ink border border-ink hover:bg-ink hover:text-paper";

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={`${baseCls} ${variantCls} ${className}`}
      >
        Request Callback
      </button>
      {open && <LeadSheet unit={unit} onClose={() => setOpen(false)} />}
    </>
  );
}

function LeadSheet({
  unit,
  onClose,
}: {
  unit: EnrichedUnit;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setStatus("submitting");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          unitSlug: unit.slug,
          name: String(fd.get("name") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          message: String(fd.get("message") ?? "") || undefined,
          pagePath: pathname,
          locale: pathname.startsWith("/ar") ? "ar" : "en",
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        leadId?: string;
        deduped?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      if (!data.deduped) fireLeadConversion(data.leadId);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("idle");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md border border-ink bg-paper shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-data p-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-taupe">
              Callback in 30 minutes
            </p>
            <h3 className="mt-1 truncate text-[17px] font-extrabold uppercase tracking-tight text-ink">
              {unit.compoundName ?? unit.title}
            </h3>
            <p className="text-[14px] font-bold text-ink">
              {formatPrice(unit.price, unit.currency)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[28px] leading-none text-slate hover:text-ink"
          >
            ×
          </button>
        </div>

        {/* Body */}
        {status !== "done" ? (
          <form onSubmit={handleSubmit} className="space-y-3 p-4">
            <input
              required
              name="name"
              placeholder="Your name"
              className="w-full border border-data bg-paper px-3 py-2.5 text-[14px] text-ink outline-none placeholder:text-slate/60 focus:border-ink"
            />
            <input
              required
              type="tel"
              name="phone"
              placeholder="Phone number"
              className="w-full border border-data bg-paper px-3 py-2.5 text-[14px] text-ink outline-none placeholder:text-slate/60 focus:border-ink"
            />
            <textarea
              name="message"
              placeholder="When can we call you? (optional)"
              rows={2}
              className="w-full resize-none border border-data bg-paper px-3 py-2.5 text-[14px] text-ink outline-none placeholder:text-slate/60 focus:border-ink"
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full border border-ink bg-ink py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-paper transition hover:bg-paper hover:text-ink disabled:opacity-50"
            >
              {status === "submitting" ? "Sending…" : "Get my callback"}
            </button>
            {error && (
              <p className="text-center text-[11px] font-semibold text-ink">
                {error} — please try again.
              </p>
            )}
            <p className="text-center text-[10px] text-slate">
              No spam — just deals.
            </p>
          </form>
        ) : (
          <div className="p-6 text-center">
            <p className="text-[18px] font-extrabold uppercase tracking-tight text-ink">
              Got it.
            </p>
            <p className="mt-2 text-[13px] text-slate">
              Our advisor will call you within 30 minutes.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 border border-ink bg-ink px-6 py-2 text-[11px] font-bold uppercase tracking-[0.06em] text-paper transition hover:bg-paper hover:text-ink"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
