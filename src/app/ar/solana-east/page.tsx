// /ar/solana-east — Google Ads BETA landing for Solana East (Ora, New Cairo),
// sold by Crestline. Same facts as the Meta videos (Omar 2026-10-08). The form
// forwards to The Deal Maker portal (see /api/lp/solana-east) — this page has
// no WhatsApp button and no egy.deals rotation: every lead is Crestline's.

import type { Metadata } from "next";
import { SolanaForm } from "./_form";

const CALL_PHONE = "+201004230444";
const CALL_DISPLAY = "0100 423 0444";
const HERO =
  "https://s3.eu-central-1.amazonaws.com/prod.images.cooingestate.com/admin/compound/cover_image/1077/20240917_-Solana_East_-_Sales_Induction_1__Page_13_Image_0001.jpg";

export const metadata: Metadata = {
  title: "Solana East — شقق فندقية من أورا في التجمع الخامس",
  description:
    "شقق فندقية متشطبة بالتكييفات في Solana East على التسعين الجنوبي، أورا للضيافة بتديرها وبتأجرها. مقدم من 5% وتقسيط لحد 8 سنين.",
  alternates: { canonical: "/ar/solana-east" },
  robots: { index: false, follow: false },
};

const POINTS = [
  { t: "متشطبة بالتكييفات", d: "تستلم الوحدة جاهزة، من غير تشطيب ولا مصاريف بعدها." },
  { t: "أورا للضيافة بتديرها", d: "الإدارة والتأجير على أورا، زي الفندق بالظبط." },
  { t: "على التسعين الجنوبي", d: "في قلب التجمع الخامس، القاهرة الجديدة." },
  { t: "مقدم من 5%", d: "والباقي تقسيط لحد 8 سنين." },
];

const UNITS = [
  { name: "أوضة", size: "62 م²", price: "من حوالي 9 مليون", down: "مقدم حوالي 450 ألف" },
  { name: "أوضتين", size: "97 م²", price: "من 13.9 مليون", down: "مقدم من 5%" },
  { name: "3 أوض", size: "130 م²", price: "من 18.25 مليون", down: "مقدم من 5%" },
];

export default function SolanaEastPage() {
  return (
    <div className="bg-paper text-ink">
      <section className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HERO} alt="Solana East" className="h-[42vh] min-h-[260px] w-full object-cover md:h-[56vh]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-5xl px-4 pb-6 text-paper">
          <p className="text-xs font-semibold tracking-wide text-data">أورا للتطوير العقاري · نجيب ساويرس</p>
          <h1 className="mt-1 text-3xl font-extrabold leading-tight md:text-5xl">
            شقق فندقية في <span dir="ltr">Solana East</span>
          </h1>
          <p className="mt-2 text-base text-data md:text-lg">متشطبة بالتكييفات، وأورا للضيافة بتديرها وبتأجرها.</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 md:grid-cols-[1fr_380px] md:py-10">
        <div className="order-2 md:order-1">
          <div className="grid grid-cols-2 gap-3">
            {POINTS.map((p) => (
              <div key={p.t} className="rounded-2xl border border-data p-4">
                <p className="font-extrabold">{p.t}</p>
                <p className="mt-1 text-sm text-slate">{p.d}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl font-extrabold">الوحدات والأسعار</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-data">
            {UNITS.map((u, i) => (
              <div key={u.name} className={`flex items-center justify-between gap-3 p-4 ${i ? "border-t border-data" : ""}`}>
                <div>
                  <p className="font-extrabold">{u.name}</p>
                  <p className="text-sm text-slate">{u.size}</p>
                </div>
                <div className="text-left">
                  <p className="font-bold">{u.price}</p>
                  <p className="text-xs text-slate">{u.down}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate">الأسعار تقريبية وبتتغير، الفريق هيأكدلك السعر الحالي وخطة السداد.</p>

          <h2 className="mt-8 text-xl font-extrabold">ليه شقة فندقية؟</h2>
          <p className="mt-2 leading-7 text-slate">
            الوحدة بتشتغل لك وانت مش فاضي: أورا للضيافة بتأجرها وبتديرها وبتهتم بالصيانة، وانت ليك العائد.
            مناسبة لو بتدور على استثمار في التجمع من مطور كبير، أو مكان جاهز تنزل فيه وقت ما تحب.
          </p>
        </div>

        <aside className="order-1 md:order-2 md:sticky md:top-6 md:self-start">
          <SolanaForm id="lead" callPhone={CALL_PHONE} callDisplay={CALL_DISPLAY} />
        </aside>
      </div>

      <a
        href="#lead"
        className="fixed inset-x-4 bottom-4 z-20 flex h-12 items-center justify-center rounded-xl bg-ink font-bold text-paper shadow-lg md:hidden"
      >
        اعرف الأسعار
      </a>
      <footer className="border-t border-data px-4 py-6 pb-24 text-center text-xs text-slate md:pb-6">
        egy.deals · المعلومات من المطور وقابلة للتغيير
      </footer>
    </div>
  );
}
