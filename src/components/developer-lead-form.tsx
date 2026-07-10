"use client";

// Working callback form for the developer page — the fallback path for
// visitors who won't tap WhatsApp. Posts to /api/lead (server assigns the
// broker via rotation) and fires the Ads conversion with the lead id.
//
// The WhatsApp/Call primary paths are server <GoLink> elements elsewhere on
// the page; this is only the form.

import { useState } from "react";
import { GOOGLE_ADS_LEAD_SEND_TO } from "@/components/analytics/conversion-tracking";
import { type Locale, t } from "@/lib/i18n";

export function DeveloperLeadForm({
  developerName,
  unitSlug,
  pagePath,
  locale,
}: {
  developerName: string;
  unitSlug: string | null;
  pagePath: string;
  locale: Locale;
}) {
  const isAr = locale === "ar";
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus("submitting");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          unitSlug: unitSlug ?? undefined,
          name: String(fd.get("name") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          message: `Developer inquiry: ${developerName}`,
          pagePath,
          locale,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        leadId?: string;
        deduped?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      if (!data.deduped && typeof window.gtag === "function") {
        window.gtag("event", "conversion", {
          send_to: GOOGLE_ADS_LEAD_SEND_TO,
          transport_type: "beacon",
          transaction_id: data.leadId,
        });
      }
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="border border-ink bg-ink p-6 text-center">
        <p className="text-[16px] font-extrabold uppercase tracking-tight text-paper">
          {t("dev.formDone", locale)}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2.5"
      dir={isAr ? "rtl" : "ltr"}
    >
      <input
        required
        name="name"
        placeholder={t("lead.namePlaceholder", locale)}
        className="w-full border border-data bg-paper px-4 py-3 text-[14px] text-ink outline-none placeholder:text-slate/50 focus:border-ink"
      />
      <input
        required
        type="tel"
        name="phone"
        placeholder={t("lead.phonePlaceholder", locale)}
        className="w-full border border-data bg-paper px-4 py-3 text-[14px] text-ink outline-none placeholder:text-slate/50 focus:border-ink"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full border border-ink bg-ink px-4 py-3.5 text-[12px] font-bold uppercase tracking-[0.08em] text-paper transition hover:bg-paper hover:text-ink disabled:opacity-50"
      >
        {status === "submitting"
          ? t("dev.formSending", locale)
          : t("dev.formSubmit", locale)}
      </button>
      {error && (
        <p className="text-center text-[11px] font-semibold text-ink">
          {error} — {isAr ? "حاول مرة أخرى" : "please try again"}.
        </p>
      )}
      <p className="text-center text-[10px] uppercase tracking-[0.07em] text-taupe">
        {t("lead.privacyNote", locale)}
      </p>
    </form>
  );
}
