// New Capital lead-gen campaign — config + bilingual copy.
//
// Self-contained for the /new-capital landing page (built for Google Ads).
// CTAs go to the campaign broker number below — intentionally separate from
// the site-wide chat broker in chat-config.ts. All copy is generated from
// factual data; nothing is copied from nawy or any other source.

import type { Locale } from "./i18n";

export const CAMPAIGN = {
  /** New Administrative Capital — area nawy_id in the dataset. */
  areaId: 16,
  /** Campaign broker number (E.164). WhatsApp + tap-to-call. */
  phone: "+201207171710",
} as const;

const WA_NUMBER = CAMPAIGN.phone.replace(/[^0-9]/g, "");

/** tap-to-call href for the campaign number. */
export const campaignTelHref = `tel:${CAMPAIGN.phone.replace(/[^0-9+]/g, "")}`;

/** WhatsApp deep link with a prefilled message. */
export function campaignWhatsApp(message: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Generic "send me the best deals" link — hero + sticky bar. */
export function campaignWhatsAppGeneric(locale: Locale): string {
  return campaignWhatsApp(
    locale === "ar"
      ? "السلام عليكم، مهتم بعقارات العاصمة الإدارية الجديدة. ممكن تبعتلي أفضل العروض وخطط السداد؟"
      : "Hi, I'm interested in New Capital properties. Could you send me the best deals and payment plans?"
  );
}

/** Per-unit link — on each listing card. */
export function campaignWhatsAppUnit(
  unitLabel: string,
  priceLabel: string,
  locale: Locale
): string {
  return campaignWhatsApp(
    locale === "ar"
      ? `السلام عليكم، مهتم بـ ${unitLabel} في العاصمة الإدارية (${priceLabel}). ممكن التفاصيل وخطة السداد؟`
      : `Hi, I'm interested in ${unitLabel} in the New Capital (${priceLabel}). Can you send details and the payment plan?`
  );
}

/** Per-compound link — used on a compound's detail page when it's an ad target. */
export function campaignWhatsAppCompound(
  name: string,
  areaLabel: string | null,
  priceLabel: string,
  locale: Locale
): string {
  return campaignWhatsApp(
    locale === "ar"
      ? `السلام عليكم، مهتم بمشروع ${name}${
          areaLabel ? ` في ${areaLabel}` : ""
        } (يبدأ من ${priceLabel}). ممكن تبعتلي التفاصيل وخطة السداد والصور المتاحة؟`
      : `Hi, I'm interested in ${name}${
          areaLabel ? ` in ${areaLabel}` : ""
        } (from ${priceLabel}). Could you send details, the payment plan, and available photos?`
  );
}

// ── Bilingual landing copy ─────────────────────────────────────────────────
// Co-located here (like CHAT_UI in chat-config.ts) so the whole campaign lives
// in one module. Both locales are required.

export const CAMPAIGN_COPY = {
  en: {
    eyebrow: "New Administrative Capital",
    h1a: "Own a Home in the",
    h1b: "New Capital",
    sub: "Primary units direct from top developers — flexible plans, low down payments, modern delivery. Tell us your budget and we'll send you the best matches today.",
    waCta: "WhatsApp Us",
    callCta: "Call Now",
    hooks: [
      { v: "FROM 1.8M", l: "EGP entry price" },
      { v: "10% DOWN", l: "on many units" },
      { v: "UP TO 8 YRS", l: "installments" },
      { v: "150+", l: "compounds" },
    ],
    statsTpl:
      "{units} primary units · {compounds} compounds · {developers} developers",
    dealsTitle: "Best Deals This Week",
    dealsSub:
      "Handpicked New Capital units with the strongest payment plans. Tap WhatsApp on any unit for prices and availability.",
    whyTitle: "Why Buy Through Us",
    why: [
      {
        t: "Verified Primary Units",
        d: "Every listing is a developer (primary) unit — no resale guesswork.",
      },
      {
        t: "Direct Developer Plans",
        d: "Real prices and the latest payment plans, straight from the developer.",
      },
      {
        t: "We Match Your Budget",
        d: "Tell us your number and we shortlist the units that actually fit it.",
      },
      {
        t: "One Tap to a Human",
        d: "No forms, no waiting — reach our advisor on WhatsApp or by phone instantly.",
      },
    ],
    finalTitle: "Tell Us Your Budget",
    finalSub:
      "Send one message with your budget and preferred delivery date. We'll reply with a shortlist of the best New Capital deals — no spam, just options.",
    perUnitWa: "WhatsApp",
    perUnitCall: "Call",
    stickyLabel: "Talk to an advisor",
    from: "From",
    seeAll: "See all New Capital units",
  },
  ar: {
    eyebrow: "العاصمة الإدارية الجديدة",
    h1a: "امتلك وحدتك في",
    h1b: "العاصمة الإدارية",
    sub: "وحدات أولية مباشرة من كبار المطوّرين — خطط سداد مرنة، مقدمات منخفضة، تسليم حديث. أخبرنا بميزانيتك ونرسل لك أفضل الخيارات اليوم.",
    waCta: "تواصل واتساب",
    callCta: "اتصل الآن",
    hooks: [
      { v: "من 1.8 مليون", l: "جنيه سعر البداية" },
      { v: "10% مقدم", l: "على وحدات كثيرة" },
      { v: "حتى 8 سنوات", l: "تقسيط" },
      { v: "+150", l: "كمبوند" },
    ],
    statsTpl: "{units} وحدة أولية · {compounds} كمبوند · {developers} مطوّر",
    dealsTitle: "أفضل العروض هذا الأسبوع",
    dealsSub:
      "وحدات مختارة في العاصمة الإدارية بأقوى خطط السداد. اضغط واتساب على أي وحدة لمعرفة السعر والتوفر.",
    whyTitle: "لماذا تشتري معنا",
    why: [
      {
        t: "وحدات أولية موثّقة",
        d: "كل وحدة مباشرة من المطوّر — بدون تخمين إعادة البيع.",
      },
      {
        t: "خطط من المطوّر مباشرة",
        d: "أسعار حقيقية وأحدث خطط السداد مباشرةً من المطوّر.",
      },
      {
        t: "نطابق ميزانيتك",
        d: "أخبرنا برقمك ونرشّح لك الوحدات التي تناسبه فعلاً.",
      },
      {
        t: "تواصل فوري",
        d: "بدون نماذج أو انتظار — تواصل مع مستشارنا على واتساب أو هاتفياً فوراً.",
      },
    ],
    finalTitle: "أخبرنا بميزانيتك",
    finalSub:
      "أرسل رسالة واحدة بميزانيتك وموعد التسليم المفضّل، وسنرد عليك بقائمة أفضل عروض العاصمة الإدارية — بدون إزعاج، خيارات فقط.",
    perUnitWa: "واتساب",
    perUnitCall: "اتصال",
    stickyLabel: "تحدّث مع مستشار",
    from: "يبدأ من",
    seeAll: "عرض كل وحدات العاصمة الإدارية",
  },
} as const;
