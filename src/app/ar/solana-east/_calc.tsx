"use client";

// "How much would I pay a month?" — answered openly, no form in the way.
// Equal installments, no interest (how Egyptian developer plans work); the
// official schedule differs per unit, which is the honest reason to ask for it.

import { useMemo, useState } from "react";

const UNITS = [
  { key: "أوضة", size: 62, price: 9_000_000, approx: true },
  { key: "أوضتين", size: 97, price: 13_900_000, approx: false },
  { key: "3 أوض", size: 130, price: 18_250_000, approx: false },
] as const;

const fmt = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n));
const millions = (n: number) => `${(n / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 2 })} مليون`;

export function Calculator() {
  const [u, setU] = useState(0);
  const [down, setDown] = useState(5);
  const [years, setYears] = useState(8);
  const unit = UNITS[u];

  const r = useMemo(() => {
    const dp = unit.price * (down / 100);
    const rest = unit.price - dp;
    return { dp, monthly: rest / (years * 12), quarterly: rest / (years * 4) };
  }, [unit, down, years]);

  return (
    <div className="rounded-3xl border border-data bg-paper p-5 md:p-7">
      <div className="flex gap-2">
        {UNITS.map((x, i) => (
          <button
            key={x.key}
            type="button"
            aria-pressed={u === i}
            onClick={() => setU(i)}
            className={`flex-1 rounded-2xl border px-2 py-3 text-center transition ${
              u === i ? "border-ink bg-ink text-paper" : "border-data"
            }`}
          >
            <span className="block text-base font-extrabold">{x.key}</span>
            <span className={`block text-xs ${u === i ? "text-data" : "text-slate"}`}>{x.size} م²</span>
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-slate">
        السعر {unit.approx ? "من حوالي" : "من"} <b className="text-ink">{millions(unit.price)} جنيه</b>
      </p>

      <label className="mt-5 block">
        <span className="flex justify-between text-sm font-semibold">
          <span>المقدّم</span>
          <span dir="ltr">{down}%</span>
        </span>
        <input type="range" min={5} max={30} step={5} value={down} onChange={(e) => setDown(+e.target.value)} className="mt-2 w-full accent-black" />
      </label>
      <label className="mt-4 block">
        <span className="flex justify-between text-sm font-semibold">
          <span>سنين التقسيط</span>
          <span>{years} سنين</span>
        </span>
        <input type="range" min={3} max={8} step={1} value={years} onChange={(e) => setYears(+e.target.value)} className="mt-2 w-full accent-black" />
      </label>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#f4f4f2] p-4">
          <p className="text-xs text-slate">المقدّم</p>
          <p className="mt-1 text-xl font-extrabold" dir="ltr">{fmt(r.dp)}</p>
          <p className="text-xs text-slate">جنيه</p>
        </div>
        <div className="rounded-2xl bg-ink p-4 text-paper">
          <p className="text-xs text-data">القسط الشهري تقريبًا</p>
          <p className="mt-1 text-xl font-extrabold" dir="ltr">{fmt(r.monthly)}</p>
          <p className="text-xs text-data">جنيه · أو {fmt(r.quarterly)} كل 3 شهور</p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate">
        حساب تقريبي بأقساط متساوية من غير فوايد. خطة السداد الرسمية بتختلف حسب الوحدة والدور.
      </p>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent("se:want", { detail: { unit: unit.key } }))}
        className="mt-4 h-12 w-full rounded-xl border border-ink text-base font-bold"
      >
        ابعتلي خطة السداد الرسمية لـ{unit.key}
      </button>
    </div>
  );
}
