// /ar/solana-east — Google Ads landing for Solana East (Ora · New Cairo).
// A LEAD MAGNET, not a form (Omar 2026-10-08): the free thing is the
// developer's own 82-page guide, plus an open payment calculator. Value first,
// soft asks only. Every lead goes to Crestline's portal via /api/lp/solana-east.
// Facts come from the Meta videos and the brochure itself (location minutes,
// 167 feddan, 5.5-feddan lake, 84% open space) — nothing invented.

import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import { Magnet } from "./_magnet";
import { Calculator } from "./_calc";
import { StickyBar } from "./_sticky";

const tajawal = Tajawal({ subsets: ["arabic"], weight: ["400", "500", "700", "800"], display: "swap" });

const CALL_PHONE = "+201004230444";
const CALL_DISPLAY = "0100 423 0444";
const IMG = "/lp/solana-east";

export const metadata: Metadata = {
  title: "Solana East من أورا — الكتيّب الكامل وحاسبة القسط",
  description:
    "شقق فندقية في Solana East على التسعين الجنوبي من أورا، والإدارة على أورا للضيافة. حمّل كتيّب المشروع الكامل ببلاش واحسب قسطك الشهري.",
  alternates: { canonical: "/ar/solana-east" },
  robots: { index: false, follow: false },
  openGraph: { images: [`${IMG}/aerial.webp`] },
};

const FACTS = [
  { n: "167", u: "فدان", t: "مساحة المشروع" },
  { n: "84%", u: "", t: "مساحات مفتوحة وخضرة" },
  { n: "5%", u: "", t: "مقدّم يبدأ من" },
  { n: "8", u: "سنين", t: "تقسيط لحد" },
];

const MINUTES = [
  { m: "10", to: "الجامعة الأمريكية" },
  { m: "10", to: "زد ايست" },
  { m: "20", to: "الدائري و CFC" },
  { m: "20", to: "قطامية هايتس" },
];

const HOW = [
  { t: "بتشتري وحدتك", d: "شقة فندقية متشطبة بالتكييفات، بمقدّم من 5% والباقي على 8 سنين." },
  { t: "أورا للضيافة بتديرها", d: "التأجير والنضافة والصيانة واستقبال الضيوف عليهم، زي الفندق." },
  { t: "وانت مش مشغول بيها", d: "من غير ما تدوّر على مستأجر أو تتابع صيانة، وتنزل فيها وقت ما تحب." },
];

const GALLERY = [
  { src: "living.webp", cap: "الريسبشن" },
  { src: "bedroom.webp", cap: "أوضة النوم" },
  { src: "garden.webp", cap: "الحدايق بين المباني" },
  { src: "strip.webp", cap: "Solana East Strip · المحلات والمطاعم" },
  { src: "homes.webp", cap: "الشوارع جوّه المشروع" },
];

const FAQ = [
  { q: "مين المطوّر؟", a: "أورا للتطوير العقاري، شركة المهندس نجيب ساويرس، وهي اللي عاملة زد ايست وزد الشيخ زايد وسيلفرساندز في الساحل." },
  { q: "يعني إيه شقة فندقية؟", a: "شقة ملكك متشطبة بالتكييفات، وأورا للضيافة هي اللي بتديرها وبتأجّرها وبتهتم بيها. تقدر تستفيد منها أو تنزل فيها وقت ما تحب." },
  { q: "المقدّم والتقسيط كام؟", a: "المقدّم يبدأ من 5% والتقسيط لحد 8 سنين. الأرقام الرسمية بتختلف حسب الوحدة والدور، وتقدر تطلب خطة السداد من الحاسبة فوق." },
  { q: "المشروع فين بالظبط؟", a: "على التسعين الجنوبي في التجمع الخامس، 10 دقايق من الجامعة الأمريكية وزد ايست، و20 دقيقة من الدائري و CFC." },
  { q: "هل لازم أتكلم مع حد عشان آخد الكتيّب؟", a: "لأ. اسمك ورقمك والكتيّب بيفتح على طول. ولو حبيت تعرف أكتر، الفريق موجود." },
];

export default function SolanaEastPage() {
  return (
    <div className={`${tajawal.className} bg-paper text-ink`}>
      {/* HERO */}
      <section id="hero" className="relative min-h-[88svh] overflow-hidden md:min-h-[78vh]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${IMG}/aerial.webp`} alt="Solana East" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
        <div className="relative mx-auto flex min-h-[88svh] max-w-5xl flex-col justify-end px-5 pb-10 text-paper md:min-h-[78vh] md:pb-14">
          <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">أورا للتطوير العقاري · نجيب ساويرس</span>
          <h1 className="mt-3 text-[2.4rem] font-extrabold leading-[1.15] md:text-6xl">
            <span dir="ltr">Solana East</span>
            <br />
            شقة فندقية في التجمع،
            <br />
            والإدارة على أورا
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-white/85 md:text-lg">
            اعرف كل حاجة عن المشروع قبل ما تكلّم حد: الكتيّب الكامل من المطوّر، والقسط الشهري لكل وحدة.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href="#magnet" className="flex h-12 items-center justify-center rounded-xl bg-paper px-6 font-bold text-ink">
              خُد الكتيّب الكامل ببلاش
            </a>
            <a href="#calc" className="flex h-12 items-center justify-center rounded-xl border border-white/40 px-6 font-bold text-paper">
              احسب قسطك الشهري
            </a>
          </div>
        </div>
      </section>

      {/* FACTS */}
      <section className="border-b border-data">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-data md:grid-cols-4">
          {FACTS.map((f) => (
            <div key={f.t} className="bg-paper px-5 py-6">
              <p className="text-3xl font-extrabold" dir="ltr">{f.n}<span className="ms-1 text-base font-bold">{f.u}</span></p>
              <p className="mt-1 text-sm text-slate">{f.t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LEAD MAGNET */}
      <section id="magnet" className="mx-auto max-w-5xl scroll-mt-4 px-4 py-10 md:py-14">
        <Magnet callPhone={CALL_PHONE} callDisplay={CALL_DISPLAY} />
      </section>

      {/* HOW A HOTEL APARTMENT WORKS */}
      <section className="mx-auto max-w-5xl px-5 py-6 md:py-10">
        <p className="text-xs font-semibold tracking-wide text-taupe">الفكرة ببساطة</p>
        <h2 className="mt-1 text-2xl font-extrabold md:text-3xl">شقة فندقية بتشتغل وانت مش موجود</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {HOW.map((h, i) => (
            <li key={h.t} className="rounded-2xl bg-[#f4f4f2] p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-bold text-paper">{i + 1}</span>
              <p className="mt-3 text-lg font-extrabold">{h.t}</p>
              <p className="mt-1 text-sm leading-6 text-slate">{h.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* GALLERY — swipe on phones */}
      <section className="py-8 md:py-12">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="text-2xl font-extrabold md:text-3xl">من جوّه المشروع</h2>
          <p className="mt-1 text-sm text-slate">صور من المطوّر · اسحب عشان تشوف أكتر</p>
        </div>
        <div className="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 md:mx-auto md:max-w-5xl md:grid md:grid-cols-3 md:overflow-visible">
          {GALLERY.map((g, i) => (
            <figure key={g.src} className={`relative w-[82%] shrink-0 snap-center overflow-hidden rounded-2xl md:w-auto ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${IMG}/${g.src}`} alt={g.cap} loading="lazy" className="aspect-[4/3] h-full w-full object-cover" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-sm font-medium text-paper">{g.cap}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CALCULATOR */}
      <section id="calc" className="mx-auto max-w-5xl scroll-mt-4 px-4 py-8 md:py-12">
        <div className="mb-5 px-1">
          <p className="text-xs font-semibold tracking-wide text-taupe">من غير ما تسيب رقمك</p>
          <h2 className="mt-1 text-2xl font-extrabold md:text-3xl">قسطك الشهري هيبقى كام؟</h2>
        </div>
        <Calculator />
      </section>

      {/* LOCATION */}
      <section className="mx-auto max-w-5xl px-5 py-8 md:py-12">
        <h2 className="text-2xl font-extrabold md:text-3xl">على التسعين الجنوبي</h2>
        <p className="mt-1 text-sm text-slate">التجمع الخامس · القاهرة الجديدة</p>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {MINUTES.map((m) => (
            <div key={m.to} className="rounded-2xl border border-data p-4">
              <p className="text-2xl font-extrabold" dir="ltr">{m.m}<span className="ms-1 text-sm font-bold">د</span></p>
              <p className="mt-1 text-sm text-slate">{m.to}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-data">
          <iframe
            title="Solana East on the map"
            src="https://www.openstreetmap.org/export/embed.html?bbox=31.49%2C29.95%2C31.58%2C30.01&layer=mapnik&marker=29.9777%2C31.5375"
            loading="lazy"
            className="h-64 w-full md:h-80"
          />
        </div>
        <p className="mt-2 text-xs text-slate">المسافات من كتيّب المطوّر.</p>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-8 md:py-12">
        <h2 className="text-2xl font-extrabold md:text-3xl">أسئلة بتتسأل كتير</h2>
        <div className="mt-4 divide-y divide-data border-y border-data">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold">
                {f.q}
                <span className="text-xl leading-none text-slate transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm leading-7 text-slate">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CLOSE — the same soft offer, once more */}
      <section className="bg-ink px-5 py-12 text-center text-paper md:py-16">
        <h2 className="text-2xl font-extrabold md:text-4xl">خُد الكتيّب، واقرأ براحتك</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-data">82 صفحة من أورا: الموقع، الماستر بلان، والتصميمات دور بدور.</p>
        <a href="#magnet" className="mx-auto mt-6 flex h-12 max-w-xs items-center justify-center rounded-xl bg-paper font-bold text-ink">
          افتح الكتيّب
        </a>
        <p className="mt-10 text-xs text-white/40">egy.deals · المعلومات والصور من المطوّر وقابلة للتغيير</p>
      </section>

      <StickyBar />
    </div>
  );
}
