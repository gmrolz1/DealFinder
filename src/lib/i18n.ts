// Tiny i18n helpers — no framework, just enough for EN ↔ AR.
//
// Locale is "en" by default; pages under /ar are "ar". The root layout reads
// the x-pathname header (set by middleware.ts) to pick lang/dir.

export type Locale = "en" | "ar";

export const LOCALES: Locale[] = ["en", "ar"];

export const localeFromPath = (pathname: string): Locale =>
  pathname.startsWith("/ar/") || pathname === "/ar" ? "ar" : "en";

export const isRtl = (locale: Locale) => locale === "ar";

// Build a path in the target locale from a "logical" path (always EN-shaped).
export const localizedPath = (path: string, locale: Locale) => {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return locale === "ar" ? `/ar${clean}` : clean;
};

// UI string dictionary — keep small and grow as we add bilingual pages.
type Strings = Record<string, { en: string; ar: string }>;
const S: Strings = {
  "nav.developers": { en: "Developers", ar: "المطورون" },
  "nav.properties": { en: "Properties", ar: "العقارات" },
  "nav.areas": { en: "Areas", ar: "المناطق" },
  "nav.compounds": { en: "Compounds", ar: "الكمبوندات" },
  "nav.newLaunches": { en: "New Launches", ar: "إطلاقات جديدة" },

  "dev.label": { en: "Real Estate Developer", ar: "مطور عقاري" },
  "dev.establishedShort": { en: "Est.", ar: "تأسست" },
  "dev.projects": { en: "Projects", ar: "المشاريع" },
  "dev.homesAvailable": { en: "Homes Available", ar: "وحدات متاحة" },
  "dev.areas": { en: "Areas", ar: "المناطق" },
  "dev.startingFrom": { en: "Starting From", ar: "تبدأ من" },

  "lead.exclusive": { en: "Exclusive", ar: "حصرياً" },
  "lead.newLaunches": { en: "New Launches", ar: "إطلاقات جديدة" },
  "lead.priceListTitle": {
    en: "Price List & Offers",
    ar: "قائمة الأسعار والعروض",
  },
  "lead.priceListSub": {
    en: "Latest prices, payment plans and availability — sent to you directly.",
    ar: "أحدث الأسعار وخطط السداد والوحدات المتاحة — مباشرةً إليك.",
  },
  "lead.beFirstTitle": {
    en: "Be First to Know",
    ar: "كن أول من يعلم",
  },
  "lead.beFirstSub": {
    en: "Register your interest and we'll alert you the moment new units are released.",
    ar: "سجّل اهتمامك وسنخبرك فور إطلاق وحدات جديدة.",
  },
  "lead.namePlaceholder": { en: "Your name", ar: "اسمك" },
  "lead.phonePlaceholder": { en: "Phone number", ar: "رقم الهاتف" },
  "lead.ctaPriceList": {
    en: "Get the Price List",
    ar: "احصل على قائمة الأسعار",
  },
  "lead.ctaRegister": {
    en: "Register My Interest",
    ar: "سجّل اهتمامي",
  },
  "lead.privacyNote": {
    en: "No spam — just deals. Lead capture activates with the database.",
    ar: "بدون رسائل مزعجة — صفقات فقط. يتم تفعيل التواصل عند ربط قاعدة البيانات.",
  },

  "section.projectsBy": { en: "Projects by", ar: "مشاريع" },
  "section.availableHomes": { en: "Available Homes", ar: "الوحدات المتاحة" },
  "section.seeAll": { en: "See all", ar: "عرض الكل" },
  "section.whereBuilds": { en: "Where", ar: "أين تبني" },
  "section.whereBuilds.suffix": { en: "Builds", ar: "" },
  "section.noUnits": {
    en: "No primary units currently listed for",
    ar: "لا توجد وحدات أولية مدرجة حالياً لـ",
  },
  "section.registerHint": {
    en: "Register your interest above and our team will reach out as soon as inventory becomes available.",
    ar: "سجّل اهتمامك أعلاه وسيتواصل معك فريقنا فور توفر وحدات جديدة.",
  },
  "section.faqLabel": { en: "Questions & Answers", ar: "أسئلة وأجوبة" },
  "section.faqHeading": { en: "FAQ", ar: "الأسئلة الشائعة" },

  "cta.interestedIn": { en: "Interested in", ar: "مهتم بـ" },
  "cta.browseAll": {
    en: "Browse every available home or request a callback from our team.",
    ar: "تصفح كل الوحدات المتاحة أو اطلب اتصالاً من فريقنا.",
  },
  "cta.callbackPosted": {
    en: "Request a callback and we'll keep you posted on every new launch.",
    ar: "اطلب اتصالاً وسنبقيك على اطلاع بكل إطلاق جديد.",
  },
  "cta.viewAll": { en: "View All Homes", ar: "عرض كل الوحدات" },
  "cta.explore": { en: "Explore Developers", ar: "تصفح المطورين" },

  "index.title.dev": {
    en: "Real Estate Developers in Egypt — DealFinder",
    ar: "مطورو العقارات في مصر — DealFinder",
  },
  "index.heading.dev": { en: "Developers", ar: "المطورون" },
  "index.subtitle.dev.tpl": {
    en: "{a} developers · {b} with available homes",
    ar: "{a} مطور · {b} لديهم وحدات متاحة",
  },
  "index.cardAvailable.tpl": {
    en: "{n} homes available",
    ar: "{n} وحدة متاحة",
  },
  "index.cardEmpty": {
    en: "View developer profile",
    ar: "عرض ملف المطور",
  },
};

export function t(key: keyof typeof S | string, locale: Locale): string {
  const entry = S[key as keyof typeof S];
  if (!entry) return key;
  return entry[locale] ?? entry.en;
}

export function tpl(
  key: keyof typeof S | string,
  locale: Locale,
  vars: Record<string, string | number>
): string {
  let s = t(key, locale);
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}
