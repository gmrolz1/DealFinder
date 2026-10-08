"use client";

// Solana East lead form: name + phone (+ optional unit type), nothing else —
// the easy-form rule that keeps volume up. On success it fires the
// "Lead - egy.deals" Google Ads conversion once and swaps to a thank-you with
// a call button to Crestline (data-no-conv, so the call isn't counted twice).

import { useState } from "react";
import { GOOGLE_ADS_LEAD_SEND_TO } from "@/components/analytics/conversion-tracking";

const UNITS = ["أوضة", "أوضتين", "3 أوض"] as const;

const ERR: Record<string, string> = {
  name: "اكتب اسمك.",
  phone: "رقم الموبايل مش صحيح، اكتبه كده: 01xxxxxxxxx",
  network: "النت فصل، جرّب تاني.",
};

export function SolanaForm({ callPhone, callDisplay, id }: { callPhone: string; callDisplay: string; id?: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [unit, setUnit] = useState<string>("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (name.trim().length < 2) return setError(ERR.name);
    if (phone.replace(/\D/g, "").length < 10) return setError(ERR.phone);
    setBusy(true);
    const sp = new URLSearchParams(window.location.search);
    const pick = (k: string) => sp.get(k) ?? undefined;
    try {
      const res = await fetch("/api/lp/solana-east", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name, phone, unit, website,
          page: window.location.href.slice(0, 200),
          gclid: pick("gclid") ?? pick("gbraid") ?? pick("wbraid"),
          utm_source: pick("utm_source"), utm_medium: pick("utm_medium"),
          utm_campaign: pick("utm_campaign"), utm_term: pick("utm_term"), utm_content: pick("utm_content"),
        }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!j.ok) {
        setError(ERR[j.error ?? ""] ?? "حصلت مشكلة، جرّب تاني بعد دقيقة.");
        return;
      }
      window.gtag?.("event", "conversion", { send_to: GOOGLE_ADS_LEAD_SEND_TO });
      window.gtag?.("event", "generate_lead", { method: "form", landing: "solana-east" });
      setDone(true);
    } catch {
      setError(ERR.network);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div id={id} className="rounded-2xl bg-ink p-6 text-paper">
        <p className="text-2xl font-extrabold">وصلنا، شكرًا يا {name.split(" ")[0]}</p>
        <p className="mt-2 text-sm text-data">فريق المبيعات هيكلمك قريب بالأسعار وخطة السداد.</p>
        <a
          href={`tel:${callPhone}`}
          data-no-conv
          className="mt-5 flex h-12 items-center justify-center rounded-xl bg-paper font-bold text-ink"
        >
          مستعجل؟ كلّمنا دلوقتي · <span dir="ltr" className="ms-1">{callDisplay}</span>
        </a>
      </div>
    );
  }

  return (
    <form id={id} onSubmit={submit} className="rounded-2xl border border-data bg-paper p-5 shadow-sm">
      <p className="text-lg font-extrabold">اعرف الأسعار وخطة السداد</p>
      <p className="mt-1 text-sm text-slate">اسمك ورقمك بس، وهنكلمك.</p>
      <label className="mt-4 block text-sm font-semibold">
        الاسم
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className="mt-1 h-12 w-full rounded-xl border border-data px-3 text-base outline-none focus:border-ink"
        />
      </label>
      <label className="mt-3 block text-sm font-semibold">
        رقم الموبايل
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
          autoComplete="tel"
          dir="ltr"
          placeholder="01xxxxxxxxx"
          className="mt-1 h-12 w-full rounded-xl border border-data px-3 text-right text-base outline-none focus:border-ink"
        />
      </label>
      <p className="mt-3 text-sm font-semibold">مهتم بإيه؟ (اختياري)</p>
      <div className="mt-1 flex gap-2">
        {UNITS.map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => setUnit(unit === u ? "" : u)}
            className={`h-10 flex-1 rounded-xl border text-sm font-semibold ${unit === u ? "border-ink bg-ink text-paper" : "border-data"}`}
          >
            {u}
          </button>
        ))}
      </div>
      {/* honeypot — hidden from people, filled by bots */}
      <input
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="mt-4 h-12 w-full rounded-xl bg-ink text-base font-bold text-paper disabled:opacity-60"
      >
        {busy ? "بنبعت…" : "ابعتلي الأسعار"}
      </button>
      <p className="mt-2 text-center text-xs text-slate">بياناتك بتروح لفريق المبيعات بس.</p>
    </form>
  );
}
