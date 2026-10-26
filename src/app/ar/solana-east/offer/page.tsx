// /ar/solana-east/offer — "Private access" variant of the Solana East landing
// (Omar 2026-10-08: "another landing page that feels like a special offer,
// only on this page"). It feels like an invitation: a priority list for
// first-phase prices, open to sign-ups from this page only.
//
// HONESTY LINE: there is no Ora-issued offer behind this page, so it never
// claims one. What is real and promised: the launch price list, the full
// 82-page Ora guide, first word when units in the chosen type are released,
// one consultant from first call to handover. If Ora or Crestline gives a
// real offer (discount, extra years, EOI amount), put its exact terms in
// OFFER_TERMS below and it renders as the headline perk.

import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import { Magnet, type MagnetCopy } from "../_magnet";
import { StickyBar } from "../_sticky";
import { OraLogo } from "../_ora-logo";
import { UnitAsk } from "../_unit-ask";

const tajawal = Tajawal({ subsets: ["arabic"], weight: ["400", "500", "700", "800"], display: "swap" });

const CALL_PHONE = "+201004230444";
const CALL_DISPLAY = "0100 423 0444";
const IMG = "/lp/solana-east";

// A REAL offer only — exact terms as given by Ora or Crestline. null = no offer.
const OFFER_TERMS: string | null = null;

export const metadata: Metadata = {
  title: "Solana East · دعوة خاصة لقايمة الأولوية",
  description: "سجّل في قايمة الأولوية لأسعار المرحلة الأولى في Solana East من أورا، وخُد قائمة الأسعار والكتيّب الكامل.",
  alternates: { canonical: "/ar/solana-east/offer" },
  robots: { index: false, follow: false },
  openGraph: { images: [`${IMG}/aerial.webp`] },
};

const COPY: MagnetCopy = {
  eyebrow: "التسجيل من الصفحة دي بس",
  title: "سجّل في قايمة الأولوية",
  titlePlan: "سجّل في قايمة الأولوية للوحدة دي",
  cta: "سجّلني في قايمة الأولوية",
  ctaPlan: "سجّلني للوحدة دي",
  tag: "قايمة الأولوية",
};

const PERKS = [
  { n: "01", t: "قائمة أسعار المرحلة الأولى", d: "كل الوحدات والمساحات بأسعار اللونش، قبل ما تتحرّك مع المرحلة الجاية." },
  { n: "02", t: "أول واحد يعرف", d: "أول ما وحدات من النوع اللي اخترته تتطرح، بيوصلك الخبر على واتساب." },
  { n: "03", t: "كتيّب أورا الكامل", d: "82 صفحة: الموقع، الماستر بلان، والتصميمات دور بدور." },
  { n: "04", t: "مستشار واحد معاك", d: "نفس الشخص من أول مكالمة لحد الاستلام، من غير ما تتنقّل بين أرقام." },
];

const UNITS = [
  { key: "أوضة", size: "62 م²", price: "8.975" },
  { key: "أوضتين", size: "97 م²", price: "13.9" },
  { key: "3 أوض", size: "130 م²", price: "18.25" },
];

export default function SolanaEastOfferPage() {
  return (
    <div className={`${tajawal.className} min-h-screen bg-[#0b0b0b] text-paper`}>
      {/* HERO — invitation */}
      <section id="hero" className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${IMG}/living.webp`} alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#0b0b0b]/80 to-[#0b0b0b]" />
        <div className="relative mx-auto max-w-3xl px-5 pb-12 pt-6 md:pb-16">
          <div className="flex items-center justify-between">
            <OraLogo className="h-6 w-auto" color="#fff" />
            <span className="text-[11px] tracking-[0.25em] text-white/60" dir="ltr">PRIVATE ACCESS</span>
          </div>

          <div className="mt-14 rounded-[28px] border border-white/15 bg-white/[0.04] p-6 text-center backdrop-blur md:mt-20 md:p-10">
            <p className="text-xs tracking-[0.3em] text-[#c9b8a6]" dir="ltr">SOLANA EAST · PHASE ONE</p>
            <p className="mt-4 text-sm text-white/70">دعوة خاصة</p>
            <h1 className="mt-2 text-[2.2rem] font-extrabold leading-[1.15] md:text-5xl">
              قايمة الأولوية
              <br />
              لأسعار المرحلة الأولى
            </h1>
            <div className="mx-auto my-6 h-px w-16 bg-[#c9b8a6]" />
            <p className="mx-auto max-w-md text-base leading-7 text-white/80">
              شقق فندقية من أورا على التسعين الجنوبي، متشطبة بالتكييفات وأورا للضيافة بتديرها. التسجيل في القايمة من الصفحة دي بس.
            </p>
            {OFFER_TERMS ? (
              <p className="mx-auto mt-5 max-w-md rounded-2xl bg-[#c9b8a6] px-4 py-3 text-base font-bold text-ink">{OFFER_TERMS}</p>
            ) : null}
            <a href="#magnet" className="mx-auto mt-7 flex h-12 max-w-xs items-center justify-center rounded-xl bg-paper font-bold text-ink">
              سجّلني في قايمة الأولوية
            </a>
            <p className="mt-3 text-xs text-white/50">أماكن المرحلة الأولى محدودة · التسجيل ببلاش ومن غير التزام</p>
          </div>
        </div>
      </section>

      {/* WHAT REGISTERED PEOPLE GET */}
      <section className="mx-auto max-w-3xl px-5 py-10 md:py-14">
        <p className="text-xs tracking-[0.25em] text-[#c9b8a6]" dir="ltr">WHAT YOU GET</p>
        <h2 className="mt-2 text-2xl font-extrabold md:text-3xl">اللي بيوصل للمسجّلين بس</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {PERKS.map((p) => (
            <div key={p.n} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <span className="text-xs font-bold text-[#c9b8a6]" dir="ltr">{p.n}</span>
              <p className="mt-2 text-lg font-extrabold">{p.t}</p>
              <p className="mt-1 text-sm leading-6 text-white/65">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LAUNCH PRICES */}
      <section className="border-y border-white/10 bg-white/[0.02] py-10 md:py-14">
        <div className="mx-auto max-w-3xl px-5">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-red-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> أسعار اللونش · المرحلة الأولى
          </span>
          <h2 className="mt-2 text-2xl font-extrabold md:text-3xl">بتبدأ من</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {UNITS.map((u) => (
              <div key={u.key} className="rounded-2xl border border-white/10 p-5">
                <div className="flex items-baseline justify-between">
                  <p className="text-lg font-extrabold">{u.key}</p>
                  <p className="text-xs text-white/50">{u.size}</p>
                </div>
                <p className="mt-2 text-3xl font-extrabold" dir="ltr">
                  {u.price}<span className="ms-1 text-base font-bold">M</span>
                </p>
                <p className="text-xs text-white/50">مليون جنيه · مقدّم <bdi dir="ltr">5%</bdi></p>
                <UnitAsk unit={u.key} />
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-white/60">
            تمن الـ3 أوض مع مطوّر كبير تاني في نفس المنطقة بيعدّي الـ<span dir="ltr">20M</span>. وكل مرحلة جديدة بتنزل بسعر أعلى.
          </p>
        </div>
      </section>

      {/* SAWIRIS */}
      <section className="mx-auto flex max-w-3xl items-center gap-5 px-5 py-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${IMG}/sawiris.webp`} alt="المهندس نجيب ساويرس" className="h-24 w-24 shrink-0 rounded-full object-cover object-[50%_20%] grayscale md:h-28 md:w-28" />
        <div>
          <p className="text-xl font-extrabold leading-snug md:text-2xl">المشروع الجديد من أورا، شركة المهندس نجيب ساويرس</p>
          <p className="mt-1 text-sm text-white/60">
            نفس المطوّر اللي عامل <bdi dir="ltr">ZED East</bdi> و<bdi dir="ltr">SilverSands</bdi>
          </p>
        </div>
      </section>

      {/* GALLERY STRIP */}
      <section className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-6 md:mx-auto md:grid md:max-w-3xl md:grid-cols-3 md:overflow-visible">
        {["aerial.webp", "bedroom.webp", "garden.webp"].map((src) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={`${IMG}/${src}`} alt="" loading="lazy" className="aspect-[4/3] w-[78%] shrink-0 snap-center rounded-2xl object-cover md:w-auto" />
        ))}
      </section>

      {/* FORM */}
      <section id="magnet" className="mx-auto max-w-3xl scroll-mt-4 px-4 py-10 md:py-14 [&>div]:ring-1 [&>div]:ring-[#c9b8a6]/40">
        <Magnet callPhone={CALL_PHONE} callDisplay={CALL_DISPLAY} copy={COPY} />
      </section>

      <footer className="px-5 pb-28 pt-4 text-center md:pb-10">
        <p className="mx-auto max-w-xl text-[11px] leading-5 text-white/35">
          قايمة الأولوية خدمة من egy.deals مع فريق مبيعات المشروع. egy.deals موقع مستقل ومش تابع لأورا، واسم وشعار أورا ملك أورا للتطوير العقاري.
          الأسعار من المرحلة الأولى وقابلة للتغيير. صورة نجيب ساويرس: Hannes Thalmann · CC BY-SA 4.0 · Wikimedia Commons.
        </p>
      </footer>

      <StickyBar label="سجّلني في قايمة الأولوية" />
    </div>
  );
}
