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
  phone: "+201210222246",
} as const;

/** Tagamo3 (Fifth Settlement) campaign — the التجمع الخامس ad group lands on
 * /tagamo3. Covers New Cairo plus its Fifth-Settlement sub-areas in the
 * dataset: Golden Square, South New Cairo, El Lotus, El Choueifat and the
 * Investors districts. Same broker number as the New Capital campaign. */
export const TAGAMO3 = {
  /** New Cairo (5), Golden Square (202), South New Cairo (101), El Lotus
   * (199), El Choueifat (200), North/South Investors (201/232). */
  areaIds: [5, 202, 101, 199, 200, 201, 232] as number[],
  phone: CAMPAIGN.phone,
};

/** Area wording injected into the prefilled WhatsApp messages. */
export type CampaignAreaLabel = { ar: string; en: string };

const NEW_CAPITAL_AREA: CampaignAreaLabel = {
  ar: "العاصمة الإدارية الجديدة",
  en: "New Capital",
};

export const TAGAMO3_AREA: CampaignAreaLabel = {
  ar: "التجمع الخامس",
  en: "Fifth Settlement (New Cairo)",
};

/** tap-to-call href for the campaign number. */
export const campaignTelHref = `tel:${CAMPAIGN.phone.replace(/[^0-9+]/g, "")}`;

// TEXT builders — the lead-routing /api/go endpoint takes the message as a
// `t=` param and redirects to the ASSIGNED broker's number (rotation/pin
// decided server-side), so CTAs need the message text, not a wa.me URL.

/** Generic "send me the best deals" message text — hero + sticky bar. */
export function campaignWaTextGeneric(
  locale: Locale,
  area: CampaignAreaLabel = NEW_CAPITAL_AREA
): string {
  return locale === "ar"
    ? `السلام عليكم، مهتم بعقارات ${area.ar}. ممكن تبعتلي أفضل العروض وخطط السداد؟`
    : `Hi, I'm interested in ${area.en} properties. Could you send me the best deals and payment plans?`;
}

/** Per-unit message text — on each listing card. */
export function campaignWaTextUnit(
  unitLabel: string,
  priceLabel: string,
  locale: Locale,
  area: CampaignAreaLabel = NEW_CAPITAL_AREA
): string {
  return locale === "ar"
    ? `السلام عليكم، مهتم بـ ${unitLabel} في ${area.ar} (${priceLabel}). ممكن التفاصيل وخطة السداد؟`
    : `Hi, I'm interested in ${unitLabel} in ${area.en} (${priceLabel}). Can you send details and the payment plan?`;
}

/** Per-compound message text — compound detail pages (ad targets). */
export function campaignWaTextCompound(
  name: string,
  areaLabel: string | null,
  priceLabel: string,
  locale: Locale
): string {
  return locale === "ar"
    ? `السلام عليكم، مهتم بمشروع ${name}${
        areaLabel ? ` في ${areaLabel}` : ""
      } (يبدأ من ${priceLabel}). ممكن تبعتلي التفاصيل وخطة السداد والصور المتاحة؟`
    : `Hi, I'm interested in ${name}${
        areaLabel ? ` in ${areaLabel}` : ""
      } (from ${priceLabel}). Could you send details, the payment plan, and available photos?`;
}

// ── Bilingual landing copy ─────────────────────────────────────────────────
// Co-located here (like CHAT_UI in chat-config.ts) so the whole campaign lives
// in one module. Both locales are required.

type CampaignLocaleCopy = {
  eyebrow: string;
  h1a: string;
  h1b: string;
  sub: string;
  waCta: string;
  callCta: string;
  hooks: { v: string; l: string }[];
  statsTpl: string;
  dealsTitle: string;
  dealsSub: string;
  whyTitle: string;
  why: { t: string; d: string }[];
  finalTitle: string;
  finalSub: string;
  perUnitWa: string;
  perUnitCall: string;
  stickyLabel: string;
  from: string;
  seeAll: string;
};

export type CampaignCopy = Record<Locale, CampaignLocaleCopy>;

export const CAMPAIGN_COPY: CampaignCopy = {
  en: {
    eyebrow: "New Administrative Capital",
    h1a: "Own a Home in the",
    h1b: "New Capital",
    sub: "Primary units direct from top developers — flexible plans, low down payments, modern delivery. Tell us your budget and we'll send you the best matches today.",
    waCta: "WhatsApp Us",
    callCta: "Call Now",
    hooks: [
      { v: "FROM 2.7M", l: "EGP entry price" },
      { v: "FROM 1% DOWN", l: "on featured units" },
      { v: "UP TO 15 YRS", l: "installments" },
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
      { v: "من 2.7 مليون", l: "جنيه سعر البداية" },
      { v: "من 1% مقدم", l: "على وحدات مختارة" },
      { v: "حتى 15 سنة", l: "تقسيط" },
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
};

/** /tagamo3 landing copy — same structure as CAMPAIGN_COPY. The hook numbers
 * are derived from the dataset (min price 1.9M, plans from 2% down, up to
 * 12-year installments among the featured deals, 160+ compounds). */
export const TAGAMO3_COPY: CampaignCopy = {
  en: {
    eyebrow: "Fifth Settlement — New Cairo",
    h1a: "Own a Home in the",
    h1b: "Fifth Settlement",
    sub: "Primary units in Tagamo3 and the Golden Square, direct from top developers — flexible plans and low down payments. Tell us your budget and we'll send you the best matches today.",
    waCta: "WhatsApp Us",
    callCta: "Call Now",
    hooks: [
      { v: "FROM 1.9M", l: "EGP entry price" },
      { v: "FROM 2% DOWN", l: "on featured units" },
      { v: "UP TO 12 YRS", l: "installments" },
      { v: "160+", l: "compounds" },
    ],
    statsTpl:
      "{units} primary units · {compounds} compounds · {developers} developers",
    dealsTitle: "Best Deals This Week",
    dealsSub:
      "Handpicked Fifth Settlement and Golden Square units with the strongest payment plans. Tap WhatsApp on any unit for prices and availability.",
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
      "Send one message with your budget and preferred delivery date. We'll reply with a shortlist of the best Fifth Settlement deals — no spam, just options.",
    perUnitWa: "WhatsApp",
    perUnitCall: "Call",
    stickyLabel: "Talk to an advisor",
    from: "From",
    seeAll: "See all Fifth Settlement units",
  },
  ar: {
    eyebrow: "التجمع الخامس — القاهرة الجديدة",
    h1a: "امتلك وحدتك في",
    h1b: "التجمع الخامس",
    sub: "وحدات أولية في التجمع الخامس والجولدن سكوير مباشرة من كبار المطوّرين — خطط سداد مرنة ومقدمات منخفضة. أخبرنا بميزانيتك ونرسل لك أفضل الخيارات اليوم.",
    waCta: "تواصل واتساب",
    callCta: "اتصل الآن",
    hooks: [
      { v: "من 1.9 مليون", l: "جنيه سعر البداية" },
      { v: "من 2% مقدم", l: "على وحدات مختارة" },
      { v: "حتى 12 سنة", l: "تقسيط" },
      { v: "+160", l: "كمبوند" },
    ],
    statsTpl: "{units} وحدة أولية · {compounds} كمبوند · {developers} مطوّر",
    dealsTitle: "أفضل العروض هذا الأسبوع",
    dealsSub:
      "وحدات مختارة في التجمع الخامس والجولدن سكوير بأقوى خطط السداد. اضغط واتساب على أي وحدة لمعرفة السعر والتوفر.",
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
      "أرسل رسالة واحدة بميزانيتك وموعد التسليم المفضّل، وسنرد عليك بقائمة أفضل عروض التجمع الخامس — بدون إزعاج، خيارات فقط.",
    perUnitWa: "واتساب",
    perUnitCall: "اتصال",
    stickyLabel: "تحدّث مع مستشار",
    from: "يبدأ من",
    seeAll: "عرض كل وحدات التجمع الخامس",
  },
};

// ── Arabian Estate landing copy ────────────────────────────────────────────
// Client landing at /arabian-estate — their sheet spans many districts (New
// Capital, Mostakbal, Shorouk, Sokhna, North Coast), so the copy is
// multi-area, unlike the area campaigns above.

export const ARABIAN_ESTATE_AREA: CampaignAreaLabel = {
  ar: "مصر",
  en: "Egypt",
};

export const ARABIAN_ESTATE_COPY: CampaignCopy = {
  en: {
    eyebrow: "Arabian Estate",
    h1a: "Find Your Next",
    h1b: "Home Deal",
    sub: "Hand-picked primary units across Egypt's fastest-growing districts — flexible plans, low down payments, trusted developers. Message us and get today's best offers.",
    waCta: "WhatsApp Us",
    callCta: "Call Now",
    hooks: [
      { v: "FROM 5% DOWN", l: "entry offers" },
      { v: "UP TO 15 YRS", l: "installments" },
      { v: "130+", l: "listed units" },
      { v: "70+", l: "trusted developers" },
    ],
    statsTpl: "{units} listed units · {compounds} projects · {developers} developers",
    dealsTitle: "This Week's Best Deals",
    dealsSub:
      "Every unit below is verified with the developer's latest prices and payment plans. Tap WhatsApp on any unit for availability.",
    whyTitle: "Why Arabian Estate",
    why: [
      {
        t: "Verified Primary Units",
        d: "Every listing is a developer (primary) unit with a real, current price.",
      },
      {
        t: "All Districts Covered",
        d: "New Capital, Mostakbal City, Shorouk, Sokhna, North Coast — one advisor for all of them.",
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
      "Send one message with your budget and preferred area. We'll reply with a shortlist of the best matching deals — no spam, just options.",
    perUnitWa: "WhatsApp",
    perUnitCall: "Call",
    stickyLabel: "Talk to an advisor",
    from: "From",
    seeAll: "See all units",
  },
  ar: {
    eyebrow: "أريبيان استيت",
    h1a: "اعثر على",
    h1b: "صفقتك القادمة",
    sub: "وحدات أولية مختارة بعناية في أسرع مناطق مصر نمواً — خطط مرنة، مقدمات منخفضة، مطوّرون موثوقون. راسلنا واحصل على أفضل عروض اليوم.",
    waCta: "تواصل واتساب",
    callCta: "اتصل الآن",
    hooks: [
      { v: "من 5% مقدم", l: "عروض البداية" },
      { v: "حتى 15 سنة", l: "تقسيط" },
      { v: "+130", l: "وحدة معروضة" },
      { v: "+70", l: "مطوّر موثوق" },
    ],
    statsTpl: "{units} وحدة معروضة · {compounds} مشروع · {developers} مطوّر",
    dealsTitle: "أفضل عروض هذا الأسبوع",
    dealsSub:
      "كل وحدة أدناه موثّقة بأحدث أسعار المطوّر وخطط السداد. اضغط واتساب على أي وحدة لمعرفة التوفر.",
    whyTitle: "لماذا أريبيان استيت",
    why: [
      {
        t: "وحدات أولية موثّقة",
        d: "كل وحدة مباشرة من المطوّر وبسعر حقيقي محدث.",
      },
      {
        t: "كل المناطق مغطاة",
        d: "العاصمة الإدارية، المستقبل، الشروق، السخنة، الساحل — مستشار واحد لكل المناطق.",
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
      "أرسل رسالة واحدة بميزانيتك ومنطقتك المفضّلة، وسنرد عليك بقائمة أفضل العروض المطابقة — بدون إزعاج، خيارات فقط.",
    perUnitWa: "واتساب",
    perUnitCall: "اتصال",
    stickyLabel: "تحدّث مع مستشار",
    from: "يبدأ من",
    seeAll: "عرض كل الوحدات",
  },
};
