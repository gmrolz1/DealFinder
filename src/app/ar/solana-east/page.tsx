// /ar/solana-east — Google Ads landing for Solana East (Ora · New Cairo).
// A LEAD MAGNET (free 82-page Ora guide) sold on the project's real selling
// points, taken from the four Solana East videos and the brochure:
//   · serviced apartments directly on South 90th St / Golden Square, run by
//     Ora Hospitality — you don't chase tenants or maintenance;
//   · first-phase launch prices: 9M / 13.9M / 18.25M, where a 3-bedroom with
//     a big developer in the same area runs ~20M (the "burning prices" video);
//   · Ora's idea for the project: low-rise, 84% open space, a 5.5-feddan lake.
// Urgency is HONEST (launch prices move with each phase) — no fake timers, no
// fake "3 units left". Unverified video claims ("15% a year", "Ora Hospitality
// #13 worldwide") are deliberately left out.
//
// MESSAGE VARIANTS: ?m=launch (default) · invest · busy · local — each Google
// ad group points at the message that matches its keywords.

import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import { Magnet } from "./_magnet";
import { StickyBar } from "./_sticky";
import { OraLogo } from "./_ora-logo";
import { UnitAsk } from "./_unit-ask";

const tajawal = Tajawal({ subsets: ["arabic"], weight: ["400", "500", "700", "800"], display: "swap" });

const CALL_PHONE = "+201004230444";
const CALL_DISPLAY = "0100 423 0444";
const IMG = "/lp/solana-east";

export const metadata: Metadata = {
  title: "Solana East من أورا — شقق فندقية بأسعار المرحلة الأولى",
  description:
    "شقق فندقية متشطبة بالتكييفات على التسعين الجنوبي من أورا، والإدارة والتأجير على أورا للضيافة. أسعار المرحلة الأولى وكتيّب المشروع الكامل ببلاش.",
  alternates: { canonical: "/ar/solana-east" },
  robots: { index: false, follow: false },
  openGraph: { images: [`${IMG}/aerial.webp`] },
};

type Variant = { eyebrow: string; h1: string[]; sub: string };
const VARIANTS: Record<string, Variant> = {
  launch: {
    eyebrow: "المرحلة الأولى · أسعار اللونش",
    h1: ["ساويرس نازل", "بأسعار أول لونش", "على التسعين"],
    sub: "شقق فندقية متشطبة بالتكييفات في Solana East، وأورا للضيافة هي اللي بتديرها وبتأجّرها. أوضة من حوالي 9 مليون، في منطقة الـ3 أوض فيها بتعدّي الـ20 مليون.",
  },
  invest: {
    eyebrow: "شقق فندقية · الإدارة على أورا للضيافة",
    h1: ["شقة فندقية", "بتتأجّر", "وانت بتقسّط"],
    sub: "مش هتدوّر على مستأجر ولا هتتابع صيانة: أورا للضيافة بتأجّر وبتدير زي الفندق بالظبط. ومصر مستهدفة 30 مليون سائح بحلول 2030.",
  },
  busy: {
    eyebrow: "لو وقتك كله في شغلك",
    h1: ["وحدتك بتشتغل", "وانت في شغلك"],
    sub: "شقة فندقية من أورا على التسعين الجنوبي، متشطبة بالتكييفات، والتأجير والنضافة والصيانة كلها على أورا للضيافة. انت بس بتملك.",
  },
  local: {
    eyebrow: "التسعين الجنوبي · الجولدن سكوير",
    h1: ["ساويرس نزل فندقي", "جنبك على التسعين"],
    sub: "Solana East جنب ميفيدا وهايد بارك، 10 دقايق من الجامعة الأمريكية وزد ايست. شقق فندقية متشطبة، وأورا للضيافة بتديرها.",
  },
};

const USPS = [
  { k: "01", t: "فندقي مباشرة على التسعين", d: "شقق فندقية في قلب الجولدن سكوير على التسعين الجنوبي، مش في أطراف التجمع." },
  { k: "02", t: "أورا للضيافة بتأجّر وبتدير", d: "مش هتدوّر على مستأجر ولا هتتابع نضافة وصيانة. الوحدة بتتدار زي الفندق بالظبط." },
  { k: "03", t: "تستلم وتقفل الباب", d: "متشطبة بالكامل بالتكييفات. من غير تشطيب ولا مصاريف ولا شهور استنى." },
  { k: "04", t: "أسعار المرحلة الأولى", d: "أوضة من حوالي 9 مليون. نفس الـ3 أوض مع مطوّر كبير تاني في المنطقة بتعدّي الـ20 مليون." },
  { k: "05", t: "مقدّم 5% بس", d: "حوالي 450 ألف للأوضة، والباقي على أقساط لحد 8 سنين." },
  { k: "06", t: "مدينة مش برج", d: "مباني واطية، 84% من الأرض خضرة ومساحات مفتوحة، وبحيرة 5.5 فدان." },
];

const UNITS = [
  { key: "أوضة", size: "62 م²", price: "8.975", down: "حوالي 450 ألف مقدّم" },
  { key: "أوضتين", size: "97 م²", price: "13.9", down: "حوالي 695 ألف مقدّم" },
  { key: "3 أوض", size: "130 م² + غرفة مربية", price: "18.25", down: "حوالي 912 ألف مقدّم" },
];

const IDEA = [
  { t: "مجتمع تمشي فيه", d: "الشوارع والممرات معمولة للمشي، والخدمات قريبة منك." },
  { t: "خضرة قبل الخرسانة", d: "16% بس من الأرض مباني، والباقي حدايق وبحيرة." },
  { t: "تراسات متدرّجة", d: "المباني متدرّجة عشان كل وحدة تاخد نور وفيو." },
  { t: "خدمات فندقية", d: "الشقق الفندقية بتتدار بالكامل من أورا للضيافة." },
];

const ORA_PROJECTS = ["ZED East · التجمع", "ZED · الشيخ زايد", "SilverSands · الساحل", "Solana West · زايد الجديدة"];

const GALLERY = [
  { src: "living.webp", cap: "الريسبشن" },
  { src: "bedroom.webp", cap: "أوضة النوم" },
  { src: "garden.webp", cap: "الحدايق بين المباني" },
  { src: "strip.webp", cap: "Solana East Strip · المحلات والمطاعم" },
  { src: "homes.webp", cap: "الشوارع جوّه المشروع" },
];

const FAQ = [
  { q: "يعني إيه شقة فندقية؟", a: "شقة ملكك متشطبة بالتكييفات، وأورا للضيافة هي اللي بتأجّرها وبتديرها وبتهتم بيها. تقدر تستثمر فيها أو تنزل فيها وقت ما تحب." },
  { q: "ليه أسعار المرحلة الأولى مهمة؟", a: "المطوّرين بيرفعوا السعر مع كل مرحلة جديدة. اللي بيدخل في اللونش بياخد أقل سعر في المشروع." },
  { q: "المشروع فين بالظبط؟", a: "على التسعين الجنوبي في التجمع الخامس، جنب ميفيدا وهايد بارك. 10 دقايق من الجامعة الأمريكية وزد ايست، و20 دقيقة من الدائري و CFC." },
  { q: "هل لازم أتكلم مع حد عشان آخد الكتيّب؟", a: "لأ. اسمك ورقمك والكتيّب بيفتح على طول." },
];

export default async function SolanaEastPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const m = typeof sp.m === "string" ? sp.m : "launch";
  const v = VARIANTS[m] ?? VARIANTS.launch;

  return (
    <div className={`${tajawal.className} bg-paper text-ink`}>
      {/* HERO */}
      <section id="hero" className="relative min-h-[90svh] overflow-hidden md:min-h-[80vh]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${IMG}/aerial.webp`} alt="Solana East" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20" />
        <div className="relative mx-auto flex min-h-[90svh] max-w-5xl flex-col px-5 pb-10 pt-6 text-paper md:min-h-[80vh] md:pb-14">
          <div className="flex items-center justify-between">
            <OraLogo className="h-6 w-auto md:h-8" color="#fff" />
            <span className="text-xs text-white/70" dir="ltr">SOLANA EAST</span>
          </div>
          <div className="mt-auto">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-ink">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
              {v.eyebrow}
            </span>
            <h1 className="mt-4 text-[2.5rem] font-extrabold leading-[1.12] md:text-6xl">
              {v.h1.map((l) => (
                <span key={l} className="block">{l}</span>
              ))}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/85 md:text-lg">{v.sub}</p>
            <a href="#magnet" className="mt-6 flex h-12 items-center justify-center rounded-xl bg-paper px-6 font-bold text-ink sm:inline-flex">
              خُد كتيّب المشروع الكامل ببلاش
            </a>
          </div>
        </div>
      </section>

      {/* SAWIRIS · ORA */}
      <section className="border-b border-data">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 px-5 py-8 md:flex-row md:items-center md:gap-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${IMG}/sawiris.webp`} alt="المهندس نجيب ساويرس" className="h-56 w-full rounded-3xl object-cover object-[50%_20%] grayscale md:h-56 md:w-48 md:shrink-0" />
          <div>
            <OraLogo className="h-5 w-auto" />
            <p className="mt-3 text-2xl font-extrabold leading-snug md:text-3xl">المشروع الجديد من أورا، شركة المهندس نجيب ساويرس</p>
            <p className="mt-2 text-sm text-slate">نفس المطوّر اللي عامل:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ORA_PROJECTS.map((p) => {
                const [name, area] = p.split(" · ");
                return (
                  <span key={p} className="rounded-full border border-data px-3 py-1 text-sm">
                    <bdi dir="ltr" className="font-bold">{name}</bdi> <span className="text-slate">{area}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* USPs */}
      <section className="mx-auto max-w-5xl px-5 py-10 md:py-14">
        <p className="text-xs font-semibold tracking-wide text-taupe">ليه Solana East مختلف</p>
        <h2 className="mt-1 text-2xl font-extrabold md:text-4xl">6 حاجات مش هتلاقيها مع بعض في مكان تاني</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {USPS.map((u) => (
            <div key={u.k} className="flex gap-4 rounded-2xl border border-data p-5">
              <span className="text-sm font-bold text-taupe" dir="ltr">{u.k}</span>
              <div>
                <p className="text-lg font-extrabold">{u.t}</p>
                <p className="mt-1 text-sm leading-6 text-slate">{u.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LAUNCH PRICES — honest FOMO */}
      <section className="bg-ink py-10 text-paper md:py-14">
        <div className="mx-auto max-w-5xl px-5">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-red-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> أسعار المرحلة الأولى
          </span>
          <h2 className="mt-2 text-2xl font-extrabold md:text-4xl">الأسعار دي بتاعة اللونش، ومش هتفضل كده</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-data">
            كل مرحلة جديدة بتنزل بسعر أعلى. واللي بيدخل في اللونش بياخد أقل سعر هيشوفه المشروع.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {UNITS.map((u) => (
              <div key={u.key} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                <div className="flex items-baseline justify-between">
                  <p className="text-xl font-extrabold">{u.key}</p>
                  <p className="text-xs text-data">{u.size}</p>
                </div>
                <p className="mt-3 text-3xl font-extrabold" dir="ltr">
                  {u.price}<span className="ms-1 text-base font-bold">M</span>
                </p>
                <p className="text-xs text-data">مليون جنيه · {u.down}</p>
                <UnitAsk unit={u.key} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/5 p-4 text-sm text-data ring-1 ring-white/10">
            <span className="text-2xl font-extrabold text-paper" dir="ltr">20M+</span>
            <span>تمن وحدة 3 أوض مع مطوّر كبير تاني في نفس المنطقة.</span>
          </div>
        </div>
      </section>

      {/* LEAD MAGNET */}
      <section id="magnet" className="mx-auto max-w-5xl scroll-mt-4 px-4 py-10 md:py-14">
        <Magnet callPhone={CALL_PHONE} callDisplay={CALL_DISPLAY} />
      </section>

      {/* ORA'S IDEA */}
      <section className="mx-auto max-w-5xl px-5 py-8 md:py-12">
        <div className="flex items-center gap-3">
          <OraLogo className="h-5 w-auto" />
          <span className="text-xs font-semibold tracking-wide text-taupe">فكرة أورا في Solana</span>
        </div>
        <h2 className="mt-2 text-2xl font-extrabold md:text-4xl">167 فدان، 84% منهم خضرة</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate">
          أورا مش عاملة أبراج. Solana متصممة كمدينة صغيرة: مباني واطية، حدايق بين كل مبنى والتاني، وبحيرة 5.5 فدان في النص.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {IDEA.map((i) => (
            <div key={i.t} className="rounded-2xl bg-[#f4f4f2] p-4">
              <p className="font-extrabold">{i.t}</p>
              <p className="mt-1 text-xs leading-5 text-slate">{i.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GALLERY */}
      <section className="py-8 md:py-12">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="text-2xl font-extrabold md:text-3xl">من جوّه المشروع</h2>
          <p className="mt-1 text-sm text-slate">صور من المطوّر · اسحب عشان تشوف أكتر</p>
        </div>
        <div className="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 md:mx-auto md:grid md:max-w-5xl md:grid-cols-3 md:overflow-visible">
          {GALLERY.map((g, i) => (
            <figure key={g.src} className={`relative w-[82%] shrink-0 snap-center overflow-hidden rounded-2xl md:w-auto ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${IMG}/${g.src}`} alt={g.cap} loading="lazy" className="aspect-[4/3] h-full w-full object-cover" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-sm font-medium text-paper">{g.cap}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* LOCATION */}
      <section className="mx-auto max-w-5xl px-5 py-8 md:py-12">
        <h2 className="text-2xl font-extrabold md:text-3xl">في الجولدن سكوير، على التسعين الجنوبي</h2>
        <p className="mt-1 text-sm text-slate">جنب ميفيدا وهايد بارك · التجمع الخامس</p>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["10", "الجامعة الأمريكية"],
            ["10", "زد ايست"],
            ["20", "الدائري و CFC"],
            ["20", "قطامية هايتس"],
          ].map(([mins, to]) => (
            <div key={to} className="rounded-2xl border border-data p-4">
              <p className="text-2xl font-extrabold" dir="ltr">{mins}<span className="ms-1 text-sm font-bold">د</span></p>
              <p className="mt-1 text-sm text-slate">{to}</p>
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

      {/* CLOSE */}
      <section className="bg-ink px-5 py-12 text-center text-paper md:py-16">
        <OraLogo className="mx-auto h-6 w-auto" color="#fff" />
        <h2 className="mt-5 text-2xl font-extrabold md:text-4xl">اللي بيدخل بدري، بياخد سعر اللونش</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-data">خُد الكتيّب الكامل واقرأ براحتك، وقرّر وانت عارف كل حاجة.</p>
        <a href="#magnet" className="mx-auto mt-6 flex h-12 max-w-xs items-center justify-center rounded-xl bg-paper font-bold text-ink">
          افتح الكتيّب
        </a>
        <p className="mx-auto mt-10 max-w-xl text-[11px] leading-5 text-white/40">
          egy.deals موقع مستقل ومش تابع لأورا. اسم وشعار أورا ملك أورا للتطوير العقاري. المعلومات والصور من المطوّر وقابلة للتغيير.
          صورة نجيب ساويرس: Hannes Thalmann · CC BY-SA 4.0 · Wikimedia Commons.
        </p>
      </section>

      <StickyBar />
    </div>
  );
}
