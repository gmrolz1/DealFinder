"use client";

// The lead magnet: the developer's own 82-page Solana East guide, free. Name +
// phone unlock the download on the spot (no "we'll call you" wall) — the value
// comes first, the conversation second. The lead goes to Crestline's portal
// through /api/lp/solana-east. The unit cards can pre-fill the unit and switch
// the ask to "what's available now" via the `se:want` event.

import { useEffect, useRef, useState } from "react";
import { GOOGLE_ADS_LEAD_SEND_TO } from "@/components/analytics/conversion-tracking";

export const BROCHURE_URL =
  "https://nmrzefvdixmxmhmxojlv.supabase.co/storage/v1/object/public/brochures/propertyhub/iljgpkgz9j7ogib9mg2b/4ef0f62d-cbb0-4a37-84d0-00fc2c6f511f.pdf";

const UNITS = ["أوضة", "أوضتين", "3 أوض"] as const;

const ERR: Record<string, string> = {
  name: "اكتب اسمك.",
  phone: "رقم الموبايل مش صحيح، اكتبه كده: 01xxxxxxxxx",
  network: "النت فصل، جرّب تاني.",
};

export function Magnet({ callPhone, callDisplay }: { callPhone: string; callDisplay: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [unit, setUnit] = useState("");
  const [plan, setPlan] = useState(false);
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // A unit card's "what's available" lands here with its unit.
  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<{ unit?: string }>).detail ?? {};
      if (d.unit) setUnit(d.unit);
      setPlan(true);
      document.getElementById("magnet")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 500);
    };
    window.addEventListener("se:want", on);
    return () => window.removeEventListener("se:want", on);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (name.trim().length < 2) return setError(ERR.name);
    if (phone.replace(/\D/g, "").length < 10) return setError(ERR.phone);
    setBusy(true);
    const sp = new URLSearchParams(window.location.search);
    const pick = (k: string) => sp.get(k) ?? undefined;
    const interest = [plan ? "المتاح والأسعار" : "كتيّب", unit].filter(Boolean).join(" · ");
    try {
      const res = await fetch("/api/lp/solana-east", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name, phone, unit: interest, website,
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
      window.gtag?.("event", "generate_lead", { method: "brochure", landing: "solana-east" });
      setDone(true);
    } catch {
      setError(ERR.network);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-ink text-paper shadow-xl">
      <div className="grid gap-0 md:grid-cols-[220px_1fr]">
        {/* the guide itself, so people see what they get */}
        <div className="relative flex items-center justify-center bg-[#1b1b1b] p-6 md:p-8">
          <div className="relative w-36 rotate-[-4deg] md:w-40">
            <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-md bg-white/10" />
            <div className="relative overflow-hidden rounded-md bg-paper shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/lp/solana-east/aerial.webp" alt="" className="h-28 w-full object-cover md:h-32" />
              <div className="p-3 text-ink" dir="ltr">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-slate">ORA</p>
                <p className="text-sm font-extrabold leading-tight">SOLANA EAST</p>
                <p className="mt-1 text-[9px] text-slate">Sales guide · 82 pages</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 md:p-7">
          {done ? (
            <div>
              <p className="text-xs font-semibold text-data">جاهز</p>
              <p className="mt-1 text-2xl font-extrabold">الكتيّب بتاعك يا {name.split(" ")[0]}</p>
              <a
                href={BROCHURE_URL}
                target="_blank"
                rel="noopener"
                className="mt-4 flex h-12 items-center justify-center gap-2 rounded-xl bg-paper font-bold text-ink"
              >
                حمّل الكتيّب · PDF
              </a>
              <p className="mt-3 text-sm text-data">
                {plan
                  ? "وهنبعتلك المتاح دلوقتي وأسعار المرحلة الأولى للوحدة اللي اخترتها على واتساب."
                  : "ولو حبيت قائمة الأسعار المحدّثة، الفريق هيبعتهالك على واتساب."}
              </p>
              <a href={`tel:${callPhone}`} data-no-conv className="mt-4 inline-block text-sm text-data underline underline-offset-4">
                عندك سؤال دلوقتي؟ <span dir="ltr">{callDisplay}</span>
              </a>
            </div>
          ) : (
            <form onSubmit={submit}>
              <p className="text-xs font-semibold text-data">ببلاش · من غير التزام</p>
              <h2 className="mt-1 text-2xl font-extrabold leading-snug md:text-3xl">
                {plan ? "المتاح دلوقتي + الكتيّب الكامل" : "كتيّب Solana East الكامل من أورا"}
              </h2>
              <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm text-data">
                <li>· الموقع والمسافات</li>
                <li>· الماستر بلان</li>
                <li>· المساحات المفتوحة والبحيرة</li>
                <li>· تصميمات المباني دور بدور</li>
              </ul>

              <div className="mt-4 grid gap-3">
                <input
                  ref={nameRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="الاسم"
                  aria-label="الاسم"
                  className="h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-base text-paper placeholder:text-white/40 outline-none focus:border-white/60"
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  dir="ltr"
                  placeholder="01xxxxxxxxx"
                  aria-label="رقم الموبايل"
                  className="h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-right text-base text-paper placeholder:text-white/40 outline-none focus:border-white/60"
                />
                <div className="flex gap-2" role="group" aria-label="مهتم بإيه؟ (اختياري)">
                  {UNITS.map((u) => (
                    <button
                      key={u}
                      type="button"
                      aria-pressed={unit === u}
                      onClick={() => setUnit(unit === u ? "" : u)}
                      className={`h-10 flex-1 rounded-xl border text-sm font-semibold transition ${
                        unit === u ? "border-paper bg-paper text-ink" : "border-white/15 text-data"
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />
              {error ? <p className="mt-3 text-sm font-semibold text-red-300">{error}</p> : null}
              <button
                type="submit"
                disabled={busy}
                className="mt-4 h-12 w-full rounded-xl bg-paper text-base font-bold text-ink disabled:opacity-60"
              >
                {busy ? "لحظة…" : plan ? "ابعتلي المتاح والكتيّب" : "افتح الكتيّب"}
              </button>
              <p className="mt-2 text-center text-xs text-white/50">رقمك بيروح لفريق المبيعات بس، ومش هنبعتلك رسايل كتير.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
