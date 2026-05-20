// Smart-CTA intents: the rotating prompts on the property card that drive
// the AI chat into specific conversation lanes (open chat / find
// alternatives / qualify by budget / explain the deal).
//
// Each intent has:
//   - label   : visible text on the rotating button (EN + AR)
//   - seed    : optional opener that gets auto-sent as the visitor's first
//               message when chat opens. Undefined = just open the chat.
//   - dir     : enter animation direction (up | right | left). Mix these
//               across intents so the rotation feels alive, not mechanical.

import type { Locale } from "./i18n";

export type IntentDirection = "up" | "right" | "left";

export type ChatIntent = {
  id: string;
  label: Record<Locale, string>;
  seed?: Record<Locale, string>;
  dir: IntentDirection;
};

/** The default rotation shown on the property card. Order matters — the
 * "ask anything" intent leads so first-time visitors get the broadest CTA. */
export const DEFAULT_INTENTS: ChatIntent[] = [
  {
    id: "ask",
    label: {
      en: "Ask Layla about this unit",
      ar: "اسأل ليلى عن هذه الوحدة",
    },
    dir: "up",
  },
  {
    id: "alternatives",
    label: {
      en: "See better alternatives",
      ar: "شاهد بدائل أفضل",
    },
    seed: {
      en: "Are there similar units in the same area that might be a better deal? Pick 2–3 to compare.",
      ar: "هل توجد وحدات مشابهة في نفس المنطقة قد تكون صفقة أفضل؟ اقترح 2-3 للمقارنة.",
    },
    dir: "right",
  },
  {
    id: "payment",
    label: {
      en: "Match my payment plan",
      ar: "خطة دفع تناسبني",
    },
    seed: {
      en: "I want to figure out if this payment plan fits my budget. What questions should I think through?",
      ar: "أريد أن أعرف ما إذا كانت خطة الدفع هذه تناسب ميزانيتي. ما الأسئلة التي يجب أن أفكر فيها؟",
    },
    dir: "left",
  },
  {
    id: "deal",
    label: {
      en: "Why is this a deal?",
      ar: "لماذا هذه صفقة جيدة؟",
    },
    seed: {
      en: "Walk me through why this specific unit is a good buy.",
      ar: "اشرحي لي لماذا تعتبر هذه الوحدة بالذات صفقة جيدة.",
    },
    dir: "up",
  },
  {
    id: "ready",
    label: {
      en: "When can I move in?",
      ar: "متى يمكنني الانتقال؟",
    },
    seed: {
      en: "When is this ready, and what does the delivery timeline mean for me as a buyer?",
      ar: "متى موعد التسليم؟ وماذا يعني الجدول الزمني للتسليم بالنسبة لي كمشترٍ؟",
    },
    dir: "right",
  },
];
